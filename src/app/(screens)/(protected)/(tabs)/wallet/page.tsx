/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React, { useState } from 'react';
import WalletStatCard from '@/app/components/wallet/WalletStatCard';
import TransactionTable from '@/app/components/wallet/TransactionTable';
import {
  WalletIconBig,
  WalletIconBigGreen,
  WalletCardIconLightBlue,
  WalletCardIconLightCyan,
  WalletIconBigLightCyan,
  WalletCardIconLightGreen,
} from '@/app/icons/icons';
import { useGetAllTransactionsWithStats } from '@/app/hooks/useTransaction';
import { formatNaira } from '@/app/utils/utils';
import TimeRangeDropdown from '@/app/components/common/TimeRangeDropdown';
import { calculateDateRange } from '@/app/utils/date-range';

interface StaticTransactionData {
  id: string;
  date: string;
  username: string;
  avatarUrl: string;
  transactionType: string;
  transactionAmount: string;
  transactionStatus: 'Pending' | 'Successful' | 'Failed';
}

function Page() {
  const [showTotalBalance, setShowTotalBalance] = useState(false);
  const [showDeposit, setShowDeposit] = useState(false);
  const [showWithdrawal, setShowWithdrawal] = useState(false);
  const [transactionStats, setTransactionStats] = useState<any>(null);

  const options = ['This week', 'Last 30 days', 'Custom'];

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

  const {
    data: wallet,
    isLoading: walletLoading,
    error: walletError,
  } = useGetAllTransactionsWithStats(
    1,
    10,
    undefined,
    undefined,
    undefined,
    undefined,
    calculateDateRange(selected, customDateRange),
  );

  const handleStatsUpdate = (stats: any) => {
    setTransactionStats(stats);
  };

  const getWalletStats = () => {
    const defaultStats = [
      {
        title: 'Total Wallet Balance',
        value: '₦0.00',
        bgColor: 'lightBlue',
        icon: <WalletCardIconLightBlue />,
        bgImage: <WalletIconBig />,
        showEye: true,
        isValueVisible: showTotalBalance,
        onEyeToggle: () => setShowTotalBalance(!showTotalBalance),
      },
      {
        title: 'Total Deposit',
        value: '₦0.00',
        bgColor: 'lightCyan',
        icon: <WalletCardIconLightCyan />,
        bgImage: <WalletIconBigLightCyan />,
        showEye: true,
        isValueVisible: showDeposit,
        onEyeToggle: () => setShowDeposit(!showDeposit),
      },
      {
        title: 'Total Withdrawal',
        value: '₦0.00',
        bgColor: 'lightGreen',
        icon: <WalletCardIconLightGreen />,
        bgImage: <WalletIconBigGreen />,
        showEye: true,
        isValueVisible: showWithdrawal,
        onEyeToggle: () => setShowWithdrawal(!showWithdrawal),
      },
    ];

    if (wallet?.statistics) {
      const walletInfo = wallet?.statistics;
      defaultStats[0].value = formatNaira(
        Number(walletInfo?.totalWalletBalance),
        true,
      );
      defaultStats[1].value = formatNaira(
        Number(walletInfo?.totalDeposits),
        true,
      );
      defaultStats[2].value = formatNaira(
        Number(walletInfo?.totalWithdrawals),
        true,
      );
    }

    return defaultStats;
  };

  const walletStats = getWalletStats();

  return (
    <div className="flex w-full max-w-full flex-col gap-5 overflow-x-hidden py-6">
      <div className="flex items-center justify-between ">
        <h2 className="text-2xl font-semibold">Wallet Statistics</h2>
        <TimeRangeDropdown
          options={options}
          selected={selected}
          onSelect={handleSelect}
          customDateRange={customDateRange}
          onCustomDateChange={handleCustomDateChange}
        />
      </div>

      <div className="grid w-full grid-cols-1 gap-4 md:grid-cols-3 md:gap-6">
        {walletLoading ? (
          Array.from({ length: 3 }).map((_, index) => (
            <div
              key={index}
              className="animate-pulse rounded-lg border bg-white p-6"
            >
              <div className="mb-4 flex items-center justify-between">
                <div className="h-8 w-8 rounded bg-gray-300"></div>
                <div className="h-4 w-16 rounded bg-gray-300"></div>
              </div>
              <div className="mb-2 h-6 w-24 rounded bg-gray-300"></div>
              <div className="h-8 w-32 rounded bg-gray-400"></div>
            </div>
          ))
        ) : walletError ? (
          <div className="col-span-full py-8 text-center">
            <p className="mb-2 text-red-600">Failed to load wallet stats</p>
            <p className="text-sm text-gray-500">Using default values</p>
          </div>
        ) : null}

        {!walletLoading &&
          walletStats.map((stat) => (
            <WalletStatCard key={stat.title} {...stat} />
          ))}
      </div>

      <TransactionTable onStatsUpdate={handleStatsUpdate} />
    </div>
  );
}

export default Page;
