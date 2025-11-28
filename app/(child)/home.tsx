import { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Dimensions,
  Alert,
  RefreshControl,
} from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { 
  FadeInUp, 
  FadeInDown,
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  withSpring,
  Layout,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { useAuthStore } from '../../lib/stores/authStore';
import { useChildStore } from '../../lib/stores/childStore';
import { useDailyTaskStore } from '../../lib/stores/dailyTaskStore';
import { useThemeStore } from '../../lib/stores/themeStore';
import { getChildren } from '../../lib/firebase';
import { DailyTask, TASK_CATEGORIES } from '../../lib/types';
import Colors from '../../constants/colors';
import CelebrationModal from '../../components/CelebrationModal';
import DateSelector from '../../components/DateSelector';

const { width } = Dimensions.get('window');

// Helper to get local date string
const getLocalDateString = (date: Date = new Date()): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export default function ChildHomeScreen() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { 
    selectedChild,
    selectChild,
    celebration, 
    setCelebration 
  } = useChildStore();
  const {
    taskList,
    selectedDate,
    setSelectedDate,
    loadDailyTasks,
    completeTask,
    uncompleteTask,
  } = useDailyTaskStore();
  const { colors, isDark } = useThemeStore();
  
  const [refreshing, setRefreshing] = useState(false);
  
  // Animations
  const avatarBounce = useSharedValue(0);
  const streakPulse = useSharedValue(1);
  
  // Load tasks when child or date changes
  useEffect(() => {
    if (selectedChild) {
      loadDailyTasks(selectedChild.id, selectedDate);
    }
  }, [selectedChild, selectedDate]);
  
  // Refresh handler - reloads child data and tasks
  const onRefresh = async () => {
    if (!selectedChild || !user) return;
    setRefreshing(true);
    try {
      // Reload child data to get updated stars
      const children = await getChildren(user.uid);
      const updatedChild = children.find(c => c.id === selectedChild.id);
      if (updatedChild) {
        selectChild(updatedChild);
      }
      // Reload tasks
      await loadDailyTasks(selectedChild.id, selectedDate);
    } catch (error) {
      console.error('Error refreshing:', error);
    }
    setRefreshing(false);
  };
  
  useEffect(() => {
    // Start animations
    avatarBounce.value = withRepeat(
      withSequence(
        withTiming(-10, { duration: 500 }),
        withTiming(0, { duration: 500 })
      ),
      -1,
      true
    );
    
    if (selectedChild && selectedChild.currentStreak > 0) {
      streakPulse.value = withRepeat(
        withSequence(
          withTiming(1.1, { duration: 800 }),
          withTiming(1, { duration: 800 })
        ),
        -1,
        true
      );
    }
  }, [selectedChild]);
  
  const avatarStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: avatarBounce.value }],
  }));
  
  const streakStyle = useAnimatedStyle(() => ({
    transform: [{ scale: streakPulse.value }],
  }));
  
  if (!selectedChild) {
    return null;
  }
  
  const getAvatarEmoji = () => {
    const avatarMap: Record<string, string> = {
      'bear': '🐻', 'bunny': '🐰', 'cat': '🐱', 'dog': '🐶',
      'panda': '🐼', 'fox': '🦊', 'lion': '🦁', 'unicorn': '🦄', 'dragon': '🐲',
    };
    return avatarMap[selectedChild.avatar.base] || '🐻';
  };
  
  const isToday = () => selectedDate === getLocalDateString();
  
  const handleTaskPress = async (task: DailyTask) => {
    if (task.completed) {
      // Ask to undo
      Alert.alert(
        'Undo Task?',
        `Do you want to undo "${task.name}"? You will lose ${task.stars} stars.`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Undo',
            style: 'destructive',
            onPress: async () => {
              await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              await uncompleteTask(selectedChild.id, task.id, selectedDate);
            },
          },
        ]
      );
    } else {
      // Complete the task
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      const result = await completeTask(selectedChild.id, task.id, selectedDate);
      
      if (result.success) {
        // Show celebration
        setCelebration({
          type: 'task',
          title: 'Great Job! 🎉',
          subtitle: task.name,
          stars: task.stars,
        });
        
        // If all tasks complete, show extra celebration
        if (result.allComplete) {
          setTimeout(() => {
            setCelebration({
              type: 'routine',
              title: 'All Done! 🌟',
              subtitle: "You completed all today's tasks!",
              stars: taskList?.totalStarsAvailable || 0,
            });
          }, 2000);
        }
      }
    }
  };
  
  const tasks = taskList?.tasks || [];
  const completedCount = tasks.filter(t => t.completed).length;
  const totalStars = taskList?.totalStarsAvailable || 0;
  const earnedStars = taskList?.totalStarsEarned || 0;
  const progress = tasks.length > 0 ? completedCount / tasks.length : 0;
  
  // Group tasks by category
  const groupedTasks = TASK_CATEGORIES.map(cat => ({
    ...cat,
    tasks: tasks.filter(t => (t.category || 'anytime') === cat.id),
  })).filter(group => group.tasks.length > 0);
  
  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header with child info */}
      <LinearGradient
        colors={isDark ? [colors.cardBg, colors.background] : [colors.primary, colors.gradientEnd]}
        style={styles.header}
      >
        <View style={styles.headerTop}>
          <Pressable 
            style={styles.backButton}
            onPress={() => router.replace('/(auth)/profiles')}
          >
            <Text style={styles.backText}>👤 Switch</Text>
          </Pressable>
          
          <Animated.View style={[styles.streakBadge, streakStyle]}>
            <Text style={styles.streakIcon}>🔥</Text>
            <Text style={styles.streakText}>{selectedChild.currentStreak}</Text>
          </Animated.View>
        </View>
        
        <View style={styles.headerContent}>
          {/* Avatar */}
          <Pressable onPress={() => router.push('/(child)/avatar')}>
            <Animated.View style={[styles.avatarContainer, avatarStyle]}>
              <View style={styles.avatar}>
                <Text style={styles.avatarEmoji}>{getAvatarEmoji()}</Text>
              </View>
              {selectedChild.avatar.hat && (
                <Text style={styles.avatarHat}>
                  {selectedChild.avatar.hat === 'crown' ? '👑' : '🎩'}
                </Text>
              )}
            </Animated.View>
          </Pressable>
          
          <Text style={styles.childName}>Hi, {selectedChild.name}! 👋</Text>
          
          {/* Stars counter */}
          <Pressable 
            style={styles.starsContainer}
            onPress={() => router.push('/(child)/shop')}
          >
            <Text style={styles.starsIcon}>⭐</Text>
            <Text style={styles.starsCount}>{selectedChild.totalStars}</Text>
            <Text style={styles.starsLabel}>stars</Text>
          </Pressable>
          
          {/* Date Selector */}
          <DateSelector 
            selectedDate={selectedDate}
            onDateChange={setSelectedDate}
          />
        </View>
      </LinearGradient>
      
      {/* Tasks */}
      <ScrollView 
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Progress Header */}
        <View style={styles.progressHeader}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            {isToday() ? "Today's Tasks 🎯" : "Tasks 📅"}
          </Text>
          {tasks.length > 0 && (
            <View style={styles.progressInfo}>
              <Text style={[styles.progressCount, { color: colors.text }]}>
                {completedCount}/{tasks.length}
              </Text>
              <Text style={[styles.progressStars, { color: colors.starYellow }]}>
                ⭐ {earnedStars}/{totalStars}
              </Text>
            </View>
          )}
        </View>
        
        {/* Progress Bar */}
        {tasks.length > 0 && (
          <View style={[styles.mainProgressBar, { backgroundColor: colors.inputBg }]}>
            <Animated.View 
              style={[
                styles.mainProgressFill, 
                { 
                  width: `${progress * 100}%`,
                  backgroundColor: taskList?.allTasksCompleted ? colors.success : colors.primary,
                }
              ]} 
            />
          </View>
        )}
        
        {!isToday() && (
          <View style={styles.pastDateBanner}>
            <Text style={styles.pastDateText}>
              ⏰ Viewing tasks for a past date
            </Text>
          </View>
        )}
        
        {tasks.length === 0 ? (
          <View style={[styles.emptyCard, { backgroundColor: colors.cardBg }]}>
            <Text style={styles.emptyEmoji}>📝</Text>
            <Text style={[styles.emptyTitle, { color: colors.text }]}>No tasks for today!</Text>
            <Text style={[styles.emptyText, { color: colors.textLight }]}>
              Ask your parent to add some tasks for you.
            </Text>
          </View>
        ) : (
          <View style={styles.tasksList}>
            {groupedTasks.map((group, groupIndex) => (
              <Animated.View 
                key={group.id}
                entering={FadeInUp.delay(groupIndex * 100).springify()}
                style={styles.categoryGroup}
              >
                <View style={[styles.categoryHeader, { backgroundColor: group.color + '20' }]}>
                  <Text style={styles.categoryIcon}>{group.icon}</Text>
                  <Text style={[styles.categoryName, { color: colors.text }]}>{group.name}</Text>
                </View>
                
                {group.tasks.map((task, index) => (
                  <TaskCard 
                    key={task.id}
                    task={task}
                    index={index}
                    groupIndex={groupIndex}
                    onPress={() => handleTaskPress(task)}
                    colors={colors}
                    categoryColor={group.color}
                  />
                ))}
              </Animated.View>
            ))}
          </View>
        )}
        
        {/* All Done Card */}
        {taskList?.allTasksCompleted && tasks.length > 0 && (
          <Animated.View 
            entering={FadeInUp.springify()}
            style={styles.allDoneCard}
          >
            <Text style={styles.allDoneEmoji}>🎊</Text>
            <Text style={styles.allDoneTitle}>All Done!</Text>
            <Text style={styles.allDoneText}>
              You completed all tasks and earned {totalStars} stars!
            </Text>
          </Animated.View>
        )}
        
        {/* Quick Stats */}
        <Animated.View 
          entering={FadeInUp.delay(400).springify()}
          style={[styles.statsCard, { backgroundColor: colors.cardBg }]}
        >
          <Pressable 
            style={styles.statItem}
            onPress={() => router.push('/(child)/badges')}
          >
            <Text style={styles.statEmoji}>🏆</Text>
            <Text style={[styles.statValue, { color: colors.text }]}>{selectedChild.badges.length}</Text>
            <Text style={[styles.statLabel, { color: colors.textLight }]}>Badges →</Text>
          </Pressable>
          <View style={[styles.statDivider, { backgroundColor: colors.border }]} />
          <View style={styles.statItem}>
            <Text style={styles.statEmoji}>📅</Text>
            <Text style={[styles.statValue, { color: colors.text }]}>{selectedChild.longestStreak}</Text>
            <Text style={[styles.statLabel, { color: colors.textLight }]}>Best Streak</Text>
          </View>
          <View style={[styles.statDivider, { backgroundColor: colors.border }]} />
          <View style={styles.statItem}>
            <Text style={styles.statEmoji}>✅</Text>
            <Text style={[styles.statValue, { color: colors.text }]}>{selectedChild.totalTasksCompleted}</Text>
            <Text style={[styles.statLabel, { color: colors.textLight }]}>Tasks Done</Text>
          </View>
        </Animated.View>
        
        {/* Rewards Shop Button */}
        <Animated.View entering={FadeInUp.delay(500).springify()}>
          <Pressable
            style={styles.shopButton}
            onPress={() => router.push('/(child)/shop')}
          >
            <Text style={styles.shopIcon}>🏪</Text>
            <View style={styles.shopInfo}>
              <Text style={[styles.shopTitle, { color: colors.text }]}>Rewards Shop</Text>
              <Text style={[styles.shopDesc, { color: colors.textLight }]}>Spend your stars on treats!</Text>
            </View>
            <Text style={styles.shopArrow}>→</Text>
          </Pressable>
        </Animated.View>
        
        {/* Motivational message */}
        <Animated.View 
          entering={FadeInUp.delay(600).springify()}
          style={styles.motivationCard}
        >
          <Text style={styles.motivationEmoji}>💪</Text>
          <Text style={[styles.motivationText, { color: colors.text }]}>
            {selectedChild.currentStreak > 0 
              ? `Amazing! You're on a ${selectedChild.currentStreak} day streak!`
              : "Let's start a new streak today!"}
          </Text>
        </Animated.View>
      </ScrollView>
      
      {/* Celebration Modal */}
      <CelebrationModal
        celebration={celebration}
        onClose={() => setCelebration(null)}
      />
    </View>
  );
}

