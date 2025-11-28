import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { 
  getAuth, 
  initializeAuth,
  getReactNativePersistence,
  Auth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  User,
} from 'firebase/auth';
import {
  getFirestore,
  Firestore,
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  Timestamp,
  serverTimestamp,
} from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Child, Routine, DailyProgress, Task, DailyTask, DailyTaskList, TaskTemplate, TemplateTask } from './types';
import { DEFAULT_AVATAR } from '../constants/avatars';

// Helper to get local date string (not UTC!)
const getLocalDateString = (date: Date = new Date()): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// Get yesterday's local date
const getYesterdayDateString = (): string => {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  return getLocalDateString(yesterday);
};

// Firebase configuration - Replace with your own config
const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY || "YOUR_API_KEY",
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN || "YOUR_AUTH_DOMAIN",
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID || "YOUR_PROJECT_ID",
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET || "YOUR_STORAGE_BUCKET",
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "YOUR_MESSAGING_SENDER_ID",
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID || "YOUR_APP_ID",
};

// Initialize Firebase
let app: FirebaseApp;
let auth: Auth;
let db: Firestore;

if (getApps().length === 0) {
  app = initializeApp(firebaseConfig);
  
  // Initialize Auth with AsyncStorage persistence for React Native
  auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage),
  });
  db = getFirestore(app);
} else {
  app = getApps()[0];
  auth = getAuth(app);
  db = getFirestore(app);
}

export { app, auth, db };

// Auth functions
export const signUp = async (email: string, password: string) => {
  const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  const user = userCredential.user;
  
  // Create user document
  await setDoc(doc(db, 'users', user.uid), {
    email: user.email,
    createdAt: serverTimestamp(),
  });
  
  return user;
};

export const signIn = async (email: string, password: string) => {
  const userCredential = await signInWithEmailAndPassword(auth, email, password);
  return userCredential.user;
};

export const signOut = async () => {
  await firebaseSignOut(auth);
};

export const onAuthChange = (callback: (user: User | null) => void) => {
  return onAuthStateChanged(auth, callback);
};

// Children functions
export const addChild = async (parentId: string, name: string): Promise<Child> => {
  const childRef = doc(collection(db, 'children'));
  const child: Omit<Child, 'createdAt'> & { createdAt: ReturnType<typeof serverTimestamp> } = {
    id: childRef.id,
    parentId,
    name,
    avatar: DEFAULT_AVATAR,
    totalStars: 0,
    currentStreak: 0,
    longestStreak: 0,
    unlockedItems: ['bear', 'bunny', 'cat', 'dog', 'rainbow', 'stars'],
    badges: [],
    totalTasksCompleted: 0,
    totalRoutinesCompleted: 0,
    createdAt: serverTimestamp(),
  };
  
  await setDoc(childRef, child);
  return { ...child, createdAt: new Date() } as Child;
};

export const getChildren = async (parentId: string): Promise<Child[]> => {
  const q = query(
    collection(db, 'children'),
    where('parentId', '==', parentId),
    orderBy('createdAt', 'asc')
  );
  
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => {
    const data = doc.data();
    return {
      ...data,
      id: doc.id,
      createdAt: data.createdAt?.toDate() || new Date(),
    } as Child;
  });
};

export const updateChild = async (childId: string, data: Partial<Child>) => {
  const childRef = doc(db, 'children', childId);
  await updateDoc(childRef, data as Record<string, unknown>);
};

export const deleteChild = async (childId: string) => {
  await deleteDoc(doc(db, 'children', childId));
};

// Routine functions
export const addRoutine = async (parentId: string, routine: Omit<Routine, 'id' | 'parentId' | 'createdAt'>): Promise<Routine> => {
  const routineRef = doc(collection(db, 'routines'));
  const newRoutine: Omit<Routine, 'createdAt'> & { createdAt: ReturnType<typeof serverTimestamp> } = {
    id: routineRef.id,
    parentId,
    ...routine,
    createdAt: serverTimestamp(),
  };
  
  await setDoc(routineRef, newRoutine);
  return { ...newRoutine, createdAt: new Date() } as Routine;
};

