import { LightTheme, DarkTheme, TaskColors, Colors, ThemeColors } from '../../constants/colors';

describe('Colors', () => {
  describe('ThemeColors structure', () => {
    const requiredKeys: (keyof ThemeColors)[] = [
      'primary', 'primaryLight', 'secondary', 'accent',
      'background', 'cardBg', 'inputBg',
      'text', 'textLight', 'textWhite',
      'success', 'warning', 'error', 'danger',
      'star', 'streak', 'badge',
      'morning', 'afternoon', 'evening', 'bedtime',
      'avatarBg',
      'border', 'inputBorder', 'shadow', 'overlay',
      'buttonDisabled',
      'gradientStart', 'gradientEnd',
    ];

    it('LightTheme should have all required color keys', () => {
      requiredKeys.forEach(key => {
        expect(LightTheme).toHaveProperty(key);
        expect(LightTheme[key]).toBeTruthy();
      });
    });

    it('DarkTheme should have all required color keys', () => {
      requiredKeys.forEach(key => {
        expect(DarkTheme).toHaveProperty(key);
        expect(DarkTheme[key]).toBeTruthy();
      });
    });
  });

  describe('LightTheme', () => {
    it('should have valid hex color codes for primary colors', () => {
      const hexColorRegex = /^#[0-9A-Fa-f]{6}$/;
      expect(LightTheme.primary).toMatch(hexColorRegex);
      expect(LightTheme.secondary).toMatch(hexColorRegex);
      expect(LightTheme.accent).toMatch(hexColorRegex);
    });

    it('should have light background colors', () => {
      // Light theme should have light backgrounds (high brightness)
      const bgColors = [LightTheme.background, LightTheme.cardBg];
      bgColors.forEach(color => {
        // Check that it starts with #F or #E or #FFFFFF (light colors)
        expect(color).toMatch(/^#[EFef]/);
      });
    });

    it('should have dark text colors', () => {
      // Light theme should have dark text for contrast
      expect(LightTheme.text).toMatch(/^#[0-4]/);
    });

    it('should have vibrant gamification colors', () => {
      expect(LightTheme.star).toBe('#FFD700'); // Gold
      expect(LightTheme.streak).toBe('#FF6347'); // Tomato
    });
  });

  describe('DarkTheme', () => {
    it('should have valid hex color codes for primary colors', () => {
      const hexColorRegex = /^#[0-9A-Fa-f]{6}$/;
      expect(DarkTheme.primary).toMatch(hexColorRegex);
      expect(DarkTheme.secondary).toMatch(hexColorRegex);
      expect(DarkTheme.accent).toMatch(hexColorRegex);
    });

    it('should have dark background colors', () => {
      // Dark theme should have dark backgrounds
      const bgColors = [DarkTheme.background, DarkTheme.cardBg];
      bgColors.forEach(color => {
        expect(color).toMatch(/^#[0-3]/);
      });
    });

    it('should have light text colors', () => {
      // Dark theme should have light text for contrast
      expect(DarkTheme.text).toBe('#FFFFFF');
      expect(DarkTheme.textWhite).toBe('#FFFFFF');
    });

    it('should maintain vibrant gamification colors', () => {
      // These should stay bright even in dark mode
      expect(DarkTheme.star).toBe('#FFD700'); // Gold
      expect(DarkTheme.streak).toBe('#FF6347'); // Tomato
    });
  });

  describe('Theme Contrast', () => {
    it('light theme text should contrast with background', () => {
      // Simple check: text should be much darker than background
      const textFirstChar = parseInt(LightTheme.text.charAt(1), 16);
      const bgFirstChar = parseInt(LightTheme.background.charAt(1), 16);
      expect(bgFirstChar).toBeGreaterThan(textFirstChar);
    });

    it('dark theme text should contrast with background', () => {
      // In dark theme, text should be much lighter than background
      const textFirstChar = parseInt(DarkTheme.text.charAt(1), 16);
      const bgFirstChar = parseInt(DarkTheme.background.charAt(1), 16);
      expect(textFirstChar).toBeGreaterThan(bgFirstChar);
    });
  });

  describe('TaskColors', () => {
    it('should have a default color', () => {
      expect(TaskColors.default).toBeDefined();
      expect(TaskColors.default).toMatch(/^#[0-9A-Fa-f]{6}$/);
    });

    it('should have colors for common tasks', () => {
      expect(TaskColors['brush-teeth']).toBeDefined();
      expect(TaskColors['shower']).toBeDefined();
      expect(TaskColors['get-dressed']).toBeDefined();
      expect(TaskColors['eat-breakfast']).toBeDefined();
    });

    it('should have all valid hex color codes', () => {
      const hexColorRegex = /^#[0-9A-Fa-f]{6}$/;
      Object.values(TaskColors).forEach(color => {
        expect(color).toMatch(hexColorRegex);
      });
    });

    it('should have unique colors for different tasks', () => {
      const colors = Object.values(TaskColors);
      const uniqueColors = new Set(colors);
      // Allow some duplicate colors but majority should be unique
      expect(uniqueColors.size).toBeGreaterThan(colors.length / 2);
    });
  });

  describe('Colors default export', () => {
    it('should export LightTheme as default Colors', () => {
      expect(Colors).toEqual(LightTheme);
    });

    it('should have primary color accessible', () => {
      expect(Colors.primary).toBe(LightTheme.primary);
    });
  });

  describe('Color accessibility considerations', () => {
    // These tests ensure colors are suitable for children
    it('should avoid harsh pure black/white in light theme', () => {
      expect(LightTheme.text).not.toBe('#000000');
      expect(LightTheme.background).not.toBe('#FFFFFF');
    });

    it('should use warm, friendly primary colors', () => {
      // Pink-ish primary color is friendly for kids
      const primary = LightTheme.primary.toLowerCase();
      expect(primary).toMatch(/^#ff/); // Starts with FF (red-ish)
    });

    it('gamification colors should be distinctly different', () => {
      // Star, streak, and badge colors should be visually distinct
      expect(LightTheme.star).not.toBe(LightTheme.streak);
      expect(LightTheme.star).not.toBe(LightTheme.badge);
      expect(LightTheme.streak).not.toBe(LightTheme.badge);
    });
  });
});

