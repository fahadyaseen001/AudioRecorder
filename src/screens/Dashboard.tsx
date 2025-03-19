import { PutObjectCommand } from '@aws-sdk/client-s3';
import { useUser, useClerk } from '@clerk/clerk-expo';
import { HUGGING_FACE_API_KEY } from '@env';
import {
  Ionicons,
  MaterialCommunityIcons,
  FontAwesome5,
} from '@expo/vector-icons';
import { Audio } from 'expo-av';
import { Recording } from 'expo-av/build/Audio';
import { useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import {
  View,
  StyleSheet,
  Text,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  ScrollView,
  FlatList,
  Pressable,
  Alert,
  Image,
} from 'react-native';
import Animated, {
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  Extrapolation,
} from 'react-native-reanimated';

import Loader from '../components/Loader';
import MemoItem, { Memo } from '../components/MemoItem';
import { s3Client, BUCKET_NAME } from '../config/aws';

type MemoWithTranscript = Memo & { transcript?: string };

export default function DashboardScreen() {
  const { user } = useUser();
  const { signOut } = useClerk();
  const router = useRouter();

  // Recording state from Memos.tsx
  const [recording, setRecording] = useState<Recording>();
  const [audioMetering, setAudioMetering] = useState<number[]>([]);
  const metering = useSharedValue(-100);
  const [memos, setMemos] = useState<MemoWithTranscript[]>([]);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [, setIsRecording] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const transcribeAudio = useCallback(async (audioData: Blob) => {
    const apiKey = HUGGING_FACE_API_KEY;
    const modelURL =
      'https://router.huggingface.co/hf-inference/models/openai/whisper-large-v3-turbo';

    try {
      const response = await fetch(modelURL, {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'audio/wav',
        },
        method: 'POST',
        body: audioData,
      });

      const result = await response.json();
      return result.text;
    } catch (error) {
      console.error('Transcription error:', error);
      Alert.alert('Error', 'Failed to transcribe audio. Please try again.');
      return null;
    }
  }, []);

  const uploadToS3 = useCallback(
    async (uri: string, filename: string) => {
      try {
        setIsUploading(true);

        const response = await fetch(uri);
        const blob = await response.blob();

        const key = `recordings/${user?.id}/${filename}`;

        const uploadParams = {
          Bucket: BUCKET_NAME,
          Key: key,
          Body: blob,
          ContentType: 'audio/wav',
        };

        await s3Client.send(new PutObjectCommand(uploadParams));

        return `https://${BUCKET_NAME}.s3.amazonaws.com/${key}`;
      } catch (error) {
        console.error('Error uploading to S3:', error);
        throw error;
      } finally {
        setIsUploading(false);
      }
    },
    [user?.id]
  );

  const startRecording = useCallback(async () => {
    try {
      setAudioMetering([]);

      await Audio.requestPermissionsAsync();
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
        staysActiveInBackground: true,
        playThroughEarpieceAndroid: false,
      });

      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY,
        undefined,
        100
      );
      setRecording(recording);
      setIsRecording(true);

      recording.setOnRecordingStatusUpdate((status) => {
        if (status.metering) {
          metering.value = status.metering;
          setAudioMetering((curVal) => [...curVal, status.metering ?? -100]);
        }
      });
    } catch (err) {
      console.error('Failed to start recording', err);
    }
  }, [metering]);

  const stopRecording = useCallback(async () => {
    if (!recording) return;

    setRecording(undefined);
    setIsRecording(false);
    await recording.stopAndUnloadAsync();
    await Audio.setAudioModeAsync({
      allowsRecordingIOS: false,
    });
    const uri = recording.getURI();
    metering.value = -100;

    if (uri) {
      setIsTranscribing(true);
      try {
        const audioBlob = await fetch(uri).then((response) => response.blob());

        const filename = `recording-${Date.now()}.wav`;

        const transcript = await transcribeAudio(audioBlob);

        const s3Uri = await uploadToS3(uri, filename);

        setMemos((existingMemos) => [
          {
            uri,
            s3Uri,
            metering: audioMetering,
            transcript,
            timestamp: new Date().toISOString(),
          },
          ...existingMemos,
        ]);
      } catch (error) {
        console.error('Error processing recording:', error);
        Alert.alert('Error', 'Failed to process audio. Please try again.');
      } finally {
        setIsTranscribing(false);
      }
    }
  }, [recording, audioMetering, metering, transcribeAudio, uploadToS3]);

  /**
   * Red circle animation from Memos.tsx
   */
  const animatedRedCircle = useAnimatedStyle(() => ({
    width: withTiming(recording ? '60%' : '100%'),
    borderRadius: withTiming(recording ? 5 : 35),
  }));

  /**
   * Recording wave animation from Memos.tsx
   */
  const animatedRecording = useAnimatedStyle(() => {
    const size = withTiming(
      interpolate(
        metering.value,
        [-160, -60, 0],
        [0, 0, -30],
        Extrapolation.CLAMP
      ),
      { duration: 100 }
    );
    return {
      top: size,
      bottom: size,
      left: size,
      right: size,
      backgroundColor: `rgba(255, 45, 0, ${interpolate(
        metering.value,
        [-160, -60, -10],
        [0.7, 0.3, 0.7],
        Extrapolation.CLAMP
      )})`,
    };
  });

  // UI Components
  const Header = () => (
    <View style={styles.header}>
      <View>
        <Text style={styles.welcomeText}>Hello,</Text>
        <Text style={styles.userName}>
          {user?.firstName ??
            user?.emailAddresses[0].emailAddress.split('@')[0]}
        </Text>
      </View>
      <TouchableOpacity style={styles.profileButton}>
        {user?.imageUrl ? (
          <Image source={{ uri: user.imageUrl }} style={styles.profileImage} />
        ) : (
          <View style={styles.profilePlaceholder}>
            <Text style={styles.profilePlaceholderText}>
              {user?.firstName?.charAt(0) ??
                user?.emailAddresses[0].emailAddress.charAt(0).toUpperCase()}
            </Text>
          </View>
        )}
      </TouchableOpacity>
    </View>
  );

  const QuickActions = () => {
    return (
      <View style={styles.quickActionsContainer}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.quickActionsGrid}>
          <TouchableOpacity style={styles.quickActionItem}>
            <View
              style={[
                styles.quickActionIcon,
                { backgroundColor: 'rgba(83, 82, 237, 0.1)' },
              ]}
            >
              <FontAwesome5 name="folder" size={18} color="#5352ed" />
            </View>
            <Text style={styles.quickActionText}>My Files</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.quickActionItem}>
            <View
              style={[
                styles.quickActionIcon,
                { backgroundColor: 'rgba(46, 204, 113, 0.1)' },
              ]}
            >
              <MaterialCommunityIcons
                name="transcribe"
                size={20}
                color="#2ecc71"
              />
            </View>
            <Text style={styles.quickActionText}>Transcribe</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.quickActionItem}>
            <View
              style={[
                styles.quickActionIcon,
                { backgroundColor: 'rgba(255, 71, 87, 0.1)' },
              ]}
            >
              <Ionicons name="share-outline" size={20} color="#ff4757" />
            </View>
            <Text style={styles.quickActionText}>Share</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.quickActionItem}
            onPress={async () => {
              await signOut();
              router.replace('/(home)');
            }}
          >
            <View
              style={[
                styles.quickActionIcon,
                { backgroundColor: 'rgba(231, 76, 60, 0.1)' },
              ]}
            >
              <Ionicons name="log-out-outline" size={20} color="#e74c3c" />
            </View>
            <Text style={styles.quickActionText}>Sign Out</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  // Advanced recordingsDisplay component that combines both UI styles
  const RecordingsDisplay = () => {
    if (memos.length === 0) {
      return (
        <View style={styles.emptyRecordingsContainer}>
          <MaterialCommunityIcons name="waveform" size={64} color="#ccc" />
          <Text style={styles.emptyRecordingsText}>No recordings yet</Text>
          <Text style={styles.emptyRecordingsSubtext}>
            Press the mic button to start recording
          </Text>
        </View>
      );
    }

    return (
      <View style={styles.recordingsContainer}>
        <Text style={styles.sectionTitle}>Your Recordings</Text>
        <FlatList
          data={memos}
          keyExtractor={(item, index) => index.toString()}
          renderItem={({ item }) => <MemoItem memo={item} />}
          contentContainerStyle={styles.recordingsList}
        />
      </View>
    );
  };

  // Main render
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      {(isTranscribing ?? isUploading) && <Loader />}

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        <Header />
        <QuickActions />
        <RecordingsDisplay />
      </ScrollView>

      {/* Recording button from Memos.tsx */}
      <View style={styles.memosFooter}>
        <View>
          <Animated.View style={[styles.recordWave, animatedRecording]} />
          <Pressable
            style={styles.recordButton}
            onPress={recording ? stopRecording : startRecording}
          >
            <Animated.View style={[styles.redCircle, animatedRedCircle]} />
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollView: {
    flex: 1,
  },
  // Header styles
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 15,
  },
  welcomeText: {
    fontSize: 16,
    color: '#666',
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  profileButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    overflow: 'hidden',
    backgroundColor: '#f1f2f6',
  },
  profileImage: {
    width: 44,
    height: 44,
  },
  profilePlaceholder: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#5352ed',
    justifyContent: 'center',
    alignItems: 'center',
  },
  profilePlaceholderText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  // Quick actions styles
  quickActionsContainer: {
    paddingHorizontal: 20,
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  quickActionItem: {
    width: '48%',
    backgroundColor: '#f9fafc',
    borderRadius: 12,
    padding: 16,
    marginBottom: 15,
  },
  quickActionIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  quickActionText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  // Recordings styles
  recordingsContainer: {
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  recordingsList: {
    paddingBottom: 20,
  },
  emptyRecordingsContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 50,
  },
  emptyRecordingsText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#666',
    marginTop: 16,
  },
  emptyRecordingsSubtext: {
    fontSize: 14,
    color: '#999',
    marginTop: 8,
    textAlign: 'center',
  },
  // Footer styles
  footer: {
    paddingVertical: 20,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
    color: '#999',
  },
  // Recording button styles from Memos.tsx
  memosFooter: {
    position: 'static',
    bottom: 30,
    left: 0,
    right: 0,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
    height: 100,
  },
  recordButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    borderWidth: 3,
    borderColor: 'gray',
    padding: 3,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'white',
    zIndex: 100,
  },
  redCircle: {
    backgroundColor: 'orangered',
    aspectRatio: 1,
  },
  recordWave: {
    position: 'absolute',
    top: -20,
    bottom: -20,
    left: -20,
    right: -20,
    borderRadius: 1000,
  },
  transparentOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'transparent',
  },
});