export const getRoutines = async (parentId: string): Promise<Routine[]> => {
  const q = query(
    collection(db, 'routines'),
    where('parentId', '==', parentId),
    orderBy('createdAt', 'asc')
  );
  
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => {
    const data = doc.data();
    return {
      ...data,
      id: doc.id,
      createdAt: data.createdAt?.toDate() || new Date(),
    } as Routine;
  });
};

export const updateRoutine = async (routineId: string, data: Partial<Routine>) => {
  const routineRef = doc(db, 'routines', routineId);
  await updateDoc(routineRef, data as Record<string, unknown>);
};

export const deleteRoutine = async (routineId: string) => {
  await deleteDoc(doc(db, 'routines', routineId));
};

// Daily Progress functions
export const getProgressForDate = async (childId: string, date?: string): Promise<DailyProgress | null> => {
  const targetDate = date || getLocalDateString();
  const progressRef = doc(db, 'progress', `${childId}_${targetDate}`);
  const snapshot = await getDoc(progressRef);
  
  if (snapshot.exists()) {
    const data = snapshot.data();
    return {
      ...data,
      id: snapshot.id,
      completedTasks: data.completedTasks?.map((t: { taskId: string; routineId: string; completedAt: Timestamp; starsEarned: number }) => ({
        ...t,
        completedAt: t.completedAt?.toDate() || new Date(),
      })) || [],
    } as DailyProgress;
  }
  
  return null;
};

// Alias for backwards compatibility
export const getTodayProgress = (childId: string) => getProgressForDate(childId);

export const completeTask = async (
  childId: string,
  taskId: string,
  routineId: string,
  starsEarned: number,
  date?: string
): Promise<DailyProgress> => {
  const targetDate = date || getLocalDateString();
  const progressRef = doc(db, 'progress', `${childId}_${targetDate}`);
  
  const existingProgress = await getProgressForDate(childId, targetDate);
  
  const completedTask = {
    taskId,
    routineId,
    completedAt: Timestamp.now(),
    starsEarned,
  };
  
  if (existingProgress) {
    const updatedTasks = [...existingProgress.completedTasks, { ...completedTask, completedAt: new Date() }];
    await updateDoc(progressRef, {
      completedTasks: [...(existingProgress.completedTasks.map(t => ({
        ...t,
        completedAt: Timestamp.fromDate(t.completedAt),
      }))), completedTask],
    });
    
    return {
      ...existingProgress,
      completedTasks: updatedTasks,
    };
  } else {
    const newProgress = {
      id: `${childId}_${targetDate}`,
      childId,
      date: targetDate,
      completedTasks: [completedTask],
      routinesCompleted: [],
    };
    
    await setDoc(progressRef, newProgress);
    
    return {
      ...newProgress,
      completedTasks: [{ ...completedTask, completedAt: new Date() }],
    };
  }
};

export const uncompleteTask = async (
  childId: string,
  taskId: string,
  routineId: string,
  starsToRemove: number,
  date?: string
): Promise<DailyProgress | null> => {
  const targetDate = date || getLocalDateString();
  const progressRef = doc(db, 'progress', `${childId}_${targetDate}`);
  
  const existingProgress = await getProgressForDate(childId, targetDate);
  
  if (!existingProgress) {
    return null;
  }
  
  // Remove the task from completedTasks
  const updatedTasks = existingProgress.completedTasks.filter(
    t => !(t.taskId === taskId && t.routineId === routineId)
  );
  
  await updateDoc(progressRef, {
    completedTasks: updatedTasks.map(t => ({
      ...t,
      completedAt: Timestamp.fromDate(t.completedAt),
    })),
  });
  
  return {
    ...existingProgress,
    completedTasks: updatedTasks,
  };
};

export const completeRoutine = async (childId: string, routineId: string, date?: string) => {
  const targetDate = date || getLocalDateString();
  const progressRef = doc(db, 'progress', `${childId}_${targetDate}`);
  
  const existingProgress = await getProgressForDate(childId, targetDate);
  
  if (existingProgress) {
    const routinesCompleted = [...existingProgress.routinesCompleted, routineId];
    await updateDoc(progressRef, { routinesCompleted });
  }
};

