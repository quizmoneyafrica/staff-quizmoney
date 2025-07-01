/* eslint-disable @typescript-eslint/no-explicit-any */

export const toDateString = (
  date: Date | string | null | undefined,
  isEndOfDay = false,
): string | null => {
  if (!date) return null;

  try {
    let dateObj: Date;

    if (typeof date === 'string') {
      dateObj = new Date(date);
    } else if (date instanceof Date) {
      dateObj = new Date(date);
    } else {
      return null;
    }

    if (isNaN(dateObj.getTime())) {
      return null;
    }

    if (isEndOfDay) {
      dateObj.setHours(23, 59, 59, 999);
    } else {
      dateObj.setHours(0, 0, 0, 0);
    }

    return dateObj.toISOString();
  } catch (error) {
    console.error('Error converting date to string:', error);
    return null;
  }
};

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

export const serializeDateRange = (
  dateRange: { start: any; end: any } | null | undefined,
): { start: string; end: string } | null => {
  if (!dateRange) return null;

  try {
    const startDate =
      typeof dateRange.start === 'string'
        ? new Date(dateRange.start)
        : dateRange.start;

    const endDate =
      typeof dateRange.end === 'string'
        ? new Date(dateRange.end)
        : dateRange.end;

    if (!(startDate instanceof Date) || !(endDate instanceof Date)) {
      return null;
    }

    startDate.setHours(0, 0, 0, 0);

    endDate.setHours(23, 59, 59, 999);

    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      return null;
    }

    return {
      start: startDate.toISOString(),
      end: endDate.toISOString(),
    };
  } catch (error) {
    console.error('Error serializing date range:', error);
    return null;
  }
};
