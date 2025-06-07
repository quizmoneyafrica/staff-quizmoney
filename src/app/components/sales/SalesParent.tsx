'use client';

import WalletStatCard from '@/app/components/wallet/WalletStatCard';
import React, { useEffect } from 'react';
import WalletStatsHeader from '@/app/components/wallet/WalletStatsHeader';
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
  color: 'blue' | 'green' | 'default';
  showEye: boolean;
};

function SalesParent() {
  const { salesData } = useSelector(selectSales);

  const walletStats: WalletStat[] = [
    {
      title: 'Total Orders',
      value: '₦500,000.00',
      color: 'default',
      showEye: true,
    },
    {
      title: 'Total Transactions',
      value: '₦500,000.00',
      color: 'blue',
      showEye: true,
    },
    {
      title: 'Total Transactions',
      value: '₦500,000.00',
      color: 'green',
      showEye: true,
    },
  ];

  const fetchSalesData = async () => {
    if (!salesData)
      try {
        store.dispatch(setLoadingSales(true));
        const res = await SalesApi.getSalesDetails();

        if (res.data.result) {
          store?.dispatch(setSalesData(res.data.result));
        }
      } catch (error) {
        console.log(error, 'Sales Error');
      } finally {
        store.dispatch(setLoadingSales(false));
      }
  };
  useEffect(() => {
    fetchSalesData();
  }, []);

  return (
    <div className="flex w-full max-w-full flex-col gap-5 overflow-x-hidden   py-6">
      <WalletStatsHeader />
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
