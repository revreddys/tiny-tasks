import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSequence,
  withDelay,
  withSpring,
  runOnJS,
  Easing,
} from 'react-native-reanimated';

const { width, height } = Dimensions.get('window');

interface FlyingUnicornProps {
  visible: boolean;
  onComplete: () => void;
}

// Sparkle component
const Sparkle = ({ delay, startX, startY }: { delay: number; startX: number; startY: number }) => {
  const opacity = useSharedValue(0);
  const scale = useSharedValue(0);
  const translateY = useSharedValue(0);
  const rotate = useSharedValue(0);
  
  useEffect(() => {
    opacity.value = withDelay(delay, withSequence(
      withTiming(1, { duration: 300 }),
      withTiming(0, { duration: 600 })
    ));
    scale.value = withDelay(delay, withSequence(
      withSpring(1.8, { damping: 6 }),
      withTiming(0.5, { duration: 500 })
    ));
    translateY.value = withDelay(delay, withTiming(-50, { duration: 900 }));
    rotate.value = withDelay(delay, withTiming(360, { duration: 900 }));
  }, []);
  
  const style = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [
      { scale: scale.value },
      { translateY: translateY.value },
      { rotate: `${rotate.value}deg` },
    ],
  }));
  
  return (
    <Animated.Text style={[styles.sparkle, style, { left: startX, top: startY }]}>
      ✨
    </Animated.Text>
  );
};

// Star burst component
const StarBurst = ({ delay, startX, startY }: { delay: number; startX: number; startY: number }) => {
  const opacity = useSharedValue(0);
  const scale = useSharedValue(0);
  
  useEffect(() => {
    opacity.value = withDelay(delay, withSequence(
      withTiming(1, { duration: 200 }),
      withTiming(0, { duration: 800 })
    ));
    scale.value = withDelay(delay, withSequence(
      withSpring(2, { damping: 5 }),
      withTiming(0.3, { duration: 700 })
    ));
  }, []);
  
  const style = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ scale: scale.value }],
  }));
  
  return (
    <Animated.Text style={[styles.starBurst, style, { left: startX, top: startY }]}>
      ⭐
    </Animated.Text>
  );
};

// Rainbow trail component
const RainbowTrail = ({ delay, x, y }: { delay: number; x: number; y: number }) => {
  const opacity = useSharedValue(0);
  const scale = useSharedValue(0);
  
  useEffect(() => {
    opacity.value = withDelay(delay, withSequence(
      withTiming(0.9, { duration: 150 }),
      withTiming(0, { duration: 800 })
    ));
    scale.value = withDelay(delay, withSequence(
      withTiming(1.2, { duration: 150 }),
      withTiming(0.6, { duration: 700 })
    ));
  }, []);
  
  const style = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ scale: scale.value }],
  }));
  
  return (
    <Animated.View style={[styles.rainbowTrail, style, { left: x - 30, top: y - 20 }]}>
      <Text style={styles.rainbow}>🌈</Text>
    </Animated.View>
  );
};

// Heart component for extra magic
const FloatingHeart = ({ delay, startX, startY }: { delay: number; startX: number; startY: number }) => {
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(0);
  const translateX = useSharedValue(0);
  const scale = useSharedValue(0);
  
  useEffect(() => {
    const randomX = (Math.random() - 0.5) * 60;
    opacity.value = withDelay(delay, withSequence(
      withTiming(1, { duration: 300 }),
      withTiming(0, { duration: 700 })
    ));
    scale.value = withDelay(delay, withSequence(
      withSpring(1.5, { damping: 8 }),
      withTiming(0.8, { duration: 600 })
    ));
    translateY.value = withDelay(delay, withTiming(-80, { duration: 1000 }));
    translateX.value = withDelay(delay, withTiming(randomX, { duration: 1000 }));
  }, []);
  
  const style = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [
      { scale: scale.value },
      { translateY: translateY.value },
      { translateX: translateX.value },
    ],
  }));
  
  return (
    <Animated.Text style={[styles.heart, style, { left: startX, top: startY }]}>
      💖
    </Animated.Text>
  );
};

