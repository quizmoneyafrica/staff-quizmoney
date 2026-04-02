/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import {
  Users,
  TrendingUp,
  ShoppingBag,
  ArrowDownLeft,
  ArrowUpRight,
  Search,
  Filter,
  Download,
  ChevronLeft,
  ChevronRight,
  CreditCard,
  Activity,
  X,
  ChevronDown,
} from 'lucide-react';
import { api } from '@/app/lib/api-client';
import { formatNaira, formatDateTime, cn } from '@/app/lib/utils';
import { ROUTES } from '@/app/lib/routes';
import { Button } from '@/app/components/ui/button';

// ─── Types ────────────────────────────────────────────────────────────────────
interface SalesStats {
  users_purchased: number;
  net_sales_kobo: number;
  gross_sales_kobo: number;
  platform_revenue_kobo: number;
  total_transactions: number;
  avg_order_value_kobo: number;
  most_purchased: string;
  refunds_kobo: number;
}

interface RevenuePoint {
  label: string;
  revenue: number;
  entry_fees: number;
  purchases: number;
  deposits: number;
}

interface BreakdownPoint {
  name: string;
  value: number;
  color: string;
}

interface Transaction {
  id: string;
  player_id: string;
  username: string;
  avatar_url?: string;
  type: string;
  direction: string;
  amount: number;
  currency: string;
  status: string;
  description: string;
  metadata: Record<string, any>;
  created_at: string;
}

type ChartPeriod = 'week' | 'month' | '6months';
type ChartView = 'days' | 'weeks';

// ─── API ──────────────────────────────────────────────────────────────────────
const salesApi = {
  stats: (period: ChartPeriod) =>
    api
      .get('/api/admin/sales/stats', { params: { period } })
      .then((r) => r.data.data as SalesStats),

  revenue: (period: ChartPeriod) =>
    api
      .get('/api/admin/sales/revenue', { params: { period } })
      .then((r) => r.data.data as RevenuePoint[]),

  breakdown: (period: ChartPeriod) =>
    api
      .get('/api/admin/sales/breakdown', { params: { period } })
      .then((r) => r.data.data as BreakdownPoint[]),

  transactions: (params: {
    page: number;
    limit: number;
    search?: string;
    status?: string;
    type?: string;
    date_from?: string;
    date_to?: string;
  }) =>
    api
      .get('/api/admin/sales/transactions', { params })
      .then((r) => r.data.data),
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
const TYPE_LABELS: Record<string, string> = {
  deposit: 'Deposit',
  withdrawal: 'Withdrawal',
  entry_fee: 'Entry Fee',
  prize: 'Prize Payout',
  purchase: 'Store Purchase',
  qmcoin_redemption: 'QM Coin Redemption',
  refund: 'Refund',
  reversal: 'Reversal',
  streak_restore: 'Streak Restore',
};

const TYPE_COLORS: Record<string, string> = {
  deposit: 'bg-blue-100 text-blue-700',
  withdrawal: 'bg-orange-100 text-orange-700',
  entry_fee: 'bg-purple-100 text-purple-700',
  prize: 'bg-yellow-100 text-yellow-700',
  purchase: 'bg-green-100 text-green-700',
  qmcoin_redemption: 'bg-amber-100 text-amber-700',
  refund: 'bg-red-100 text-red-600',
  reversal: 'bg-gray-100 text-gray-600',
  streak_restore: 'bg-teal-100 text-teal-700',
};

// ─── Stat Card ────────────────────────────────────────────────────────────────
function StatCard({
  title,
  value,
  sub,
  icon,
  bg,
  iconBg,
}: {
  title: string;
  value: string;
  sub?: string;
  icon: React.ReactNode;
  bg: string;
  iconBg: string;
}) {
  return (
    <div className={`${bg} relative overflow-hidden rounded-2xl p-5`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="mb-1 text-xs font-medium opacity-75">{title}</p>
          <p className="text-xl font-bold leading-tight">{value}</p>
          {sub && <p className="mt-0.5 text-xs opacity-60">{sub}</p>}
        </div>
        <div className={`${iconBg} rounded-xl p-2.5`}>{icon}</div>
      </div>
    </div>
  );
}

// ─── Tooltip ──────────────────────────────────────────────────────────────────
function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border border-gray-100 bg-white p-3 text-xs shadow-lg">
      <p className="mb-2 font-semibold text-gray-700">{label}</p>
      {payload.map((p: any) => (
        <p
          key={p.dataKey}
          style={{ color: p.color }}
          className="flex items-center gap-1.5"
        >
          <span
            className="inline-block h-2 w-2 rounded-full"
            style={{ background: p.color }}
          />
          {p.name}: {formatNaira(p.value * 100)}
        </p>
      ))}
    </div>
  );
}

