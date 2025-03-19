import { SignedIn, SignedOut } from '@clerk/clerk-expo';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter, Redirect } from 'expo-router';
import React from 'react';
import {
  Text,
  View,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
} from 'react-native';

export default function Page() {
  const router = useRouter();

  // When signed in, redirect to dashboard
  return (
    <>
      <SignedIn>
        <Redirect href="/(dashboard)" />
      </SignedIn>
      <SignedOut>
        <SafeAreaView style={styles.container}>
          <StatusBar barStyle="dark-content" backgroundColor="#fff" />
          <View style={styles.authContainer}>
            <View style={styles.logoContainer}>
              <MaterialCommunityIcons
                name="waveform"
                size={64}
                color="#5352ed"
              />
              <Text style={styles.logoText}>AudioRecorder</Text>
              <Text style={styles.tagline}>
                Professional voice recording studio in your pocket
              </Text>
            </View>

            <View style={styles.authButtons}>
              <TouchableOpacity
                style={styles.signInButton}
                onPress={() => {
                  router.push('/(auth)/sign-in');
                }}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={['#5352ed', '#3742fa']}
                  style={styles.gradientButton}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <Text style={styles.signInButtonText}>Sign In</Text>
                </LinearGradient>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.signUpButton}
                onPress={() => {
                  router.push('/(auth)/sign-up');
                }}
                activeOpacity={0.8}
              >
                <Text style={styles.signUpButtonText}>Create an Account</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.features}>
              <Text style={styles.featuresTitle}>Why AudioRecorder?</Text>

              <View style={styles.featureItem}>
                <View style={styles.featureIcon}>
                  <Ionicons name="checkmark-circle" size={22} color="#5352ed" />
                </View>
                <Text style={styles.featureText}>
                  High-quality 48kHz audio recording
                </Text>
              </View>

              <View style={styles.featureItem}>
                <View style={styles.featureIcon}>
                  <Ionicons name="checkmark-circle" size={22} color="#5352ed" />
                </View>
                <Text style={styles.featureText}>
                  Cloud syncing across all your devices
                </Text>
              </View>

              <View style={styles.featureItem}>
                <View style={styles.featureIcon}>
                  <Ionicons name="checkmark-circle" size={22} color="#5352ed" />
                </View>
                <Text style={styles.featureText}>
                  AI-powered transcription technology
                </Text>
              </View>

              <View style={styles.featureItem}>
                <View style={styles.featureIcon}>
                  <Ionicons name="checkmark-circle" size={22} color="#5352ed" />
                </View>
                <Text style={styles.featureText}>
                  Secure end-to-end encryption
                </Text>
              </View>
            </View>
          </View>
        </SafeAreaView>
      </SignedOut>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  authContainer: {
    flex: 1,
    padding: 25,
    justifyContent: 'center',
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 50,
  },
  logoText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 12,
  },
  tagline: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginTop: 8,
    maxWidth: '80%',
  },
  authButtons: {
    marginBottom: 40,
  },
  signInButton: {
    marginBottom: 15,
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#5352ed',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  gradientButton: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  signInButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  signUpButton: {
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#ddd',
    alignItems: 'center',
  },
  signUpButtonText: {
    color: '#333',
    fontSize: 16,
    fontWeight: '600',
  },
  features: {
    marginBottom: 30,
  },
  featuresTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 18,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  featureIcon: {
    marginRight: 10,
  },
  featureText: {
    fontSize: 15,
    color: '#555',
  },
});
