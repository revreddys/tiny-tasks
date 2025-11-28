import { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  TextInput,
  Alert,
  Modal,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import Animated, { FadeInUp, FadeInDown, Layout } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { useAuthStore } from '../../../lib/stores/authStore';
import { useChildStore } from '../../../lib/stores/childStore';
import { useDailyTaskStore } from '../../../lib/stores/dailyTaskStore';
import { useThemeStore } from '../../../lib/stores/themeStore';
import { DailyTask, TaskTemplate, TASK_CATEGORIES } from '../../../lib/types';
import Colors from '../../../constants/colors';

// Common task icons
const TASK_ICONS = ['🦷', '🛁', '👕', '🍳', '📚', '🎒', '🛏️', '🧹', '🥗', '💪', '🎹', '✏️', '🐕', '🚿', '😴', '🧘', '🎨', '🏃', '🍎', '💊'];

// Helper to get local date string
const getLocalDateString = (date: Date = new Date()): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const formatDisplayDate = (dateString: string): string => {
  const date = new Date(dateString + 'T00:00:00');
  const today = getLocalDateString();
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowStr = getLocalDateString(tomorrow);
  
  if (dateString === today) return 'Today';
  if (dateString === tomorrowStr) return 'Tomorrow';
  
  return date.toLocaleDateString('en-US', { 
    weekday: 'short', 
    month: 'short', 
    day: 'numeric' 
  });
};

export default function DailyTasksScreen() {
  const router = useRouter();
  const { childId } = useLocalSearchParams<{ childId: string }>();
  const { user } = useAuthStore();
  const { children } = useChildStore();
  const { colors, isDark } = useThemeStore();
  const {
    taskList,
    templates,
    isLoading,
    selectedDate,
    setSelectedDate,
    loadDailyTasks,
    loadTemplates,
    addTask,
    removeTask,
    updateTask,
    copyFromPreviousDay,
    applyTemplate,
  } = useDailyTaskStore();
  
  const child = children.find(c => c.id === childId);
  
  const [showAddModal, setShowAddModal] = useState(false);
  const [showTemplatesModal, setShowTemplatesModal] = useState(false);
  const [editingTask, setEditingTask] = useState<DailyTask | null>(null);
  
  // New task form
  const [taskName, setTaskName] = useState('');
  const [taskIcon, setTaskIcon] = useState('⭐');
  const [taskStars, setTaskStars] = useState('1');
  const [taskCategory, setTaskCategory] = useState<string>('anytime');
  
  useEffect(() => {
    if (childId) {
      loadDailyTasks(childId, selectedDate);
    }
    if (user) {
      loadTemplates(user.uid);
    }
  }, [childId, selectedDate, user]);
  
  const resetForm = () => {
    setTaskName('');
    setTaskIcon('⭐');
    setTaskStars('1');
    setTaskCategory('anytime');
    setEditingTask(null);
  };
  
  const handleAddTask = async () => {
    if (!taskName.trim()) {
      Alert.alert('Oops!', 'Please enter a task name');
      return;
    }
    
    const stars = parseInt(taskStars) || 1;
    
    if (!user || !childId) return;
    
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      
      if (editingTask) {
        await updateTask(childId, user.uid, editingTask.id, {
          name: taskName.trim(),
          icon: taskIcon,
          stars,
          category: taskCategory,
        }, selectedDate);
      } else {
        await addTask(childId, user.uid, {
          name: taskName.trim(),
          icon: taskIcon,
          stars,
          category: taskCategory,
        }, selectedDate);
      }
      
      setShowAddModal(false);
      resetForm();
    } catch (error) {
      Alert.alert('Error', 'Failed to save task');
    }
  };
  
  const handleDeleteTask = (taskId: string, taskName: string) => {
    Alert.alert(
      'Delete Task',
      `Remove "${taskName}" from today's list?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            if (!user || !childId) return;
            await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            await removeTask(childId, user.uid, taskId, selectedDate);
          },
        },
      ]
    );
  };
  
  const handleEditTask = (task: DailyTask) => {
    setEditingTask(task);
    setTaskName(task.name);
    setTaskIcon(task.icon);
    setTaskStars(task.stars.toString());
    setTaskCategory(task.category || 'anytime');
    setShowAddModal(true);
  };
  
  const handleCopyYesterday = async () => {
    if (!user || !childId) return;
    
    Alert.alert(
      'Copy Yesterday\'s Tasks',
      'This will add all tasks from yesterday to today.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Copy',
          onPress: async () => {
            const success = await copyFromPreviousDay(childId, user.uid, selectedDate);
            if (success) {
              await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            } else {
              Alert.alert('No Tasks', 'No tasks found from yesterday.');
            }
          },
        },
      ]
    );
  };
  
  const handleApplyTemplate = async (template: TaskTemplate) => {
    if (!user || !childId) return;
    
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    await applyTemplate(childId, user.uid, template, selectedDate);
    setShowTemplatesModal(false);
  };
  
  const goToPreviousDay = () => {
    const current = new Date(selectedDate + 'T12:00:00');
    current.setDate(current.getDate() - 1);
    setSelectedDate(getLocalDateString(current));
  };
  
  const goToNextDay = () => {
    const current = new Date(selectedDate + 'T12:00:00');
    current.setDate(current.getDate() + 1);
    setSelectedDate(getLocalDateString(current));
  };
  
  const goToToday = () => {
    setSelectedDate(getLocalDateString());
  };
  
  const isToday = selectedDate === getLocalDateString();
  
  const tasks = taskList?.tasks || [];
  const totalStars = tasks.reduce((sum, t) => sum + t.stars, 0);
  
  // Group tasks by category
  const groupedTasks = TASK_CATEGORIES.map(cat => ({
    ...cat,
    tasks: tasks.filter(t => (t.category || 'anytime') === cat.id),
  })).filter(group => group.tasks.length > 0);
  
  if (!child) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Text style={[styles.errorText, { color: colors.text }]}>Child not found</Text>
      </View>
    );
  }
  
  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.cardBg, borderBottomColor: colors.border }]}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Text style={[styles.backText, { color: colors.primary }]}>← Back</Text>
        </Pressable>
        <View style={styles.headerCenter}>
          <Text style={[styles.childName, { color: colors.text }]}>{child.name}'s Tasks</Text>
        </View>
        <View style={styles.placeholder} />
      </View>
      
      {/* Date Selector */}
      <View style={[styles.dateSelector, { backgroundColor: colors.cardBg }]}>
        <Pressable onPress={goToPreviousDay} style={styles.dateArrow}>
          <Text style={styles.dateArrowText}>◀</Text>
        </Pressable>
        
        <Pressable onPress={goToToday} style={styles.dateCenter}>
          <Text style={[styles.dateText, { color: colors.text }]}>
            {formatDisplayDate(selectedDate)}
          </Text>
          {!isToday && (
            <Text style={[styles.todayHint, { color: colors.primary }]}>Tap for today</Text>
          )}
        </Pressable>
        
        <Pressable onPress={goToNextDay} style={styles.dateArrow}>
          <Text style={styles.dateArrowText}>▶</Text>
        </Pressable>
      </View>
      
      {/* Summary */}
      <View style={[styles.summaryBar, { backgroundColor: isDark ? colors.cardBg : '#FFF9E6' }]}>
        <Text style={[styles.summaryText, { color: colors.text }]}>
          {tasks.length} task{tasks.length !== 1 ? 's' : ''} • ⭐ {totalStars} stars possible
        </Text>
      </View>
      
      <ScrollView 
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Quick Actions */}
        <View style={styles.quickActions}>
          <Pressable 
            style={[styles.quickButton, { backgroundColor: colors.primary }]}
            onPress={() => setShowAddModal(true)}
          >
            <Text style={styles.quickButtonText}>+ Add Task</Text>
          </Pressable>
          
          <Pressable 
            style={[styles.quickButton, styles.quickButtonSecondary, { backgroundColor: colors.cardBg, borderColor: colors.border }]}
            onPress={() => setShowTemplatesModal(true)}
          >
            <Text style={[styles.quickButtonTextSecondary, { color: colors.text }]}>📋 Templates</Text>
          </Pressable>
          
          <Pressable 
            style={[styles.quickButton, styles.quickButtonSecondary, { backgroundColor: colors.cardBg, borderColor: colors.border }]}
            onPress={handleCopyYesterday}
          >
            <Text style={[styles.quickButtonTextSecondary, { color: colors.text }]}>📄 Copy Yesterday</Text>
          </Pressable>
        </View>
        
        {/* Task List */}
        {tasks.length === 0 ? (
          <Animated.View 
            entering={FadeInUp.springify()}
            style={[styles.emptyCard, { backgroundColor: colors.cardBg }]}
          >
            <Text style={styles.emptyEmoji}>📝</Text>
            <Text style={[styles.emptyTitle, { color: colors.text }]}>No tasks yet!</Text>
            <Text style={[styles.emptySubtitle, { color: colors.textLight }]}>
              Add tasks for {child.name} to complete {isToday ? 'today' : 'on this day'}.
            </Text>
          </Animated.View>
        ) : (
          <>
            {groupedTasks.map((group, groupIndex) => (
              <Animated.View 
                key={group.id}
                entering={FadeInUp.delay(groupIndex * 100).springify()}
                style={styles.categoryGroup}
              >
                <View style={[styles.categoryHeader, { backgroundColor: group.color + '20' }]}>
                  <Text style={styles.categoryIcon}>{group.icon}</Text>
                  <Text style={[styles.categoryName, { color: colors.text }]}>{group.name}</Text>
                  <Text style={[styles.categoryCount, { color: colors.textLight }]}>
                    {group.tasks.length} task{group.tasks.length !== 1 ? 's' : ''}
                  </Text>
                </View>
                
                {group.tasks.map((task, index) => (
                  <Animated.View
                    key={task.id}
                    entering={FadeInUp.delay((groupIndex * 100) + (index * 50)).springify()}
                    layout={Layout.springify()}
                  >
                    <View
                      style={[
                        styles.taskCard,
                        { backgroundColor: colors.cardBg, borderColor: colors.border },
                        task.completed && styles.taskCardCompleted,
                      ]}
                    >
                      <Pressable 
                        style={styles.taskMainContent}
                        onPress={() => handleEditTask(task)}
                      >
                        <Text style={styles.taskIcon}>{task.icon}</Text>
                        <View style={styles.taskInfo}>
                          <Text style={[
                            styles.taskName,
                            { color: colors.text },
                            task.completed && styles.taskNameCompleted,
                          ]}>
                            {task.name}
                          </Text>
                          {task.completed && (
                            <Text style={styles.completedBadge}>✅ Done</Text>
                          )}
                        </View>
                        <View style={styles.taskStars}>
                          <Text style={styles.starIcon}>⭐</Text>
                          <Text style={styles.starCount}>{task.stars}</Text>
                        </View>
                      </Pressable>
                      <Pressable 
                        style={[styles.deleteTaskButton, { backgroundColor: colors.error + '15' }]}
                        onPress={() => handleDeleteTask(task.id, task.name)}
                      >
                        <Text style={[styles.deleteTaskIcon, { color: colors.error }]}>🗑️</Text>
                      </Pressable>
                    </View>
                  </Animated.View>
                ))}
              </Animated.View>
            ))}
          </>
        )}
        
        <View style={styles.bottomPadding} />
      </ScrollView>
      
      {/* Add/Edit Task Modal */}
      <Modal
        visible={showAddModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => {
          setShowAddModal(false);
          resetForm();
        }}
      >
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalOverlay}
        >
          <Pressable 
            style={styles.modalBackdrop}
            onPress={() => {
              setShowAddModal(false);
              resetForm();
            }}
          />
          <View style={[styles.modalContent, { backgroundColor: colors.background }]}>
            <View style={[styles.modalHeader, { borderBottomColor: colors.border }]}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>
                {editingTask ? 'Edit Task' : 'Add Task'}
              </Text>
              <Pressable onPress={() => {
                setShowAddModal(false);
                resetForm();
              }}>
                <Text style={[styles.modalClose, { color: colors.textLight }]}>✕</Text>
              </Pressable>
            </View>
            
            <ScrollView style={styles.modalBody}>
              {/* Task Name */}
              <Text style={[styles.inputLabel, { color: colors.text }]}>Task Name</Text>
              <TextInput
                style={[styles.input, { backgroundColor: colors.cardBg, color: colors.text, borderColor: colors.border }]}
                placeholder="e.g., Brush teeth"
                placeholderTextColor={colors.textLight}
                value={taskName}
                onChangeText={setTaskName}
                autoFocus
              />
              
              {/* Icon Selection */}
              <Text style={[styles.inputLabel, { color: colors.text }]}>Icon</Text>
              <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false}
                style={styles.iconPicker}
              >
                {TASK_ICONS.map((icon) => (
                  <Pressable
                    key={icon}
                    style={[
                      styles.iconOption,
                      { backgroundColor: colors.cardBg, borderColor: colors.border },
                      taskIcon === icon && styles.iconSelected,
                    ]}
                    onPress={() => setTaskIcon(icon)}
                  >
                    <Text style={styles.iconEmoji}>{icon}</Text>
                  </Pressable>
                ))}
              </ScrollView>
              
              {/* Stars */}
              <Text style={[styles.inputLabel, { color: colors.text }]}>Stars (1-5)</Text>
              <View style={styles.starsRow}>
                {[1, 2, 3, 4, 5].map((num) => (
                  <Pressable
                    key={num}
                    style={[
                      styles.starOption,
                      { backgroundColor: colors.cardBg, borderColor: colors.border },
                      parseInt(taskStars) === num && styles.starOptionSelected,
                    ]}
                    onPress={() => setTaskStars(num.toString())}
                  >
                    <Text style={styles.starOptionIcon}>⭐</Text>
                    <Text style={[styles.starOptionText, { color: colors.text }]}>{num}</Text>
                  </Pressable>
                ))}
              </View>
              
              {/* Category */}
              <Text style={[styles.inputLabel, { color: colors.text }]}>Category</Text>
              <View style={styles.categoryRow}>
                {TASK_CATEGORIES.map((cat) => (
                  <Pressable
                    key={cat.id}
                    style={[
                      styles.categoryOption,
                      { backgroundColor: colors.cardBg, borderColor: colors.border },
                      taskCategory === cat.id && { backgroundColor: cat.color + '30', borderColor: cat.color },
                    ]}
                    onPress={() => setTaskCategory(cat.id)}
                  >
                    <Text style={styles.categoryOptionIcon}>{cat.icon}</Text>
                    <Text style={[styles.categoryOptionText, { color: colors.text }]}>{cat.name}</Text>
                  </Pressable>
                ))}
              </View>
            </ScrollView>
            
            <View style={[styles.modalFooter, { borderTopColor: colors.border }]}>
              <Pressable
                style={[styles.saveButton, { backgroundColor: colors.primary }]}
                onPress={handleAddTask}
              >
                <Text style={styles.saveButtonText}>
                  {editingTask ? 'Save Changes' : 'Add Task'}
                </Text>
              </Pressable>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
      
      {/* Templates Modal */}
      <Modal
        visible={showTemplatesModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowTemplatesModal(false)}
      >
        <Pressable 
          style={styles.modalOverlay}
          onPress={() => setShowTemplatesModal(false)}
        >
          <View style={[styles.templatesModal, { backgroundColor: colors.background }]}>
            <View style={[styles.modalHeader, { borderBottomColor: colors.border }]}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>Quick Add from Templates</Text>
              <Pressable onPress={() => setShowTemplatesModal(false)}>
                <Text style={[styles.modalClose, { color: colors.textLight }]}>✕</Text>
              </Pressable>
            </View>
            
            <ScrollView style={styles.templatesList}>
              {templates.length === 0 ? (
                <View style={styles.emptyTemplates}>
                  <Text style={[styles.emptyTemplatesText, { color: colors.textLight }]}>
                    No templates yet. Create tasks and save them as templates!
                  </Text>
                </View>
              ) : (
                templates.map((template) => (
                  <Pressable
                    key={template.id}
                    style={[styles.templateItem, { backgroundColor: colors.cardBg, borderColor: colors.border }]}
                    onPress={() => handleApplyTemplate(template)}
                  >
                    <View style={[styles.templateIconBox, { backgroundColor: template.color + '30' }]}>
                      <Text style={styles.templateIcon}>{template.icon}</Text>
                    </View>
                    <View style={styles.templateInfo}>
                      <Text style={[styles.templateName, { color: colors.text }]}>{template.name}</Text>
                      <Text style={[styles.templateStars, { color: colors.textLight }]}>
                        {template.tasks.length} tasks • ⭐ {template.tasks.reduce((sum, t) => sum + t.stars, 0)} stars
                      </Text>
                    </View>
                    {template.isFavorite && <Text style={styles.favoriteIcon}>💛</Text>}
                  </Pressable>
                ))
              )}
            </ScrollView>
            
            <Pressable
              style={[styles.manageTemplatesButton, { borderTopColor: colors.border }]}
              onPress={() => {
                setShowTemplatesModal(false);
                router.push('/(parent)/task-templates');
              }}
            >
              <Text style={[styles.manageTemplatesText, { color: colors.primary }]}>
                ⚙️ Manage Templates
              </Text>
            </Pressable>
          </View>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 15,
    backgroundColor: Colors.cardBg,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  backButton: {
    width: 70,
  },
  backText: {
    fontSize: 16,
    color: Colors.primary,
    fontWeight: '600',
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  childName: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text,
  },
  placeholder: {
    width: 70,
  },
  dateSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 15,
    paddingHorizontal: 20,
    backgroundColor: Colors.cardBg,
  },
  dateArrow: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dateArrowText: {
    fontSize: 18,
  },
  dateCenter: {
    alignItems: 'center',
  },
  dateText: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.text,
  },
  todayHint: {
    fontSize: 12,
    color: Colors.primary,
    marginTop: 2,
  },
  summaryBar: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: '#FFF9E6',
  },
  summaryText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
    textAlign: 'center',
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
  },
  quickActions: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 20,
    flexWrap: 'wrap',
  },
  quickButton: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: Colors.primary,
  },
  quickButtonSecondary: {
    backgroundColor: Colors.cardBg,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  quickButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFF',
  },
  quickButtonTextSecondary: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
  },
  emptyCard: {
    backgroundColor: Colors.cardBg,
    borderRadius: 20,
    padding: 40,
    alignItems: 'center',
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
  emptySubtitle: {
    fontSize: 14,
    color: Colors.textLight,
    textAlign: 'center',
  },
  categoryGroup: {
    marginBottom: 20,
  },
  categoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 12,
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
    flex: 1,
  },
  categoryCount: {
    fontSize: 12,
    color: Colors.textLight,
  },
  taskCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.cardBg,
    borderRadius: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: 'hidden',
  },
  taskMainContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
  },
  taskCardCompleted: {
    opacity: 0.6,
  },
  deleteTaskButton: {
    paddingVertical: 15,
    paddingHorizontal: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteTaskIcon: {
    fontSize: 18,
  },
  taskIcon: {
    fontSize: 28,
    marginRight: 12,
  },
  taskInfo: {
    flex: 1,
  },
  taskName: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
  },
  taskNameCompleted: {
    textDecorationLine: 'line-through',
    opacity: 0.7,
  },
  completedBadge: {
    fontSize: 12,
    color: '#27AE60',
    marginTop: 2,
  },
  taskStars: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF9E6',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 20,
  },
  starIcon: {
    fontSize: 14,
    marginRight: 4,
  },
  starCount: {
    fontSize: 14,
    fontWeight: '700',
    color: '#B8860B',  // Dark gold - readable on light yellow background
  },
  bottomPadding: {
    height: 100,
  },
  errorText: {
    fontSize: 16,
    color: Colors.text,
    textAlign: 'center',
    marginTop: 100,
  },
  
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalBackdrop: {
    flex: 1,
  },
  modalContent: {
    backgroundColor: Colors.background,
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    maxHeight: '85%',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 20,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.text,
  },
  modalClose: {
    fontSize: 24,
    color: Colors.textLight,
  },
  modalBody: {
    padding: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 8,
  },
  input: {
    backgroundColor: Colors.cardBg,
    borderRadius: 12,
    padding: 15,
    fontSize: 16,
    color: Colors.text,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  iconPicker: {
    marginBottom: 20,
  },
  iconOption: {
    width: 50,
    height: 50,
    borderRadius: 12,
    backgroundColor: Colors.cardBg,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  iconSelected: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primary + '20',
  },
  iconEmoji: {
    fontSize: 26,
  },
  starsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 20,
  },
  starOption: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: Colors.cardBg,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  starOptionSelected: {
    borderColor: Colors.starYellow,
    backgroundColor: '#FFF9E6',
  },
  starOptionIcon: {
    fontSize: 20,
  },
  starOptionText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
    marginTop: 4,
  },
  categoryRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 20,
  },
  categoryOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 20,
    backgroundColor: Colors.cardBg,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  categoryOptionIcon: {
    fontSize: 16,
    marginRight: 6,
  },
  categoryOptionText: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.text,
  },
  modalFooter: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  saveButton: {
    backgroundColor: Colors.primary,
    paddingVertical: 16,
    borderRadius: 25,
    alignItems: 'center',
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFF',
  },
  
  // Templates modal
  templatesModal: {
    backgroundColor: Colors.background,
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    maxHeight: '70%',
    marginTop: 'auto',
  },
  templatesList: {
    padding: 20,
  },
  emptyTemplates: {
    padding: 30,
    alignItems: 'center',
  },
  emptyTemplatesText: {
    fontSize: 14,
    color: Colors.textLight,
    textAlign: 'center',
  },
  templateItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.cardBg,
    borderRadius: 12,
    padding: 15,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  templateIconBox: {
    width: 50,
    height: 50,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  templateIcon: {
    fontSize: 24,
  },
  templateInfo: {
    flex: 1,
  },
  templateName: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
  },
  templateStars: {
    fontSize: 12,
    color: Colors.textLight,
    marginTop: 2,
  },
  favoriteIcon: {
    fontSize: 18,
  },
  manageTemplatesButton: {
    padding: 20,
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  manageTemplatesText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.primary,
  },
});

