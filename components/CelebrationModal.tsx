import React, { useEffect, useCallback } from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  Modal,
  Dimensions,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withSequence,
  withTiming,
  withDelay,
  runOnJS,
  Easing,
  interpolate,
  interpolateColor,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { Celebration } from '../lib/types';
import Colors from '../constants/colors';
import { useThemeStore } from '../lib/stores/themeStore';

const { width, height } = Dimensions.get('window');

interface CelebrationModalProps {
  celebration: Celebration | null;
  onClose: () => void;
}

// Particle shapes and colors for confetti - harmonized with teal/navy theme
const PARTICLE_COLORS = [
  '#FFD700', // Gold - for stars
  '#F59E0B', // Amber - matches CTA buttons
  '#0D9488', // Teal - matches primary gradient
  '#14B8A6', // Lighter teal
  '#06B6D4', // Cyan
  '#38BDF8', // Sky blue
  '#A7F3D0', // Mint green
  '#FCD34D', // Light gold
];
const PARTICLE_SHAPES = ['circle', 'square', 'star'] as const;

// Single confetti particle with realistic physics
const ConfettiParticle = ({ 
  index, 
  totalParticles 
}: { 
  index: number; 
  totalParticles: number;
}) => {
  const progress = useSharedValue(0);
  
  // Randomize particle properties
  const startX = (index / totalParticles) * width + (Math.random() - 0.5) * 100;
  const endX = startX + (Math.random() - 0.5) * 150;
  const size = 8 + Math.random() * 8;
  const color = PARTICLE_COLORS[index % PARTICLE_COLORS.length];
  const shape = PARTICLE_SHAPES[index % PARTICLE_SHAPES.length];
  const delay = index * 30;
  const duration = 2500 + Math.random() * 1000;
  const rotationSpeed = 180 + Math.random() * 360;
  const swayAmount = 30 + Math.random() * 40;
  
  useEffect(() => {
    progress.value = withDelay(
      delay,
      withTiming(1, { 
        duration, 
        easing: Easing.out(Easing.quad) 
      })
    );
  }, []);
  
  const animatedStyle = useAnimatedStyle(() => {
    const translateY = interpolate(
      progress.value,
      [0, 1],
      [-60, height + 60]
    );
    
    // Gentle swaying motion
    const sway = Math.sin(progress.value * Math.PI * 3) * swayAmount * (1 - progress.value);
    const translateX = startX + (endX - startX) * progress.value + sway;
    
    const rotate = progress.value * rotationSpeed;
    const scale = interpolate(progress.value, [0, 0.1, 0.9, 1], [0, 1, 1, 0.5]);
    const opacity = interpolate(progress.value, [0, 0.1, 0.8, 1], [0, 1, 1, 0]);
    
    return {
      position: 'absolute',
      left: 0,
      top: 0,
      width: size,
      height: size,
      backgroundColor: shape === 'star' ? 'transparent' : color,
      borderRadius: shape === 'circle' ? size / 2 : shape === 'square' ? 2 : 0,
      transform: [
        { translateX },
        { translateY },
        { rotate: `${rotate}deg` },
        { scale },
      ],
      opacity,
    };
  });
  
  if (shape === 'star') {
    return (
      <Animated.Text style={[animatedStyle, { fontSize: size * 1.5 }]}>
        ⭐
      </Animated.Text>
    );
  }
  
  return <Animated.View style={animatedStyle} />;
};

// Animated star that flies up
const FlyingStar = ({ 
  index, 
  total,
  baseDelay 
}: { 
  index: number; 
  total: number;
  baseDelay: number;
}) => {
  const progress = useSharedValue(0);
  const startX = width / 2 + (index - (total - 1) / 2) * 50;
  
  useEffect(() => {
    progress.value = withDelay(
      baseDelay + index * 150,
      withSequence(
        withTiming(1, { duration: 600, easing: Easing.out(Easing.back(1.5)) }),
        withTiming(0.8, { duration: 200 })
      )
    );
  }, []);
  
  const style = useAnimatedStyle(() => {
    const translateY = interpolate(progress.value, [0, 1], [100, 0]);
    const scale = interpolate(progress.value, [0, 0.5, 1], [0, 1.3, 1]);
    const opacity = interpolate(progress.value, [0, 0.3, 1], [0, 1, 1]);
    
    return {
      transform: [
        { translateY },
        { scale },
      ],
      opacity,
    };
  });
  
  return (
    <Animated.Text style={[styles.flyingStar, style, { left: startX - 20 }]}>
      ⭐
    </Animated.Text>
  );
};

