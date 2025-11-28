// Kid-friendly, vibrant color palette

export interface ThemeColors {
  // Primary colors
  primary: string;
  primaryLight: string;
  secondary: string;
  accent: string;
  
  // Background colors
  background: string;
  cardBg: string;
  inputBg: string;
  
  // Text colors
  text: string;
  textLight: string;
  textWhite: string;
  
  // Status colors
  success: string;
  warning: string;
  error: string;
  danger: string;
  
  // Gamification colors
  star: string;
  streak: string;
  badge: string;
  
  // Task category colors
  morning: string;
  afternoon: string;
  evening: string;
  bedtime: string;
  
  // Avatar colors
  avatarBg: string;
  
  // UI colors
  border: string;
  inputBorder: string;
  shadow: string;
  overlay: string;
  
  // Button states
  buttonDisabled: string;
  
  // Gradient colors (for backgrounds)
  gradientStart: string;
  gradientEnd: string;
}

// Light Theme (default - bright and cheerful)
export const LightTheme: ThemeColors = {
  // Primary colors
  primary: '#FF6B9D',      // Bright pink
  primaryLight: '#FFE4EC',
  secondary: '#4ECDC4',    // Teal
  accent: '#FFE66D',       // Sunny yellow
  
  // Background colors
  background: '#FFF5F8',   // Soft pink white
  cardBg: '#FFFFFF',
  inputBg: '#F8F9FA',
  
  // Text colors
  text: '#2D3436',         // Dark gray
  textLight: '#636E72',    // Medium gray
  textWhite: '#FFFFFF',
  
  // Status colors
  success: '#6DD5B7',      // Mint green
  warning: '#FFB347',      // Orange
  error: '#FF6B6B',        // Coral red
  danger: '#FF6B6B',
  
  // Gamification colors
  star: '#FFD700',         // Gold
  streak: '#FF6347',       // Tomato/flame
  badge: '#9B59B6',        // Purple
  
  // Task category colors
  morning: '#87CEEB',      // Sky blue
  afternoon: '#98D8C8',    // Sage green
  evening: '#DDA0DD',      // Plum
  bedtime: '#778899',      // Slate
  
  // Avatar colors
  avatarBg: '#E8F6FF',
  
  // UI colors
  border: '#E0E0E0',
  inputBorder: '#E0E0E0',
  shadow: 'rgba(0, 0, 0, 0.1)',
  overlay: 'rgba(0, 0, 0, 0.5)',
  
  // Button states
  buttonDisabled: '#CCCCCC',
  
  // Gradient colors (for backgrounds)
  gradientStart: '#FF6B9D',
  gradientEnd: '#FF8E72',
};

// Dark Theme (cozy and calm for bedtime)
export const DarkTheme: ThemeColors = {
  // Primary colors
  primary: '#FF85AD',      // Softer pink
  primaryLight: '#3D2A3A',
  secondary: '#5ED9D0',    // Brighter teal
  accent: '#FFE66D',       // Sunny yellow (keeps pop)
  
  // Background colors
  background: '#1A1A2E',   // Deep navy
  cardBg: '#252542',       // Card background
  inputBg: '#2D2D4A',
  
  // Text colors
  text: '#FFFFFF',         // White text
  textLight: '#A0A0B8',    // Muted text
  textWhite: '#FFFFFF',
  
  // Status colors
  success: '#6DD5B7',      // Mint green (keeps vibrancy)
  warning: '#FFB347',      // Orange
  error: '#FF6B6B',        // Coral red
  danger: '#FF6B6B',
  
  // Gamification colors
  star: '#FFD700',         // Gold (still pops!)
  streak: '#FF6347',       // Tomato/flame
  badge: '#B370CF',        // Lighter purple
  
  // Task category colors
  morning: '#6BB3D9',      // Sky blue
  afternoon: '#7DC4B0',    // Sage green
  evening: '#C98DC9',      // Plum
  bedtime: '#8899AA',      // Lighter slate
  
  // Avatar colors
  avatarBg: '#2D3A4A',
  
  // UI colors
  border: '#3D3D5C',
  inputBorder: '#3D3D5C',
  shadow: 'rgba(0, 0, 0, 0.3)',
  overlay: 'rgba(0, 0, 0, 0.7)',
  
  // Button states
  buttonDisabled: '#4A4A6A',
  
  // Gradient colors (for backgrounds)
  gradientStart: '#2D2D4A',
  gradientEnd: '#1A1A2E',
};

// Task icon colors mapping
export const TaskColors: Record<string, string> = {
  'brush-teeth': '#4ECDC4',
  'shower': '#87CEEB',
  'get-dressed': '#FFB347',
  'eat-breakfast': '#FFE66D',
  'make-bed': '#DDA0DD',
  'homework': '#98D8C8',
  'read-book': '#9B59B6',
  'exercise': '#6DD5B7',
  'clean-room': '#FF8E72',
  'sleep': '#778899',
  default: '#FF6B9D',
};

// Default export is light theme for backward compatibility
export const Colors = LightTheme;
export default Colors;
