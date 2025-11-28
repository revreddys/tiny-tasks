import { AvatarConfig } from '../constants/avatars';

export interface User {
  id: string;
  email: string;
  displayName?: string;
  createdAt: Date;
}

export interface Child {
  id: string;
  parentId: string;
  name: string;
  avatar: AvatarConfig;
  totalStars: number;
  currentStreak: number;
  longestStreak: number;
  lastCompletedDate?: string; // YYYY-MM-DD format
  unlockedItems: string[];
  badges: string[];
  totalTasksCompleted: number;
  totalRoutinesCompleted: number;
  createdAt: Date;
}

// ============ NEW FLEXIBLE DAILY TASK SYSTEM ============

// A single task for a specific day
export interface DailyTask {
  id: string;
  name: string;
  icon: string;
  stars: number;           // Points for this task (customizable per day)
  category?: string;       // Optional: morning, afternoon, evening, anytime
  completed: boolean;
  completedAt?: Date;
  order: number;
}

// The daily task list for a child
export interface DailyTaskList {
  id: string;              // Format: childId_YYYY-MM-DD
  childId: string;
  parentId: string;
  date: string;            // YYYY-MM-DD format
  tasks: DailyTask[];
  totalStarsAvailable: number;
  totalStarsEarned: number;
  allTasksCompleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// A task within a template
export interface TemplateTask {
  id: string;
  name: string;
  icon: string;
  stars: number;
  category?: string;
  order: number;
}

// Task template - a COLLECTION of tasks (e.g., "Morning Routine", "Bedtime")
export interface TaskTemplate {
  id: string;
  parentId: string;
  name: string;              // e.g., "Morning Routine", "Bedtime", "Homework Time"
  icon: string;              // Template icon
  color: string;             // Template color
  tasks: TemplateTask[];     // The tasks in this template
  isFavorite: boolean;       // Show at top of list
  usageCount: number;        // Track how often used
  createdAt: Date;
}

// Category definitions
export type TaskCategory = 'morning' | 'afternoon' | 'evening' | 'anytime';

export const TASK_CATEGORIES: { id: TaskCategory; name: string; icon: string; color: string }[] = [
  { id: 'morning', name: 'Morning', icon: '🌅', color: '#FFB347' },
  { id: 'afternoon', name: 'Afternoon', icon: '☀️', color: '#87CEEB' },
  { id: 'evening', name: 'Evening', icon: '🌙', color: '#9B59B6' },
  { id: 'anytime', name: 'Anytime', icon: '⭐', color: '#4ECDC4' },
];

// ============ LEGACY TYPES (keeping for backwards compatibility) ============

export interface Task {
  id: string;
  templateId: string;
  name: string;
  icon: string;
  stars: number;
  order: number;
}

export interface Routine {
  id: string;
  parentId: string;
  name: string;
  icon: string;
  color: string;
  tasks: Task[];
  isActive: boolean;
  createdAt: Date;
}

export interface DailyProgress {
  id: string;
  childId: string;
  date: string; // YYYY-MM-DD format
  completedTasks: CompletedTask[];
  routinesCompleted: string[]; // routine IDs
}

export interface CompletedTask {
  taskId: string;
  routineId: string;
  completedAt: Date;
  starsEarned: number;
}

export interface GameStats {
  totalStars: number;
  currentStreak: number;
  longestStreak: number;
  totalTasks: number;
  totalRoutines: number;
}

// For the routine screen
export interface RoutineWithProgress extends Routine {
  completedTaskIds: string[];
  totalStars: number;
  earnedStars: number;
}

// For celebration modals
export interface Celebration {
  type: 'task' | 'routine' | 'badge' | 'streak' | 'redemption';
  title: string;
  subtitle?: string;
  stars?: number;
  badge?: {
    id: string;
    name: string;
    icon: string;
  };
  streak?: number;
  reward?: {
    name: string;
    icon: string;
  };
}

// Reward system types
export interface Reward {
  id: string;
  parentId: string;
  name: string;
  description?: string;
  icon: string;
  starCost: number;
  isActive: boolean;
  createdAt: Date;
}

export interface Redemption {
  id: string;
  childId: string;
  childName: string;
  rewardId: string;
  rewardName: string;
  rewardIcon: string;
  starCost: number;
  status: 'pending' | 'approved' | 'rejected' | 'completed';
  redeemedAt: Date;
  completedAt?: Date;
}
