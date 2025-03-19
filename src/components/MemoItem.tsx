import { FontAwesome5 } from '@expo/vector-icons';
import { Audio, AVPlaybackStatus } from 'expo-av';
import { Sound } from 'expo-av/build/Audio';
import { useState, useEffect, useCallback, useRef } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { interpolate, Extrapolation } from 'react-native-reanimated';

export type Memo = {
  uri: string;
  s3Uri?: string;
  metering: number[];
  transcript?: string;
  timestamp?: string;
};

const MemoItem = ({ memo }: { memo: Memo }) => {
  const [, setSound] = useState<Sound>();
  const [isPlaying, setIsPlaying] = useState(false);
  const [position, setPosition] = useState(0);
  const [duration, setDuration] = useState(0);
  const [showTranscript, setShowTranscript] = useState(false);
  const soundRef = useRef<Sound>();

  const onPlaybackStatusUpdate = useCallback(
    async (status: AVPlaybackStatus) => {
      if (!status.isLoaded) return;
      setIsPlaying(status.isPlaying);
      setPosition(status.positionMillis);
      setDuration(status.durationMillis ?? 0);
      if (status.didJustFinish) {
        setIsPlaying(false);
        try {
          await soundRef.current?.setPositionAsync(0);
        } catch (error) {
          console.error('Error resetting position:', error);
        }
      }
    },
    []
  );

  useEffect(() => {
    let isMounted = true;
    const loadSound = async () => {
      try {
        if (soundRef.current) {
          await soundRef.current.unloadAsync();
        }
        const { sound: newSound } = await Audio.Sound.createAsync(
          { uri: memo.uri },
          { progressUpdateIntervalMillis: 100 },
          onPlaybackStatusUpdate
        );
        if (!isMounted) {
          await newSound.unloadAsync();
          return;
        }
        soundRef.current = newSound;
        setSound(newSound);
        const status = await newSound.getStatusAsync();
        if (status.isLoaded && isMounted) {
          setDuration(status.durationMillis ?? 0);
        }
      } catch (error) {
        console.error('Error loading sound:', error);
      }
    };
    loadSound().catch((error) => {
      console.error('Error in loadSound:', error);
    });
    return () => {
      isMounted = false;
      if (soundRef.current) {
        soundRef.current.unloadAsync().catch((error) => {
          console.error('Error unloading sound:', error);
        });
      }
    };
  }, [memo.uri, onPlaybackStatusUpdate]);

  const togglePlayback = useCallback(async () => {
    try {
      if (!soundRef.current) return;
      if (isPlaying) {
        await soundRef.current.pauseAsync();
      } else {
        if (position >= duration) {
          await soundRef.current.setPositionAsync(0);
        }
        await soundRef.current.playAsync();
      }
    } catch (error) {
      console.error('Error toggling playback:', error);
    }
  }, [isPlaying, position, duration]);

  const formatMillis = useCallback((millis: number) => {
    const minutes = Math.floor(millis / (1000 * 60));
    const seconds = Math.floor((millis % (1000 * 60)) / 1000);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  }, []);

  const progress = duration > 0 ? position / duration : 0;
  const numLines = 50;
  const lines = memo.metering
    .reduce<number[][]>(
      (acc, curr, i) => {
        const index = Math.floor((i * numLines) / memo.metering.length);
        if (!acc[index]) acc[index] = [];
        acc[index].push(curr);
        return acc;
      },
      Array(numLines)
        .fill(null)
        .map(() => [])
    )
    .map((group) => group.reduce((sum, val) => sum + val, 0) / group.length);

  const waveLineHeight = useCallback((db: number) => {
    const height = interpolate(db, [-60, 0], [5, 50], Extrapolation.CLAMP);
    return isNaN(height) ? 5 : height;
  }, []);

  const isValidLine = useCallback(
    (db: unknown): db is number => typeof db === 'number' && !isNaN(db),
    []
  );

  return (
    <View style={styles.container}>
      <View
        style={[
          styles.audioSection,
          {
            borderBottomWidth: memo?.transcript ? StyleSheet.hairlineWidth : 0,
          },
        ]}
      >
        <FontAwesome5
          onPress={togglePlayback}
          name={isPlaying ? 'pause' : 'play'}
          size={20}
          color={'gray'}
        />
        <View style={styles.playbackContainer}>
          <View style={styles.wave}>
            {lines.map((db, index) => (
              <View
                key={index}
                style={[
                  styles.waveLine,
                  {
                    height: isValidLine(db) ? waveLineHeight(db) : 5,
                    backgroundColor:
                      progress > index / lines.length
                        ? 'royalblue'
                        : 'gainsboro',
                  },
                ]}
              />
            ))}
          </View>
          <Text style={styles.duration}>
            {formatMillis(position)} / {formatMillis(duration)}
          </Text>
        </View>
      </View>

      {memo.transcript && (
        <View>
          <Pressable
            onPress={() => {
              setShowTranscript(!showTranscript);
            }}
            style={styles.toggleTranscriptButton}
          >
            <Text style={styles.toggleTranscriptText}>
              {showTranscript ? 'Hide Transcript' : 'Show Transcript'}
            </Text>
          </Pressable>
          {showTranscript && (
            <View style={styles.transcriptContainer}>
              <View style={styles.transcriptHeader}>
                <FontAwesome5 name="file-alt" size={14} color="gray" />
                <Text style={styles.transcriptTitle}>Transcript</Text>
              </View>
              <Text style={styles.transcriptText}>{memo.transcript}</Text>
            </View>
          )}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    margin: 10,
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  audioSection: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 12,
    gap: 15,
    borderBottomColor: '#E5E5E5',
  },
  playbackContainer: {
    flex: 1,
    height: 80,
    justifyContent: 'center',
  },
  wave: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  waveLine: {
    flex: 1,
    backgroundColor: 'gainsboro',
    borderRadius: 20,
  },
  duration: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    color: 'gray',
    fontFamily: 'Inter',
    fontSize: 12,
  },
  toggleTranscriptButton: {
    backgroundColor: '#E5E5E5',
    paddingVertical: 6,
    paddingHorizontal: 12,
    alignSelf: 'flex-start',
    margin: 10,
    borderRadius: 4,
  },
  toggleTranscriptText: {
    fontSize: 14,
    color: '#333',
    fontFamily: 'Inter',
  },
  transcriptContainer: {
    padding: 15,
    backgroundColor: '#F8F9FA',
  },
  transcriptHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  transcriptTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  transcriptText: {
    fontSize: 15,
    lineHeight: 22,
    color: '#2C3E50',
    fontFamily: 'Inter',
  },
});

export default MemoItem;
