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

function Page() {
  const [showTotalBalance, setShowTotalBalance] = useState(false);
  const [showDeposit, setShowDeposit] = useState(false);
  const [showWithdrawal, setShowWithdrawal] = useState(false);
  const [showTotalExpenses, setShowTotalExpenses] = useState(false);

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
      value: formatNaira(summaryData?.data?.totalBalance, true),
      bgColor: 'lightBlue',
      icon: <WalletCardIconLightBlue />,
      bgImage: <WalletIconBig />,
      showEye: true,
      isValueVisible: showTotalBalance,
      onEyeToggle: () => setShowTotalBalance(!showTotalBalance),
    },
    {
      title: 'Total Deposit',
      value: formatNaira(summaryData?.data?.totalDeposit, true),
      bgColor: 'lightCyan',
      icon: <WalletCardIconLightCyan />,
      bgImage: <WalletIconBigLightCyan />,
      showEye: true,
      isValueVisible: showDeposit,
      onEyeToggle: () => setShowDeposit(!showDeposit),
    },
    {
      title: 'Total Withdrawal',
      value: formatNaira(summaryData?.data?.totalWithdrawal, true),
      bgColor: 'lightGreen',
      icon: <WalletCardIconLightGreen />,
      bgImage: <WalletIconBigGreen />,
      showEye: true,
      isValueVisible: showWithdrawal,
      onEyeToggle: () => setShowWithdrawal(!showWithdrawal),
    },
    {
      title: 'Total Expenses',
      value: formatNaira(summaryData?.data?.totalExpenses, true),
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
