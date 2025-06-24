/* eslint-disable @typescript-eslint/no-explicit-any */

'use client';

import React, { useState } from 'react';
import WalletStatCard from '@/app/components/wallet/WalletStatCard';
import TransactionTable from '@/app/components/wallet/TransactionTable';
import WalletStatsHeader from '@/app/components/wallet/WalletStatsHeader';
import {
  WalletIconBig,
  WalletIconBigGreen,
  WalletCardIconLightBlue,
  WalletCardIconLightCyan,
  WalletIconBigLightCyan,
  WalletCardIconLightGreen,
} from '@/app/icons/icons';
import { Loader2 } from 'lucide-react';
import { useGetWalletStats } from '@/app/hooks/useTransaction';

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
  const [transactionStats, setTransactionStats] = useState<any>(null);

  const {
    data: walletData,
    isLoading: walletLoading,
    error: walletError,
  } = useGetWalletStats();

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
        showEye: false,
      },
      {
        title: 'Total Withdrawal',
        value: '₦0.00',
        bgColor: 'lightGreen',
        icon: <WalletCardIconLightGreen />,
        bgImage: <WalletIconBigGreen />,
        showEye: false,
      },
    ];

    if (walletData?.result) {
      const walletInfo = walletData.result;
      defaultStats[0].value = `₦${
        walletInfo.balance?.toLocaleString() || '0.00'
      }`;
    }

    if (transactionStats) {
      if (transactionStats.totalDeposits !== undefined) {
        defaultStats[1].value = `₦${transactionStats.totalDeposits.toLocaleString()}`;
      }
      if (transactionStats.totalWithdrawals !== undefined) {
        defaultStats[2].value = `₦${transactionStats.totalWithdrawals.toLocaleString()}`;
      }
    }

    return defaultStats;
  };

  const walletStats = getWalletStats();

  const handleViewDetails = (transactionData: StaticTransactionData) => {
    console.log('View details for:', transactionData);
  };

  return (
    <div className="flex w-full max-w-full flex-col gap-5 overflow-x-hidden py-6">
      <WalletStatsHeader />

      {/* Wallet Stats Cards */}
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

        {walletStats.map((stat) => (
          <WalletStatCard key={stat.title} {...stat} />
        ))}
      </div>

      {/* Transaction Table */}
      <TransactionTable
        viewDetails={handleViewDetails}
        onStatsUpdate={handleStatsUpdate}
      />
    </div>
  );
}

export default Page;
