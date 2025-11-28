import { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  TextInput,
  Alert,
  Modal,
} from 'react-native';
import { useRouter } from 'expo-router';
import Animated, { FadeInUp, Layout } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { useAuthStore } from '../../lib/stores/authStore';
import { useDailyTaskStore } from '../../lib/stores/dailyTaskStore';
import { useThemeStore } from '../../lib/stores/themeStore';
import { TaskTemplate, TemplateTask, TASK_CATEGORIES } from '../../lib/types';
import Colors from '../../constants/colors';

// Common task icons
const TASK_ICONS = ['🦷', '🛁', '👕', '🍳', '📚', '🎒', '🛏️', '🧹', '🥗', '💪', '🎹', '✏️', '🐕', '🚿', '😴', '🧘', '🎨', '🏃', '🍎', '💊'];

// Template colors
const TEMPLATE_COLORS = ['#FFB347', '#87CEEB', '#DDA0DD', '#98D8C8', '#FF6B9D', '#4ECDC4', '#9B59B6', '#F39C12'];

// Default template suggestions
const SUGGESTED_TEMPLATES: Omit<TaskTemplate, 'id' | 'parentId' | 'usageCount' | 'createdAt'>[] = [
  {
    name: 'Morning Routine',
    icon: '🌅',
    color: '#FFB347',
    isFavorite: true,
    tasks: [
      { id: '1', name: 'Brush teeth', icon: '🦷', stars: 1, category: 'morning', order: 0 },
      { id: '2', name: 'Get dressed', icon: '👕', stars: 1, category: 'morning', order: 1 },
      { id: '3', name: 'Make bed', icon: '🛏️', stars: 1, category: 'morning', order: 2 },
      { id: '4', name: 'Eat breakfast', icon: '🍳', stars: 1, category: 'morning', order: 3 },
    ],
  },
  {
    name: 'Bedtime Routine',
    icon: '🌙',
    color: '#9B59B6',
    isFavorite: true,
    tasks: [
      { id: '1', name: 'Take a bath', icon: '🛁', stars: 2, category: 'evening', order: 0 },
      { id: '2', name: 'Put on pajamas', icon: '😴', stars: 1, category: 'evening', order: 1 },
      { id: '3', name: 'Brush teeth', icon: '🦷', stars: 1, category: 'evening', order: 2 },
      { id: '4', name: 'Read a book', icon: '📚', stars: 2, category: 'evening', order: 3 },
    ],
  },
  {
    name: 'After School',
    icon: '🏫',
    color: '#87CEEB',
    isFavorite: false,
    tasks: [
      { id: '1', name: 'Unpack school bag', icon: '🎒', stars: 1, category: 'afternoon', order: 0 },
      { id: '2', name: 'Do homework', icon: '✏️', stars: 3, category: 'afternoon', order: 1 },
      { id: '3', name: 'Have a snack', icon: '🍎', stars: 1, category: 'afternoon', order: 2 },
    ],
  },
];

