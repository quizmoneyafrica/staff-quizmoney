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
import {
  WalletIconBigGreen,
  BigPurchasedIcon,
  BigShop,
  Shop,
  WalletCardIconLightGreen,
  PurchasedIcon,
} from '@/app/icons/icons';

type WalletStat = {
  title: string;
  value: string;
  bgColor: string;
  showEye: boolean;
  icon: React.ReactNode;
  bgImage?: React.ReactNode;
};

function SalesParent() {
  const { salesData } = useSelector(selectSales);

  const walletStats: WalletStat[] = [
    {
      title: 'Users Purchased',
      value: '5000',
      bgColor: 'blue',
      icon: <Shop />,
      bgImage: <BigShop />,
      showEye: false,
    },
    {
      title: 'Total Withdrawal',
      value: '₦0.00',
      bgColor: 'lightGreen',
      icon: <WalletCardIconLightGreen />,
      bgImage: <WalletIconBigGreen />,
      showEye: true,
    },
    {
      title: 'Most Purchased',
      value: 'Quick Fix Pack',
      bgColor: 'cyan',
      icon: <PurchasedIcon />,
      bgImage: <BigPurchasedIcon />,
      showEye: false,
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
