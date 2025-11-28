import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  withSpring,
} from 'react-native-reanimated';
import Colors from '../constants/colors';
import { useThemeStore } from '../lib/stores/themeStore';

interface StreakCounterProps {
  streak: number;
  size?: 'small' | 'medium' | 'large';
  animated?: boolean;
}

const SIZE_CONFIG = {
  small: { container: 36, icon: 18, text: 14 },
  medium: { container: 48, icon: 24, text: 18 },
  large: { container: 64, icon: 32, text: 24 },
};

export default function StreakCounter({ 
  streak, 
  size = 'medium',
  animated = true,
}: StreakCounterProps) {
  const scale = useSharedValue(1);
  const flameOpacity = useSharedValue(1);
  
  useEffect(() => {
    if (animated && streak > 0) {
      // Pulse animation for active streak
      scale.value = withRepeat(
        withSequence(
          withTiming(1.1, { duration: 500 }),
          withTiming(1, { duration: 500 })
        ),
        -1,
        true
      );
      
      // Flame flicker effect
      flameOpacity.value = withRepeat(
        withSequence(
          withTiming(0.7, { duration: 300 }),
          withTiming(1, { duration: 300 })
        ),
        -1,
        true
      );
    }
  }, [animated, streak]);
  
  const containerStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));
  
  const flameStyle = useAnimatedStyle(() => ({
    opacity: flameOpacity.value,
  }));
  
  const sizes = SIZE_CONFIG[size];
  const isActive = streak > 0;
  
  return (
    <Animated.View 
      style={[
        styles.container,
        containerStyle,
        {
          minWidth: sizes.container,
          height: sizes.container,
          borderRadius: sizes.container / 2,
          backgroundColor: isActive ? Colors.streak + '20' : Colors.border,
        },
      ]}
    >
      <Animated.Text 
        style={[
          styles.icon, 
          flameStyle,
          { fontSize: sizes.icon }
        ]}
      >
        {isActive ? '🔥' : '❄️'}
      </Animated.Text>
      <Text 
        style={[
          styles.text, 
          { 
            fontSize: sizes.text,
            color: isActive ? Colors.streak : Colors.textLight,
          }
        ]}
      >
        {streak}
      </Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
    gap: 4,
  },
  icon: {
    textAlign: 'center',
  },
  text: {
    fontWeight: '800',
  },
});


