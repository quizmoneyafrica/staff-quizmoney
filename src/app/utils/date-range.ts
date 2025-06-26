export const formatDateRange = (dateRange) => {
  if (!dateRange || !dateRange.startDate || !dateRange.endDate) return null;

  const formatDate = (date) => {
    if (typeof date === 'string') return date;
    return date.toISOString().split('T')[0];
  };

  return {
    start: formatDate(dateRange.startDate),
    end: formatDate(dateRange.endDate),
  };
};

export const calculateDateRange = (selectedOption, customDateRange) => {
  if (selectedOption === 'Custom' && customDateRange) {
    return formatDateRange(customDateRange);
  }

  const today = new Date();
  const formatDate = (date) => {
    return date.toISOString().split('T')[0];
  };

  switch (selectedOption) {
    case 'This week': {
      const startOfWeek = new Date(today);
      const dayOfWeek = today.getDay();
      const daysFromMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
      startOfWeek.setDate(today.getDate() - daysFromMonday);
      startOfWeek.setHours(0, 0, 0, 0);

      const endOfWeek = new Date(today);
      endOfWeek.setHours(23, 59, 59, 999);

      return {
        start: formatDate(startOfWeek),
        end: formatDate(endOfWeek),
      };
    }

    case 'Last 30 days': {
      const thirtyDaysAgo = new Date(today);
      thirtyDaysAgo.setDate(today.getDate() - 30);
      thirtyDaysAgo.setHours(0, 0, 0, 0);

      const endDate = new Date(today);
      endDate.setHours(23, 59, 59, 999);

      return {
        start: formatDate(thirtyDaysAgo),
        end: formatDate(endDate),
      };
    }

    default:
      return null;
  }
};