// Streak calculation
export const updateStreak = async (childId: string): Promise<{ currentStreak: number; longestStreak: number }> => {
  const childRef = doc(db, 'children', childId);
  const childSnap = await getDoc(childRef);
  
  if (!childSnap.exists()) {
    return { currentStreak: 0, longestStreak: 0 };
  }
  
  const childData = childSnap.data() as Child;
  const today = getLocalDateString();
  const yesterday = getYesterdayDateString();
  
  let currentStreak = childData.currentStreak || 0;
  let longestStreak = childData.longestStreak || 0;
  
  if (childData.lastCompletedDate === today) {
    // Already updated today
    return { currentStreak, longestStreak };
  }
  
  if (childData.lastCompletedDate === yesterday) {
    // Continuing streak
    currentStreak += 1;
  } else if (childData.lastCompletedDate !== today) {
    // Streak broken or first day
    currentStreak = 1;
  }
  
  longestStreak = Math.max(longestStreak, currentStreak);
  
  await updateDoc(childRef, {
    currentStreak,
    longestStreak,
    lastCompletedDate: today,
  });
  
  return { currentStreak, longestStreak };
};

// Add stars to child
export const addStars = async (childId: string, stars: number): Promise<number> => {
  const childRef = doc(db, 'children', childId);
  const childSnap = await getDoc(childRef);
  
  if (!childSnap.exists()) {
    return 0;
  }
  
  const currentStars = childSnap.data().totalStars || 0;
  const newTotal = currentStars + stars;
  
  await updateDoc(childRef, { totalStars: newTotal });
  
  return newTotal;
};

// Remove stars from child (for undo)
export const removeStars = async (childId: string, stars: number): Promise<number> => {
  const childRef = doc(db, 'children', childId);
  const childSnap = await getDoc(childRef);
  
  if (!childSnap.exists()) {
    return 0;
  }
  
  const currentStars = childSnap.data().totalStars || 0;
  const newTotal = Math.max(0, currentStars - stars); // Don't go below 0
  
  await updateDoc(childRef, { totalStars: newTotal });
  
  return newTotal;
};

// Decrement task count (for undo)
export const decrementTaskCount = async (childId: string) => {
  const childRef = doc(db, 'children', childId);
  const childSnap = await getDoc(childRef);
  
  if (childSnap.exists()) {
    const current = childSnap.data().totalTasksCompleted || 0;
    await updateDoc(childRef, { totalTasksCompleted: Math.max(0, current - 1) });
  }
};

// Increment task/routine counters
export const incrementTaskCount = async (childId: string) => {
  const childRef = doc(db, 'children', childId);
  const childSnap = await getDoc(childRef);
  
  if (childSnap.exists()) {
    const current = childSnap.data().totalTasksCompleted || 0;
    await updateDoc(childRef, { totalTasksCompleted: current + 1 });
  }
};

export const incrementRoutineCount = async (childId: string) => {
  const childRef = doc(db, 'children', childId);
  const childSnap = await getDoc(childRef);
  
  if (childSnap.exists()) {
    const current = childSnap.data().totalRoutinesCompleted || 0;
    await updateDoc(childRef, { totalRoutinesCompleted: current + 1 });
  }
};

// Unlock avatar item
export const unlockItem = async (childId: string, itemId: string, cost: number): Promise<boolean> => {
  const childRef = doc(db, 'children', childId);
  const childSnap = await getDoc(childRef);
  
  if (!childSnap.exists()) {
    return false;
  }
  
  const childData = childSnap.data() as Child;
  
  if (childData.totalStars < cost) {
    return false;
  }
  
  if (childData.unlockedItems.includes(itemId)) {
    return true;
  }
  
  await updateDoc(childRef, {
    totalStars: childData.totalStars - cost,
    unlockedItems: [...childData.unlockedItems, itemId],
  });
  
  return true;
};

// Add badge
export const addBadge = async (childId: string, badgeId: string) => {
  const childRef = doc(db, 'children', childId);
  const childSnap = await getDoc(childRef);
  
  if (childSnap.exists()) {
    const badges = childSnap.data().badges || [];
    if (!badges.includes(badgeId)) {
      await updateDoc(childRef, { badges: [...badges, badgeId] });
    }
  }
};

// ============ DAILY TASKS SYSTEM (NEW FLEXIBLE SYSTEM) ============

