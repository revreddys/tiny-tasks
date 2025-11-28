import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Crypto from 'expo-crypto';

const PASSCODES_KEY = 'profile_passcodes_v2'; // v2 for hashed version
const LEGACY_PASSCODES_KEY = 'profile_passcodes'; // old plaintext version

interface PasscodeData {
  [profileId: string]: string; // profileId -> hashed PIN
}

interface PasscodeState {
  passcodes: PasscodeData;
  isLoading: boolean;
  
  // Actions
  loadPasscodes: () => Promise<void>;
  setPasscode: (profileId: string, code: string) => Promise<void>;
  removePasscode: (profileId: string) => Promise<void>;
  verifyPasscode: (profileId: string, code: string) => Promise<boolean>;
  hasPasscode: (profileId: string) => boolean;
  getParentPasscode: () => string | null;
  setParentPasscode: (code: string) => Promise<void>;
  removeParentPasscode: () => Promise<void>;
  verifyParentPasscode: (code: string) => Promise<boolean>;
}

const PARENT_PROFILE_ID = 'parent';

/**
 * Hash a PIN using SHA-256 with a salt
 * This is more secure than storing plaintext
 */
const hashPin = async (pin: string, salt: string = 'TinyTasks_v1'): Promise<string> => {
  const dataToHash = `${salt}:${pin}`;
  const hash = await Crypto.digestStringAsync(
    Crypto.CryptoDigestAlgorithm.SHA256,
    dataToHash
  );
  return hash;
};

/**
 * Migrate legacy plaintext PINs to hashed versions
 */
const migrateLegacyPasscodes = async (): Promise<PasscodeData | null> => {
  try {
    const legacyData = await AsyncStorage.getItem(LEGACY_PASSCODES_KEY);
    if (!legacyData) return null;
    
    const plainPasscodes: PasscodeData = JSON.parse(legacyData);
    const hashedPasscodes: PasscodeData = {};
    
    // Hash all existing PINs
    for (const [profileId, pin] of Object.entries(plainPasscodes)) {
      if (pin) {
        hashedPasscodes[profileId] = await hashPin(pin);
      }
    }
    
    // Save hashed version
    await AsyncStorage.setItem(PASSCODES_KEY, JSON.stringify(hashedPasscodes));
    
    // Remove legacy data
    await AsyncStorage.removeItem(LEGACY_PASSCODES_KEY);
    
    console.log('Migrated legacy passcodes to hashed version');
    return hashedPasscodes;
  } catch (error) {
    console.error('Failed to migrate legacy passcodes:', error);
    return null;
  }
};

export const usePasscodeStore = create<PasscodeState>((set, get) => ({
  passcodes: {},
  isLoading: true,
  
  loadPasscodes: async () => {
    try {
      // Try to load hashed passcodes first
      let stored = await AsyncStorage.getItem(PASSCODES_KEY);
      
      if (!stored) {
        // Check for legacy plaintext passcodes and migrate
        const migrated = await migrateLegacyPasscodes();
        if (migrated) {
          set({ passcodes: migrated, isLoading: false });
          return;
        }
      }
      
      const passcodes = stored ? JSON.parse(stored) : {};
      set({ passcodes, isLoading: false });
    } catch (error) {
      console.error('Failed to load passcodes:', error);
      set({ isLoading: false });
    }
  },
  
  setPasscode: async (profileId: string, code: string) => {
    try {
      // Validate PIN format (4 digits)
      if (!/^\d{4}$/.test(code)) {
        throw new Error('PIN must be exactly 4 digits');
      }
      
      const hashedCode = await hashPin(code);
      const { passcodes } = get();
      const updated = { ...passcodes, [profileId]: hashedCode };
      await AsyncStorage.setItem(PASSCODES_KEY, JSON.stringify(updated));
      set({ passcodes: updated });
    } catch (error) {
      console.error('Failed to save passcode:', error);
      throw error;
    }
  },
  
  removePasscode: async (profileId: string) => {
    try {
      const { passcodes } = get();
      const updated = { ...passcodes };
      delete updated[profileId];
      await AsyncStorage.setItem(PASSCODES_KEY, JSON.stringify(updated));
      set({ passcodes: updated });
    } catch (error) {
      console.error('Failed to remove passcode:', error);
      throw error;
    }
  },
  
  verifyPasscode: async (profileId: string, code: string) => {
    try {
      const { passcodes } = get();
      const storedHash = passcodes[profileId];
      if (!storedHash) return false;
      
      const inputHash = await hashPin(code);
      return storedHash === inputHash;
    } catch (error) {
      console.error('Failed to verify passcode:', error);
      return false;
    }
  },
  
  hasPasscode: (profileId: string) => {
    const { passcodes } = get();
    return !!passcodes[profileId];
  },
  
  // Parent-specific helpers
  getParentPasscode: () => {
    const { passcodes } = get();
    return passcodes[PARENT_PROFILE_ID] || null;
  },
  
  setParentPasscode: async (code: string) => {
    await get().setPasscode(PARENT_PROFILE_ID, code);
  },
  
  removeParentPasscode: async () => {
    await get().removePasscode(PARENT_PROFILE_ID);
  },
  
  verifyParentPasscode: async (code: string) => {
    return get().verifyPasscode(PARENT_PROFILE_ID, code);
  },
}));

export default usePasscodeStore;