// ─── Filter Dropdown ──────────────────────────────────────────────────────────
function FilterDropdown({
  label,
  value,
  options,
  onChange,
  onClear,
}: {
  label: string;
  value: string;
  options: { value: string; label: string }[];
  onChange: (v: string) => void;
  onClear: () => void;
}) {
  const [open, setOpen] = useState(false);
  const selected = options.find((o) => o.value === value);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className={cn(
          'flex items-center gap-2 rounded-lg border px-3 py-2 text-sm transition-colors',
          value
            ? 'border-blue-500 bg-blue-50 text-blue-700'
            : 'border-gray-200 text-gray-600 hover:bg-gray-50',
        )}
      >
        {selected ? selected.label : label}
        {value ? (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onClear();
            }}
          >
            <X className="h-3.5 w-3.5" />
          </button>
        ) : (
          <ChevronDown className="h-3.5 w-3.5" />
        )}
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute left-0 top-10 z-20 min-w-[160px] overflow-hidden rounded-xl border border-gray-100 bg-white shadow-lg">
            {options.map((o) => (
              <button
                key={o.value}
                onClick={() => {
                  onChange(o.value);
                  setOpen(false);
                }}
                className={cn(
                  'w-full px-4 py-2.5 text-left text-sm transition-colors hover:bg-gray-50',
                  o.value === value
                    ? 'text-primary-800 bg-blue-50 font-medium'
                    : 'text-gray-700',
                )}
              >
                {o.label}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

// ─── Pagination ───────────────────────────────────────────────────────────────
function Pagination({
  page,
  totalPages,
  onChange,
}: {
  page: number;
  totalPages: number;
  onChange: (p: number) => void;
}) {
  const pages = (): (number | '...')[] => {
    if (totalPages <= 5)
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    if (page <= 3) return [1, 2, 3, 4, '...', totalPages];
    if (page >= totalPages - 2)
      return [
        1,
        '...',
        totalPages - 3,
        totalPages - 2,
        totalPages - 1,
        totalPages,
      ];
    return [1, '...', page - 1, page, page + 1, '...', totalPages];
  };
  return (
    <div className="flex items-center gap-1">
      <button
        onClick={() => onChange(page - 1)}
        disabled={page === 1}
        className="flex h-7 w-7 items-center justify-center rounded border border-gray-200 hover:bg-gray-50 disabled:opacity-40"
      >
        <ChevronLeft className="h-3.5 w-3.5" />
      </button>
      {pages().map((n, i) => (
        <button
          key={i}
          onClick={() => typeof n === 'number' && onChange(n)}
          disabled={n === '...'}
          className={cn(
            'flex h-7 w-7 items-center justify-center rounded text-xs font-medium transition-colors',
            n === page
              ? 'bg-primary-800 text-white'
              : n === '...'
              ? 'cursor-default text-gray-400'
              : 'border border-gray-200 text-gray-600 hover:bg-gray-50',
          )}
        >
          {n}
        </button>
      ))}
      <button
        onClick={() => onChange(page + 1)}
        disabled={page === totalPages}
        className="flex h-7 w-7 items-center justify-center rounded border border-gray-200 hover:bg-gray-50 disabled:opacity-40"
      >
        <ChevronRight className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function SalesPage() {
  const router = useRouter();

  // Chart controls
  const [period, setPeriod] = useState<ChartPeriod>('week');
  const [chartView, setChartView] = useState<ChartView>('days');
  const [periodOpen, setPeriodOpen] = useState(false);

  // Table filters
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterType, setFilterType] = useState('');
  const [filterDateFrom, setFilterDateFrom] = useState('');
  const [filterDateTo, setFilterDateTo] = useState('');
  const [filterOpen, setFilterOpen] = useState(false);
  const [page, setPage] = useState(1);

  // ── Queries ────────────────────────────────────────────────
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['sales-stats', period],
    queryFn: () => salesApi.stats(period),
    staleTime: 60_000,
  });

  const { data: revenueData = [], isLoading: chartLoading } = useQuery({
    queryKey: ['sales-revenue', period],
    queryFn: () => salesApi.revenue(period),
    staleTime: 60_000,
  });

  const { data: breakdownData = [] } = useQuery({
    queryKey: ['sales-breakdown', period],
    queryFn: () => salesApi.breakdown(period),
    staleTime: 60_000,
  });

  const { data: txData, isLoading: txLoading } = useQuery({
    queryKey: [
      'sales-transactions',
      page,
      search,
      filterStatus,
      filterType,
      filterDateFrom,
      filterDateTo,
    ],
    queryFn: () =>
      salesApi.transactions({
        page,
        limit: 20,
        search: search || undefined,
        status: filterStatus || undefined,
        type: filterType || undefined,
        date_from: filterDateFrom || undefined,
        date_to: filterDateTo || undefined,
      }),
    staleTime: 30_000,
  });

  const transactions: Transaction[] = txData?.transactions ?? [];
  const pagination = txData?.pagination;
  const totalPages = pagination
    ? Math.ceil(pagination.total / pagination.limit)
    : 1;

  const hasFilters =
    filterStatus || filterType || filterDateFrom || filterDateTo;
  const clearFilters = () => {
    setFilterStatus('');
    setFilterType('');
    setFilterDateFrom('');
    setFilterDateTo('');
  };

  // ── CSV Export ─────────────────────────────────────────────
  const exportCsv = () => {
    const rows = [
      ['Transaction ID', 'Username', 'Type', 'Amount', 'Status', 'Date'],
    ];
    transactions.forEach((t) =>
      rows.push([
        t.id,
        t.username,
        TYPE_LABELS[t.type] ?? t.type,
        formatNaira(t.amount),
        t.status,
        t.created_at,
      ]),
    );
    const csv = rows.map((r) => r.join(',')).join('\n');
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([csv]));
    a.download = 'sales.csv';
    a.click();
  };

  const periodLabel = {
    week: 'Weeks',
    month: '1 Month',
    '6months': '6 Months',
  }[period];

  return (
    <div className="space-y-6 p-6">
      <h1 className="text-2xl font-bold text-gray-900">Sales</h1>

      {/* ── Stat Cards ─────────────────────────────────────── */}
      <div className="grid grid-cols-3 gap-4">
        <StatCard
          title="Users Purchased"
          value={
            statsLoading ? '—' : (stats?.users_purchased ?? 0).toLocaleString()
          }
          icon={<Users className="text-primary-800 h-5 w-5" />}
          bg="bg-blue-50 text-blue-900"
          iconBg="bg-blue-100"
        />
        <StatCard
          title="Net Sales"
          value={statsLoading ? '—' : formatNaira(stats?.net_sales_kobo ?? 0)}
          sub="Gross income minus refunds & reversals"
          icon={<TrendingUp className="h-5 w-5 text-green-600" />}
          bg="bg-green-50 text-green-900"
          iconBg="bg-green-100"
        />
        <StatCard
          title="Most Purchased"
          value={statsLoading ? '—' : stats?.most_purchased ?? '—'}
          icon={<ShoppingBag className="h-5 w-5 text-teal-600" />}
          bg="bg-teal-50 text-teal-900"
          iconBg="bg-teal-100"
        />
      </div>

      <div className="grid grid-cols-3 gap-4">
        <StatCard
          title="Platform Revenue (30%)"
          value={
            statsLoading ? '—' : formatNaira(stats?.platform_revenue_kobo ?? 0)
          }
          sub="From entry fees"
          icon={<CreditCard className="h-5 w-5 text-purple-600" />}
          bg="bg-purple-50 text-purple-900"
          iconBg="bg-purple-100"
        />
        <StatCard
          title="Total Transactions"
          value={
            statsLoading
              ? '—'
              : (stats?.total_transactions ?? 0).toLocaleString()
          }
          icon={<Activity className="h-5 w-5 text-orange-600" />}
          bg="bg-orange-50 text-orange-900"
          iconBg="bg-orange-100"
        />
        <StatCard
          title="Avg Order Value"
          value={
            statsLoading ? '—' : formatNaira(stats?.avg_order_value_kobo ?? 0)
          }
          icon={<ArrowUpRight className="h-5 w-5 text-indigo-600" />}
          bg="bg-indigo-50 text-indigo-900"
          iconBg="bg-indigo-100"
        />
      </div>

      {/* ── Revenue Chart ───────────────────────────────────── */}
      <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-semibold text-gray-900">
              Revenue Chart
            </h2>
            <p className="mt-0.5 text-xs text-gray-500">
              Total sales generated for a specific period
            </p>
          </div>
          <div className="flex items-center gap-2">
            {/* Days/Weeks toggle */}
            <div className="flex overflow-hidden rounded-lg border border-gray-200 text-xs">
              <button
                onClick={() => setChartView('days')}
                className={cn(
                  'px-3 py-1.5 font-medium transition-colors',
                  chartView === 'days'
                    ? 'bg-primary-800 text-white'
                    : 'text-gray-600 hover:bg-gray-50',
                )}
              >
                Days
              </button>
              <button
                onClick={() => setChartView('weeks')}
                className={cn(
                  'px-3 py-1.5 font-medium transition-colors',
                  chartView === 'weeks'
                    ? 'bg-primary-800 text-white'
                    : 'text-gray-600 hover:bg-gray-50',
                )}
              >
                Weeks
              </button>
            </div>

            {/* Period selector */}
            <div className="relative">
              <button
                onClick={() => setPeriodOpen((o) => !o)}
                className="flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-1.5 text-xs text-gray-600 hover:bg-gray-50"
              >
                <Filter className="h-3.5 w-3.5" />
                {periodLabel}
                <ChevronDown className="h-3 w-3" />
              </button>
              {periodOpen && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setPeriodOpen(false)}
                  />
                  <div className="absolute right-0 top-9 z-20 w-32 overflow-hidden rounded-xl border border-gray-100 bg-white shadow-lg">
                    {(
                      [
                        ['week', 'Weeks'],
                        ['month', '1 Month'],
                        ['6months', '6 Months'],
                      ] as const
                    ).map(([v, l]) => (
                      <button
                        key={v}
                        onClick={() => {
                          setPeriod(v);
                          setPeriodOpen(false);
                        }}
                        className={cn(
                          'w-full px-4 py-2.5 text-left text-xs hover:bg-gray-50',
                          period === v
                            ? 'text-primary-800 font-medium'
                            : 'text-gray-700',
                        )}
                      >
                        {l}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {chartLoading ? (
          <div className="h-56 animate-pulse rounded-xl bg-gray-50" />
        ) : (
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={revenueData} barGap={2} barCategoryGap="30%">
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#f0f0f0"
                vertical={false}
              />
              <XAxis
                dataKey="label"
                tick={{ fontSize: 11, fill: '#9ca3af' }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 11, fill: '#9ca3af' }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v) =>
                  v >= 1_000_000
                    ? `${v / 1_000_000}M`
                    : v >= 1000
                    ? `${v / 1000}k`
                    : String(v)
                }
              />
              <Tooltip
                content={<CustomTooltip />}
                cursor={{ fill: '#f8fafc' }}
              />
              <Legend
                iconType="circle"
                iconSize={8}
                wrapperStyle={{ fontSize: 11 }}
              />
              <Bar
                dataKey="deposits"
                name="Deposits"
                fill="#3b82f6"
                radius={[4, 4, 0, 0]}
              />
              <Bar
                dataKey="entry_fees"
                name="Entry Fees"
                fill="#8b5cf6"
                radius={[4, 4, 0, 0]}
              />
              <Bar
                dataKey="purchases"
                name="Purchases"
                fill="#10b981"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* ── Revenue Breakdown + Trend ──────────────────────── */}
      <div className="grid grid-cols-2 gap-4">
        {/* Breakdown donut-like bar */}
        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
          <h2 className="mb-4 text-sm font-semibold text-gray-900">
            Revenue Breakdown
          </h2>
          <div className="space-y-3">
            {breakdownData.map((item: BreakdownPoint) => {
              const total = breakdownData.reduce(
                (s: number, i: BreakdownPoint) => s + i.value,
                0,
              );
              const pct =
                total > 0 ? Math.round((item.value / total) * 100) : 0;
              return (
                <div key={item.name}>
                  <div className="mb-1 flex items-center justify-between">
                    <span className="text-xs text-gray-600">{item.name}</span>
                    <span className="text-xs font-semibold text-gray-800">
                      {formatNaira(item.value)} ({pct}%)
                    </span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-gray-100">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{ width: `${pct}%`, background: item.color }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Revenue trend line */}
        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
          <h2 className="mb-4 text-sm font-semibold text-gray-900">
            Revenue Trend
          </h2>
          {chartLoading ? (
            <div className="h-40 animate-pulse rounded-xl bg-gray-50" />
          ) : (
            <ResponsiveContainer width="100%" height={160}>
              <LineChart data={revenueData}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#f0f0f0"
                  vertical={false}
                />
                <XAxis
                  dataKey="label"
                  tick={{ fontSize: 10, fill: '#9ca3af' }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis hide />
                <Tooltip content={<CustomTooltip />} />
                <Line
                  type="monotone"
                  dataKey="revenue"
                  name="Total Revenue"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* ── Transactions Table ──────────────────────────────── */}
      <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-100 px-5 py-4">
          <h2 className="text-sm font-semibold text-gray-900">
            Total Transactions
          </h2>
          <div className="flex flex-wrap items-center gap-2">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                placeholder="Search"
                className="w-44 rounded-lg border border-gray-200 py-2 pl-9 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Filter toggle */}
            <div className="relative">
              <button
                onClick={() => setFilterOpen((o) => !o)}
                className={cn(
                  'flex items-center gap-2 rounded-lg border px-3 py-2 text-sm transition-colors',
                  hasFilters
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-200 text-gray-600 hover:bg-gray-50',
                )}
              >
                <Filter className="h-4 w-4" />
                Filter by
                {hasFilters && (
                  <span className="bg-primary-800 flex h-4 w-4 items-center justify-center rounded-full text-xs text-white">
                    {
                      [filterStatus, filterType, filterDateFrom].filter(Boolean)
                        .length
                    }
                  </span>
                )}
              </button>

              {filterOpen && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setFilterOpen(false)}
                  />
                  <div className="absolute right-0 top-10 z-20 w-72 space-y-3 rounded-2xl border border-gray-100 bg-white p-4 shadow-xl">
                    <div className="mb-1 flex items-center justify-between">
                      <p className="text-sm font-semibold text-gray-800">
                        Filters
                      </p>
                      {hasFilters && (
                        <button
                          onClick={clearFilters}
                          className="text-xs text-red-500 hover:underline"
                        >
                          Clear all
                        </button>
                      )}
                    </div>

                    {/* Status */}
                    <div>
                      <label className="mb-1 block text-xs font-medium text-gray-600">
                        Status
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {['success', 'pending', 'failed'].map((s) => (
                          <button
                            key={s}
                            onClick={() =>
                              setFilterStatus(filterStatus === s ? '' : s)
                            }
                            className={cn(
                              'rounded-full border px-3 py-1 text-xs capitalize transition-colors',
                              filterStatus === s
                                ? 'border-blue-500 bg-blue-50 text-blue-700'
                                : 'border-gray-200 text-gray-600 hover:bg-gray-50',
                            )}
                          >
                            {s}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Transaction Type */}
                    <div>
                      <label className="mb-1 block text-xs font-medium text-gray-600">
                        Transaction Type
                      </label>
                      <select
                        value={filterType}
                        onChange={(e) => setFilterType(e.target.value)}
                        className="w-full rounded-lg border border-gray-200 px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">All Types</option>
                        {Object.entries(TYPE_LABELS).map(([v, l]) => (
                          <option key={v} value={v}>
                            {l}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Date range */}
                    <div>
                      <label className="mb-1 block text-xs font-medium text-gray-600">
                        Date Range
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        <input
                          type="date"
                          value={filterDateFrom}
                          onChange={(e) => setFilterDateFrom(e.target.value)}
                          className="rounded-lg border border-gray-200 px-2 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <input
                          type="date"
                          value={filterDateTo}
                          onChange={(e) => setFilterDateTo(e.target.value)}
                          className="rounded-lg border border-gray-200 px-2 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>

                    <button
                      onClick={() => setFilterOpen(false)}
                      className="w-full rounded-lg bg-blue-700 py-2 text-sm font-medium text-white hover:bg-blue-800"
                    >
                      Apply Filters
                    </button>
                  </div>
                </>
              )}
            </div>

            {/* Export */}
            <Button onClick={exportCsv} className="text-sm">
              <Download className="h-4 w-4" /> Export
            </Button>
          </div>
        </div>

        {/* Active filter pills */}
        {hasFilters && (
          <div className="flex flex-wrap items-center gap-2 border-b border-gray-50 px-5 py-2">
            {filterStatus && (
              <span className="flex items-center gap-1 rounded-full bg-blue-50 px-2.5 py-1 text-xs text-blue-700">
                Status: {filterStatus}
                <button onClick={() => setFilterStatus('')}>
                  <X className="h-3 w-3" />
                </button>
              </span>
            )}
            {filterType && (
              <span className="flex items-center gap-1 rounded-full bg-blue-50 px-2.5 py-1 text-xs text-blue-700">
                {TYPE_LABELS[filterType]}
                <button onClick={() => setFilterType('')}>
                  <X className="h-3 w-3" />
                </button>
              </span>
            )}
            {filterDateFrom && (
              <span className="flex items-center gap-1 rounded-full bg-blue-50 px-2.5 py-1 text-xs text-blue-700">
                From: {filterDateFrom}
                <button onClick={() => setFilterDateFrom('')}>
                  <X className="h-3 w-3" />
                </button>
              </span>
            )}
            {filterDateTo && (
              <span className="flex items-center gap-1 rounded-full bg-blue-50 px-2.5 py-1 text-xs text-blue-700">
                To: {filterDateTo}
                <button onClick={() => setFilterDateTo('')}>
                  <X className="h-3 w-3" />
                </button>
              </span>
            )}
          </div>
        )}

        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 text-left text-xs uppercase tracking-wide text-gray-500">
              <th className="px-5 py-3 font-medium">Transaction ID</th>
              <th className="px-5 py-3 font-medium">Username</th>
              <th className="px-5 py-3 font-medium">Transaction Type</th>
              <th className="px-5 py-3 font-medium">Amount</th>
              <th className="px-5 py-3 font-medium">Transaction Status</th>
              <th className="px-5 py-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {txLoading ? (
              Array.from({ length: 8 }).map((_, i) => (
                <tr key={i}>
                  {Array.from({ length: 6 }).map((_, j) => (
                    <td key={j} className="px-5 py-4">
                      <div className="h-4 animate-pulse rounded bg-gray-100" />
                    </td>
                  ))}
                </tr>
              ))
            ) : transactions.length === 0 ? (
              <tr>
                <td
                  colSpan={6}
                  className="py-14 text-center text-sm text-gray-400"
                >
                  No transactions found
                </td>
              </tr>
            ) : (
              transactions.map((tx) => (
                <tr key={tx.id} className="hover:bg-gray-50">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2">
                      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-gray-100">
                        {tx.direction === 'credit' ? (
                          <ArrowDownLeft className="h-3.5 w-3.5 text-green-500" />
                        ) : (
                          <ArrowUpRight className="h-3.5 w-3.5 text-red-500" />
                        )}
                      </div>
                      <div>
                        <p className="font-mono text-xs font-medium text-gray-700">
                          {'ID' +
                            tx.id.replace(/-/g, '').slice(0, 7).toUpperCase()}
                        </p>
                        <p className="text-xs text-gray-400">
                          {formatDateTime(tx.created_at)}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2">
                      <div className="to-primary-800 flex h-7 w-7 shrink-0 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-blue-400 text-xs font-bold text-white">
                        {tx.avatar_url ? (
                          <img
                            src={tx.avatar_url}
                            alt=""
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          tx.username?.[0]?.toUpperCase() ?? '?'
                        )}
                      </div>
                      <span className="text-primary-800 text-sm font-medium">
                        {tx.username ?? '—'}
                      </span>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <span
                      className={cn(
                        'inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium',
                        TYPE_COLORS[tx.type] ?? 'bg-gray-100 text-gray-600',
                      )}
                    >
                      {TYPE_LABELS[tx.type] ?? tx.type}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <span
                      className={cn(
                        'text-sm font-semibold',
                        tx.direction === 'credit'
                          ? 'text-green-600'
                          : 'text-red-500',
                      )}
                    >
                      {tx.direction === 'credit' ? '+' : '-'}
                      {formatNaira(tx.amount)}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <span
                      className={cn(
                        'inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium',
                        tx.status === 'success'
                          ? 'bg-green-100 text-green-700'
                          : tx.status === 'pending'
                          ? 'bg-yellow-100 text-yellow-700'
                          : 'bg-red-100 text-red-600',
                      )}
                    >
                      {tx.status === 'success'
                        ? 'Successful'
                        : tx.status === 'pending'
                        ? 'Pending'
                        : 'Failed'}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() =>
                        router.push(ROUTES.PLAYER_PROFILE(tx.player_id))
                      }
                      className="text-primary-800 whitespace-nowrap text-xs shadow-none"
                    >
                      View profile
                    </Button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {pagination && (
          <div className="flex items-center justify-between border-t border-gray-100 px-5 py-3">
            <p className="text-xs text-gray-500">
              Showing {(page - 1) * 20 + 1} to{' '}
              {Math.min(page * 20, pagination.total)} of{' '}
              {pagination.total.toLocaleString()} entries
            </p>
            <Pagination
              page={page}
              totalPages={totalPages}
              onChange={setPage}
            />
          </div>
        )}
      </div>
    </div>
  );
}