// Get daily tasks for a child on a specific date
export const getDailyTasks = async (childId: string, date?: string): Promise<DailyTaskList | null> => {
  const targetDate = date || getLocalDateString();
  const tasksRef = doc(db, 'dailyTasks', `${childId}_${targetDate}`);
  const snapshot = await getDoc(tasksRef);
  
  if (snapshot.exists()) {
    const data = snapshot.data();
    return {
      ...data,
      id: snapshot.id,
      tasks: data.tasks?.map((t: DailyTask & { completedAt?: { toDate: () => Date } }) => ({
        ...t,
        completedAt: t.completedAt?.toDate?.() || t.completedAt,
      })) || [],
      createdAt: data.createdAt?.toDate() || new Date(),
      updatedAt: data.updatedAt?.toDate() || new Date(),
    } as DailyTaskList;
  }
  
  return null;
};

// Create or update daily tasks for a child
export const setDailyTasks = async (
  childId: string,
  parentId: string,
  tasks: Omit<DailyTask, 'completed' | 'completedAt'>[],
  date?: string
): Promise<DailyTaskList> => {
  const targetDate = date || getLocalDateString();
  const tasksRef = doc(db, 'dailyTasks', `${childId}_${targetDate}`);
  
  // Check if tasks already exist for this day (to preserve completion status)
  const existing = await getDailyTasks(childId, targetDate);
  
  let finalTasks: DailyTask[];
  
  if (existing) {
    // Merge new tasks with existing completion status
    const existingTaskMap = new Map(existing.tasks.map(t => [t.id, t]));
    finalTasks = tasks.map((newTask, index) => {
      const existingTask = existingTaskMap.get(newTask.id);
      return {
        ...newTask,
        order: index,
        completed: existingTask?.completed || false,
        completedAt: existingTask?.completedAt || null,  // Firebase doesn't accept undefined
      };
    });
  } else {
    finalTasks = tasks.map((t, index) => ({
      ...t,
      order: index,
      completed: false,
      completedAt: null,  // Firebase doesn't accept undefined
    }));
  }
  
  const totalStarsAvailable = finalTasks.reduce((sum, t) => sum + t.stars, 0);
  const totalStarsEarned = finalTasks.filter(t => t.completed).reduce((sum, t) => sum + t.stars, 0);
  const allTasksCompleted = finalTasks.length > 0 && finalTasks.every(t => t.completed);
  
  const taskList: Omit<DailyTaskList, 'createdAt' | 'updatedAt'> & { 
    createdAt: ReturnType<typeof serverTimestamp>;
    updatedAt: ReturnType<typeof serverTimestamp>;
  } = {
    id: `${childId}_${targetDate}`,
    childId,
    parentId,
    date: targetDate,
    tasks: finalTasks,
    totalStarsAvailable,
    totalStarsEarned,
    allTasksCompleted,
    createdAt: existing ? Timestamp.fromDate(existing.createdAt) as unknown as ReturnType<typeof serverTimestamp> : serverTimestamp(),
    updatedAt: serverTimestamp(),
  };
  
  await setDoc(tasksRef, taskList);
  
  return {
    ...taskList,
    createdAt: existing?.createdAt || new Date(),
    updatedAt: new Date(),
  } as DailyTaskList;
};