export default function FlyingUnicorn({ visible, onComplete }: FlyingUnicornProps) {
  const [sparkles, setSparkles] = useState<{ id: number; x: number; y: number; delay: number }[]>([]);
  const [stars, setStars] = useState<{ id: number; x: number; y: number; delay: number }[]>([]);
  const [trails, setTrails] = useState<{ id: number; x: number; y: number; delay: number }[]>([]);
  const [hearts, setHearts] = useState<{ id: number; x: number; y: number; delay: number }[]>([]);
  
  // Unicorn position - diagonal path from bottom-left to top-right
  const translateX = useSharedValue(-80);
  const translateY = useSharedValue(height + 50);
  const rotate = useSharedValue(30);
  const scale = useSharedValue(0.5);
  
  useEffect(() => {
    if (visible) {
      // Reset position to bottom-left
      translateX.value = -80;
      translateY.value = height - 100;
      rotate.value = -35; // Tilted up for flying upward
      scale.value = 0.5;
      
      // Generate effects along the diagonal path
      const newSparkles: typeof sparkles = [];
      const newStars: typeof stars = [];
      const newTrails: typeof trails = [];
      const newHearts: typeof hearts = [];
      
      // Path from bottom-left to top-right
      for (let i = 0; i < 18; i++) {
        const progress = i / 18;
        const x = progress * (width + 160) - 80;
        const y = height - 100 - (progress * (height - 50));
        
        // Add some wave to the path
        const waveOffset = Math.sin(progress * Math.PI * 2) * 30;
        
        newSparkles.push({
          id: i,
          x: x + waveOffset + Math.random() * 50 - 25,
          y: y + Math.random() * 50 - 25,
          delay: i * 120,
        });
        
        if (i % 2 === 0) {
          newStars.push({
            id: i,
            x: x + Math.random() * 40 - 20,
            y: y + Math.random() * 40 - 20,
            delay: i * 120 + 50,
          });
        }
        
        if (i % 3 === 0) {
          newTrails.push({
            id: i,
            x,
            y,
            delay: i * 120,
          });
        }
        
        if (i % 4 === 0) {
          newHearts.push({
            id: i,
            x: x + 20,
            y: y,
            delay: i * 120 + 100,
          });
        }
      }
      
      setSparkles(newSparkles);
      setStars(newStars);
      setTrails(newTrails);
      setHearts(newHearts);
      
      // Scale up entrance
      scale.value = withSequence(
        withTiming(1.3, { duration: 400, easing: Easing.out(Easing.back(2)) }),
        withTiming(1, { duration: 200 })
      );
      
      // Animate unicorn flying diagonally from bottom-left to top-right
      // SLOWER: 2500ms duration (was 1200ms)
      translateX.value = withTiming(width + 80, {
        duration: 2500,
        easing: Easing.inOut(Easing.quad),
      }, (finished) => {
        if (finished) {
          runOnJS(onComplete)();
        }
      });
      
      // Vertical motion - bottom to top with gentle wave
      translateY.value = withTiming(-100, {
        duration: 2500,
        easing: Easing.inOut(Easing.quad),
      });
      
      // Gentle rotation during flight
      rotate.value = withSequence(
        withTiming(-40, { duration: 800 }),
        withTiming(-30, { duration: 800 }),
        withTiming(-45, { duration: 900 })
      );
    }
  }, [visible]);
  
  const unicornStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { rotate: `${rotate.value}deg` },
      { scale: scale.value },
    ],
  }));
  
  if (!visible) return null;
  
  return (
    <View style={styles.container} pointerEvents="none">
      {/* Rainbow trails */}
      {trails.map((trail) => (
        <RainbowTrail key={`trail-${trail.id}`} delay={trail.delay} x={trail.x} y={trail.y} />
      ))}
      
      {/* Stars */}
      {stars.map((star) => (
        <StarBurst key={`star-${star.id}`} delay={star.delay} startX={star.x} startY={star.y} />
      ))}
      
      {/* Sparkles */}
      {sparkles.map((sparkle) => (
        <Sparkle key={`sparkle-${sparkle.id}`} delay={sparkle.delay} startX={sparkle.x} startY={sparkle.y} />
      ))}
      
      {/* Hearts */}
      {hearts.map((heart) => (
        <FloatingHeart key={`heart-${heart.id}`} delay={heart.delay} startX={heart.x} startY={heart.y} />
      ))}
      
      {/* Flying Unicorn */}
      <Animated.View style={[styles.unicornContainer, unicornStyle]}>
        <Text style={styles.unicorn}>🦄</Text>
        {/* Trailing stars behind unicorn */}
        <View style={styles.starsTrail}>
          <Text style={styles.trailStar}>⭐</Text>
          <Text style={[styles.trailStar, styles.trailStar2]}>✨</Text>
          <Text style={[styles.trailStar, styles.trailStar3]}>💫</Text>
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 1000,
    overflow: 'hidden',
  },
  unicornContainer: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  unicorn: {
    fontSize: 80,
    textShadowColor: 'rgba(255, 255, 255, 0.9)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 25,
  },
  starsTrail: {
    position: 'absolute',
    left: -60,
    bottom: -10,
    flexDirection: 'row',
    gap: 8,
  },
  trailStar: {
    fontSize: 28,
    opacity: 0.9,
  },
  trailStar2: {
    fontSize: 22,
    opacity: 0.7,
    marginTop: 15,
  },
  trailStar3: {
    fontSize: 16,
    opacity: 0.5,
    marginTop: 8,
  },
  sparkle: {
    position: 'absolute',
    fontSize: 35,
  },
  starBurst: {
    position: 'absolute',
    fontSize: 40,
  },
  rainbowTrail: {
    position: 'absolute',
  },
  rainbow: {
    fontSize: 50,
    opacity: 0.8,
  },
  heart: {
    position: 'absolute',
    fontSize: 30,
  },
});
