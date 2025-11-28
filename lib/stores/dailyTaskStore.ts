import { create } from 'zustand';
import { DailyTask, DailyTaskList, TaskTemplate } from '../types';
import {
  getDailyTasks,
  setDailyTasks,
  addDailyTask,
  removeDailyTask,
  updateDailyTask,
  completeDailyTask,
  uncompleteDailyTask,
  copyDailyTasks,
  getTaskTemplates,
  addTaskTemplate,
  updateTaskTemplate,
  deleteTaskTemplate,
  incrementTemplateUsage,
  addStars,
  removeStars,
  incrementTaskCount,
  decrementTaskCount,
  updateStreak,
} from '../firebase';
import { useChildStore } from './childStore';

// Helper to get local date string
const getLocalDateString = (date: Date = new Date()): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

interface DailyTaskState {
  // Current day's tasks
  taskList: DailyTaskList | null;
  templates: TaskTemplate[];
  isLoading: boolean;
  selectedDate: string;
  
  // Actions
  setSelectedDate: (date: string) => void;
  loadDailyTasks: (childId: string, date?: string) => Promise<void>;
  loadTemplates: (parentId: string) => Promise<void>;
  
  // Task management
  setTasks: (childId: string, parentId: string, tasks: Omit<DailyTask, 'completed' | 'completedAt'>[], date?: string) => Promise<void>;
  addTask: (childId: string, parentId: string, task: Omit<DailyTask, 'id' | 'completed' | 'completedAt' | 'order'>, date?: string) => Promise<void>;
  removeTask: (childId: string, parentId: string, taskId: string, date?: string) => Promise<void>;
  updateTask: (childId: string, parentId: string, taskId: string, updates: Partial<Omit<DailyTask, 'id' | 'completed' | 'completedAt'>>, date?: string) => Promise<void>;
  reorderTasks: (childId: string, parentId: string, tasks: DailyTask[], date?: string) => Promise<void>;
  
  // Child actions (completing tasks)
  completeTask: (childId: string, taskId: string, date?: string) => Promise<{ success: boolean; allComplete: boolean }>;
  uncompleteTask: (childId: string, taskId: string, date?: string) => Promise<boolean>;
  
  // Utility
  copyFromPreviousDay: (childId: string, parentId: string, date?: string) => Promise<boolean>;
  
  // Template management
  createTemplate: (parentId: string, template: Omit<TaskTemplate, 'id' | 'parentId' | 'usageCount' | 'createdAt'>) => Promise<void>;
  updateTemplate: (templateId: string, updates: Partial<TaskTemplate>) => Promise<void>;
  deleteTemplate: (templateId: string) => Promise<void>;
  applyTemplate: (childId: string, parentId: string, template: TaskTemplate, date?: string) => Promise<void>;
}

