import { useSignIn } from '@clerk/clerk-expo';
import { Link, useRouter } from 'expo-router';
import React from 'react';
import { 
  Text, 
  TextInput, 
  TouchableOpacity, 
  View, 
  StyleSheet, 
  ActivityIndicator, 
  Alert, 
  KeyboardAvoidingView, 
  Platform,
  Image,
  ScrollView 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function Page() {
  const { signIn, setActive, isLoaded } = useSignIn();
  const router = useRouter();

  const [emailAddress, setEmailAddress] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [showPassword, setShowPassword] = React.useState(false);

  // Handle the submission of the sign-in form
  const onSignInPress = async () => {
    if (!isLoaded || loading) return;

    // Validate input
    if (!emailAddress.trim()) {
      Alert.alert("Error", "Please enter your email address");
      return;
    }
    
    if (!password.trim()) {
      Alert.alert("Error", "Please enter your password");
      return;
    }

    setLoading(true);
    
    // Start the sign-in process using the email and password provided
    try {
      const signInAttempt = await signIn.create({
        identifier: emailAddress,
        password,
      });

      // If sign-in process is complete, set the created session as active
      // and redirect the user to the dashboard
      if (signInAttempt.status === 'complete') {
        await setActive({ session: signInAttempt.createdSessionId });
        router.replace('/(dashboard)');
      } else {
        // Handle incomplete sign-in attempts
        console.log("Incomplete sign-in:", JSON.stringify(signInAttempt, null, 2));
        Alert.alert("Sign In Error", "Unable to complete sign in. Please check your credentials and try again.");
      }
    } catch (err: any) {
      let errorMessage = "Failed to sign in. Please try again.";
      
      if (err.errors && err.errors.length > 0) {
        const error = err.errors[0];
        
        if (error.code === 'form_identifier_not_found') {
          errorMessage = "We couldn't find an account with that email. Please check your email or sign up.";
        } else if (error.code === 'form_password_incorrect') {
          errorMessage = "Incorrect password. Please try again.";
        } else {
          errorMessage = error.message || errorMessage;
        }
      }
      
      Alert.alert("Error", errorMessage);
      console.error(JSON.stringify(err, null, 2));
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
    >
      <TouchableOpacity
        style={styles.backButtonAbsolute}
        onPress={() => router.push('/')}
      >
        <Ionicons name="arrow-back" size={24} color="#4f46e5" />
      </TouchableOpacity>
      
      <ScrollView 
        contentContainerStyle={styles.scrollContainer}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.card}>
          <Text style={styles.title}>Sign In</Text>
          <View style={styles.formGroup}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={styles.input}
              autoCapitalize="none"
              keyboardType="email-address"
              value={emailAddress}
              placeholder="your@email.com"
              onChangeText={setEmailAddress}
            />
          </View>
          
          <View style={styles.formGroup}>
            <Text style={styles.label}>Password</Text>
            <View style={styles.passwordContainer}>
              <TextInput
                style={styles.passwordInput}
                value={password}
                placeholder="••••••••"
                secureTextEntry={!showPassword}
                onChangeText={setPassword}
              />
              <TouchableOpacity 
                style={styles.visibilityIcon} 
                onPress={() => setShowPassword(!showPassword)}
              >
                <Ionicons 
                  name={showPassword ? "eye" : "eye-off"} 
                  size={24} 
                  color="#6b7280" 
                />
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity 
            style={styles.button} 
            onPress={onSignInPress}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.buttonText}>Sign in</Text>
            )}
          </TouchableOpacity>

          <View style={styles.footer}>
            <Text style={styles.footerText}>Don't have an account?</Text>
            <Link href="/sign-up" asChild>
              <TouchableOpacity>
                <Text style={styles.footerLink}>Sign up</Text>
              </TouchableOpacity>
            </Link>
          </View>
        </View>
        
        <View style={styles.clerkBadgeContainer}>
          <Text style={styles.securedByText}>Secured by</Text>
          <Image 
            source={require('../../../assets/clerk.png')}  
            style={styles.clerkLogo}
            resizeMode="contain"
          />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    paddingBottom: 40,
  },
  card: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    marginBottom: 20,
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
    width: '100%',
  },
  backButton: {
    padding: 8,
  },
  backButtonAbsolute: {
    position: 'absolute',
    top: 50,
    left: 20,
    zIndex: 10,
    padding: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  placeholder: {
    width: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 24,
    textAlign: 'center',
    color: '#111827',
    flex: 1,
  },
  formGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 6,
    color: '#374151',
  },
  input: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 6,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  button: {
    backgroundColor: '#4f46e5',
    borderRadius: 6,
    padding: 14,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
    gap: 6,
  },
  footerText: {
    color: '#6b7280',
    fontSize: 14,
  },
  footerLink: {
    color: '#4f46e5',
    fontSize: 14,
    fontWeight: '600',
  },
  clerkBadgeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 8,
    backgroundColor: '#f3f4f6',
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  securedByText: {
    color: '#6b7280',
    fontSize: 14,
    marginRight: 5,
  },
  clerkLogo: {
    width: 40,
    height: 16,
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 6,
    backgroundColor: '#fff',
  },
  passwordInput: {
    flex: 1,
    padding: 12,
    fontSize: 16,
  },
  visibilityIcon: {
    padding: 10,
  },
});
