import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Appearance } from 'react-native';
import { LightTheme, DarkTheme, ThemeColors } from '../../constants/colors';

type ThemeMode = 'light' | 'dark' | 'system';

interface ThemeState {
  mode: ThemeMode;
  colors: ThemeColors;
  isDark: boolean;
  isLoading: boolean;
  
  // Actions
  loadTheme: () => Promise<void>;
  setMode: (mode: ThemeMode) => Promise<void>;
  toggleTheme: () => Promise<void>;
}

const THEME_KEY = 'app_theme_mode';

const getColorsForMode = (mode: ThemeMode): { colors: ThemeColors; isDark: boolean } => {
  if (mode === 'system') {
    const systemTheme = Appearance.getColorScheme();
    const isDark = systemTheme === 'dark';
    return { colors: isDark ? DarkTheme : LightTheme, isDark };
  }
  
  const isDark = mode === 'dark';
  return { colors: isDark ? DarkTheme : LightTheme, isDark };
};

export const useThemeStore = create<ThemeState>((set, get) => ({
  mode: 'light',
  colors: LightTheme,
  isDark: false,
  isLoading: true,
  
  loadTheme: async () => {
    try {
      const savedMode = await AsyncStorage.getItem(THEME_KEY);
      const mode = (savedMode as ThemeMode) || 'light';
      const { colors, isDark } = getColorsForMode(mode);
      set({ mode, colors, isDark, isLoading: false });
    } catch (error) {
      set({ isLoading: false });
    }
  },
  
  setMode: async (mode: ThemeMode) => {
    try {
      await AsyncStorage.setItem(THEME_KEY, mode);
      const { colors, isDark } = getColorsForMode(mode);
      set({ mode, colors, isDark });
    } catch (error) {
      console.error('Failed to save theme:', error);
    }
  },
  
  toggleTheme: async () => {
    const { mode } = get();
    const newMode: ThemeMode = mode === 'dark' ? 'light' : 'dark';
    await get().setMode(newMode);
  },
}));

// Subscribe to system theme changes when in 'system' mode
Appearance.addChangeListener(({ colorScheme }) => {
  const { mode } = useThemeStore.getState();
  if (mode === 'system') {
    const isDark = colorScheme === 'dark';
    useThemeStore.setState({
      colors: isDark ? DarkTheme : LightTheme,
      isDark,
    });
  }
});

