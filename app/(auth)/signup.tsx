import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
  Dimensions,
} from 'react-native';
import { useRouter, Link } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInUp, FadeInDown } from 'react-native-reanimated';
import { useAuthStore } from '../../lib/stores/authStore';

const { height } = Dimensions.get('window');

export default function SignupScreen() {
  const router = useRouter();
  const { register, isLoading } = useAuthStore();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isFocused, setIsFocused] = useState<string | null>(null);
  
  const handleSignup = async () => {
    if (!email.trim() || !password.trim() || !confirmPassword.trim()) {
      Alert.alert('Oops!', 'Please fill in all fields');
      return;
    }
    
    if (password !== confirmPassword) {
      Alert.alert('Oops!', 'Passwords do not match');
      return;
    }
    
    if (password.length < 6) {
      Alert.alert('Oops!', 'Password must be at least 6 characters');
      return;
    }
    
    try {
      await register(email.trim(), password);
      router.replace('/(auth)/profiles');
    } catch (err: any) {
      Alert.alert('Sign Up Failed', err.message || 'Please try again');
    }
  };
  
  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#0D9488', '#134E4A', '#1E3A5F', '#1A1A2E']}
        locations={[0, 0.3, 0.7, 1]}
        style={StyleSheet.absoluteFill}
      />
      
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <Animated.View 
            entering={FadeInDown.delay(100).springify()}
            style={styles.header}
          >
            <Pressable 
              onPress={() => router.back()} 
              style={styles.backButton}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <View style={styles.backButtonInner}>
                <Text style={styles.backArrow}>←</Text>
              </View>
            </Pressable>
            
            <View style={styles.iconCircle}>
              <Text style={styles.emoji}>🚀</Text>
            </View>
            <Text style={styles.title}>Get Started</Text>
            <Text style={styles.subtitle}>Create your family account</Text>
          </Animated.View>
          
          {/* Form */}
          <Animated.View 
            entering={FadeInUp.delay(200).springify()}
            style={styles.form}
          >
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Email</Text>
              <View style={[
                styles.inputWrapper,
                isFocused === 'email' && styles.inputWrapperFocused
              ]}>
                <Text style={styles.inputIcon}>📧</Text>
                <TextInput
                  style={styles.input}
                  placeholder="parent@email.com"
                  placeholderTextColor="rgba(255,255,255,0.4)"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  onFocus={() => setIsFocused('email')}
                  onBlur={() => setIsFocused(null)}
                />
              </View>
            </View>
            
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Password</Text>
              <View style={[
                styles.inputWrapper,
                isFocused === 'password' && styles.inputWrapperFocused
              ]}>
                <Text style={styles.inputIcon}>🔒</Text>
                <TextInput
                  style={styles.input}
                  placeholder="At least 6 characters"
                  placeholderTextColor="rgba(255,255,255,0.4)"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                  onFocus={() => setIsFocused('password')}
                  onBlur={() => setIsFocused(null)}
                />
              </View>
            </View>
            
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Confirm Password</Text>
              <View style={[
                styles.inputWrapper,
                isFocused === 'confirm' && styles.inputWrapperFocused
              ]}>
                <Text style={styles.inputIcon}>🔐</Text>
                <TextInput
                  style={styles.input}
                  placeholder="••••••••"
                  placeholderTextColor="rgba(255,255,255,0.4)"
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry
                  onFocus={() => setIsFocused('confirm')}
                  onBlur={() => setIsFocused(null)}
                />
              </View>
            </View>
            
            <Pressable
              style={({ pressed }) => [
                styles.signupButton,
                pressed && styles.signupButtonPressed,
                isLoading && styles.buttonDisabled
              ]}
              onPress={handleSignup}
              disabled={isLoading}
            >
              <LinearGradient
                colors={['#F59E0B', '#D97706']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.signupButtonGradient}
              >
                <Text style={styles.signupButtonText}>
                  {isLoading ? 'Creating account...' : 'Create Account'}
                </Text>
              </LinearGradient>
            </Pressable>
          </Animated.View>
          
          {/* Login prompt */}
          <Animated.View 
            entering={FadeInUp.delay(400).springify()}
            style={styles.loginSection}
          >
            <View style={styles.dividerContainer}>
              <View style={styles.divider} />
              <Text style={styles.dividerText}>Already a member?</Text>
              <View style={styles.divider} />
            </View>
            
            <Link href="/(auth)/login" asChild>
              <Pressable style={({ pressed }) => [
                styles.loginButton,
                pressed && styles.loginButtonPressed
              ]}>
                <Text style={styles.loginButtonText}>Sign In Instead</Text>
              </Pressable>
            </Link>
          </Animated.View>
          
          {/* Features */}
          <Animated.View 
            entering={FadeInUp.delay(500).springify()}
            style={styles.features}
          >
            <View style={styles.featureItem}>
              <View style={[styles.featureIconBg, { backgroundColor: 'rgba(245, 158, 11, 0.2)' }]}>
                <Text style={styles.featureIcon}>👨‍👩‍👧‍👦</Text>
              </View>
              <Text style={styles.featureText}>Multi-child support</Text>
            </View>
            <View style={styles.featureItem}>
              <View style={[styles.featureIconBg, { backgroundColor: 'rgba(59, 130, 246, 0.2)' }]}>
                <Text style={styles.featureIcon}>📱</Text>
              </View>
              <Text style={styles.featureText}>Sync across devices</Text>
            </View>
            <View style={styles.featureItem}>
              <View style={[styles.featureIconBg, { backgroundColor: 'rgba(16, 185, 129, 0.2)' }]}>
                <Text style={styles.featureIcon}>🎯</Text>
              </View>
              <Text style={styles.featureText}>Custom daily tasks</Text>
            </View>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: height * 0.06,
    paddingBottom: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  backButton: {
    position: 'absolute',
    left: 0,
    top: 0,
    zIndex: 10,
  },
  backButtonInner: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  backArrow: {
    fontSize: 20,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  iconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  emoji: {
    fontSize: 36,
  },
  title: {
    fontSize: 30,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 6,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.7)',
    fontWeight: '500',
  },
  form: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  inputContainer: {
    marginBottom: 18,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 10,
    color: 'rgba(255, 255, 255, 0.9)',
    letterSpacing: 0.5,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 14,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 14,
  },
  inputWrapperFocused: {
    borderColor: 'rgba(245, 158, 11, 0.6)',
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
  },
  inputIcon: {
    fontSize: 16,
    marginRight: 10,
  },
  input: {
    flex: 1,
    padding: 14,
    paddingLeft: 0,
    fontSize: 16,
    color: '#FFFFFF',
  },
  signupButton: {
    borderRadius: 14,
    overflow: 'hidden',
    marginTop: 6,
    shadowColor: '#F59E0B',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 6,
  },
  signupButtonPressed: {
    transform: [{ scale: 0.98 }],
    shadowOpacity: 0.2,
  },
  buttonDisabled: {
    opacity: 0.6,
    shadowOpacity: 0,
  },
  signupButtonGradient: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  signupButtonText: {
    fontSize: 17,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  loginSection: {
    marginTop: 24,
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
  },
  dividerText: {
    marginHorizontal: 14,
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.5)',
    fontWeight: '500',
  },
  loginButton: {
    paddingVertical: 14,
    alignItems: 'center',
    borderRadius: 14,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  loginButtonPressed: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  loginButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.9)',
  },
  features: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 28,
    paddingHorizontal: 8,
  },
  featureItem: {
    alignItems: 'center',
    flex: 1,
  },
  featureIconBg: {
    width: 48,
    height: 48,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  featureIcon: {
    fontSize: 22,
  },
  featureText: {
    fontSize: 11,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.6)',
    textAlign: 'center',
  },
});
