import React, { useEffect } from 'react';
import { View, Text, Pressable, StyleSheet, Dimensions, Alert } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withSequence,
  withTiming,
  FadeInRight,
} from 'react-native-reanimated';
import { Task } from '../lib/types';
import Colors from '../constants/colors';
import { useThemeStore } from '../lib/stores/themeStore';

const { width } = Dimensions.get('window');

interface TaskCardProps {
  task: Task;
  index: number;
  isCompleted: boolean;
  onComplete: () => void;
  onUndo?: () => void;
  routineColor: string;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export default function TaskCard({ 
  task, 
  index, 
  isCompleted, 
  onComplete,
  onUndo,
  routineColor,
}: TaskCardProps) {
  const { colors, isDark } = useThemeStore();
  const scale = useSharedValue(1);
  const checkScale = useSharedValue(isCompleted ? 1 : 0);
  const starScale = useSharedValue(1);
  
  useEffect(() => {
    if (isCompleted) {
      checkScale.value = withSpring(1, { damping: 10 });
    } else {
      checkScale.value = withTiming(0, { duration: 200 });
    }
  }, [isCompleted]);
  
  const handlePress = () => {
    if (isCompleted) {
      // Ask for confirmation to undo
      Alert.alert(
        'Undo Task?',
        `Do you want to undo "${task.name}"? You will lose ${task.stars} star${task.stars > 1 ? 's' : ''}.`,
        [
          { text: 'Cancel', style: 'cancel' },
          { 
            text: 'Undo', 
            style: 'destructive',
            onPress: () => {
              // Animate undo
              scale.value = withSequence(
                withTiming(0.95, { duration: 100 }),
                withSpring(1, { damping: 10 })
              );
              checkScale.value = withTiming(0, { duration: 200 });
              onUndo?.();
            }
          },
        ]
      );
      return;
    }
    
    // Animate the card
    scale.value = withSequence(
      withTiming(0.95, { duration: 100 }),
      withSpring(1, { damping: 10 })
    );
    
    // Animate the check
    checkScale.value = withSpring(1, { damping: 10 });
    
    // Animate stars
    starScale.value = withSequence(
      withTiming(1.5, { duration: 200 }),
      withSpring(1, { damping: 10 })
    );
    
    onComplete();
  };
  
  const cardStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));
  
  const checkStyle = useAnimatedStyle(() => ({
    transform: [{ scale: checkScale.value }],
    opacity: checkScale.value,
  }));
  
  const starStyle = useAnimatedStyle(() => ({
    transform: [{ scale: starScale.value }],
  }));
  
  return (
    <Animated.View entering={FadeInRight.delay(index * 100).springify()}>
      <AnimatedPressable
        style={[
          styles.card,
          cardStyle,
          isCompleted && styles.cardCompleted,
          { borderColor: isCompleted ? Colors.success : routineColor + '50' },
        ]}
        onPress={handlePress}
      >
        {/* Task Icon */}
        <View 
          style={[
            styles.iconContainer,
            { backgroundColor: isCompleted ? Colors.success + '20' : routineColor + '20' },
          ]}
        >
          <Text style={styles.icon}>{task.icon}</Text>
        </View>
        
        {/* Task Info */}
        <View style={styles.info}>
          <Text style={[styles.name, isCompleted && styles.nameCompleted]}>
            {task.name}
          </Text>
          <Animated.View style={[styles.starsContainer, starStyle]}>
            {[...Array(task.stars)].map((_, i) => (
              <Text key={i} style={styles.star}>
                {isCompleted ? '⭐' : '☆'}
              </Text>
            ))}
          </Animated.View>
        </View>
        
        {/* Check Circle */}
        <View style={[
          styles.checkCircle,
          isCompleted && styles.checkCircleCompleted,
        ]}>
          {isCompleted ? (
            <Animated.Text style={[styles.checkMark, checkStyle]}>✓</Animated.Text>
          ) : (
            <Text style={styles.tapText}>TAP!</Text>
          )}
        </View>
      </AnimatedPressable>
      
      {/* Undo hint for completed tasks */}
      {isCompleted && onUndo && (
        <Text style={styles.undoHint}>Tap to undo</Text>
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.cardBg,
    borderRadius: 20,
    padding: 18,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  cardCompleted: {
    backgroundColor: Colors.success + '10',
  },
  iconContainer: {
    width: 60,
    height: 60,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  icon: {
    fontSize: 32,
  },
  info: {
    flex: 1,
  },
  name: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 6,
  },
  nameCompleted: {
    textDecorationLine: 'line-through',
    color: Colors.textLight,
  },
  starsContainer: {
    flexDirection: 'row',
    gap: 4,
  },
  star: {
    fontSize: 20,
  },
  checkCircle: {
    width: 55,
    height: 55,
    borderRadius: 27.5,
    backgroundColor: Colors.background,
    borderWidth: 3,
    borderColor: Colors.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkCircleCompleted: {
    backgroundColor: Colors.success,
    borderColor: Colors.success,
  },
  checkMark: {
    fontSize: 28,
    color: Colors.textWhite,
    fontWeight: '800',
  },
  tapText: {
    fontSize: 12,
    fontWeight: '800',
    color: Colors.primary,
  },
  undoHint: {
    fontSize: 11,
    color: Colors.textLight,
    textAlign: 'center',
    marginTop: 4,
    fontStyle: 'italic',
  },
});
