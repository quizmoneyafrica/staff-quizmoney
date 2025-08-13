'use client';

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import WalletStatCard from '@/app/components/wallet/WalletStatCard';
import TransactionTable from '@/app/components/wallet/TransactionTable';
import {
  WalletIconBig,
  WalletIconBigGreen,
  WalletIconBigLightCyan,
  WalletCardIconLightBlue,
  WalletCardIconLightCyan,
  WalletCardIconLightGreen,
  SmallRedWallet,
  WalletIconBigRedError,
} from '@/app/icons/icons';

import WalletApi, { WalletSummaryResponse } from '@/app/api/wallet';
import { formatNaira } from '@/app/utils/utils';
import TimeRangeDropdown from '@/app/components/common/TimeRangeDropdown';
import { calculateDateRange } from '@/app/utils/date-range';

function Page() {
  const [showTotalBalance, setShowTotalBalance] = useState(false);
  const [showDeposit, setShowDeposit] = useState(false);
  const [showWithdrawal, setShowWithdrawal] = useState(false);
  const [showTotalExpenses, setShowTotalExpenses] = useState(false);

  const [selected, setSelected] = useState('All Time');
  const [customDateRange, setCustomDateRange] = useState(null);

  const handleSelect = (option) => {
    setSelected(option);
    if (option !== 'Custom') setCustomDateRange(null);
  };

  const handleCustomDateChange = (dateRange) => setCustomDateRange(dateRange);

  const {
    data: summaryData,
    isLoading: summaryLoading,
    error: summaryError,
  } = useQuery<{
    success: boolean;
    code: string;
    message: string;
    data: WalletSummaryResponse;
  }>({
    queryKey: ['walletSummary'],
    queryFn: () => WalletApi.getWalletSummary().then((res) => res.data),
  });

  const walletStats = [
    {
      title: 'Total Wallet Balance',
      value: formatNaira(summaryData?.data?.totalBalance || 0),
      bgColor: 'lightBlue',
      icon: <WalletCardIconLightBlue />,
      bgImage: <WalletIconBig />,
      showEye: true,
      isValueVisible: showTotalBalance,
      onEyeToggle: () => setShowTotalBalance(!showTotalBalance),
    },
    {
      title: 'Total Deposit',
      value: formatNaira(summaryData?.data?.totalDeposit || 0),
      bgColor: 'lightCyan',
      icon: <WalletCardIconLightCyan />,
      bgImage: <WalletIconBigLightCyan />,
      showEye: true,
      isValueVisible: showDeposit,
      onEyeToggle: () => setShowDeposit(!showDeposit),
    },
    {
      title: 'Total Withdrawal',
      value: formatNaira(summaryData?.data?.totalWithdrawal || 0),
      bgColor: 'lightGreen',
      icon: <WalletCardIconLightGreen />,
      bgImage: <WalletIconBigGreen />,
      showEye: true,
      isValueVisible: showWithdrawal,
      onEyeToggle: () => setShowWithdrawal(!showWithdrawal),
    },
    {
      title: 'Total Expenses',
      value: formatNaira(summaryData?.data?.totalExpenses || 0),
      bgColor: 'redError',
      icon: <SmallRedWallet />,
      bgImage: <WalletIconBigRedError />,
      showEye: true,
      isValueVisible: showTotalExpenses,
      onEyeToggle: () => setShowTotalExpenses(!showTotalExpenses),
    },
  ];

  return (
    <div className="flex w-full max-w-full flex-col gap-5 overflow-x-hidden py-6">
      <div className="flex items-center justify-between ">
        <h2 className="text-2xl font-semibold">Wallet Statistics</h2>
        <TimeRangeDropdown
          options={['All Time', 'This week', 'Last 30 days', 'Custom']}
          selected={selected}
          onSelect={handleSelect}
          customDateRange={customDateRange}
          onCustomDateChange={handleCustomDateChange}
        />
      </div>

      <div className="grid w-full grid-cols-1 gap-4 md:grid-cols-4 md:gap-6">
        {summaryLoading ? (
          Array.from({ length: 4 }).map((_, index) => (
            <div
              key={index}
              className="h-[169px] animate-pulse rounded-lg bg-gray-200"
            ></div>
          ))
        ) : summaryError ? (
          <div className="col-span-full py-8 text-center text-red-600">
            Failed to load wallet stats.
          </div>
        ) : (
          walletStats.map((stat) => (
            <WalletStatCard key={stat.title} {...stat} />
          ))
        )}
      </div>

      <TransactionTable />
    </div>
  );
}

export default Page;