// Pulsing glow ring effect
const GlowRing = ({ delay, color }: { delay: number; color: string }) => {
  const scale = useSharedValue(0.8);
  const opacity = useSharedValue(0);
  
  useEffect(() => {
    scale.value = withDelay(delay, withTiming(2.5, { duration: 1000, easing: Easing.out(Easing.ease) }));
    opacity.value = withDelay(delay, withSequence(
      withTiming(0.6, { duration: 200 }),
      withTiming(0, { duration: 800 })
    ));
  }, []);
  
  const style = useAnimatedStyle(() => ({
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 3,
    borderColor: color,
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));
  
  return <Animated.View style={style} />;
};

export default function CelebrationModal({ celebration, onClose }: CelebrationModalProps) {
  const { colors } = useThemeStore();
  
  // Animation values
  const overlayOpacity = useSharedValue(0);
  const cardScale = useSharedValue(0.8);
  const cardOpacity = useSharedValue(0);
  const emojiScale = useSharedValue(0);
  const emojiRotate = useSharedValue(-15);
  const contentOpacity = useSharedValue(0);
  const buttonScale = useSharedValue(0);
  const progressWidth = useSharedValue(0);
  
  const handleClose = useCallback(() => {
    // Exit animation
    overlayOpacity.value = withTiming(0, { duration: 200 });
    cardScale.value = withTiming(0.8, { duration: 200, easing: Easing.in(Easing.ease) });
    cardOpacity.value = withTiming(0, { duration: 200 }, () => {
      runOnJS(onClose)();
    });
  }, [onClose]);
  
  useEffect(() => {
    if (celebration) {
      // Haptic feedback
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      
      // Orchestrated entrance
      overlayOpacity.value = withTiming(1, { duration: 300 });
      cardScale.value = withDelay(100, withSpring(1, { damping: 15, stiffness: 150 }));
      cardOpacity.value = withDelay(100, withTiming(1, { duration: 200 }));
      
      // Emoji entrance with bounce
      emojiScale.value = withDelay(200, withSpring(1, { damping: 8, stiffness: 200 }));
      emojiRotate.value = withDelay(200, withSpring(0, { damping: 12 }));
      
      // Content fade in
      contentOpacity.value = withDelay(400, withTiming(1, { duration: 300 }));
      
      // Button entrance
      buttonScale.value = withDelay(600, withSpring(1, { damping: 12, stiffness: 150 }));
      
      // Auto-close progress bar
      progressWidth.value = withDelay(500, withTiming(100, { duration: 2500, easing: Easing.linear }));
      
      // Auto close after animation
      const timer = setTimeout(handleClose, 3200);
      return () => clearTimeout(timer);
    }
  }, [celebration]);
  
  const overlayStyle = useAnimatedStyle(() => ({
    opacity: overlayOpacity.value,
  }));
  
  const cardStyle = useAnimatedStyle(() => ({
    transform: [{ scale: cardScale.value }],
    opacity: cardOpacity.value,
  }));
  
  const emojiStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: emojiScale.value },
      { rotate: `${emojiRotate.value}deg` },
    ],
  }));
  
  const contentStyle = useAnimatedStyle(() => ({
    opacity: contentOpacity.value,
  }));
  
  const buttonStyle = useAnimatedStyle(() => ({
    transform: [{ scale: buttonScale.value }],
  }));
  
  const progressStyle = useAnimatedStyle(() => ({
    width: `${progressWidth.value}%`,
  }));
  
  if (!celebration) return null;
  
  const getEmoji = () => {
    switch (celebration.type) {
      case 'task': return '⭐';
      case 'routine': return '🎊';
      case 'badge': return celebration.badge?.icon || '🏆';
      case 'streak': return '🔥';
      case 'redemption': return celebration.reward?.icon || '🎁';
      default: return '🌟';
    }
  };
  
  const getGlowColor = () => {
    // Colors harmonized with teal/navy theme
    switch (celebration.type) {
      case 'task': return '#F59E0B';      // Amber - matches app accent
      case 'routine': return '#14B8A6';   // Teal - matches primary
      case 'badge': return '#8B5CF6';     // Purple - still distinct but softer
      case 'streak': return '#F97316';    // Orange - warm but not jarring
      case 'redemption': return '#06B6D4'; // Cyan - complements teal
      default: return '#F59E0B';
    }
  };
  
  const glowColor = getGlowColor();
  
  return (
    <Modal
      visible={!!celebration}
      transparent
      animationType="none"
      onRequestClose={handleClose}
      statusBarTranslucent
    >
      <Animated.View style={[styles.overlay, overlayStyle]}>
        {/* Confetti particles */}
        {[...Array(25)].map((_, i) => (
          <ConfettiParticle key={i} index={i} totalParticles={25} />
        ))}
        
        {/* Flying stars for task completion */}
        {celebration.type === 'task' && celebration.stars && (
          [...Array(celebration.stars)].map((_, i) => (
            <FlyingStar key={i} index={i} total={celebration.stars!} baseDelay={300} />
          ))
        )}
        
        <Pressable style={styles.touchArea} onPress={handleClose}>
          <Animated.View style={[styles.card, cardStyle, { backgroundColor: colors.cardBg }]}>
            {/* Glow rings */}
            <View style={styles.glowContainer}>
              <GlowRing delay={200} color={glowColor} />
              <GlowRing delay={400} color={glowColor} />
            </View>
            
            {/* Main emoji */}
            <Animated.View style={[styles.emojiContainer, emojiStyle]}>
              <Text style={styles.emoji}>{getEmoji()}</Text>
            </Animated.View>
            
            {/* Content */}
            <Animated.View style={[styles.contentContainer, contentStyle]}>
              <Text style={[styles.title, { color: colors.text }]}>
                {celebration.title}
              </Text>
              
              {celebration.subtitle && (
                <Text style={[styles.subtitle, { color: colors.textLight }]}>
                  {celebration.subtitle}
                </Text>
              )}
              
              {/* Stars earned display */}
              {celebration.type === 'task' && celebration.stars && (
                <View style={styles.starsEarned}>
                  <Text style={styles.starsText}>+{celebration.stars}</Text>
                  <Text style={styles.starsEmoji}>⭐</Text>
                </View>
              )}
              
              {/* Badge display */}
              {celebration.type === 'badge' && celebration.badge && (
                <View style={[styles.badgeDisplay, { backgroundColor: '#8B5CF6' + '20' }]}>
                  <Text style={styles.badgeName}>{celebration.badge.name}</Text>
                </View>
              )}
              
              {/* Streak display */}
              {celebration.type === 'streak' && celebration.streak && (
                <View style={styles.streakDisplay}>
                  <Text style={styles.streakNumber}>{celebration.streak}</Text>
                  <Text style={[styles.streakLabel, { color: colors.textLight }]}>day streak!</Text>
                </View>
              )}
              
              {/* Reward display */}
              {celebration.type === 'redemption' && celebration.reward && (
                <View style={[styles.rewardDisplay, { backgroundColor: '#06B6D4' + '20' }]}>
                  <Text style={styles.rewardName}>{celebration.reward.name}</Text>
                </View>
              )}
            </Animated.View>
            
            {/* Continue button */}
            <Animated.View style={buttonStyle}>
              <Pressable 
                style={({ pressed }) => [
                  styles.continueButton,
                  { backgroundColor: glowColor },
                  pressed && styles.continueButtonPressed
                ]} 
                onPress={handleClose}
              >
                <Text style={styles.continueText}>Awesome!</Text>
              </Pressable>
            </Animated.View>
            
            {/* Auto-close progress bar */}
            <View style={styles.progressContainer}>
              <Animated.View style={[styles.progressBar, progressStyle, { backgroundColor: glowColor + '60' }]} />
            </View>
          </Animated.View>
        </Pressable>
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  touchArea: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  card: {
    borderRadius: 28,
    padding: 32,
    paddingTop: 40,
    alignItems: 'center',
    width: width * 0.85,
    maxWidth: 340,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.25,
    shadowRadius: 30,
    elevation: 15,
    overflow: 'hidden',
  },
  glowContainer: {
    position: 'absolute',
    top: 60,
    left: '50%',
    marginLeft: -60,
    width: 120,
    height: 120,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emojiContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  emoji: {
    fontSize: 56,
  },
  contentContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 16,
  },
  starsEarned: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF9E6',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
    gap: 8,
    borderWidth: 2,
    borderColor: '#FFD700',
  },
  starsText: {
    fontSize: 24,
    fontWeight: '800',
    color: '#B8860B',
  },
  starsEmoji: {
    fontSize: 24,
  },
  badgeDisplay: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 16,
  },
  badgeName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#8B5CF6',
  },
  streakDisplay: {
    alignItems: 'center',
  },
  streakNumber: {
    fontSize: 48,
    fontWeight: '800',
    color: '#F97316',
  },
  streakLabel: {
    fontSize: 16,
    fontWeight: '600',
  },
  rewardDisplay: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 16,
  },
  rewardName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#06B6D4',
    textAlign: 'center',
  },
  continueButton: {
    paddingVertical: 16,
    paddingHorizontal: 48,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  continueButtonPressed: {
    transform: [{ scale: 0.97 }],
    opacity: 0.9,
  },
  continueText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
  },
  progressContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 4,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
  },
  progressBar: {
    height: '100%',
    borderRadius: 2,
  },
  flyingStar: {
    position: 'absolute',
    top: height * 0.35,
    fontSize: 40,
  },
});