// Task Card Component
interface TaskCardProps {
  task: DailyTask;
  index: number;
  groupIndex: number;
  onPress: () => void;
  colors: any;
  categoryColor: string;
}

function TaskCard({ task, index, groupIndex, onPress, colors, categoryColor }: TaskCardProps) {
  const scale = useSharedValue(1);
  const checkScale = useSharedValue(task.completed ? 1 : 0);
  
  useEffect(() => {
    checkScale.value = withSpring(task.completed ? 1 : 0, { damping: 12 });
  }, [task.completed]);
  
  const cardStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));
  
  const checkStyle = useAnimatedStyle(() => ({
    transform: [{ scale: checkScale.value }],
    opacity: checkScale.value,
  }));
  
  const handlePressIn = () => {
    scale.value = withSpring(0.97);
  };
  
  const handlePressOut = () => {
    scale.value = withSpring(1);
  };
  
  return (
    <Animated.View
      entering={FadeInUp.delay((groupIndex * 100) + (index * 50)).springify()}
      layout={Layout.springify()}
      style={cardStyle}
    >
      <Pressable
        style={[
          styles.taskCard,
          { 
            backgroundColor: colors.cardBg, 
            borderColor: task.completed ? colors.success : categoryColor + '50',
          },
          task.completed && { backgroundColor: colors.success + '15' },
        ]}
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
      >
        {/* Checkbox */}
        <View style={[
          styles.checkbox,
          { borderColor: task.completed ? colors.success : categoryColor },
          task.completed && { backgroundColor: colors.success },
        ]}>
          <Animated.Text style={[styles.checkmark, checkStyle]}>✓</Animated.Text>
        </View>
        
        {/* Task Icon */}
        <Text style={[styles.taskIcon, task.completed && styles.taskIconCompleted]}>
          {task.icon}
        </Text>
        
        {/* Task Info */}
        <View style={styles.taskInfo}>
          <Text style={[
            styles.taskName,
            { color: colors.text },
            task.completed && styles.taskNameCompleted,
          ]}>
            {task.name}
          </Text>
        </View>
        
        {/* Stars */}
        <View style={[
          styles.taskStars,
          task.completed && styles.taskStarsCompleted,
        ]}>
          <Text style={styles.starEmoji}>⭐</Text>
          <Text style={styles.starCount}>{task.stars}</Text>
        </View>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    paddingTop: 50,
    paddingBottom: 30,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 40,
    borderBottomRightRadius: 40,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  backButton: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 20,
  },
  backText: {
    color: Colors.textWhite,
    fontWeight: '600',
    fontSize: 14,
  },
  streakBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 20,
    gap: 6,
  },
  streakIcon: {
    fontSize: 20,
  },
  streakText: {
    color: Colors.textWhite,
    fontWeight: '700',
    fontSize: 18,
  },
  headerContent: {
    alignItems: 'center',
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 15,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: Colors.textWhite,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: Colors.accent,
  },
  avatarEmoji: {
    fontSize: 55,
  },
  avatarHat: {
    position: 'absolute',
    top: -20,
    left: '50%',
    marginLeft: -15,
    fontSize: 30,
  },
  childName: {
    fontSize: 28,
    fontWeight: '800',
    color: Colors.textWhite,
    marginBottom: 12,
    textShadowColor: 'rgba(0,0,0,0.2)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  starsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF9E6',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 25,
    gap: 8,
    borderWidth: 2,
    borderColor: '#FFD700',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  starsIcon: {
    fontSize: 24,
  },
  starsCount: {
    fontSize: 22,
    fontWeight: '800',
    color: '#B8860B',  // Dark gold - readable on light yellow background
  },
  starsLabel: {
    fontSize: 16,
    color: '#996515',  // Darker gold for label
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: Colors.text,
  },
  progressInfo: {
    flexDirection: 'row',
    gap: 15,
  },
  progressCount: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text,
  },
  progressStars: {
    fontSize: 16,
    fontWeight: '700',
  },
  mainProgressBar: {
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.border,
    marginBottom: 20,
    overflow: 'hidden',
  },
  mainProgressFill: {
    height: '100%',
    borderRadius: 4,
  },
  pastDateBanner: {
    backgroundColor: Colors.accent,
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 12,
    marginBottom: 15,
  },
  pastDateText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
    textAlign: 'center',
  },
  emptyCard: {
    backgroundColor: Colors.cardBg,
    borderRadius: 24,
    padding: 40,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  emptyEmoji: {
    fontSize: 60,
    marginBottom: 15,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 15,
    color: Colors.textLight,
    textAlign: 'center',
  },
  tasksList: {
    marginBottom: 25,
  },
  categoryGroup: {
    marginBottom: 20,
  },
  categoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 10,
    marginBottom: 10,
  },
  categoryIcon: {
    fontSize: 18,
    marginRight: 8,
  },
  categoryName: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
  },
  taskCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.cardBg,
    borderRadius: 20,
    padding: 16,
    marginBottom: 10,
    borderWidth: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  checkbox: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 3,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  checkmark: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFF',
  },
  taskIcon: {
    fontSize: 32,
    marginRight: 12,
  },
  taskIconCompleted: {
    opacity: 0.6,
  },
  taskInfo: {
    flex: 1,
  },
  taskName: {
    fontSize: 17,
    fontWeight: '600',
    color: Colors.text,
  },
  taskNameCompleted: {
    textDecorationLine: 'line-through',
    opacity: 0.6,
  },
  taskStars: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF9E6',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 15,
    gap: 4,
  },
  taskStarsCompleted: {
    backgroundColor: Colors.success + '20',
  },
  starEmoji: {
    fontSize: 16,
  },
  starCount: {
    fontSize: 16,
    fontWeight: '700',
    color: '#B8860B',  // Dark gold - readable on light yellow background
  },
  allDoneCard: {
    backgroundColor: '#27AE60' + '20',
    borderRadius: 24,
    padding: 30,
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 2,
    borderColor: '#27AE60' + '40',
  },
  allDoneEmoji: {
    fontSize: 50,
    marginBottom: 10,
  },
  allDoneTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#27AE60',
    marginBottom: 8,
  },
  allDoneText: {
    fontSize: 16,
    color: Colors.text,
    textAlign: 'center',
  },
  statsCard: {
    backgroundColor: Colors.cardBg,
    borderRadius: 24,
    padding: 25,
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  statItem: {
    alignItems: 'center',
  },
  statEmoji: {
    fontSize: 30,
    marginBottom: 8,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '800',
    color: Colors.text,
  },
  statLabel: {
    fontSize: 12,
    color: Colors.textLight,
    fontWeight: '500',
    marginTop: 4,
  },
  statDivider: {
    width: 1,
    backgroundColor: Colors.border,
  },
  shopButton: {
    backgroundColor: '#9B59B6' + '20',
    borderRadius: 20,
    padding: 18,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
    borderWidth: 2,
    borderColor: '#9B59B6' + '40',
  },
  shopIcon: {
    fontSize: 40,
    marginRight: 15,
  },
  shopInfo: {
    flex: 1,
  },
  shopTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 2,
  },
  shopDesc: {
    fontSize: 14,
    color: Colors.textLight,
  },
  shopArrow: {
    fontSize: 24,
    color: '#9B59B6',
    fontWeight: '600',
  },
  motivationCard: {
    backgroundColor: Colors.accent + '40',
    borderRadius: 20,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
  },
  motivationEmoji: {
    fontSize: 35,
  },
  motivationText: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    lineHeight: 22,
  },
});
