import { create } from 'zustand';
import { Child, DailyProgress, Celebration } from '../types';
import { AvatarConfig } from '../../constants/avatars';
import {
  getChildren,
  addChild as addChildToDb,
  updateChild as updateChildInDb,
  deleteChild as deleteChildFromDb,
  getProgressForDate,
  completeTask as completeTaskInDb,
  uncompleteTask as uncompleteTaskInDb,
  completeRoutine as completeRoutineInDb,
  addStars,
  removeStars,
  incrementTaskCount,
  decrementTaskCount,
  incrementRoutineCount,
  updateStreak,
  unlockItem as unlockItemInDb,
  addBadge,
} from '../firebase';
import { getEarnableBadges, getBadgeById } from '../../constants/badges';

interface ChildState {
  children: Child[];
  selectedChild: Child | null;
  selectedDate: string; // YYYY-MM-DD format
  todayProgress: DailyProgress | null;
  isLoading: boolean;
  error: string | null;
  celebration: Celebration | null;
  
  // Actions
  loadChildren: (parentId: string) => Promise<void>;
  addChild: (parentId: string, name: string) => Promise<Child>;
  updateChild: (childId: string, data: Partial<Child>) => Promise<void>;
  removeChild: (childId: string) => Promise<void>;
  selectChild: (child: Child | null) => void;
  
  // Date actions
  setSelectedDate: (date: string) => void;
  isToday: () => boolean;
  
  // Progress actions
  loadProgress: (childId: string, date?: string) => Promise<void>;
  completeTask: (taskId: string, routineId: string, stars: number) => Promise<void>;
  uncompleteTask: (taskId: string, routineId: string, stars: number) => Promise<void>;
  markRoutineComplete: (routineId: string) => Promise<void>;
  
  // Avatar actions
  updateAvatar: (avatar: AvatarConfig) => Promise<void>;
  purchaseItem: (itemId: string, cost: number) => Promise<boolean>;
  
  // Celebration
  setCelebration: (celebration: Celebration | null) => void;
  checkForBadges: () => Promise<void>;
}

