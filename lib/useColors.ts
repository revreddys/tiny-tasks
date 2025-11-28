import { useThemeStore } from './stores/themeStore';
import { ThemeColors } from '../constants/colors';

/**
 * Hook to get current theme colors
 * Usage: const colors = useColors();
 */
export const useColors = (): ThemeColors => {
  return useThemeStore((state) => state.colors);
};

/**
 * Hook to get theme state and actions
 */
export const useTheme = () => {
  const mode = useThemeStore((state) => state.mode);
  const isDark = useThemeStore((state) => state.isDark);
  const setMode = useThemeStore((state) => state.setMode);
  const toggleTheme = useThemeStore((state) => state.toggleTheme);
  
  return { mode, isDark, setMode, toggleTheme };
};

export default useColors;

