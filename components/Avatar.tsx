import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { AvatarConfig } from '../constants/avatars';
import Colors from '../constants/colors';
import { useThemeStore } from '../lib/stores/themeStore';

interface AvatarProps {
  config: AvatarConfig;
  size?: 'small' | 'medium' | 'large';
  animated?: boolean;
  onPress?: () => void;
}

const AVATAR_EMOJIS: Record<string, string> = {
  'bear': '🐻',
  'bunny': '🐰',
  'cat': '🐱',
  'dog': '🐶',
  'panda': '🐼',
  'fox': '🦊',
  'lion': '🦁',
  'unicorn': '🦄',
  'dragon': '🐲',
};

const HAT_EMOJIS: Record<string, string> = {
  'crown': '👑',
  'party-hat': '🎉',
  'wizard-hat': '🧙',
  'cowboy-hat': '🤠',
  'top-hat': '🎩',
  'cap': '🧢',
  'tiara': '👸',
};

const ACCESSORY_EMOJIS: Record<string, string> = {
  'glasses': '😎',
  'bow': '🎀',
  'star-wand': '⭐',
  'heart': '💖',
  'flower': '🌸',
  'balloon': '🎈',
  'sparkles': '✨',
};

const OUTFIT_EMOJIS: Record<string, string> = {
  'superhero': '🦸',
  'princess': '👗',
  'astronaut': '👨‍🚀',
  'pirate': '🏴‍☠️',
  'fairy': '🧚',
  'ninja': '🥷',
};

const BACKGROUND_COLORS: Record<string, string[]> = {
  'rainbow': ['#FF6B9D', '#FFE66D', '#4ECDC4'],
  'stars': ['#2C3E50', '#3498DB'],
  'clouds': ['#87CEEB', '#E0F7FA'],
  'hearts': ['#FFB6C1', '#FFC0CB'],
  'space': ['#0C0C2C', '#1A1A40'],
  'ocean': ['#006994', '#40E0D0'],
  'forest': ['#228B22', '#90EE90'],
  'candy': ['#FF69B4', '#FFB6C1'],
};

const SIZE_CONFIG = {
  small: { container: 50, emoji: 28, hat: 16, accessory: 12 },
  medium: { container: 80, emoji: 45, hat: 24, accessory: 18 },
  large: { container: 120, emoji: 70, hat: 35, accessory: 25 },
};

export default function Avatar({ 
  config, 
  size = 'medium', 
  animated = false,
  onPress,
}: AvatarProps) {
  const bounce = useSharedValue(0);
  
  React.useEffect(() => {
    if (animated) {
      bounce.value = withRepeat(
        withSequence(
          withTiming(-5, { duration: 500 }),
          withTiming(0, { duration: 500 })
        ),
        -1,
        true
      );
    }
  }, [animated]);
  
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: bounce.value }],
  }));
  
  const sizes = SIZE_CONFIG[size];
  const bgColors = BACKGROUND_COLORS[config.background] || BACKGROUND_COLORS['rainbow'];
  
  const content = (
    <Animated.View 
      style={[
        styles.container,
        {
          width: sizes.container,
          height: sizes.container,
          borderRadius: sizes.container / 2,
          backgroundColor: bgColors[0],
        },
        animated && animatedStyle,
      ]}
    >
      {/* Hat */}
      {config.hat && (
        <Text 
          style={[
            styles.hat, 
            { 
              fontSize: sizes.hat,
              top: -sizes.hat * 0.8,
            }
          ]}
        >
          {HAT_EMOJIS[config.hat]}
        </Text>
      )}
      
      {/* Base Avatar */}
      <Text style={[styles.emoji, { fontSize: sizes.emoji }]}>
        {AVATAR_EMOJIS[config.base] || '🐻'}
      </Text>
      
      {/* Accessory */}
      {config.accessory && (
        <Text 
          style={[
            styles.accessory, 
            { 
              fontSize: sizes.accessory,
              right: -sizes.accessory * 0.5,
              top: sizes.container * 0.1,
            }
          ]}
        >
          {ACCESSORY_EMOJIS[config.accessory]}
        </Text>
      )}
      
      {/* Outfit indicator */}
      {config.outfit && (
        <Text 
          style={[
            styles.outfit, 
            { 
              fontSize: sizes.accessory,
              bottom: -sizes.accessory * 0.3,
            }
          ]}
        >
          {OUTFIT_EMOJIS[config.outfit]}
        </Text>
      )}
    </Animated.View>
  );
  
  if (onPress) {
    return (
      <Pressable onPress={onPress}>
        {content}
      </Pressable>
    );
  }
  
  return content;
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    borderWidth: 3,
    borderColor: Colors.textWhite,
  },
  emoji: {
    textAlign: 'center',
  },
  hat: {
    position: 'absolute',
    textAlign: 'center',
  },
  accessory: {
    position: 'absolute',
    textAlign: 'center',
  },
  outfit: {
    position: 'absolute',
    textAlign: 'center',
  },
});


