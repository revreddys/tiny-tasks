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
} from 'react-native-reanimated';
import { useAuthStore } from '../lib/stores/authStore';
import { useThemeStore } from '../lib/stores/themeStore';

const { width } = Dimensions.get('window');

export default function WelcomeScreen() {
  const router = useRouter();
  const { user, isInitialized } = useAuthStore();
  const { colors, isDark } = useThemeStore();
  
  // Animations
  const titleScale = useSharedValue(0);
  const subtitleOpacity = useSharedValue(0);
  const buttonsTranslateY = useSharedValue(100);
  const starRotation = useSharedValue(0);
  
  useEffect(() => {
    // Redirect if already logged in - go to profile selector
    if (isInitialized && user) {
      router.replace('/(auth)/profiles');
      return;
    }
    
    // Start animations
    titleScale.value = withSpring(1, { damping: 12 });
    subtitleOpacity.value = withDelay(300, withTiming(1, { duration: 600 }));
    buttonsTranslateY.value = withDelay(500, withSpring(0, { damping: 15 }));
    starRotation.value = withRepeat(
      withSequence(
        withTiming(15, { duration: 500 }),
        withTiming(-15, { duration: 500 })
      ),
      -1,
      true
    );
  }, [isInitialized, user]);
  
  const titleStyle = useAnimatedStyle(() => ({
    transform: [{ scale: titleScale.value }],
  }));
  
  const subtitleStyle = useAnimatedStyle(() => ({
    opacity: subtitleOpacity.value,
  }));
  
  const buttonsStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: buttonsTranslateY.value }],
  }));
  
  const starStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${starRotation.value}deg` }],
  }));
  
  return (
    <LinearGradient
      colors={isDark ? [colors.gradientStart, colors.gradientEnd] : [colors.primary, colors.gradientEnd]}
      style={styles.container}
    >
      {/* Decorative elements */}
      <View style={styles.decorations}>
        <Animated.Text style={[styles.decorStar, styles.star1, starStyle]}>⭐</Animated.Text>
        <Animated.Text style={[styles.decorStar, styles.star2, starStyle]}>✨</Animated.Text>
        <Animated.Text style={[styles.decorStar, styles.star3, starStyle]}>🌟</Animated.Text>
      </View>
      
      <View style={styles.content}>
        {/* Logo/Title */}
        <Animated.View style={[styles.titleContainer, titleStyle]}>
          <Text style={styles.emoji}>🦄</Text>
          <View style={styles.titleRow}>
            <Text style={styles.title}>Tiny Tasks</Text>
            <View style={styles.betaBadge}>
              <Text style={styles.betaText}>BETA</Text>
            </View>
          </View>
        </Animated.View>
        
        <Animated.Text style={[styles.subtitle, subtitleStyle]}>
          Make daily routines fun for your little ones!
        </Animated.Text>
        
        {/* Features */}
        <Animated.View style={[styles.features, subtitleStyle]}>
          <View style={styles.featureRow}>
            <Text style={styles.featureIcon}>⭐</Text>
            <Text style={styles.featureText}>Earn stars</Text>
          </View>
          <View style={styles.featureRow}>
            <Text style={styles.featureIcon}>🔥</Text>
            <Text style={styles.featureText}>Build streaks</Text>
          </View>
          <View style={styles.featureRow}>
            <Text style={styles.featureIcon}>🏆</Text>
            <Text style={styles.featureText}>Unlock badges</Text>
          </View>
        </Animated.View>
        
        {/* Buttons */}
        <Animated.View style={[styles.buttons, buttonsStyle]}>
          <Pressable 
            style={[styles.primaryButton, { backgroundColor: isDark ? colors.cardBg : '#FFFFFF' }]}
            onPress={() => router.push('/(auth)/signup')}
          >
            <Text style={[styles.primaryButtonText, { color: colors.primary }]}>Get Started</Text>
          </Pressable>
          
          <Pressable 
            style={styles.secondaryButton}
            onPress={() => router.push('/(auth)/login')}
          >
            <Text style={styles.secondaryButtonText}>I have an account</Text>
          </Pressable>
        </Animated.View>
      </View>
      
      {/* Bottom characters */}
      <View style={styles.characters}>
        <Text style={styles.character}>🐻</Text>
        <Text style={styles.character}>🐰</Text>
        <Text style={styles.character}>🐱</Text>
        <Text style={styles.character}>🐶</Text>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  decorations: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  decorStar: {
    position: 'absolute',
    fontSize: 30,
  },
  star1: {
    top: 100,
    left: 30,
  },
  star2: {
    top: 150,
    right: 40,
  },
  star3: {
    top: 80,
    right: 100,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 30,
  },
  titleContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  emoji: {
    fontSize: 80,
    marginBottom: 10,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  title: {
    fontSize: 42,
    fontWeight: '800',
    color: '#FFFFFF',
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 4,
  },
  betaBadge: {
    backgroundColor: 'rgba(255,255,255,0.25)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.5)',
  },
  betaText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 1.5,
  },
  subtitle: {
    fontSize: 18,
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 30,
    opacity: 0.95,
  },
  features: {
    marginBottom: 40,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 8,
  },
  featureIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  featureText: {
    fontSize: 18,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  buttons: {
    width: '100%',
  },
  primaryButton: {
    paddingVertical: 18,
    borderRadius: 30,
    alignItems: 'center',
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  primaryButtonText: {
    fontSize: 18,
    fontWeight: '700',
  },
  secondaryButton: {
    paddingVertical: 15,
    alignItems: 'center',
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    opacity: 0.9,
  },
  characters: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingBottom: 50,
  },
  character: {
    fontSize: 50,
    marginHorizontal: 10,
  },
});
