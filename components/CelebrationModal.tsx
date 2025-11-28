import React, { useEffect } from 'react';
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
  withRepeat,
  runOnJS,
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

// Confetti particle component
const ConfettiParticle = ({ delay, color }: { delay: number; color: string }) => {
  const translateY = useSharedValue(-50);
  const translateX = useSharedValue(0);
  const rotate = useSharedValue(0);
  const opacity = useSharedValue(1);
  
  useEffect(() => {
    const startX = Math.random() * width;
    const endX = startX + (Math.random() - 0.5) * 200;
    
    translateX.value = startX;
    translateY.value = withSequence(
      withTiming(-50, { duration: 0 }),
      withTiming(height + 100, { duration: 3000 + delay })
    );
    translateX.value = withTiming(endX, { duration: 3000 + delay });
    rotate.value = withRepeat(
      withTiming(360, { duration: 1000 }),
      -1,
      false
    );
    opacity.value = withSequence(
      withTiming(1, { duration: 1000 }),
      withTiming(0, { duration: 2000 + delay })
    );
  }, []);
  
  const style = useAnimatedStyle(() => ({
    position: 'absolute',
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { rotate: `${rotate.value}deg` },
    ],
    opacity: opacity.value,
  }));
  
  return (
    <Animated.View style={style}>
      <View style={[styles.confetti, { backgroundColor: color }]} />
    </Animated.View>
  );
};

export default function CelebrationModal({ celebration, onClose }: CelebrationModalProps) {
  const scale = useSharedValue(0);
  const rotate = useSharedValue(0);
  const emojiScale = useSharedValue(0);
  
  useEffect(() => {
    if (celebration) {
      // Haptic feedback
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      
      // Animations
      scale.value = withSpring(1, { damping: 10 });
      emojiScale.value = withSequence(
        withTiming(0, { duration: 0 }),
        withSpring(1.2, { damping: 8 }),
        withSpring(1, { damping: 10 })
      );
      rotate.value = withSequence(
        withTiming(-10, { duration: 100 }),
        withRepeat(
          withSequence(
            withTiming(10, { duration: 200 }),
            withTiming(-10, { duration: 200 })
          ),
          3,
          true
        ),
        withTiming(0, { duration: 100 })
      );
      
      // Auto close after 3 seconds
      const timer = setTimeout(() => {
        handleClose();
      }, 3000);
      
      return () => clearTimeout(timer);
    }
  }, [celebration]);
  
  const handleClose = () => {
    scale.value = withTiming(0, { duration: 200 }, () => {
      runOnJS(onClose)();
    });
  };
  
  const containerStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));
  
  const emojiStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: emojiScale.value },
      { rotate: `${rotate.value}deg` },
    ],
  }));
  
  if (!celebration) return null;
  
  const confettiColors = [
    Colors.primary, Colors.secondary, Colors.accent, 
    Colors.success, Colors.star, '#FF69B4', '#00CED1'
  ];
  
  return (
    <Modal
      visible={!!celebration}
      transparent
      animationType="fade"
      onRequestClose={handleClose}
    >
      <Pressable style={styles.overlay} onPress={handleClose}>
        {/* Confetti */}
        {[...Array(30)].map((_, i) => (
          <ConfettiParticle 
            key={i} 
            delay={i * 100} 
            color={confettiColors[i % confettiColors.length]}
          />
        ))}
        
        <Animated.View style={[styles.container, containerStyle]}>
          <Animated.Text style={[styles.emoji, emojiStyle]}>
            {celebration.type === 'task' ? '⭐' :
             celebration.type === 'routine' ? '🎉' :
             celebration.type === 'badge' ? celebration.badge?.icon || '🏆' :
             celebration.type === 'streak' ? '🔥' : 
             celebration.type === 'redemption' ? celebration.reward?.icon || '🎁' : '🌟'}
          </Animated.Text>
          
          <Text style={styles.title}>{celebration.title}</Text>
          
          {celebration.subtitle && (
            <Text style={styles.subtitle}>{celebration.subtitle}</Text>
          )}
          
          {celebration.stars && celebration.type === 'task' && (
            <View style={styles.starsRow}>
              {[...Array(celebration.stars)].map((_, i) => (
                <Animated.Text 
                  key={i} 
                  style={[styles.starIcon]}
                >
                  ⭐
                </Animated.Text>
              ))}
            </View>
          )}
          
          {celebration.type === 'badge' && celebration.badge && (
            <View style={styles.badgeContainer}>
              <Text style={styles.badgeName}>{celebration.badge.name}</Text>
            </View>
          )}
          
          {celebration.type === 'streak' && celebration.streak && (
            <View style={styles.streakContainer}>
              <Text style={styles.streakNumber}>{celebration.streak}</Text>
              <Text style={styles.streakLabel}>days</Text>
            </View>
          )}
          
          {celebration.type === 'redemption' && celebration.reward && (
            <View style={styles.rewardContainer}>
              <Text style={styles.rewardName}>{celebration.reward.name}</Text>
            </View>
          )}
          
          <Pressable style={styles.continueButton} onPress={handleClose}>
            <Text style={styles.continueText}>Awesome! 🎊</Text>
          </Pressable>
        </Animated.View>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    backgroundColor: Colors.cardBg,
    borderRadius: 30,
    padding: 40,
    alignItems: 'center',
    width: width * 0.85,
    maxWidth: 350,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  emoji: {
    fontSize: 80,
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: Colors.text,
    textAlign: 'center',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.textLight,
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 22,
  },
  starsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 25,
  },
  starIcon: {
    fontSize: 40,
  },
  badgeContainer: {
    backgroundColor: Colors.badge + '20',
    paddingVertical: 10,
    paddingHorizontal: 25,
    borderRadius: 20,
    marginBottom: 25,
  },
  badgeName: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.badge,
  },
  streakContainer: {
    alignItems: 'center',
    marginBottom: 25,
  },
  streakNumber: {
    fontSize: 50,
    fontWeight: '800',
    color: Colors.streak,
  },
  streakLabel: {
    fontSize: 16,
    color: Colors.textLight,
    fontWeight: '600',
  },
  rewardContainer: {
    backgroundColor: '#9B59B6' + '20',
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 20,
    marginBottom: 25,
  },
  rewardName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#9B59B6',
    textAlign: 'center',
  },
  continueButton: {
    backgroundColor: Colors.primary,
    paddingVertical: 16,
    paddingHorizontal: 40,
    borderRadius: 25,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  continueText: {
    color: Colors.textWhite,
    fontSize: 18,
    fontWeight: '700',
  },
  confetti: {
    width: 10,
    height: 10,
    borderRadius: 2,
  },
});

