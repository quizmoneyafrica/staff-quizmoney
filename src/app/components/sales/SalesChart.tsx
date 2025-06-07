'use client';
import React, { JSX, useState } from 'react';
import TimeRangeDropdown from '../common/TimeRangeDropdown';
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

// Data type definition
type SalesData = {
  name: string;
  value: number;
};

const data: SalesData[] = [
  { name: 'Monday', value: 600000 },
  { name: 'Tuesday', value: 100000 },
  { name: 'Wednesday', value: 75000 },
  { name: 'Thursday', value: 1000000 },
  { name: 'Friday', value: 400000 },
  { name: 'Saturday', value: 300000 },
  { name: 'Sunday', value: 50000 },
];

// Y-axis tick formatter
const formatYAxis = (tick: number): string => {
  if (tick >= 1000000) return `${tick / 1000000}M`;
  if (tick >= 1000) return `${tick / 1000}k`;
  return tick.toString();
};

// Custom Tooltip with proper TypeScript types
const CustomTooltip: React.FC<TooltipProps<ValueType, NameType>> = ({
  active,
  payload,
}) => {
  if (active && payload && payload.length) {
    const value = Number(payload[0].value);
    let label = '';
    if (value >= 1000000) label = `${value / 1000000}M made`;
    else if (value >= 1000) label = `${value / 1000}k made`;
    else label = `${value} made`;

    return (
      <div className="rounded-md border border-[#3A93DB] bg-white px-3 py-1 text-[#3A93DB] shadow">
        <span className="text-sm">{label}</span>
      </div>
    );
  }
  return null;
};

export default function TotalSalesCard(): JSX.Element {
  const periodOptions = ['Weeks', 'Months', 'Years'];
  const [selectedPeriod, setSelectedPeriod] = useState(periodOptions[0]);

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

            <TimeRangeDropdown
              options={periodOptions}
              selected={selectedPeriod}
              onSelect={setSelectedPeriod}
            />
          </div>

          <ResponsiveContainer
            width="100%"
            height={280}
            className="sm:h-[340px]"
          >
            <BarChart
              data={data}
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
                domain={[0, 1000000]}
                ticks={[
                  0, 100000, 200000, 300000, 400000, 500000, 600000, 700000,
                  800000, 900000, 1000000,
                ]}
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
                className="sm:barSize-60"
              />
            </BarChart>
          </ResponsiveContainer>

          <div className="mt-2 flex justify-end p-4 sm:p-6">
            <span className="text-primary-900 text-xs font-medium sm:text-sm">
              Days
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