// Add a single task to a day
export const addDailyTask = async (
  childId: string,
  parentId: string,
  task: Omit<DailyTask, 'id' | 'completed' | 'completedAt' | 'order'>,
  date?: string
): Promise<DailyTaskList> => {
  const targetDate = date || getLocalDateString();
  const existing = await getDailyTasks(childId, targetDate);
  
  const newTask: DailyTask = {
    ...task,
    id: `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    completed: false,
    order: existing?.tasks.length || 0,
  };
  
  const tasks = existing ? [...existing.tasks, newTask] : [newTask];
  
  return setDailyTasks(childId, parentId, tasks, targetDate);
};

// Remove a task from a day
export const removeDailyTask = async (
  childId: string,
  parentId: string,
  taskId: string,
  date?: string
): Promise<DailyTaskList | null> => {
  const targetDate = date || getLocalDateString();
  const existing = await getDailyTasks(childId, targetDate);
  
  if (!existing) return null;
  
  const tasks = existing.tasks.filter(t => t.id !== taskId);
  return setDailyTasks(childId, parentId, tasks, targetDate);
};

// Update a specific task (e.g., change stars, name)
export const updateDailyTask = async (
  childId: string,
  parentId: string,
  taskId: string,
  updates: Partial<Omit<DailyTask, 'id' | 'completed' | 'completedAt'>>,
  date?: string
): Promise<DailyTaskList | null> => {
  const targetDate = date || getLocalDateString();
  const existing = await getDailyTasks(childId, targetDate);
  
  if (!existing) return null;
  
  const tasks = existing.tasks.map(t => 
    t.id === taskId ? { ...t, ...updates } : t
  );
  
  return setDailyTasks(childId, parentId, tasks, targetDate);
};

// Complete a daily task
export const completeDailyTask = async (
  childId: string,
  taskId: string,
  date?: string
): Promise<{ taskList: DailyTaskList; starsEarned: number } | null> => {
  const targetDate = date || getLocalDateString();
  const tasksRef = doc(db, 'dailyTasks', `${childId}_${targetDate}`);
  const existing = await getDailyTasks(childId, targetDate);
  
  if (!existing) return null;
  
  const taskIndex = existing.tasks.findIndex(t => t.id === taskId);
  if (taskIndex === -1) return null;
  
  const task = existing.tasks[taskIndex];
  if (task.completed) return null; // Already completed
  
  const starsEarned = task.stars;
  
  // Update task
  const updatedTasks = existing.tasks.map(t => 
    t.id === taskId 
      ? { ...t, completed: true, completedAt: new Date() }
      : t
  );
  
  const totalStarsEarned = updatedTasks.filter(t => t.completed).reduce((sum, t) => sum + t.stars, 0);
  const allTasksCompleted = updatedTasks.every(t => t.completed);
  
  await updateDoc(tasksRef, {
    tasks: updatedTasks.map(t => ({
      ...t,
      completedAt: t.completedAt ? Timestamp.fromDate(new Date(t.completedAt)) : null,
    })),
    totalStarsEarned,
    allTasksCompleted,
    updatedAt: serverTimestamp(),
  });
  
  return {
    taskList: {
      ...existing,
      tasks: updatedTasks,
      totalStarsEarned,
      allTasksCompleted,
      updatedAt: new Date(),
    },
    starsEarned,
  };
};

// Uncomplete a daily task
export const uncompleteDailyTask = async (
  childId: string,
  taskId: string,
  date?: string
): Promise<{ taskList: DailyTaskList; starsRemoved: number } | null> => {
  const targetDate = date || getLocalDateString();
  const tasksRef = doc(db, 'dailyTasks', `${childId}_${targetDate}`);
  const existing = await getDailyTasks(childId, targetDate);
  
  if (!existing) return null;
  
  const task = existing.tasks.find(t => t.id === taskId);
  if (!task || !task.completed) return null;
  
  const starsRemoved = task.stars;
  
  const updatedTasks = existing.tasks.map(t => 
    t.id === taskId 
      ? { ...t, completed: false, completedAt: undefined }
      : t
  );
  
  const totalStarsEarned = updatedTasks.filter(t => t.completed).reduce((sum, t) => sum + t.stars, 0);
  
  await updateDoc(tasksRef, {
    tasks: updatedTasks.map(t => ({
      ...t,
      completedAt: t.completedAt ? Timestamp.fromDate(new Date(t.completedAt)) : null,
    })),
    totalStarsEarned,
    allTasksCompleted: false,
    updatedAt: serverTimestamp(),
  });
  
  return {
    taskList: {
      ...existing,
      tasks: updatedTasks,
      totalStarsEarned,
      allTasksCompleted: false,
      updatedAt: new Date(),
    },
    starsRemoved,
  };
};

// Copy tasks from one day to another (useful for "copy yesterday's tasks")
export const copyDailyTasks = async (
  childId: string,
  parentId: string,
  fromDate: string,
  toDate: string
): Promise<DailyTaskList | null> => {
  const sourceTasks = await getDailyTasks(childId, fromDate);
  
  if (!sourceTasks || sourceTasks.tasks.length === 0) return null;
  
  // Create fresh tasks (without completion status) with new IDs
  const newTasks = sourceTasks.tasks.map((t, index) => ({
    id: `task_${Date.now()}_${index}_${Math.random().toString(36).substr(2, 9)}`,
    name: t.name,
    icon: t.icon,
    stars: t.stars,
    category: t.category,
    order: index,
  }));
  
  return setDailyTasks(childId, parentId, newTasks, toDate);
};

// ============ TASK TEMPLATES ============

// Get all task templates for a parent
export const getTaskTemplates = async (parentId: string): Promise<TaskTemplate[]> => {
  const q = query(
    collection(db, 'taskTemplates'),
    where('parentId', '==', parentId)
  );
  
  const snapshot = await getDocs(q);
  const templates = snapshot.docs.map(doc => {
    const data = doc.data();
    return {
      ...data,
      id: doc.id,
      createdAt: data.createdAt?.toDate() || new Date(),
    } as TaskTemplate;
  });
  
  // Sort by favorite first, then by usage count
  return templates.sort((a, b) => {
    if (a.isFavorite !== b.isFavorite) return a.isFavorite ? -1 : 1;
    return b.usageCount - a.usageCount;
  });
};

// Add a new task template
export const addTaskTemplate = async (
  parentId: string,
  template: Omit<TaskTemplate, 'id' | 'parentId' | 'usageCount' | 'createdAt'>
): Promise<TaskTemplate> => {
  const templateRef = doc(collection(db, 'taskTemplates'));
  const newTemplate: Omit<TaskTemplate, 'createdAt'> & { createdAt: ReturnType<typeof serverTimestamp> } = {
    id: templateRef.id,
    parentId,
    ...template,
    usageCount: 0,
    createdAt: serverTimestamp(),
  };
  
  await setDoc(templateRef, newTemplate);
  return { ...newTemplate, createdAt: new Date() } as TaskTemplate;
};

// Update a task template
export const updateTaskTemplate = async (templateId: string, data: Partial<TaskTemplate>) => {
  const templateRef = doc(db, 'taskTemplates', templateId);
  await updateDoc(templateRef, data as Record<string, unknown>);
};

// Delete a task template
export const deleteTaskTemplate = async (templateId: string) => {
  await deleteDoc(doc(db, 'taskTemplates', templateId));
};

// Increment template usage count
export const incrementTemplateUsage = async (templateId: string) => {
  const templateRef = doc(db, 'taskTemplates', templateId);
  const snap = await getDoc(templateRef);
  if (snap.exists()) {
    const current = snap.data().usageCount || 0;
    await updateDoc(templateRef, { usageCount: current + 1 });
  }
};

// ============ REWARDS SYSTEM ============

import { Reward, Redemption } from './types';

// Reward functions
export const addReward = async (parentId: string, reward: Omit<Reward, 'id' | 'parentId' | 'createdAt'>): Promise<Reward> => {
  const rewardRef = doc(collection(db, 'rewards'));
  
  // Build reward object, excluding undefined values (Firestore doesn't accept undefined)
  const newReward: Record<string, unknown> = {
    id: rewardRef.id,
    parentId,
    name: reward.name,
    icon: reward.icon,
    starCost: reward.starCost,
    isActive: reward.isActive,
    createdAt: serverTimestamp(),
  };
  
  // Only add description if it has a value
  if (reward.description) {
    newReward.description = reward.description;
  }
  
  await setDoc(rewardRef, newReward);
  return { ...newReward, createdAt: new Date() } as Reward;
};

export const getRewards = async (parentId: string): Promise<Reward[]> => {
  const q = query(
    collection(db, 'rewards'),
    where('parentId', '==', parentId),
    orderBy('starCost', 'asc')
  );
  
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => {
    const data = doc.data();
    return {
      ...data,
      id: doc.id,
      createdAt: data.createdAt?.toDate() || new Date(),
    } as Reward;
  });
};

export const updateReward = async (rewardId: string, data: Partial<Reward>) => {
  const rewardRef = doc(db, 'rewards', rewardId);
  await updateDoc(rewardRef, data as Record<string, unknown>);
};

export const deleteReward = async (rewardId: string) => {
  await deleteDoc(doc(db, 'rewards', rewardId));
};

// Redemption functions
export const redeemReward = async (
  childId: string,
  childName: string,
  reward: Reward
): Promise<Redemption | null> => {
  const childRef = doc(db, 'children', childId);
  const childSnap = await getDoc(childRef);
  
  if (!childSnap.exists()) {
    return null;
  }
  
  const childData = childSnap.data() as Child;
  
  // Check if child has enough stars
  if (childData.totalStars < reward.starCost) {
    return null;
  }
  
  // Deduct stars
  await updateDoc(childRef, {
    totalStars: childData.totalStars - reward.starCost,
  });
  
  // Create redemption record
  const redemptionRef = doc(collection(db, 'redemptions'));
  const redemption: Omit<Redemption, 'redeemedAt'> & { redeemedAt: ReturnType<typeof serverTimestamp> } = {
    id: redemptionRef.id,
    childId,
    childName,
    rewardId: reward.id,
    rewardName: reward.name,
    rewardIcon: reward.icon,
    starCost: reward.starCost,
    status: 'pending',
    redeemedAt: serverTimestamp(),
  };
  
  await setDoc(redemptionRef, redemption);
  
  return { ...redemption, redeemedAt: new Date() } as Redemption;
};

export const getRedemptions = async (parentId: string): Promise<Redemption[]> => {
  // Get all children for this parent
  const childrenQuery = query(
    collection(db, 'children'),
    where('parentId', '==', parentId)
  );
  const childrenSnap = await getDocs(childrenQuery);
  const childIds = childrenSnap.docs.map(doc => doc.id);
  
  if (childIds.length === 0) {
    return [];
  }
  
  // Get redemptions for all children (no orderBy to avoid index requirement)
  // Firestore 'in' queries are limited to 10 items, so we'll handle larger families differently
  const allRedemptions: Redemption[] = [];
  
  // Process in batches of 10 (Firestore limit for 'in' queries)
  for (let i = 0; i < childIds.length; i += 10) {
    const batchIds = childIds.slice(i, i + 10);
    const redemptionsQuery = query(
      collection(db, 'redemptions'),
      where('childId', 'in', batchIds)
    );
    
    const snapshot = await getDocs(redemptionsQuery);
    const batchRedemptions = snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        ...data,
        id: doc.id,
        redeemedAt: data.redeemedAt?.toDate() || new Date(),
        completedAt: data.completedAt?.toDate(),
      } as Redemption;
    });
    
    allRedemptions.push(...batchRedemptions);
  }
  
  // Sort by redeemedAt descending (newest first)
  return allRedemptions.sort((a, b) => 
    new Date(b.redeemedAt).getTime() - new Date(a.redeemedAt).getTime()
  );
};

export const getChildRedemptions = async (childId: string): Promise<Redemption[]> => {
  // Simple query without orderBy to avoid index requirement
  const q = query(
    collection(db, 'redemptions'),
    where('childId', '==', childId)
  );
  
  const snapshot = await getDocs(q);
  const redemptions = snapshot.docs.map(doc => {
    const data = doc.data();
    return {
      ...data,
      id: doc.id,
      redeemedAt: data.redeemedAt?.toDate() || new Date(),
      completedAt: data.completedAt?.toDate(),
    } as Redemption;
  });
  
  // Sort by redeemedAt descending (newest first)
  return redemptions.sort((a, b) => 
    new Date(b.redeemedAt).getTime() - new Date(a.redeemedAt).getTime()
  );
};

export const updateRedemptionStatus = async (
  redemptionId: string, 
  status: Redemption['status'],
  childId?: string
) => {
  const redemptionRef = doc(db, 'redemptions', redemptionId);
  
  const updateData: Record<string, unknown> = { status };
  
  if (status === 'completed') {
    updateData.completedAt = serverTimestamp();
  }
  
  // If rejected, refund the stars
  if (status === 'rejected' && childId) {
    const redemptionSnap = await getDoc(redemptionRef);
    if (redemptionSnap.exists()) {
      const redemption = redemptionSnap.data() as Redemption;
      await addStars(childId, redemption.starCost);
    }
  }
  
  await updateDoc(redemptionRef, updateData);
};

export default { auth, db };
