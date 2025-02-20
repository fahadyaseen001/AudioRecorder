import { View, Text, StyleSheet } from 'react-native'
import { FontAwesome5 } from '@expo/vector-icons'
import { useState, useEffect, useCallback } from 'react'
import { AVPlaybackStatus, Audio } from 'expo-av'
import { Sound } from 'expo-av/build/Audio'
import Animated, {
  Extrapolation,
  interpolate,
  useAnimatedStyle,
  withTiming,
} from 'react-native-reanimated'

export type Memo = {
  uri: string // audio file uri
  metering: number[] // dB array
  transcript?: string
}

/**
 * Component to display an audio record item
 */
const MemoItem = ({ memo }: { memo: Memo }) => {
  const [sound, setSound] = useState<Sound>()
  const [status, setStatus] = useState<AVPlaybackStatus>()

  /**
   * Load the audio file
   */
  async function loadSound() {
    const { sound } = await Audio.Sound.createAsync(
      { uri: memo.uri },
      { progressUpdateIntervalMillis: 1000 / 60 },
      onPlaybackStatusUpdate
    )
    setSound(sound)
  }

  /**
   * Callback to update the playback status
   */
  const onPlaybackStatusUpdate = useCallback(
    async (newStatus: AVPlaybackStatus) => {
      setStatus(newStatus)

      if (!newStatus.isLoaded || !sound) {
        return
      }

      if (newStatus.didJustFinish) {
        await sound?.setPositionAsync(0)
      }
    },
    [sound]
  )

  useEffect(() => {
    loadSound()
  }, [memo])

  /**
   * Play or pause the audio
   */
  const playSound = useCallback(async () => {
    if (!sound) {
      return
    }
    if (status?.isLoaded && status.isPlaying) {
      await sound.pauseAsync()
    } else {
      await sound.replayAsync()
    }
  }, [sound, status])

  useEffect(() => {
    return sound
      ? () => {
          sound.unloadAsync()
        }
      : undefined
  }, [sound])

  /**
   * Format milliseconds to minutes:seconds
   */
  const formatMillis = (millis: number) => {
    const minutes = Math.floor(millis / (1000 * 60))
    const seconds = Math.floor((millis % (1000 * 60)) / 1000)
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`
  }

  const isPlaying = status?.isLoaded ? status.isPlaying : false
  const position = status?.isLoaded ? status.positionMillis : 0
  const duration = status?.isLoaded ? status.durationMillis : 1

  const progress = position / (duration ?? 1)

  /**
   * Animated style for the playback blue dot indicator
   */
  const animatedIndicatorStyle = useAnimatedStyle(() => ({
    left: `${progress * 100}%`,
    // withTiming(`${progress * 100}%`, {
    //   duration:
    //     (status?.isLoaded && status.progressUpdateIntervalMillis) || 100,
    // }),
  }))

  // Compress or expand the audio waveform to fit the playback duration
  let numLines = 50
  let lines = []

  for (let i = 0; i < numLines; i++) {
    const meteringIndex = Math.floor((i * memo.metering.length) / numLines)
    const nextMeteringIndex = Math.ceil(
      ((i + 1) * memo.metering.length) / numLines
    )
    const values = memo.metering.slice(meteringIndex, nextMeteringIndex)
    const average = values.reduce((sum, a) => sum + a, 0) / values.length
    // lines.push(memo.metering[meteringIndex]);
    lines.push(average)
  }

  // Fix the wave line height NaN issue
  const waveLineHeight = (db: number) => {
    const height = interpolate(
      db,
      [-60, 0],
      [5, 50],
      Extrapolation.CLAMP
    )
    return isNaN(height) ? 5 : height
  }

  const isValidLine = (db: any) => typeof db === 'number' && !isNaN(db)

  return (
    <View style={styles.container}>
      <View style={[styles.audioSection, { borderBottomWidth: memo?.transcript ? StyleSheet.hairlineWidth : 0 }]}>
        <FontAwesome5
          onPress={playSound}
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
                      progress > index / lines.length ? 'royalblue' : 'gainsboro',
                  },
                ]}
              />
            ))}
          </View>

          <Text style={styles.duration}>
            {formatMillis(position || 0)} / {formatMillis(duration || 0)}
          </Text>
        </View>
      </View>

      {memo.transcript && (
        <View style={styles.transcriptContainer}>
          <View style={styles.transcriptHeader}>
            <FontAwesome5 name="file-alt" size={14} color="gray" />
            <Text style={styles.transcriptTitle}>Transcript</Text>
          </View>
          <Text style={styles.transcriptText}>{memo.transcript}</Text>
        </View>
      )}
    </View>
  )
}

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
})

export default MemoItem