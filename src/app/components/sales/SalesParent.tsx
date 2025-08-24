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
import { startOfMonth, format } from 'date-fns';
import { formatNaira } from '@/app/utils/utils';
import { SalesChartResponse } from '@/app/api/salesApi';
import { convertToLocaleString } from '@/app/utils';

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

function SalesParent() {
  const [selectedPeriod, setSelectedPeriod] = useState('Months');
  const [isWithdrawalVisible, setIsWithdrawalVisible] = useState(false);
  const [monthRange, setMonthRange] = useState<DateRange | undefined>({
    from: startOfMonth(new Date()),
    to: new Date(),
  });

  const formattedStartDate = monthRange?.from
    ? format(monthRange.from, 'yyyy-MM-dd')
    : '';
  const formattedEndDate = monthRange?.to
    ? format(monthRange.to, 'yyyy-MM-dd')
    : '';

  const {
    data: summaryData,
    isLoading: isSummaryLoading,
    isError: isSummaryError,
    error: summaryError,
  } = useQuery({
    queryKey: ['salesSummary'],
    queryFn: () => SalesApi.getSalesSummary().then((res) => res.data.data),
  });

  const { data: salesChartData = [], isLoading: isChartLoading } = useQuery<
    SalesChartResponse[]
  >({
    queryKey: [
      'salesChart',
      formattedStartDate,
      formattedEndDate,
      selectedPeriod,
    ],
    queryFn: async () => {
      if (!formattedStartDate || !formattedEndDate) return [];
      const response = await SalesApi.getSalesChart(
        formattedStartDate,
        formattedEndDate,
      );
      return response.data.data?.salesChartResponses || [];
    },
    enabled: !!formattedStartDate && !!formattedEndDate,
  });

  const toggleWithdrawalVisibility = () => setIsWithdrawalVisible((p) => !p);

  const walletStats: WalletStat[] = useMemo(() => {
    return [
      {
        title: 'Users Purchased',
        value: convertToLocaleString(summaryData?.totalPurchases) ?? '',
        bgColor: 'blue',
        icon: <Shop />,
        bgImage: <BigShop />,
        showEye: false,
      },
      {
        title: 'Net Sales',
        value: formatNaira(summaryData?.netSales ?? 0),
        bgColor: 'lightGreen',
        icon: <WalletCardIconLightGreen />,
        bgImage: <WalletIconBigGreen />,
        showEye: true,
        isValueVisible: isWithdrawalVisible,
        onEyeToggle: toggleWithdrawalVisibility,
      },
      {
        title: 'Most Purchased',
        value: summaryData?.mostPurchased || 'N/A',
        bgColor: 'cyan',
        icon: <PurchasedIcon />,
        bgImage: <BigPurchasedIcon />,
        showEye: false,
      },
    ];
  }, [summaryData, isWithdrawalVisible]);

  if (isSummaryError) {
    return (
      <div className="flex w-full max-w-full flex-col items-center justify-center py-12">
        <div className="text-center">
          <h2 className="mb-2 text-lg font-semibold text-gray-900">
            Error Loading Sales Data
          </h2>
          <p className="mb-4 text-sm text-gray-600">
            {summaryError?.message ||
              'Unable to fetch sales summary. Please try again.'}
          </p>
          <button
            onClick={() => window.location.reload()}
            className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex w-full max-w-full flex-col gap-5 overflow-x-hidden py-6">
      <div className="grid w-full grid-cols-1 gap-4 md:grid-cols-3 md:gap-6">
        {isSummaryLoading ? (
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
        chartData={salesChartData || []}
        selectedPeriod={selectedPeriod}
        setSelectedPeriod={setSelectedPeriod}
        monthRange={monthRange}
        onMonthRangeChange={setMonthRange}
        isLoading={isChartLoading}
      />

      <TotalTransactionsTable />
    </div>
  );
}

export default SalesParent;
