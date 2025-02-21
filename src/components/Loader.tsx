import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, {
  useAnimatedStyle,
  withRepeat,
  withTiming,
  useSharedValue,
  withSequence,
  Easing,
} from 'react-native-reanimated';

const Loader = () => {
  const rotation = useSharedValue(0);

  React.useEffect(() => {
    rotation.value = withRepeat(
      withSequence(
        withTiming(360, {
          duration: 1000,
          easing: Easing.linear,
        })
      ),
      -1
    );
  }, [rotation]);

  const spinnerStyle = useAnimatedStyle(() => {
    return {
      transform: [{ rotate: `${rotation.value}deg` }],
    };
  });

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.spinner, spinnerStyle]} />
      <Text style={styles.text}>
        Audio is being transcribed, please wait...
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  spinner: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 4,
    borderColor: '#FF4500',
    borderTopColor: 'transparent',
    marginBottom: 16,
  },
  text: {
    color: 'gray',
    fontSize: 16,
    fontFamily: 'Inter',
    textAlign: 'center',
    maxWidth: '80%',
  },
});

export default Loader;
