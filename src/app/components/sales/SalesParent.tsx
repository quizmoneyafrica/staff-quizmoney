'use client';

import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import WalletStatCard, {
  WalletStatCardsLoading,
} from '@/app/components/wallet/WalletStatCard';
import SalesChart from '@/app/components/sales/SalesChart';
import TotalTransactionsTable from '@/app/components/sales/TotalTransactionsTable';
import SalesApi from '@/app/api/salesApi';
import {
  WalletIconBigGreen,
  BigPurchasedIcon,
  BigShop,
  Shop,
  WalletCardIconLightGreen,
  PurchasedIcon,
} from '@/app/icons/icons';
import { sub, formatISO, startOfYear, endOfYear } from 'date-fns';

import { formatNaira } from '@/app/utils/utils';

type WalletStat = {
  title: string;
  value: string;
  bgColor: string;
  showEye: boolean;
  icon: React.ReactNode;
  bgImage?: React.ReactNode;
  isValueVisible?: boolean;
  onEyeToggle?: () => void;
};

const getDateRange = (period: string) => {
  const now = new Date();
  let startDate,
    endDate = now;

  switch (period.toLowerCase()) {
    case 'years':
      startDate = startOfYear(now);
      endDate = endOfYear(now);
      break;
    case 'months':
      startDate = sub(now, { months: 1 });
      break;
    case 'weeks':
    default:
      startDate = sub(now, { weeks: 1 });
      break;
  }

  return {
    start: formatISO(startDate),
    end: formatISO(endDate),
  };
};

function SalesParent() {
  const [selectedPeriod, setSelectedPeriod] = useState('Weeks');
  const [isWithdrawalVisible, setIsWithdrawalVisible] = useState(false);

  const chartTypeMap: { [key: string]: 'month' | 'year' } = {
    Weeks: 'month',
    Months: 'month',
    Years: 'year',
  };
  const chartType = chartTypeMap[selectedPeriod];

  const {
    data: salesData,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ['salesStats', selectedPeriod, chartType],
    queryFn: () => {
      const payload = {
        chartType: chartType,
        dateRange: getDateRange(selectedPeriod),
      };
      return SalesApi.getSalesTransactionsChartStats(payload);
    },
    select: (res) => res.data.result,
  });

  const toggleWithdrawalVisibility = () => {
    setIsWithdrawalVisible((prevState) => !prevState);
  };

  const walletStats: WalletStat[] = useMemo(() => {
    if (!salesData) return [];

    const { statistics } = salesData;
    return [
      {
        title: 'Users Purchased',
        value: statistics.totalDistinctUsers.toString(),
        bgColor: 'blue',
        icon: <Shop />,
        bgImage: <BigShop />,
        showEye: false,
      },
      {
        title: 'Total Withdrawal',

        value: formatNaira(statistics.totalAmount),
        bgColor: 'lightGreen',
        icon: <WalletCardIconLightGreen />,
        bgImage: <WalletIconBigGreen />,
        showEye: true,
        isValueVisible: isWithdrawalVisible,
        onEyeToggle: toggleWithdrawalVisibility,
      },
      {
        title: 'Most Purchased',
        value: statistics.mostPurchasedProduct?.name || 'N/A',
        bgColor: 'cyan',
        icon: <PurchasedIcon />,
        bgImage: <BigPurchasedIcon />,
        showEye: false,
      },
    ];
  }, [salesData, isWithdrawalVisible]);

  if (isError) {
    return <div>Error fetching data: {error.message}</div>;
  }

  return (
    <div className="flex w-full max-w-full flex-col gap-5 overflow-x-hidden py-6">
      <div className="grid w-full grid-cols-1 gap-4 md:grid-cols-3 md:gap-6">
        {isLoading ? (
          <>
            <WalletStatCardsLoading />
            <WalletStatCardsLoading />
            <WalletStatCardsLoading />
          </>
        ) : (
          walletStats.map((stat) => (
            <WalletStatCard key={stat.title} {...stat} />
          ))
        )}
      </div>

      <SalesChart
        chartData={salesData?.chartData || []}
        selectedPeriod={selectedPeriod}
        setSelectedPeriod={setSelectedPeriod}
      />

      <TotalTransactionsTable />
    </div>
  );
}

export default SalesParent;
