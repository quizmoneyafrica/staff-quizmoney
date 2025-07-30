'use client';

import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { DateRange } from 'react-day-picker';
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
import { sub } from 'date-fns';
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

const chartTypeMap: { [key: string]: 'month' | 'year' } = {
  Months: 'month',
  Years: 'year',
};

const getDateRangeForApi = (period: string, monthRange?: DateRange) => {
  const toApiStart = (date: Date) => {
    const d = new Date(date);
    d.setUTCHours(23, 0, 0, 0);
    return d.toISOString();
  };
  const toApiEnd = (date: Date) => {
    const d = new Date(date);
    d.setDate(d.getDate() + 1);
    d.setUTCHours(22, 59, 59, 999);
    return d.toISOString();
  };

  if (monthRange?.from && monthRange?.to) {
    return {
      start: toApiStart(monthRange.from),
      end: toApiEnd(monthRange.to),
    };
  }

  const now = new Date();
  if (period === 'Months') {
    const start = sub(now, { months: 1 });
    return { start: toApiStart(start), end: toApiEnd(now) };
  }
};

function SalesParent() {
  const [selectedPeriod, setSelectedPeriod] = useState('Months');
  const [isWithdrawalVisible, setIsWithdrawalVisible] = useState(false);
  const [monthRange, setMonthRange] = useState<DateRange | undefined>();

  const {
    data: salesData,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ['salesStats', selectedPeriod, monthRange],
    queryFn: () => {
      const payload = {
        chartType: chartTypeMap[selectedPeriod],
        dateRange: getDateRangeForApi(selectedPeriod, monthRange),
      };
      return SalesApi.getSalesTransactionsChartStats(payload);
    },
    select: (res) => res.data.result,
    enabled:
      selectedPeriod !== 'Years' ||
      (selectedPeriod === 'Years' && !!monthRange?.from && !!monthRange?.to),
  });

  const toggleWithdrawalVisibility = () => setIsWithdrawalVisible((p) => !p);

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
    return <div>Error fetching data: {error?.message}</div>;
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
        monthRange={monthRange}
        onMonthRangeChange={setMonthRange}
      />

      <TotalTransactionsTable />
    </div>
  );
}

export default SalesParent;
