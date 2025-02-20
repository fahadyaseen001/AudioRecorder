import { useCallback, useState } from 'react'
import {
  View,
  StyleSheet,
  FlatList,
  Pressable,
  Alert,
} from 'react-native'
import { Audio } from 'expo-av'
import { Recording } from 'expo-av/build/Audio'
import Animated, {
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated'
import MemoItem, { Memo } from '../components/MemoItem'
import { HUGGING_FACE_API_KEY } from '@env'
import Loader from '../components/Loader'

type MemoWithTranscript = Memo & { transcript?: string };


/**
 * Audio recorder home screen
 */
export default function MemosScreen() {
  const [recording, setRecording] = useState<Recording>()
  const [audioMetering, setAudioMetering] = useState<number[]>([])
  const metering = useSharedValue(-100)
  const [memos, setMemos] = useState<MemoWithTranscript[]>([]);
  const [isTranscribing, setIsTranscribing] = useState(false)


  /**
 * Transcribe audio using Hugging Face API
 */

  const apiKey = HUGGING_FACE_API_KEY;
  const modelURL = "https://router.huggingface.co/hf-inference/models/openai/whisper-large-v3-turbo";

  const transcribeAudio = async (audioData: Blob) => {
    try {
      const response = await fetch(modelURL, {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'audio/wav' // Ensure this matches your audio format
        },
        method: 'POST',
        body: audioData
      });

      const result = await response.json();
      return result.text; //  API response  
    } catch (error) {
      console.error('Transcription error:', error);
      Alert.alert('Error', 'Failed to transcribe audio. Please try again.');
      return null;
    }
  };
  

  /**
   * Start recording
   */
  const startRecording = useCallback(async () => {
    try {
      setAudioMetering([])

      await Audio.requestPermissionsAsync()
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      })

      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY,
        undefined,
        100
      )
      setRecording(recording)

      recording.setOnRecordingStatusUpdate((status) => {
        if (status.metering) {
          metering.value = status.metering
          setAudioMetering((curVal) => [...curVal, status.metering || -100])
        }
      })
    } catch (err) {
      console.error('Failed to start recording', err)
    }
  }, [])

  /**
   * Stop recording and save the memo
   */
  const stopRecording = useCallback(async () => {
    if (!recording) return;

    setRecording(undefined);
    await recording.stopAndUnloadAsync();
    await Audio.setAudioModeAsync({
      allowsRecordingIOS: false,
    });
    const uri = recording.getURI();
    metering.value = -100;

    if (uri) {
      setIsTranscribing(true);
      try {
        const audioBlob = await fetch(uri).then(response => response.blob());
        const transcript = await transcribeAudio(audioBlob);
        
        setMemos((existingMemos) => [
          { uri, metering: audioMetering, transcript },
          ...existingMemos,
        ]);
      } catch (error) {
        Alert.alert('Error', 'Failed to transcribe audio. Please try again.');
      } finally {
        setIsTranscribing(false);
      }
    }
  }, [recording, audioMetering]);

  /**
   * Red circle animation
   */
  const animatedRedCircle = useAnimatedStyle(() => ({
    width: withTiming(recording ? '60%' : '100%'),
    borderRadius: withTiming(recording ? 5 : 35),
  }))

  /**
   * Recording wave animation
   */
  const animatedRecording = useAnimatedStyle(() => {
    const size = withTiming(
      interpolate(metering.value, [-160, -60, 0], [0, 0, -30]),
      { duration: 100 }
    )
    return {
      top: size,
      bottom: size,
      left: size,
      right: size,
      backgroundColor: `rgba(255, 45, 0, ${interpolate(
        metering.value,
        [-160, -60, -10],
        [0.7, 0.3, 0.7]
      )})`,
    }
  })

  return (
    <View style={styles.container}>
      {isTranscribing && <Loader />}
      <FlatList
        data={memos}
        renderItem={({ item, index }) => <MemoItem key={index} memo={item} />}
      />

      <View style={styles.footer}>
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
    </View>
  )
}

/**
 * Styles
 */
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: '#ecf0f1',
  },
  footer: {
    backgroundColor: 'white',
    height: 150,
    alignItems: 'center',
    justifyContent: 'center',
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
  },
  recordWave: {
    position: 'absolute',
    top: -20,
    bottom: -20,
    left: -20,
    right: -20,
    borderRadius: 1000,
  },
  redCircle: {
    backgroundColor: 'orangered',
    aspectRatio: 1,
  },
})