'use client';

import WalletStatCard from '@/app/components/wallet/WalletStatCard';
import React, { useCallback, useEffect } from 'react';
import SalesChart from '@/app/components/sales/SalesChart';
import TotalTransactionsTable from '@/app/components/sales/TotalTransactionsTable';
import { useSelector } from 'react-redux';
import {
  selectSales,
  setLoadingSales,
  setSalesData,
} from '@/app/store/salesSlice';
import SalesApi from '@/app/api/salesApi';
import { store } from '@/app/store/store';

type WalletStat = {
  title: string;
  value: string;
  bgColor: string;
  showEye: boolean;
  icon: React.ReactNode;
};

function SalesParent() {
  const { salesData } = useSelector(selectSales);

  const OrderIcon = () => (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
      <rect x="8" y="2" width="8" height="4" rx="1" ry="1" />
    </svg>
  );

  const TransactionIcon = () => (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
    </svg>
  );

  const walletStats: WalletStat[] = [
    {
      title: 'Total Orders',
      value: '₦500,000.00',
      bgColor: 'blue',
      showEye: true,
      icon: <OrderIcon />,
    },
    {
      title: 'Total Transactions',
      value: '₦500,000.00',
      bgColor: 'green',
      showEye: true,
      icon: <TransactionIcon />,
    },
    {
      title: 'Total Revenue',
      value: '₦500,000.00',
      bgColor: 'cyan',
      showEye: true,
      icon: <TransactionIcon />,
    },
  ];

  const fetchSalesData = useCallback(async () => {
    if (!salesData)
      try {
        store.dispatch(setLoadingSales(true));
        const res = await SalesApi.getSalesDetails();

        if (res.data.result) {
          store?.dispatch(setSalesData(res.data.result));
        }
      } catch (error) {
        console.error(error, 'Sales Error');
      } finally {
        store.dispatch(setLoadingSales(false));
      }
  }, [salesData]);

  useEffect(() => {
    fetchSalesData();
  }, [fetchSalesData]);

  return (
    <div className="flex w-full max-w-full flex-col gap-5 overflow-x-hidden py-6">
      <div className="grid w-full grid-cols-1 gap-4 md:grid-cols-3 md:gap-6">
        {walletStats.map((stat) => (
          <WalletStatCard key={stat.title} {...stat} />
        ))}
      </div>

      <SalesChart />

      <TotalTransactionsTable />
    </div>
  );
}

export default SalesParent;
