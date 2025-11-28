import { create } from 'zustand';
import { Reward, Redemption } from '../types';
import {
  getRewards,
  addReward as addRewardToDb,
  updateReward as updateRewardInDb,
  deleteReward as deleteRewardFromDb,
  redeemReward as redeemRewardInDb,
  getRedemptions,
  getChildRedemptions,
  updateRedemptionStatus as updateRedemptionStatusInDb,
} from '../firebase';

interface RewardState {
  rewards: Reward[];
  redemptions: Redemption[];
  childRedemptions: Redemption[];
  isLoading: boolean;
  error: string | null;
  
  // Reward actions (parent)
  loadRewards: (parentId: string) => Promise<void>;
  addReward: (parentId: string, reward: Omit<Reward, 'id' | 'parentId' | 'createdAt'>) => Promise<Reward>;
  updateReward: (rewardId: string, data: Partial<Reward>) => Promise<void>;
  removeReward: (rewardId: string) => Promise<void>;
  
  // Redemption actions
  loadRedemptions: (parentId: string) => Promise<void>;
  loadChildRedemptions: (childId: string) => Promise<void>;
  redeemReward: (childId: string, childName: string, reward: Reward) => Promise<Redemption | null>;
  updateRedemptionStatus: (redemptionId: string, status: Redemption['status'], childId?: string) => Promise<void>;
}

export const useRewardStore = create<RewardState>((set, get) => ({
  rewards: [],
  redemptions: [],
  childRedemptions: [],
  isLoading: false,
  error: null,
  
  loadRewards: async (parentId: string) => {
    set({ isLoading: true, error: null });
    try {
      const rewards = await getRewards(parentId);
      set({ rewards, isLoading: false });
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
    }
  },
  
  addReward: async (parentId: string, reward: Omit<Reward, 'id' | 'parentId' | 'createdAt'>) => {
    set({ isLoading: true, error: null });
    try {
      const newReward = await addRewardToDb(parentId, reward);
      set((state) => ({
        rewards: [...state.rewards, newReward].sort((a, b) => a.starCost - b.starCost),
        isLoading: false,
      }));
      return newReward;
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },
  
  updateReward: async (rewardId: string, data: Partial<Reward>) => {
    try {
      await updateRewardInDb(rewardId, data);
      set((state) => ({
        rewards: state.rewards.map((r) =>
          r.id === rewardId ? { ...r, ...data } : r
        ).sort((a, b) => a.starCost - b.starCost),
      }));
    } catch (error: any) {
      set({ error: error.message });
      throw error;
    }
  },
  
  removeReward: async (rewardId: string) => {
    try {
      await deleteRewardFromDb(rewardId);
      set((state) => ({
        rewards: state.rewards.filter((r) => r.id !== rewardId),
      }));
    } catch (error: any) {
      set({ error: error.message });
      throw error;
    }
  },
  
  loadRedemptions: async (parentId: string) => {
    set({ isLoading: true, error: null });
    try {
      const redemptions = await getRedemptions(parentId);
      set({ redemptions, isLoading: false });
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
    }
  },
  
  loadChildRedemptions: async (childId: string) => {
    try {
      const childRedemptions = await getChildRedemptions(childId);
      set({ childRedemptions });
    } catch (error: any) {
      set({ error: error.message });
    }
  },
  
  redeemReward: async (childId: string, childName: string, reward: Reward) => {
    set({ isLoading: true, error: null });
    try {
      const redemption = await redeemRewardInDb(childId, childName, reward);
      if (redemption) {
        set((state) => ({
          childRedemptions: [redemption, ...state.childRedemptions],
          isLoading: false,
        }));
      } else {
        set({ isLoading: false });
      }
      return redemption;
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },
  
  updateRedemptionStatus: async (redemptionId: string, status: Redemption['status'], childId?: string) => {
    try {
      await updateRedemptionStatusInDb(redemptionId, status, childId);
      set((state) => ({
        redemptions: state.redemptions.map((r) =>
          r.id === redemptionId 
            ? { ...r, status, completedAt: status === 'completed' ? new Date() : r.completedAt } 
            : r
        ),
        childRedemptions: state.childRedemptions.map((r) =>
          r.id === redemptionId 
            ? { ...r, status, completedAt: status === 'completed' ? new Date() : r.completedAt } 
            : r
        ),
      }));
    } catch (error: any) {
      set({ error: error.message });
      throw error;
    }
  },
}));

export default useRewardStore;


