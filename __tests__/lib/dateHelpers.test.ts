import {
  getLocalDateString,
  getTodayDateString,
  getYesterdayDateString,
  isToday,
  isYesterday,
  parseDateString,
  getDayOfWeek,
  formatDisplayDate,
  getDateNDaysAgo,
  getDaysBetween,
  shouldStreakContinue,
} from '../../lib/utils/dateHelpers';

describe('Date Helpers', () => {
  describe('getLocalDateString', () => {
    it('should return date in YYYY-MM-DD format', () => {
      const date = new Date(2024, 0, 15); // January 15, 2024
      const result = getLocalDateString(date);
      expect(result).toBe('2024-01-15');
    });

    it('should pad single digit months with zero', () => {
      const date = new Date(2024, 2, 5); // March 5, 2024
      const result = getLocalDateString(date);
      expect(result).toBe('2024-03-05');
    });

    it('should pad single digit days with zero', () => {
      const date = new Date(2024, 11, 1); // December 1, 2024
      const result = getLocalDateString(date);
      expect(result).toBe('2024-12-01');
    });

    it('should use current date when no argument provided', () => {
      const result = getLocalDateString();
      const now = new Date();
      const expected = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
      expect(result).toBe(expected);
    });
  });

  describe('getTodayDateString', () => {
    it('should return today\'s date', () => {
      const result = getTodayDateString();
      const now = new Date();
      const expected = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
      expect(result).toBe(expected);
    });
  });

  describe('getYesterdayDateString', () => {
    it('should return yesterday\'s date', () => {
      const result = getYesterdayDateString();
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const expected = getLocalDateString(yesterday);
      expect(result).toBe(expected);
    });
  });

  describe('isToday', () => {
    it('should return true for today\'s date', () => {
      const today = getTodayDateString();
      expect(isToday(today)).toBe(true);
    });

    it('should return false for yesterday\'s date', () => {
      const yesterday = getYesterdayDateString();
      expect(isToday(yesterday)).toBe(false);
    });

    it('should return false for a past date', () => {
      expect(isToday('2020-01-01')).toBe(false);
    });
  });

  describe('isYesterday', () => {
    it('should return true for yesterday\'s date', () => {
      const yesterday = getYesterdayDateString();
      expect(isYesterday(yesterday)).toBe(true);
    });

    it('should return false for today\'s date', () => {
      const today = getTodayDateString();
      expect(isYesterday(today)).toBe(false);
    });
  });

  describe('parseDateString', () => {
    it('should parse a date string into a Date object', () => {
      const result = parseDateString('2024-06-15');
      expect(result.getFullYear()).toBe(2024);
      expect(result.getMonth()).toBe(5); // June is month 5 (0-indexed)
      expect(result.getDate()).toBe(15);
    });

    it('should set time to noon to avoid timezone issues', () => {
      const result = parseDateString('2024-06-15');
      expect(result.getHours()).toBe(12);
    });
  });

  describe('getDayOfWeek', () => {
    it('should return correct day of week (0 = Sunday)', () => {
      // December 25, 2024 is a Wednesday (day 3)
      expect(getDayOfWeek('2024-12-25')).toBe(3);
    });

    it('should return 0 for Sunday', () => {
      // December 29, 2024 is a Sunday
      expect(getDayOfWeek('2024-12-29')).toBe(0);
    });

    it('should return 6 for Saturday', () => {
      // December 28, 2024 is a Saturday
      expect(getDayOfWeek('2024-12-28')).toBe(6);
    });
  });

  describe('formatDisplayDate', () => {
    it('should return "Today" for today\'s date', () => {
      const today = getTodayDateString();
      expect(formatDisplayDate(today)).toBe('Today');
    });

    it('should return "Yesterday" for yesterday\'s date', () => {
      const yesterday = getYesterdayDateString();
      expect(formatDisplayDate(yesterday)).toBe('Yesterday');
    });

    it('should format other dates with day name and month', () => {
      // December 25, 2024 is a Wednesday
      const result = formatDisplayDate('2024-12-25');
      expect(result).toBe('Wednesday, Dec 25');
    });
  });

  describe('getDateNDaysAgo', () => {
    it('should return today for 0 days ago', () => {
      const result = getDateNDaysAgo(0);
      expect(result).toBe(getTodayDateString());
    });

    it('should return yesterday for 1 day ago', () => {
      const result = getDateNDaysAgo(1);
      expect(result).toBe(getYesterdayDateString());
    });

    it('should return correct date for N days ago', () => {
      const result = getDateNDaysAgo(7);
      const expected = new Date();
      expected.setDate(expected.getDate() - 7);
      expect(result).toBe(getLocalDateString(expected));
    });
  });

  describe('getDaysBetween', () => {
    it('should return 0 for same dates', () => {
      expect(getDaysBetween('2024-06-15', '2024-06-15')).toBe(0);
    });

    it('should return positive number when date2 > date1', () => {
      expect(getDaysBetween('2024-06-10', '2024-06-15')).toBe(5);
    });

    it('should return negative number when date1 > date2', () => {
      expect(getDaysBetween('2024-06-15', '2024-06-10')).toBe(-5);
    });

    it('should handle month boundaries', () => {
      expect(getDaysBetween('2024-01-30', '2024-02-02')).toBe(3);
    });
  });

  describe('shouldStreakContinue', () => {
    it('should return false for undefined date', () => {
      expect(shouldStreakContinue(undefined)).toBe(false);
    });

    it('should return true if last completed was today', () => {
      const today = getTodayDateString();
      expect(shouldStreakContinue(today)).toBe(true);
    });

    it('should return true if last completed was yesterday', () => {
      const yesterday = getYesterdayDateString();
      expect(shouldStreakContinue(yesterday)).toBe(true);
    });

    it('should return false if last completed was 2+ days ago', () => {
      const twoDaysAgo = getDateNDaysAgo(2);
      expect(shouldStreakContinue(twoDaysAgo)).toBe(false);
    });
  });
});

