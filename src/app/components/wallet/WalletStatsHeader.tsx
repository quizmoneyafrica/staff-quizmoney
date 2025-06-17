'use client';

import React, { useState } from 'react';
import TimeRangeDropdown from '../common/TimeRangeDropdown';

const options = ['This week', 'Last 30 days', 'Custom'];

const WalletStatsHeader = () => {
  const [selected, setSelected] = useState(options[0]);
  const [customDateRange, setCustomDateRange] = useState(null);

  const handleSelect = (option) => {
    setSelected(option);

    if (option !== 'Custom') {
      setCustomDateRange(null);
    }
  };

  const handleCustomDateChange = (dateRange) => {
    setCustomDateRange(dateRange);
  };

  return (
    <div className="flex items-center justify-between ">
      <h2 className="text-2xl font-semibold">Wallet Statistic </h2>
      <TimeRangeDropdown
        options={options}
        selected={selected}
        onSelect={handleSelect}
        customDateRange={customDateRange}
        onCustomDateChange={handleCustomDateChange}
      />
    </div>
  );
};

export default WalletStatsHeader;