export default function TaskTemplatesScreen() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { templates, loadTemplates, createTemplate, updateTemplate, deleteTemplate } = useDailyTaskStore();
  const { colors, isDark } = useThemeStore();
  
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<TaskTemplate | null>(null);
  
  // Form state
  const [templateName, setTemplateName] = useState('');
  const [templateIcon, setTemplateIcon] = useState('📋');
  const [templateColor, setTemplateColor] = useState(TEMPLATE_COLORS[0]);
  const [templateTasks, setTemplateTasks] = useState<TemplateTask[]>([]);
  const [templateFavorite, setTemplateFavorite] = useState(false);
  
  // Task form state
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [editingTaskIndex, setEditingTaskIndex] = useState<number | null>(null);
  const [taskName, setTaskName] = useState('');
  const [taskIcon, setTaskIcon] = useState('⭐');
  const [taskStars, setTaskStars] = useState('1');
  const [taskCategory, setTaskCategory] = useState('anytime');
  
  useEffect(() => {
    if (user) {
      loadTemplates(user.uid);
    }
  }, [user]);
  
  const resetForm = () => {
    setTemplateName('');
    setTemplateIcon('📋');
    setTemplateColor(TEMPLATE_COLORS[0]);
    setTemplateTasks([]);
    setTemplateFavorite(false);
    setEditingTemplate(null);
  };
  
  const resetTaskForm = () => {
    setTaskName('');
    setTaskIcon('⭐');
    setTaskStars('1');
    setTaskCategory('anytime');
    setEditingTaskIndex(null);
  };
  
  const handleSaveTemplate = async () => {
    if (!templateName.trim()) {
      Alert.alert('Oops!', 'Please enter a template name');
      return;
    }
    
    if (templateTasks.length === 0) {
      Alert.alert('Oops!', 'Add at least one task to the template');
      return;
    }
    
    if (!user) return;
    
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      
      if (editingTemplate) {
        await updateTemplate(editingTemplate.id, {
          name: templateName.trim(),
          icon: templateIcon,
          color: templateColor,
          tasks: templateTasks,
          isFavorite: templateFavorite,
        });
      } else {
        await createTemplate(user.uid, {
          name: templateName.trim(),
          icon: templateIcon,
          color: templateColor,
          tasks: templateTasks,
          isFavorite: templateFavorite,
        });
      }
      
      setShowEditModal(false);
      resetForm();
    } catch (error) {
      Alert.alert('Error', 'Failed to save template');
    }
  };
  
  const handleEditTemplate = (template: TaskTemplate) => {
    setEditingTemplate(template);
    setTemplateName(template.name);
    setTemplateIcon(template.icon);
    setTemplateColor(template.color);
    setTemplateTasks([...template.tasks]);
    setTemplateFavorite(template.isFavorite);
    setShowEditModal(true);
  };
  
  const handleDeleteTemplate = (template: TaskTemplate) => {
    Alert.alert(
      'Delete Template',
      `Are you sure you want to delete "${template.name}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            await deleteTemplate(template.id);
          },
        },
      ]
    );
  };
  
  const handleAddTask = () => {
    if (!taskName.trim()) {
      Alert.alert('Oops!', 'Please enter a task name');
      return;
    }
    
    const newTask: TemplateTask = {
      id: `task_${Date.now()}`,
      name: taskName.trim(),
      icon: taskIcon,
      stars: parseInt(taskStars) || 1,
      category: taskCategory,
      order: editingTaskIndex !== null ? editingTaskIndex : templateTasks.length,
    };
    
    if (editingTaskIndex !== null) {
      const updated = [...templateTasks];
      updated[editingTaskIndex] = newTask;
      setTemplateTasks(updated);
    } else {
      setTemplateTasks([...templateTasks, newTask]);
    }
    
    setShowTaskModal(false);
    resetTaskForm();
  };
  
  const handleEditTask = (index: number) => {
    const task = templateTasks[index];
    setEditingTaskIndex(index);
    setTaskName(task.name);
    setTaskIcon(task.icon);
    setTaskStars(task.stars.toString());
    setTaskCategory(task.category || 'anytime');
    setShowTaskModal(true);
  };
  
  const handleRemoveTask = (index: number) => {
    setTemplateTasks(templateTasks.filter((_, i) => i !== index));
  };
  
  const handleAddSuggested = async (suggested: typeof SUGGESTED_TEMPLATES[0]) => {
    if (!user) return;
    
    const exists = templates.some(t => 
      t.name.toLowerCase() === suggested.name.toLowerCase()
    );
    
    if (exists) {
      Alert.alert('Already Added', 'This template already exists.');
      return;
    }
    
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    await createTemplate(user.uid, suggested);
  };
  
  const availableSuggestions = SUGGESTED_TEMPLATES.filter(
    s => !templates.some(t => t.name.toLowerCase() === s.name.toLowerCase())
  );
  
  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.cardBg, borderBottomColor: colors.border }]}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Text style={[styles.backText, { color: colors.primary }]}>← Back</Text>
        </Pressable>
        <Text style={[styles.title, { color: colors.text }]}>Task Templates</Text>
        <Pressable 
          style={[styles.addButton, { backgroundColor: colors.primary }]}
          onPress={() => setShowEditModal(true)}
        >
          <Text style={styles.addButtonText}>+ New</Text>
        </Pressable>
      </View>
      
      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        {/* Info Card */}
        <View style={[styles.infoCard, { backgroundColor: isDark ? colors.cardBg : '#E8F6FF' }]}>
          <Text style={styles.infoIcon}>💡</Text>
          <Text style={[styles.infoText, { color: colors.text }]}>
            Templates are collections of tasks. Apply a template to quickly add multiple tasks at once!
          </Text>
        </View>
        
        {/* My Templates */}
        <Text style={[styles.sectionTitle, { color: colors.text }]}>My Templates</Text>
        
        {templates.length === 0 ? (
          <View style={[styles.emptyCard, { backgroundColor: colors.cardBg }]}>
            <Text style={styles.emptyEmoji}>📋</Text>
            <Text style={[styles.emptyTitle, { color: colors.text }]}>No templates yet</Text>
            <Text style={[styles.emptySubtitle, { color: colors.textLight }]}>
              Create templates or add from suggestions below
            </Text>
          </View>
        ) : (
          <View style={styles.templatesList}>
            {templates.map((template, index) => (
              <Animated.View
                key={template.id}
                entering={FadeInUp.delay(index * 50).springify()}
                layout={Layout.springify()}
              >
                <Pressable
                  style={[
                    styles.templateCard, 
                    { backgroundColor: colors.cardBg, borderLeftColor: template.color }
                  ]}
                  onPress={() => handleEditTemplate(template)}
                  onLongPress={() => handleDeleteTemplate(template)}
                >
                  <View style={[styles.templateIconContainer, { backgroundColor: template.color + '30' }]}>
                    <Text style={styles.templateIcon}>{template.icon}</Text>
                  </View>
                  <View style={styles.templateInfo}>
                    <Text style={[styles.templateName, { color: colors.text }]}>{template.name}</Text>
                    <Text style={[styles.templateMeta, { color: colors.textLight }]}>
                      {template.tasks.length} tasks • ⭐ {template.tasks.reduce((sum, t) => sum + t.stars, 0)} stars
                    </Text>
                  </View>
                  {template.isFavorite && <Text style={styles.favoriteIcon}>💛</Text>}
                </Pressable>
              </Animated.View>
            ))}
          </View>
        )}
        
        {/* Suggested Templates */}
        {availableSuggestions.length > 0 && (
          <>
            <Text style={[styles.sectionTitle, { color: colors.text, marginTop: 30 }]}>
              Quick Add Templates
            </Text>
            <Text style={[styles.sectionSubtitle, { color: colors.textLight }]}>
              Tap to add these pre-made templates
            </Text>
            
            <View style={styles.suggestionsGrid}>
              {availableSuggestions.map((suggested, index) => (
                <Animated.View
                  key={suggested.name}
                  entering={FadeInUp.delay(index * 50).springify()}
                >
                  <Pressable
                    style={[
                      styles.suggestionCard, 
                      { backgroundColor: colors.cardBg, borderColor: suggested.color }
                    ]}
                    onPress={() => handleAddSuggested(suggested)}
                  >
                    <Text style={styles.suggestionIcon}>{suggested.icon}</Text>
                    <Text style={[styles.suggestionName, { color: colors.text }]}>{suggested.name}</Text>
                    <Text style={[styles.suggestionMeta, { color: colors.textLight }]}>
                      {suggested.tasks.length} tasks
                    </Text>
                  </Pressable>
                </Animated.View>
              ))}
            </View>
          </>
        )}
        
        <View style={styles.bottomPadding} />
      </ScrollView>
      
      {/* Edit Template Modal */}
      <Modal
        visible={showEditModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => {
          setShowEditModal(false);
          resetForm();
        }}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.background }]}>
            <View style={[styles.modalHeader, { borderBottomColor: colors.border }]}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>
                {editingTemplate ? 'Edit Template' : 'New Template'}
              </Text>
              <Pressable onPress={() => {
                setShowEditModal(false);
                resetForm();
              }}>
                <Text style={[styles.modalClose, { color: colors.textLight }]}>✕</Text>
              </Pressable>
            </View>
            
            <ScrollView style={styles.modalBody}>
              {/* Template Name */}
              <Text style={[styles.inputLabel, { color: colors.text }]}>Template Name</Text>
              <TextInput
                style={[styles.input, { backgroundColor: colors.cardBg, color: colors.text, borderColor: colors.border }]}
                placeholder="e.g., Morning Routine"
                placeholderTextColor={colors.textLight}
                value={templateName}
                onChangeText={setTemplateName}
              />
              
              {/* Icon & Color */}
              <View style={styles.iconColorRow}>
                <View style={styles.iconSection}>
                  <Text style={[styles.inputLabel, { color: colors.text }]}>Icon</Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    {['📋', '🌅', '🌙', '🏫', '📚', '🎯', '🏃', '🎨', '🧹', '💪'].map((icon) => (
                      <Pressable
                        key={icon}
                        style={[
                          styles.iconOption,
                          { backgroundColor: colors.cardBg },
                          templateIcon === icon && { borderColor: colors.primary, borderWidth: 2 },
                        ]}
                        onPress={() => setTemplateIcon(icon)}
                      >
                        <Text style={styles.iconEmoji}>{icon}</Text>
                      </Pressable>
                    ))}
                  </ScrollView>
                </View>
              </View>
              
              {/* Color */}
              <Text style={[styles.inputLabel, { color: colors.text }]}>Color</Text>
              <View style={styles.colorRow}>
                {TEMPLATE_COLORS.map((color) => (
                  <Pressable
                    key={color}
                    style={[
                      styles.colorOption,
                      { backgroundColor: color },
                      templateColor === color && styles.colorSelected,
                    ]}
                    onPress={() => setTemplateColor(color)}
                  />
                ))}
              </View>
              
              {/* Tasks */}
              <View style={styles.tasksHeader}>
                <Text style={[styles.inputLabel, { color: colors.text }]}>Tasks</Text>
                <Pressable
                  style={[styles.addTaskButton, { backgroundColor: colors.primary }]}
                  onPress={() => {
                    resetTaskForm();
                    setShowTaskModal(true);
                  }}
                >
                  <Text style={styles.addTaskButtonText}>+ Add Task</Text>
                </Pressable>
              </View>
              
              {templateTasks.length === 0 ? (
                <View style={[styles.noTasksCard, { backgroundColor: colors.cardBg }]}>
                  <Text style={[styles.noTasksText, { color: colors.textLight }]}>
                    No tasks yet. Add tasks to your template.
                  </Text>
                </View>
              ) : (
                <View style={styles.tasksList}>
                  {templateTasks.map((task, index) => (
                    <View 
                      key={task.id} 
                      style={[styles.taskItem, { backgroundColor: colors.cardBg, borderColor: colors.border }]}
                    >
                      <Text style={styles.taskItemIcon}>{task.icon}</Text>
                      <View style={styles.taskItemInfo}>
                        <Text style={[styles.taskItemName, { color: colors.text }]}>{task.name}</Text>
                        <Text style={[styles.taskItemStars, { color: colors.textLight }]}>⭐ {task.stars}</Text>
                      </View>
                      <Pressable onPress={() => handleEditTask(index)} style={styles.taskItemButton}>
                        <Text style={{ color: colors.primary }}>Edit</Text>
                      </Pressable>
                      <Pressable onPress={() => handleRemoveTask(index)} style={styles.taskItemButton}>
                        <Text style={{ color: colors.error }}>✕</Text>
                      </Pressable>
                    </View>
                  ))}
                </View>
              )}
              
              {/* Favorite Toggle */}
              <Pressable
                style={[styles.favoriteToggle, { backgroundColor: colors.cardBg, borderColor: colors.border }]}
                onPress={() => setTemplateFavorite(!templateFavorite)}
              >
                <Text style={styles.favoriteToggleIcon}>{templateFavorite ? '💛' : '🤍'}</Text>
                <Text style={[styles.favoriteToggleText, { color: colors.text }]}>Mark as favorite</Text>
              </Pressable>
            </ScrollView>
            
            <View style={[styles.modalFooter, { borderTopColor: colors.border }]}>
              {editingTemplate && (
                <Pressable
                  style={[styles.deleteButton, { borderColor: colors.error }]}
                  onPress={() => {
                    setShowEditModal(false);
                    handleDeleteTemplate(editingTemplate);
                    resetForm();
                  }}
                >
                  <Text style={[styles.deleteButtonText, { color: colors.error }]}>Delete</Text>
                </Pressable>
              )}
              <Pressable
                style={[styles.saveButton, { backgroundColor: colors.primary, flex: editingTemplate ? 1 : undefined }]}
                onPress={handleSaveTemplate}
              >
                <Text style={styles.saveButtonText}>Save Template</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
      
      {/* Add Task Modal */}
      <Modal
        visible={showTaskModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => {
          setShowTaskModal(false);
          resetTaskForm();
        }}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.taskModalContent, { backgroundColor: colors.background }]}>
            <View style={[styles.modalHeader, { borderBottomColor: colors.border }]}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>
                {editingTaskIndex !== null ? 'Edit Task' : 'Add Task'}
              </Text>
              <Pressable onPress={() => {
                setShowTaskModal(false);
                resetTaskForm();
              }}>
                <Text style={[styles.modalClose, { color: colors.textLight }]}>✕</Text>
              </Pressable>
            </View>
            
            <ScrollView style={styles.modalBody}>
              <Text style={[styles.inputLabel, { color: colors.text }]}>Task Name</Text>
              <TextInput
                style={[styles.input, { backgroundColor: colors.cardBg, color: colors.text, borderColor: colors.border }]}
                placeholder="e.g., Brush teeth"
                placeholderTextColor={colors.textLight}
                value={taskName}
                onChangeText={setTaskName}
              />
              
              <Text style={[styles.inputLabel, { color: colors.text }]}>Icon</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.iconPicker}>
                {TASK_ICONS.map((icon) => (
                  <Pressable
                    key={icon}
                    style={[
                      styles.iconOption,
                      { backgroundColor: colors.cardBg },
                      taskIcon === icon && { borderColor: colors.primary, borderWidth: 2 },
                    ]}
                    onPress={() => setTaskIcon(icon)}
                  >
                    <Text style={styles.iconEmoji}>{icon}</Text>
                  </Pressable>
                ))}
              </ScrollView>
              
              <Text style={[styles.inputLabel, { color: colors.text }]}>Stars</Text>
              <View style={styles.starsRow}>
                {[1, 2, 3, 4, 5].map((num) => (
                  <Pressable
                    key={num}
                    style={[
                      styles.starOption,
                      { backgroundColor: colors.cardBg },
                      parseInt(taskStars) === num && styles.starOptionSelected,
                    ]}
                    onPress={() => setTaskStars(num.toString())}
                  >
                    <Text style={styles.starOptionIcon}>⭐</Text>
                    <Text style={[styles.starOptionText, { color: colors.text }]}>{num}</Text>
                  </Pressable>
                ))}
              </View>
              
              <Text style={[styles.inputLabel, { color: colors.text }]}>Category</Text>
              <View style={styles.categoryRow}>
                {TASK_CATEGORIES.map((cat) => (
                  <Pressable
                    key={cat.id}
                    style={[
                      styles.categoryOption,
                      { backgroundColor: colors.cardBg },
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
                  {editingTaskIndex !== null ? 'Save Task' : 'Add Task'}
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 15,
    borderBottomWidth: 1,
  },
  backButton: { width: 60 },
  backText: { fontSize: 16, fontWeight: '600' },
  title: { fontSize: 18, fontWeight: '700' },
  addButton: { paddingVertical: 8, paddingHorizontal: 15, borderRadius: 15 },
  addButtonText: { color: '#FFF', fontWeight: '600', fontSize: 14 },
  content: { flex: 1 },
  contentContainer: { padding: 20 },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderRadius: 12,
    marginBottom: 25,
    gap: 12,
  },
  infoIcon: { fontSize: 24 },
  infoText: { flex: 1, fontSize: 14, lineHeight: 20 },
  sectionTitle: { fontSize: 20, fontWeight: '700', marginBottom: 5 },
  sectionSubtitle: { fontSize: 14, marginBottom: 15 },
  emptyCard: { borderRadius: 16, padding: 30, alignItems: 'center' },
  emptyEmoji: { fontSize: 40, marginBottom: 10 },
  emptyTitle: { fontSize: 16, fontWeight: '600', marginBottom: 5 },
  emptySubtitle: { fontSize: 14, textAlign: 'center' },
  templatesList: { gap: 12 },
  templateCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderRadius: 16,
    borderLeftWidth: 4,
  },
  templateIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  templateIcon: { fontSize: 24 },
  templateInfo: { flex: 1 },
  templateName: { fontSize: 16, fontWeight: '600' },
  templateMeta: { fontSize: 13, marginTop: 2 },
  favoriteIcon: { fontSize: 18 },
  suggestionsGrid: { gap: 12 },
  suggestionCard: {
    padding: 16,
    borderRadius: 16,
    borderWidth: 2,
    alignItems: 'center',
  },
  suggestionIcon: { fontSize: 36, marginBottom: 8 },
  suggestionName: { fontSize: 15, fontWeight: '600', marginBottom: 4 },
  suggestionMeta: { fontSize: 12 },
  bottomPadding: { height: 50 },
  
  // Modal
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { borderTopLeftRadius: 25, borderTopRightRadius: 25, maxHeight: '90%' },
  taskModalContent: { borderTopLeftRadius: 25, borderTopRightRadius: 25, maxHeight: '80%' },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 20,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
  },
  modalTitle: { fontSize: 20, fontWeight: '700' },
  modalClose: { fontSize: 24 },
  modalBody: { padding: 20 },
  inputLabel: { fontSize: 14, fontWeight: '600', marginBottom: 8 },
  input: { borderRadius: 12, padding: 15, fontSize: 16, marginBottom: 20, borderWidth: 1 },
  iconColorRow: { marginBottom: 20 },
  iconSection: { flex: 1 },
  iconPicker: { marginBottom: 20 },
  iconOption: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  iconEmoji: { fontSize: 24 },
  colorRow: { flexDirection: 'row', gap: 12, marginBottom: 20, flexWrap: 'wrap' },
  colorOption: { width: 36, height: 36, borderRadius: 18 },
  colorSelected: { borderWidth: 3, borderColor: '#FFF', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.3, shadowRadius: 4, elevation: 4 },
  tasksHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  addTaskButton: { paddingVertical: 8, paddingHorizontal: 14, borderRadius: 12 },
  addTaskButtonText: { color: '#FFF', fontWeight: '600', fontSize: 13 },
  noTasksCard: { padding: 20, borderRadius: 12, alignItems: 'center' },
  noTasksText: { fontSize: 14 },
  tasksList: { gap: 8, marginBottom: 20 },
  taskItem: { flexDirection: 'row', alignItems: 'center', padding: 12, borderRadius: 12, borderWidth: 1 },
  taskItemIcon: { fontSize: 24, marginRight: 10 },
  taskItemInfo: { flex: 1 },
  taskItemName: { fontSize: 15, fontWeight: '500' },
  taskItemStars: { fontSize: 12, marginTop: 2 },
  taskItemButton: { paddingHorizontal: 10, paddingVertical: 5 },
  favoriteToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderRadius: 12,
    borderWidth: 1,
    gap: 10,
    marginTop: 10,
  },
  favoriteToggleIcon: { fontSize: 20 },
  favoriteToggleText: { fontSize: 15, fontWeight: '500' },
  starsRow: { flexDirection: 'row', gap: 10, marginBottom: 20 },
  starOption: { flex: 1, paddingVertical: 12, borderRadius: 12, alignItems: 'center', borderWidth: 2, borderColor: 'transparent' },
  starOptionSelected: { borderColor: '#FFD700', backgroundColor: '#FFF9E6' },
  starOptionIcon: { fontSize: 20 },
  starOptionText: { fontSize: 14, fontWeight: '600', marginTop: 4 },
  categoryRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 20 },
  categoryOption: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, paddingHorizontal: 14, borderRadius: 20, borderWidth: 2, borderColor: 'transparent' },
  categoryOptionIcon: { fontSize: 16, marginRight: 6 },
  categoryOptionText: { fontSize: 14, fontWeight: '500' },
  modalFooter: { padding: 20, borderTopWidth: 1, flexDirection: 'row', gap: 12 },
  deleteButton: { paddingVertical: 16, paddingHorizontal: 20, borderRadius: 25, borderWidth: 2 },
  deleteButtonText: { fontSize: 16, fontWeight: '600' },
  saveButton: { backgroundColor: Colors.primary, paddingVertical: 16, paddingHorizontal: 30, borderRadius: 25, alignItems: 'center' },
  saveButtonText: { fontSize: 16, fontWeight: '700', color: '#FFF' },
});
