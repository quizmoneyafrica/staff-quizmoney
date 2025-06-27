/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Converts a Date object or date string to YYYY-MM-DD format
 * @param date - Date object, ISO string, or YYYY-MM-DD string
 * @returns YYYY-MM-DD formatted string or null if invalid
 */
export const toDateString = (
  date: Date | string | null | undefined,
): string | null => {
  if (!date) return null;

  try {
    let dateObj: Date;

    if (typeof date === 'string') {
      dateObj = new Date(date);
    } else if (date instanceof Date) {
      dateObj = date;
    } else {
      return null;
    }

    // Check if date is valid
    if (isNaN(dateObj.getTime())) {
      return null;
    }

    return dateObj.toISOString().split('T')[0];
  } catch (error) {
    console.error('Error converting date to string:', error);
    return null;
  }
};

/**
 * Validates if a date range object has valid string dates
 * @param dateRange - Object with start and end properties
 * @returns boolean indicating if the date range is valid
 */
export const isValidDateRange = (
  dateRange: { start: any; end: any } | null | undefined,
): dateRange is { start: string; end: string } => {
  return !!(
    dateRange &&
    typeof dateRange.start === 'string' &&
    typeof dateRange.end === 'string' &&
    dateRange.start.trim() &&
    dateRange.end.trim() &&
    !isNaN(new Date(dateRange.start).getTime()) &&
    !isNaN(new Date(dateRange.end).getTime())
  );
};

/**
 * Safely converts any date range to serializable format
 * @param dateRange - Date range with potentially non-serializable values
 * @returns Serializable date range or null
 */
export const serializeDateRange = (
  dateRange: { start: any; end: any } | null | undefined,
): { start: string; end: string } | null => {
  if (!dateRange) return null;

  const startStr = toDateString(dateRange.start);
  const endStr = toDateString(dateRange.end);

  if (startStr && endStr) {
    return { start: startStr, end: endStr };
  }

  return null;
};
