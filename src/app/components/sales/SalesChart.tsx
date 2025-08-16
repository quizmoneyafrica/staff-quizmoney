'use client';

import React, { JSX, useMemo } from 'react';
import { ChartPeriodPicker } from '../ui/month-range-picker';
import { DateRange } from 'react-day-picker';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import type { TooltipProps } from 'recharts';
import type {
  ValueType,
  NameType,
} from 'recharts/types/component/DefaultTooltipContent';
import { format, isWithinInterval, startOfDay, endOfDay } from 'date-fns';
import { SalesChartResponse } from '@/app/api/salesApi';
import { formatNaira } from '@/app/utils/utils';

type SalesChartProps = {
  chartData: SalesChartResponse[];
  selectedPeriod: string;
  setSelectedPeriod: (period: string) => void;
  monthRange: DateRange | undefined;
  onMonthRangeChange: (range: DateRange | undefined) => void;
  isLoading?: boolean;
};

const formatYAxis = (tick: number): string => {
  if (tick >= 1000000) return `${tick / 1000000}M`;
  if (tick >= 1000) return `${tick / 1000}k`;
  return tick.toString();
};

const CustomTooltip: React.FC<TooltipProps<ValueType, NameType>> = ({
  active,
  payload,
}) => {
  if (active && payload && payload.length) {
    const value = Number(payload[0].value);
    const formattedValue = formatNaira(value);
    return (
      <div className="rounded-md border border-[#3A93DB] bg-white px-3 py-1 text-[#3A93DB] shadow">
        <span className="text-sm">{`${formattedValue} made`}</span>
      </div>
    );
  }
  return null;
};

const LoadingSkeleton = () => (
  <div className="animate-pulse">
    <div className="h-64 w-full rounded-md bg-gray-200"></div>
  </div>
);

const EmptyState = () => (
  <div className="flex h-64 w-full flex-col items-center justify-center text-gray-500">
    <div className="text-center">
      <p className="mb-2 text-lg font-medium">No data available</p>
      <p className="text-sm">
        Select a different time period or try again later
      </p>
    </div>
  </div>
);

export default function SalesChart({
  chartData,
  selectedPeriod,
  setSelectedPeriod,
  monthRange,
  onMonthRangeChange,
  isLoading = false,
}: SalesChartProps): JSX.Element {
  const filteredChartData = useMemo(() => {
    if (!chartData || chartData.length === 0) {
      return [];
    }

    if (!monthRange?.from || !monthRange?.to) {
      return chartData;
    }

    return chartData.filter((item) => {
      const itemDate = new Date(item.date);
      return isWithinInterval(itemDate, {
        start: startOfDay(monthRange.from!),
        end: endOfDay(monthRange.to!),
      });
    });
  }, [chartData, monthRange]);

  const formattedData = useMemo(() => {
    if (!filteredChartData || filteredChartData.length === 0) {
      return [];
    }

    return filteredChartData.map((item) => {
      const date = new Date(item.date);
      let name: string;

      if (selectedPeriod === 'Years') {
        name = format(date, 'MMM yyyy');
      } else {
        name = format(date, 'do MMM');
      }

      return {
        name,
        value: item.sales,
      };
    });
  }, [filteredChartData, selectedPeriod]);

  const yAxisMax = useMemo(() => {
    if (formattedData.length === 0) return 100000;

    const maxAmount = Math.max(...formattedData.map((item) => item.value), 0);
    return maxAmount > 0
      ? Math.ceil(maxAmount / 100000) * 100000 + 100000
      : 100000;
  }, [formattedData]);

  return (
    <div className="w-full rounded-2xl bg-white">
      <div className="mb-4 border-b border-b-[#D9D9D9] px-4 pb-3 pt-4 sm:mb-8 sm:px-8 sm:pb-5 sm:pt-8">
        <h2 className="text-xl font-bold text-[#3B3B3B] sm:text-2xl">
          Total Sales
        </h2>
        <p className="text-sm text-[#6D6D6D] sm:text-base">
          Sales generated for a specific period
        </p>
      </div>

      <div className="p-4 sm:p-8">
        <div className="rounded-xl border border-[#D9D9D9] bg-white">
          <div className="mb-4 flex flex-col justify-between border-b border-b-[#D9D9D9] p-4 pb-3 sm:mb-6 sm:flex-row sm:items-center sm:p-6 sm:pb-4">
            <span className="text-primary-900 mb-2 text-sm font-semibold sm:mb-0 sm:text-base">
              Revenue Chart
            </span>
            <ChartPeriodPicker
              period={selectedPeriod}
              onPeriodChange={setSelectedPeriod}
              range={monthRange}
              onRangeChange={onMonthRangeChange}
            />
          </div>

          {isLoading ? (
            <div className="p-4 sm:p-6">
              <LoadingSkeleton />
            </div>
          ) : formattedData.length === 0 ? (
            <div className="p-4 sm:p-6">
              <EmptyState />
            </div>
          ) : (
            <ResponsiveContainer
              width="100%"
              height={280}
              className="sm:h-[340px]"
            >
              <BarChart
                data={formattedData}
                margin={{ top: 20, right: 20, left: 10, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 12, fill: '#3B3B3B' }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tickFormatter={formatYAxis}
                  tick={{ fontSize: 12, fill: '#3B3B3B' }}
                  axisLine={false}
                  tickLine={false}
                  domain={[0, yAxisMax]}
                />
                <Tooltip
                  content={<CustomTooltip />}
                  cursor={{ fill: 'transparent' }}
                />
                <Bar
                  dataKey="value"
                  fill="#3A93DB"
                  radius={[8, 8, 8, 8]}
                  barSize={40}
                />
              </BarChart>
            </ResponsiveContainer>
          )}

          <div className="mt-2 flex justify-end p-4 sm:p-6">
            <span className="text-primary-900 text-xs font-medium sm:text-sm">
              {selectedPeriod === 'Years' ? 'Months' : 'Days'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
