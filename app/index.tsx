import { useEffect } from 'react';
import { View, Text, StyleSheet, Pressable, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withSpring,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
  Easing,
  interpolate,
} from 'react-native-reanimated';
import { useAuthStore } from '../lib/stores/authStore';

const { width, height } = Dimensions.get('window');

export default function WelcomeScreen() {
  const router = useRouter();
  const { user, isInitialized } = useAuthStore();
  
  // Animations
  const logoScale = useSharedValue(0);
  const logoRotate = useSharedValue(-10);
  const titleOpacity = useSharedValue(0);
  const titleTranslateY = useSharedValue(20);
  const featuresOpacity = useSharedValue(0);
  const buttonsTranslateY = useSharedValue(60);
  const buttonsOpacity = useSharedValue(0);
  const floatAnim = useSharedValue(0);
  const pulseAnim = useSharedValue(1);
  
  useEffect(() => {
    // Redirect if already logged in
    if (isInitialized && user) {
      router.replace('/(auth)/profiles');
      return;
    }
    
    // Orchestrated entrance animations
    logoScale.value = withSpring(1, { damping: 10, stiffness: 100 });
    logoRotate.value = withSpring(0, { damping: 12 });
    
    titleOpacity.value = withDelay(200, withTiming(1, { duration: 500 }));
    titleTranslateY.value = withDelay(200, withSpring(0, { damping: 15 }));
    
    featuresOpacity.value = withDelay(400, withTiming(1, { duration: 600 }));
    
    buttonsOpacity.value = withDelay(600, withTiming(1, { duration: 400 }));
    buttonsTranslateY.value = withDelay(600, withSpring(0, { damping: 15 }));
    
    // Continuous floating animation for decorative elements
    floatAnim.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 2000, easing: Easing.inOut(Easing.ease) }),
        withTiming(0, { duration: 2000, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );
    
    // Subtle pulse for CTA button
    pulseAnim.value = withRepeat(
      withSequence(
        withTiming(1.02, { duration: 1500 }),
        withTiming(1, { duration: 1500 })
      ),
      -1,
      true
    );
  }, [isInitialized, user]);
  
  const logoStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: logoScale.value },
      { rotate: `${logoRotate.value}deg` },
    ],
  }));
  
  const titleStyle = useAnimatedStyle(() => ({
    opacity: titleOpacity.value,
    transform: [{ translateY: titleTranslateY.value }],
  }));
  
  const featuresStyle = useAnimatedStyle(() => ({
    opacity: featuresOpacity.value,
  }));
  
  const buttonsStyle = useAnimatedStyle(() => ({
    opacity: buttonsOpacity.value,
    transform: [{ translateY: buttonsTranslateY.value }],
  }));
  
  const floatingStyle1 = useAnimatedStyle(() => ({
    transform: [
      { translateY: interpolate(floatAnim.value, [0, 1], [0, -15]) },
      { rotate: `${interpolate(floatAnim.value, [0, 1], [-5, 5])}deg` },
    ],
  }));
  
  const floatingStyle2 = useAnimatedStyle(() => ({
    transform: [
      { translateY: interpolate(floatAnim.value, [0, 1], [-10, 5]) },
      { rotate: `${interpolate(floatAnim.value, [0, 1], [5, -5])}deg` },
    ],
  }));
  
  const floatingStyle3 = useAnimatedStyle(() => ({
    transform: [
      { translateY: interpolate(floatAnim.value, [0, 1], [5, -20]) },
    ],
  }));
  
  const ctaStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseAnim.value }],
  }));
  
  return (
    <View style={styles.container}>
      {/* Background gradient - Deep teal to warm navy */}
      <LinearGradient
        colors={['#0D9488', '#134E4A', '#1E3A5F', '#1A1A2E']}
        locations={[0, 0.3, 0.7, 1]}
        style={StyleSheet.absoluteFill}
      />
      
      {/* Decorative floating elements */}
      <View style={styles.decorations}>
        <Animated.Text style={[styles.floatingEmoji, styles.float1, floatingStyle1]}>
          ⭐
        </Animated.Text>
        <Animated.Text style={[styles.floatingEmoji, styles.float2, floatingStyle2]}>
          🌟
        </Animated.Text>
        <Animated.Text style={[styles.floatingEmoji, styles.float3, floatingStyle3]}>
          ✨
        </Animated.Text>
        <Animated.Text style={[styles.floatingEmoji, styles.float4, floatingStyle1]}>
          🎯
        </Animated.Text>
        <Animated.Text style={[styles.floatingEmoji, styles.float5, floatingStyle2]}>
          🏆
        </Animated.Text>
      </View>
      
      <View style={styles.content}>
        {/* Hero Section */}
        <View style={styles.heroSection}>
          {/* Animated Logo */}
          <Animated.View style={[styles.logoContainer, logoStyle]}>
            <View style={styles.logoCircle}>
              <Text style={styles.logoEmoji}>🚀</Text>
            </View>
          </Animated.View>
          
          {/* Title + Badge */}
          <Animated.View style={[styles.titleContainer, titleStyle]}>
            <View style={styles.titleRow}>
              <Text style={styles.title}>Tiny Tasks</Text>
              <View style={styles.betaBadge}>
                <Text style={styles.betaText}>BETA</Text>
              </View>
            </View>
            <Text style={styles.tagline}>Turn chores into adventures</Text>
          </Animated.View>
        </View>
        
        {/* Features */}
        <Animated.View style={[styles.featuresContainer, featuresStyle]}>
          <View style={styles.featureCard}>
            <View style={[styles.featureIcon, { backgroundColor: '#FEF3C7' }]}>
              <Text style={styles.featureEmoji}>⭐</Text>
            </View>
            <View style={styles.featureTextContainer}>
              <Text style={styles.featureTitle}>Earn Stars</Text>
              <Text style={styles.featureDesc}>Complete tasks, collect rewards</Text>
            </View>
          </View>
          
          <View style={styles.featureCard}>
            <View style={[styles.featureIcon, { backgroundColor: '#FEE2E2' }]}>
              <Text style={styles.featureEmoji}>🔥</Text>
            </View>
            <View style={styles.featureTextContainer}>
              <Text style={styles.featureTitle}>Build Streaks</Text>
              <Text style={styles.featureDesc}>Stay consistent, grow stronger</Text>
            </View>
          </View>
          
          <View style={styles.featureCard}>
            <View style={[styles.featureIcon, { backgroundColor: '#DBEAFE' }]}>
              <Text style={styles.featureEmoji}>🏆</Text>
            </View>
            <View style={styles.featureTextContainer}>
              <Text style={styles.featureTitle}>Unlock Badges</Text>
              <Text style={styles.featureDesc}>Celebrate every milestone</Text>
            </View>
          </View>
        </Animated.View>
        
        {/* CTA Buttons */}
        <Animated.View style={[styles.buttonsContainer, buttonsStyle]}>
          <Animated.View style={ctaStyle}>
            <Pressable 
              style={({ pressed }) => [
                styles.primaryButton,
                pressed && styles.primaryButtonPressed
              ]}
              onPress={() => router.push('/(auth)/signup')}
            >
              <LinearGradient
                colors={['#F59E0B', '#D97706']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.primaryButtonGradient}
              >
                <Text style={styles.primaryButtonText}>Get Started Free</Text>
                <Text style={styles.primaryButtonArrow}>→</Text>
              </LinearGradient>
            </Pressable>
          </Animated.View>
          
          <Pressable 
            style={({ pressed }) => [
              styles.secondaryButton,
              pressed && styles.secondaryButtonPressed
            ]}
            onPress={() => router.push('/(auth)/login')}
          >
            <Text style={styles.secondaryButtonText}>I already have an account</Text>
          </Pressable>
        </Animated.View>
      </View>
      
      {/* Bottom safe area with subtle branding */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>Built with 💛 for busy families</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  decorations: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
  },
  floatingEmoji: {
    position: 'absolute',
    fontSize: 28,
    opacity: 0.6,
  },
  float1: {
    top: height * 0.08,
    left: width * 0.1,
  },
  float2: {
    top: height * 0.12,
    right: width * 0.15,
  },
  float3: {
    top: height * 0.25,
    right: width * 0.08,
  },
  float4: {
    top: height * 0.18,
    left: width * 0.75,
  },
  float5: {
    top: height * 0.22,
    left: width * 0.05,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: height * 0.1,
    justifyContent: 'space-between',
    paddingBottom: 20,
  },
  heroSection: {
    alignItems: 'center',
  },
  logoContainer: {
    marginBottom: 24,
  },
  logoCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  logoEmoji: {
    fontSize: 50,
  },
  titleContainer: {
    alignItems: 'center',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 8,
  },
  title: {
    fontSize: 38,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -1,
  },
  betaBadge: {
    backgroundColor: 'rgba(245, 158, 11, 0.9)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  betaText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 1,
  },
  tagline: {
    fontSize: 18,
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: '500',
    letterSpacing: 0.5,
  },
  featuresContainer: {
    gap: 12,
    marginVertical: 32,
  },
  featureCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  featureIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  featureEmoji: {
    fontSize: 24,
  },
  featureTextContainer: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  featureDesc: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
    fontWeight: '400',
  },
  buttonsContainer: {
    gap: 16,
  },
  primaryButton: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#F59E0B',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 8,
  },
  primaryButtonPressed: {
    transform: [{ scale: 0.98 }],
    shadowOpacity: 0.2,
  },
  primaryButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    paddingHorizontal: 32,
    gap: 8,
  },
  primaryButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  primaryButtonArrow: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  secondaryButton: {
    paddingVertical: 16,
    alignItems: 'center',
    borderRadius: 16,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  secondaryButtonPressed: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.9)',
  },
  footer: {
    paddingBottom: 40,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.5)',
    fontWeight: '500',
  },
});
