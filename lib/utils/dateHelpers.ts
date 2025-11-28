/**
 * Date utility functions for consistent local timezone handling
 * These functions ensure dates are always in local timezone, not UTC
 */

/**
 * Get a date string in YYYY-MM-DD format in local timezone
 * @param date - Date object (defaults to current date)
 * @returns Date string in YYYY-MM-DD format
 */
export const getLocalDateString = (date: Date = new Date()): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

/**
 * Get today's date string in local timezone
 * @returns Today's date in YYYY-MM-DD format
 */
export const getTodayDateString = (): string => {
  return getLocalDateString(new Date());
};

/**
 * Get yesterday's date string in local timezone
 * @returns Yesterday's date in YYYY-MM-DD format
 */
export const getYesterdayDateString = (): string => {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  return getLocalDateString(yesterday);
};

/**
 * Check if a date string represents today
 * @param dateString - Date string in YYYY-MM-DD format
 * @returns True if the date is today
 */
export const isToday = (dateString: string): boolean => {
  return dateString === getTodayDateString();
};

/**
 * Check if a date string represents yesterday
 * @param dateString - Date string in YYYY-MM-DD format
 * @returns True if the date is yesterday
 */
export const isYesterday = (dateString: string): boolean => {
  return dateString === getYesterdayDateString();
};

/**
 * Parse a YYYY-MM-DD date string into a Date object at noon local time
 * Using noon avoids timezone edge cases
 * @param dateString - Date string in YYYY-MM-DD format
 * @returns Date object
 */
export const parseDateString = (dateString: string): Date => {
  return new Date(dateString + 'T12:00:00');
};

/**
 * Get the day of week from a date string
 * @param dateString - Date string in YYYY-MM-DD format
 * @returns Day of week (0 = Sunday, 6 = Saturday)
 */
export const getDayOfWeek = (dateString: string): number => {
  return parseDateString(dateString).getDay();
};

/**
 * Format a date string for display
 * @param dateString - Date string in YYYY-MM-DD format
 * @returns Formatted string like "Today", "Yesterday", or "Monday, Nov 28"
 */
export const formatDisplayDate = (dateString: string): string => {
  if (isToday(dateString)) {
    return 'Today';
  }
  if (isYesterday(dateString)) {
    return 'Yesterday';
  }
  
  const date = parseDateString(dateString);
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  
  return `${days[date.getDay()]}, ${months[date.getMonth()]} ${date.getDate()}`;
};

/**
 * Get date string for N days ago
 * @param daysAgo - Number of days ago (0 = today, 1 = yesterday, etc.)
 * @returns Date string in YYYY-MM-DD format
 */
export const getDateNDaysAgo = (daysAgo: number): string => {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  return getLocalDateString(date);
};

/**
 * Get the number of days between two date strings
 * @param dateString1 - First date string in YYYY-MM-DD format
 * @param dateString2 - Second date string in YYYY-MM-DD format
 * @returns Number of days between the two dates (positive if date2 > date1)
 */
export const getDaysBetween = (dateString1: string, dateString2: string): number => {
  const date1 = parseDateString(dateString1);
  const date2 = parseDateString(dateString2);
  const diffTime = date2.getTime() - date1.getTime();
  return Math.round(diffTime / (1000 * 60 * 60 * 24));
};

/**
 * Check if a streak should continue based on last completed date
 * @param lastCompletedDate - Last completed date in YYYY-MM-DD format
 * @returns True if streak should continue (yesterday or today was completed)
 */
export const shouldStreakContinue = (lastCompletedDate: string | undefined): boolean => {
  if (!lastCompletedDate) return false;
  return isToday(lastCompletedDate) || isYesterday(lastCompletedDate);
};

