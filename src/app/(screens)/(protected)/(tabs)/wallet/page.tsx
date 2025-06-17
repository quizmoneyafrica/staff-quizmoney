'use client';

import WalletStatCard from '@/app/components/wallet/WalletStatCard';
import TransactionTable from '@/app/components/wallet/TransactionTable';
import React, { useState } from 'react';
import WalletStatsHeader from '@/app/components/wallet/WalletStatsHeader';
import {
  WalletIconBig,
  WalletIconBigGreen,
  WalletCardIconLightBlue,
  WalletCardIconLightCyan,
  WalletIconBigLightCyan,
  WalletCardIconLightGreen,
} from '@/app/icons/icons';

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

  const walletStats = [
    {
      title: 'Total Wallet Balance',
      value: '₦500,000.00',
      bgColor: 'lightBlue',
      icon: <WalletCardIconLightBlue />,
      bgImage: <WalletIconBig />,
      showEye: true,
      isValueVisible: showTotalBalance,
      onEyeToggle: () => setShowTotalBalance(!showTotalBalance),
    },
    {
      title: 'Total Deposit',
      value: '₦500,000.00',
      bgColor: 'lightCyan',
      icon: <WalletCardIconLightCyan />,
      bgImage: <WalletIconBigLightCyan />,
      showEye: false,
    },
    {
      title: 'Total Withdrawal',
      value: '₦500,000.00',
      bgColor: 'lightGreen',
      icon: <WalletCardIconLightGreen />,
      bgImage: <WalletIconBigGreen />,
      showEye: false,
    },
  ];

  const handleViewDetails = (transactionData: StaticTransactionData) => {};

  return (
    <div className="flex w-full max-w-full flex-col gap-5 overflow-x-hidden py-6">
      <WalletStatsHeader />
      <div className="grid w-full grid-cols-1 gap-4 md:grid-cols-3 md:gap-6">
        {walletStats.map((stat) => (
          <WalletStatCard key={stat.title} {...stat} />
        ))}
      </div>
      <TransactionTable viewDetails={handleViewDetails} />
    </div>
  );
}

export default Page;