// Use local timezone for date (not UTC)
const getTodayDateString = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const useChildStore = create<ChildState>((set, get) => ({
  children: [],
  selectedChild: null,
  selectedDate: getTodayDateString(),
  todayProgress: null,
  isLoading: false,
  error: null,
  celebration: null,
  
  loadChildren: async (parentId: string) => {
    set({ isLoading: true, error: null });
    try {
      const children = await getChildren(parentId);
      set({ children, isLoading: false });
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
    }
  },
  
  addChild: async (parentId: string, name: string) => {
    set({ isLoading: true, error: null });
    try {
      const child = await addChildToDb(parentId, name);
      set((state) => ({
        children: [...state.children, child],
        isLoading: false,
      }));
      return child;
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },
  
  updateChild: async (childId: string, data: Partial<Child>) => {
    try {
      await updateChildInDb(childId, data);
      set((state) => ({
        children: state.children.map((c) =>
          c.id === childId ? { ...c, ...data } : c
        ),
        selectedChild:
          state.selectedChild?.id === childId
            ? { ...state.selectedChild, ...data }
            : state.selectedChild,
      }));
    } catch (error: any) {
      set({ error: error.message });
      throw error;
    }
  },
  
  removeChild: async (childId: string) => {
    try {
      await deleteChildFromDb(childId);
      set((state) => ({
        children: state.children.filter((c) => c.id !== childId),
        selectedChild:
          state.selectedChild?.id === childId ? null : state.selectedChild,
      }));
    } catch (error: any) {
      set({ error: error.message });
      throw error;
    }
  },
  
  selectChild: (child: Child | null) => {
    set({ selectedChild: child, todayProgress: null, selectedDate: getTodayDateString() });
  },
  
  setSelectedDate: (date: string) => {
    set({ selectedDate: date });
  },
  
  isToday: () => {
    return get().selectedDate === getTodayDateString();
  },
  
  loadProgress: async (childId: string, date?: string) => {
    const targetDate = date || get().selectedDate;
    try {
      const progress = await getProgressForDate(childId, targetDate);
      set({ todayProgress: progress });
    } catch (error: any) {
      set({ error: error.message });
    }
  },
  
  completeTask: async (taskId: string, routineId: string, stars: number) => {
    const { selectedChild, selectedDate } = get();
    if (!selectedChild) return;
    
    try {
      // Complete the task for the selected date
      const progress = await completeTaskInDb(selectedChild.id, taskId, routineId, stars, selectedDate);
      set({ todayProgress: progress });
      
      // Add stars
      const newStars = await addStars(selectedChild.id, stars);
      
      // Increment task count
      await incrementTaskCount(selectedChild.id);
      
      // Update local state
      set((state) => ({
        selectedChild: state.selectedChild
          ? {
              ...state.selectedChild,
              totalStars: newStars,
              totalTasksCompleted: state.selectedChild.totalTasksCompleted + 1,
            }
          : null,
        children: state.children.map((c) =>
          c.id === selectedChild.id
            ? {
                ...c,
                totalStars: newStars,
                totalTasksCompleted: c.totalTasksCompleted + 1,
              }
            : c
        ),
      }));
      
      // Flying unicorn handles task celebration now!
      // Only show modal celebration for badges (checked below)
      
      // Check for new badges
      setTimeout(() => get().checkForBadges(), 2000);
    } catch (error: any) {
      set({ error: error.message });
      throw error;
    }
  },
  
  uncompleteTask: async (taskId: string, routineId: string, stars: number) => {
    const { selectedChild, selectedDate } = get();
    if (!selectedChild) return;
    
    try {
      // Uncomplete the task for the selected date
      const progress = await uncompleteTaskInDb(selectedChild.id, taskId, routineId, stars, selectedDate);
      if (progress) {
        set({ todayProgress: progress });
      }
      
      // Remove stars
      const newStars = await removeStars(selectedChild.id, stars);
      
      // Decrement task count
      await decrementTaskCount(selectedChild.id);
      
      // Update local state
      set((state) => ({
        selectedChild: state.selectedChild
          ? {
              ...state.selectedChild,
              totalStars: newStars,
              totalTasksCompleted: Math.max(0, state.selectedChild.totalTasksCompleted - 1),
            }
          : null,
        children: state.children.map((c) =>
          c.id === selectedChild.id
            ? {
                ...c,
                totalStars: newStars,
                totalTasksCompleted: Math.max(0, c.totalTasksCompleted - 1),
              }
            : c
        ),
      }));
    } catch (error: any) {
      set({ error: error.message });
      throw error;
    }
  },
  
  markRoutineComplete: async (routineId: string) => {
    const { selectedChild, selectedDate } = get();
    if (!selectedChild) return;
    
    try {
      await completeRoutineInDb(selectedChild.id, routineId, selectedDate);
      await incrementRoutineCount(selectedChild.id);
      
      // Update streak
      const { currentStreak, longestStreak } = await updateStreak(selectedChild.id);
      
      // Update local state
      set((state) => ({
        selectedChild: state.selectedChild
          ? {
              ...state.selectedChild,
              currentStreak,
              longestStreak,
              totalRoutinesCompleted: state.selectedChild.totalRoutinesCompleted + 1,
            }
          : null,
        children: state.children.map((c) =>
          c.id === selectedChild.id
            ? {
                ...c,
                currentStreak,
                longestStreak,
                totalRoutinesCompleted: c.totalRoutinesCompleted + 1,
              }
            : c
        ),
        todayProgress: state.todayProgress
          ? {
              ...state.todayProgress,
              routinesCompleted: [...state.todayProgress.routinesCompleted, routineId],
            }
          : null,
      }));
      
      // Show routine completion celebration
      set({
        celebration: {
          type: 'routine',
          title: 'Routine Complete!',
          subtitle: `${currentStreak} day streak! Keep it up!`,
          streak: currentStreak,
        },
      });
    } catch (error: any) {
      set({ error: error.message });
      throw error;
    }
  },
  
  updateAvatar: async (avatar: AvatarConfig) => {
    const { selectedChild } = get();
    if (!selectedChild) return;
    
    try {
      await updateChildInDb(selectedChild.id, { avatar });
      set((state) => ({
        selectedChild: state.selectedChild
          ? { ...state.selectedChild, avatar }
          : null,
        children: state.children.map((c) =>
          c.id === selectedChild.id ? { ...c, avatar } : c
        ),
      }));
    } catch (error: any) {
      set({ error: error.message });
      throw error;
    }
  },
  
  purchaseItem: async (itemId: string, cost: number) => {
    const { selectedChild } = get();
    if (!selectedChild) return false;
    
    try {
      const success = await unlockItemInDb(selectedChild.id, itemId, cost);
      
      if (success) {
        set((state) => ({
          selectedChild: state.selectedChild
            ? {
                ...state.selectedChild,
                totalStars: state.selectedChild.totalStars - cost,
                unlockedItems: [...state.selectedChild.unlockedItems, itemId],
              }
            : null,
          children: state.children.map((c) =>
            c.id === selectedChild.id
              ? {
                  ...c,
                  totalStars: c.totalStars - cost,
                  unlockedItems: [...c.unlockedItems, itemId],
                }
              : c
          ),
        }));
      }
      
      return success;
    } catch (error: any) {
      set({ error: error.message });
      return false;
    }
  },
  
  setCelebration: (celebration: Celebration | null) => {
    set({ celebration });
  },
  
  checkForBadges: async () => {
    const { selectedChild } = get();
    if (!selectedChild) return;
    
    const stats = {
      totalStars: selectedChild.totalStars,
      currentStreak: selectedChild.currentStreak,
      totalTasks: selectedChild.totalTasksCompleted,
      totalRoutines: selectedChild.totalRoutinesCompleted,
    };
    
    const newBadges = getEarnableBadges(stats, selectedChild.badges);
    
    if (newBadges.length > 0) {
      const firstBadge = newBadges[0];
      
      // Add badge to database
      await addBadge(selectedChild.id, firstBadge.id);
      
      // Update local state
      set((state) => ({
        selectedChild: state.selectedChild
          ? {
              ...state.selectedChild,
              badges: [...state.selectedChild.badges, firstBadge.id],
            }
          : null,
        children: state.children.map((c) =>
          c.id === selectedChild.id
            ? { ...c, badges: [...c.badges, firstBadge.id] }
            : c
        ),
        celebration: {
          type: 'badge',
          title: 'New Badge!',
          subtitle: firstBadge.description,
          badge: {
            id: firstBadge.id,
            name: firstBadge.name,
            icon: firstBadge.icon,
          },
        },
      }));
    }
  },
}));

export default useChildStore;