export const useDailyTaskStore = create<DailyTaskState>((set, get) => ({
  taskList: null,
  templates: [],
  isLoading: false,
  selectedDate: getLocalDateString(),
  
  setSelectedDate: (date) => {
    set({ selectedDate: date });
  },
  
  loadDailyTasks: async (childId, date) => {
    set({ isLoading: true });
    try {
      const targetDate = date || get().selectedDate;
      const taskList = await getDailyTasks(childId, targetDate);
      set({ taskList, isLoading: false });
    } catch (error) {
      console.error('Error loading daily tasks:', error);
      set({ isLoading: false });
    }
  },
  
  loadTemplates: async (parentId) => {
    try {
      const templates = await getTaskTemplates(parentId);
      set({ templates });
    } catch (error) {
      console.error('Error loading templates:', error);
    }
  },
  
  setTasks: async (childId, parentId, tasks, date) => {
    set({ isLoading: true });
    try {
      const targetDate = date || get().selectedDate;
      const taskList = await setDailyTasks(childId, parentId, tasks, targetDate);
      set({ taskList, isLoading: false });
    } catch (error) {
      console.error('Error setting tasks:', error);
      set({ isLoading: false });
      throw error;
    }
  },
  
  addTask: async (childId, parentId, task, date) => {
    set({ isLoading: true });
    try {
      const targetDate = date || get().selectedDate;
      const taskList = await addDailyTask(childId, parentId, task, targetDate);
      set({ taskList, isLoading: false });
    } catch (error) {
      console.error('Error adding task:', error);
      set({ isLoading: false });
      throw error;
    }
  },
  
  removeTask: async (childId, parentId, taskId, date) => {
    set({ isLoading: true });
    try {
      const targetDate = date || get().selectedDate;
      const taskList = await removeDailyTask(childId, parentId, taskId, targetDate);
      set({ taskList, isLoading: false });
    } catch (error) {
      console.error('Error removing task:', error);
      set({ isLoading: false });
      throw error;
    }
  },
  
  updateTask: async (childId, parentId, taskId, updates, date) => {
    set({ isLoading: true });
    try {
      const targetDate = date || get().selectedDate;
      const taskList = await updateDailyTask(childId, parentId, taskId, updates, targetDate);
      set({ taskList, isLoading: false });
    } catch (error) {
      console.error('Error updating task:', error);
      set({ isLoading: false });
      throw error;
    }
  },
  
  reorderTasks: async (childId, parentId, tasks, date) => {
    // Just update with new order
    const tasksWithOrder = tasks.map((t, i) => ({ ...t, order: i }));
    await get().setTasks(childId, parentId, tasksWithOrder, date);
  },
  
  completeTask: async (childId, taskId, date) => {
    const targetDate = date || get().selectedDate;
    const isToday = targetDate === getLocalDateString();
    
    try {
      const result = await completeDailyTask(childId, taskId, targetDate);
      
      if (!result) {
        return { success: false, allComplete: false };
      }
      
      set({ taskList: result.taskList });
      
      // Only update stars and counts for today's tasks
      if (isToday) {
        // Add stars to child
        await addStars(childId, result.starsEarned);
        await incrementTaskCount(childId);
        
        // Update streak if all tasks complete
        if (result.taskList.allTasksCompleted) {
          await updateStreak(childId);
        }
        
        // Refresh child data in the child store
        const { selectedChild, selectChild } = useChildStore.getState();
        if (selectedChild && selectedChild.id === childId) {
          selectChild({
            ...selectedChild,
            totalStars: selectedChild.totalStars + result.starsEarned,
            totalTasksCompleted: selectedChild.totalTasksCompleted + 1,
          });
        }
      }
      
      return { 
        success: true, 
        allComplete: result.taskList.allTasksCompleted 
      };
    } catch (error) {
      console.error('Error completing task:', error);
      return { success: false, allComplete: false };
    }
  },
  
  uncompleteTask: async (childId, taskId, date) => {
    const targetDate = date || get().selectedDate;
    const isToday = targetDate === getLocalDateString();
    
    try {
      const result = await uncompleteDailyTask(childId, taskId, targetDate);
      
      if (!result) {
        return false;
      }
      
      set({ taskList: result.taskList });
      
      // Only update stars and counts for today's tasks
      if (isToday) {
        await removeStars(childId, result.starsRemoved);
        await decrementTaskCount(childId);
        
        // Refresh child data
        const { selectedChild, selectChild } = useChildStore.getState();
        if (selectedChild && selectedChild.id === childId) {
          selectChild({
            ...selectedChild,
            totalStars: Math.max(0, selectedChild.totalStars - result.starsRemoved),
            totalTasksCompleted: Math.max(0, selectedChild.totalTasksCompleted - 1),
          });
        }
      }
      
      return true;
    } catch (error) {
      console.error('Error uncompleting task:', error);
      return false;
    }
  },
  
  copyFromPreviousDay: async (childId, parentId, date) => {
    const targetDate = date || get().selectedDate;
    const previousDate = new Date(targetDate + 'T12:00:00');
    previousDate.setDate(previousDate.getDate() - 1);
    const fromDate = getLocalDateString(previousDate);
    
    try {
      const taskList = await copyDailyTasks(childId, parentId, fromDate, targetDate);
      if (taskList) {
        set({ taskList });
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error copying tasks:', error);
      return false;
    }
  },
  
  createTemplate: async (parentId, template) => {
    try {
      const newTemplate = await addTaskTemplate(parentId, template);
      set({ templates: [...get().templates, newTemplate] });
    } catch (error) {
      console.error('Error creating template:', error);
      throw error;
    }
  },
  
  updateTemplate: async (templateId, updates) => {
    try {
      await updateTaskTemplate(templateId, updates);
      set({
        templates: get().templates.map(t => 
          t.id === templateId ? { ...t, ...updates } : t
        ),
      });
    } catch (error) {
      console.error('Error updating template:', error);
      throw error;
    }
  },
  
  deleteTemplate: async (templateId) => {
    try {
      await deleteTaskTemplate(templateId);
      set({ templates: get().templates.filter(t => t.id !== templateId) });
    } catch (error) {
      console.error('Error deleting template:', error);
      throw error;
    }
  },
  
  // Apply a template - adds ALL tasks from the template to the day
  applyTemplate: async (childId, parentId, template, date) => {
    const targetDate = date || get().selectedDate;
    
    try {
      // Get existing tasks
      const existing = await getDailyTasks(childId, targetDate);
      const existingTasks = existing?.tasks || [];
      
      // Strip completion status from existing tasks (setDailyTasks will preserve it by ID)
      const existingTasksClean = existingTasks.map(t => ({
        id: t.id,
        name: t.name,
        icon: t.icon,
        stars: t.stars,
        category: t.category,
        order: t.order,
      }));
      
      // Create new tasks from template with unique IDs
      const timestamp = Date.now();
      const newTasks = template.tasks.map((t, index) => ({
        id: `task_${timestamp}_${index}_${Math.random().toString(36).substr(2, 9)}`,
        name: t.name,
        icon: t.icon,
        stars: t.stars,
        category: t.category,
        order: existingTasksClean.length + index,
      }));
      
      // Combine existing + new tasks
      const allTasks = [...existingTasksClean, ...newTasks];
      
      const taskList = await setDailyTasks(childId, parentId, allTasks, targetDate);
      set({ taskList });
      
      // Increment template usage (non-blocking, don't fail if this errors)
      if (template.id) {
        try {
          await incrementTemplateUsage(template.id);
          set({
            templates: get().templates.map(t => 
              t.id === template.id ? { ...t, usageCount: (t.usageCount || 0) + 1 } : t
            ),
          });
        } catch (usageError) {
          console.warn('Could not increment template usage:', usageError);
          // Don't throw - the tasks were still added successfully
        }
      }
    } catch (error) {
      console.error('Error applying template:', error);
      throw error;
    }
  },
}));

