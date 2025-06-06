'use client';

import React, { useState } from 'react';
import TimeRangeDropdown from '../common/TimeRangeDropdown';

const options = ['This week', 'Last week', 'This month', 'Last month'];

const WalletStatsHeader = () => {
  const [selected, setSelected] = useState(options[0]);

  return (
    <div className="flex justify-between items-center ">
      <h2 className="text-2xl font-semibold">Wallet Statistic </h2>
      <TimeRangeDropdown 
        options={options}
        selected={selected}
        onSelect={setSelected}
      />
    </div>
  );
};

export default WalletStatsHeader;
