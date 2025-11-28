import { create } from 'zustand';
import { User } from 'firebase/auth';
import { onAuthChange, signIn, signUp, signOut } from '../firebase';

interface AuthState {
  user: User | null;
  isLoading: boolean;
  isInitialized: boolean;
  error: string | null;
  
  // Actions
  initialize: () => void;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoading: false,
  isInitialized: false,
  error: null,
  
  initialize: () => {
    const unsubscribe = onAuthChange((user) => {
      set({ user, isInitialized: true, isLoading: false });
    });
    
    // Return unsubscribe for cleanup
    return unsubscribe;
  },
  
  login: async (email: string, password: string) => {
    set({ isLoading: true, error: null });
    try {
      await signIn(email, password);
    } catch (error: any) {
      set({ error: error.message || 'Failed to sign in', isLoading: false });
      throw error;
    }
  },
  
  register: async (email: string, password: string) => {
    set({ isLoading: true, error: null });
    try {
      await signUp(email, password);
    } catch (error: any) {
      set({ error: error.message || 'Failed to create account', isLoading: false });
      throw error;
    }
  },
  
  logout: async () => {
    set({ isLoading: true, error: null });
    try {
      await signOut();
      set({ user: null, isLoading: false });
    } catch (error: any) {
      set({ error: error.message || 'Failed to sign out', isLoading: false });
      throw error;
    }
  },
  
  clearError: () => set({ error: null }),
}));

export default useAuthStore;


