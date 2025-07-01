export const formatDateRange = (dateRange) => {
  if (!dateRange || !dateRange.startDate || !dateRange.endDate) return null;

  const formatDate = (date, isEndOfDay = false) => {
    if (typeof date === 'string') return date;
    const d = new Date(date);
    if (isEndOfDay) {
      d.setHours(23, 59, 59, 999);
    } else {
      d.setHours(0, 0, 0, 0);
    }
    return d.toISOString();
  };

  return {
    start: formatDate(dateRange.startDate),
    end: formatDate(dateRange.endDate, true),
  };
};

export const calculateDateRange = (selectedOption, customDateRange) => {
  if (selectedOption === 'Custom' && customDateRange) {
    return formatDateRange(customDateRange);
  }

  if (selectedOption === 'All Time') {
    return null;
  }

  const today = new Date();
  today.setHours(23, 59, 59, 999);

  switch (selectedOption) {
    case 'This week': {
      const startOfWeek = new Date(today);
      const dayOfWeek = today.getDay();
      const daysFromMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
      startOfWeek.setDate(today.getDate() - daysFromMonday);
      startOfWeek.setHours(0, 0, 0, 0);

      return {
        start: startOfWeek.toISOString(),
        end: today.toISOString(),
      };
    }

    case 'Last 30 days': {
      const thirtyDaysAgo = new Date(today);
      thirtyDaysAgo.setDate(today.getDate() - 30);
      thirtyDaysAgo.setHours(0, 0, 0, 0);

      return {
        start: thirtyDaysAgo.toISOString(),
        end: today.toISOString(),
      };
    }

    default:
      return null;
  }
};
