import { create } from 'zustand';
import { Routine, Task } from '../types';
import {
  getRoutines,
  addRoutine as addRoutineToDb,
  updateRoutine as updateRoutineInDb,
  deleteRoutine as deleteRoutineFromDb,
} from '../firebase';
import { ROUTINE_TEMPLATES, getTaskById, TASK_TEMPLATES } from '../../constants/tasks';

interface RoutineState {
  routines: Routine[];
  isLoading: boolean;
  error: string | null;
  
  // Actions
  loadRoutines: (parentId: string) => Promise<void>;
  addRoutine: (parentId: string, routine: Omit<Routine, 'id' | 'parentId' | 'createdAt'>) => Promise<Routine>;
  updateRoutine: (routineId: string, data: Partial<Routine>) => Promise<void>;
  removeRoutine: (routineId: string) => Promise<void>;
  
  // Create from template
  createFromTemplate: (parentId: string, templateId: string) => Promise<Routine>;
  createDefaultRoutines: (parentId: string) => Promise<void>;
}

export const useRoutineStore = create<RoutineState>((set, get) => ({
  routines: [],
  isLoading: false,
  error: null,
  
  loadRoutines: async (parentId: string) => {
    set({ isLoading: true, error: null });
    try {
      const routines = await getRoutines(parentId);
      set({ routines, isLoading: false });
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
    }
  },
  
  addRoutine: async (parentId: string, routine: Omit<Routine, 'id' | 'parentId' | 'createdAt'>) => {
    set({ isLoading: true, error: null });
    try {
      const newRoutine = await addRoutineToDb(parentId, routine);
      set((state) => ({
        routines: [...state.routines, newRoutine],
        isLoading: false,
      }));
      return newRoutine;
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },
  
  updateRoutine: async (routineId: string, data: Partial<Routine>) => {
    try {
      await updateRoutineInDb(routineId, data);
      set((state) => ({
        routines: state.routines.map((r) =>
          r.id === routineId ? { ...r, ...data } : r
        ),
      }));
    } catch (error: any) {
      set({ error: error.message });
      throw error;
    }
  },
  
  removeRoutine: async (routineId: string) => {
    try {
      await deleteRoutineFromDb(routineId);
      set((state) => ({
        routines: state.routines.filter((r) => r.id !== routineId),
      }));
    } catch (error: any) {
      set({ error: error.message });
      throw error;
    }
  },
  
  createFromTemplate: async (parentId: string, templateId: string) => {
    const template = ROUTINE_TEMPLATES.find((t) => t.id === templateId);
    if (!template) {
      throw new Error('Template not found');
    }
    
    const tasks: Task[] = template.taskIds
      .map((taskId, index) => {
        const taskTemplate = getTaskById(taskId);
        if (!taskTemplate) return null;
        
        return {
          id: `${taskId}-${Date.now()}-${index}`,
          templateId: taskId,
          name: taskTemplate.name,
          icon: taskTemplate.icon,
          stars: taskTemplate.stars,
          order: index,
        };
      })
      .filter((t): t is Task => t !== null);
    
    const routine = await get().addRoutine(parentId, {
      name: template.name,
      icon: template.icon,
      color: template.color,
      tasks,
      isActive: true,
    });
    
    return routine;
  },
  
  createDefaultRoutines: async (parentId: string) => {
    const { routines } = get();
    
    // Only create defaults if no routines exist
    if (routines.length > 0) return;
    
    for (const template of ROUTINE_TEMPLATES) {
      await get().createFromTemplate(parentId, template.id);
    }
  },
}));

export default useRoutineStore;


