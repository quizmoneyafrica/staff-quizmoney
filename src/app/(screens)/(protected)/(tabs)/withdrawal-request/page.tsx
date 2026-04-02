'use client';

import { useState } from 'react';
import { useWithdrawals, useWithdrawalSummary } from '@/app/lib/queries';
import { hasPermission } from '@/app/lib/permissions';
import { useAuthStore } from '@/app/lib/auth-store';
import { Search, SlidersHorizontal } from 'lucide-react';
import { DropdownMenu } from 'radix-ui';
import type { WithdrawalRequest, WithdrawalStatus } from '@/app/lib/types';
import WithdrawalTable from '@/app/components/screens/withdrawal/WithdrawalTable';
import WithdrawalDetailModal from '@/app/components/screens/withdrawal/WithdrawalDetailModal';

const STATUS_FILTERS: { label: string; value: WithdrawalStatus | 'all' }[] = [
  { label: 'All', value: 'all' },
  { label: 'Pending', value: 'pending' },
  { label: 'Approved', value: 'approved' },
  { label: 'Processing', value: 'processing' },
  { label: 'Rejected', value: 'rejected' },
];

export default function WithdrawalRequestPage() {
  const user = useAuthStore((s) => s.user);
  const canWrite = user ? hasPermission(user.role, 'withdrawals.write') : false;

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<WithdrawalStatus | 'all'>(
    'all',
  );
  const [selected, setSelected] = useState<WithdrawalRequest | null>(null);

  const { data, isLoading } = useWithdrawals({
    page,
    limit: 10,
    status: statusFilter === 'all' ? undefined : statusFilter,
  });
  const { data: summary, isLoading: summaryLoading } = useWithdrawalSummary();

  const withdrawals = data?.withdrawals ?? [];
  const pagination = data?.pagination;

  // Stat cards data — derived from current filter context
  const total =
    summary?.pending +
    summary?.approved +
    summary?.processing +
    summary?.rejected;

  return (
    <>
      <div className="space-y-6">
        {/* Stat Cards */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <StatCard
            title="All Withdrawal Requests"
            value={total || 0}
            trend="+10% This week"
            trendUp
            color="blue"
            loading={summaryLoading}
          />
          <StatCard
            title="Total Approved Requests"
            value={summary?.approved ?? 0}
            trend="-10% This week"
            trendUp={false}
            color="green"
            loading={summaryLoading}
          />
          <StatCard
            title="Total Pending Request"
            value={summary?.pending ?? 0}
            trend="+10% This week"
            trendUp
            color="orange"
            loading={summaryLoading}
            isAmount
          />
        </div>

        {/* Table Card */}
        <div className="rounded-xl bg-white">
          {/* Table Header */}
          <div className="flex flex-col gap-3 border-b border-neutral-100 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="font-heading text-base font-medium text-neutral-800">
              Recent Withdrawal Request
            </p>

            <div className="flex items-center gap-3">
              {/* Search */}
              <div className="relative">
                <Search
                  size={14}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400"
                />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search"
                  className="focus:border-primary-400 h-9 w-48 rounded-lg border border-neutral-200 bg-neutral-50 pl-8 pr-3 text-sm outline-none focus:bg-white"
                />
              </div>

              {/* Status Filter */}
              <DropdownMenu.Root>
                <DropdownMenu.Trigger asChild>
                  <button className="flex h-9 items-center gap-2 rounded-lg border border-neutral-200 bg-neutral-50 px-3 text-sm text-neutral-600 transition-colors hover:bg-neutral-100">
                    <SlidersHorizontal size={14} />
                    Filter by
                  </button>
                </DropdownMenu.Trigger>
                <DropdownMenu.Portal>
                  <DropdownMenu.Content
                    className="DropdownMenuContent"
                    sideOffset={4}
                  >
                    {STATUS_FILTERS.map((f) => (
                      <DropdownMenu.Item
                        key={f.value}
                        className={`DropdownMenuItem ${
                          statusFilter === f.value ? 'font-semibold' : ''
                        }`}
                        onSelect={() => {
                          setStatusFilter(f.value);
                          setPage(1);
                        }}
                      >
                        {f.label}
                      </DropdownMenu.Item>
                    ))}
                  </DropdownMenu.Content>
                </DropdownMenu.Portal>
              </DropdownMenu.Root>

              {/* Active filter badge */}
              {statusFilter !== 'all' && (
                <span className="bg-primary-100 text-primary-800 rounded-full px-2.5 py-0.5 text-xs font-medium capitalize">
                  {statusFilter}
                  <button
                    onClick={() => setStatusFilter('all')}
                    className="ml-1.5 opacity-60 hover:opacity-100"
                  >
                    ×
                  </button>
                </span>
              )}
            </div>
          </div>

          {/* Loading skeleton */}
          {isLoading ? (
            <div className="space-y-3 p-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <div
                  key={i}
                  className="h-12 animate-pulse rounded-lg bg-neutral-100"
                />
              ))}
            </div>
          ) : (
            <WithdrawalTable
              withdrawals={withdrawals}
              onViewDetails={(w) => setSelected(w)}
              pagination={
                pagination
                  ? {
                      page,
                      totalPages: pagination.total_pages,
                      total: pagination.total,
                      onPageChange: setPage,
                    }
                  : undefined
              }
            />
          )}

          {/* Footer count */}
          {!isLoading && withdrawals.length > 0 && pagination && (
            <div className="border-t border-neutral-100 px-6 py-3">
              <p className="text-xs text-neutral-400">
                Showing {(page - 1) * 10 + 1} to{' '}
                {Math.min(page * 10, pagination.total)} of{' '}
                {pagination.total.toLocaleString()} entries
              </p>
            </div>
          )}
        </div>
      </div>

      <WithdrawalDetailModal
        withdrawal={selected}
        open={!!selected}
        onOpenChange={(open) => {
          if (!open) setSelected(null);
        }}
      />
    </>
  );
}

// ─── Stat Card ────────────────────────────────────────────────

const COLOR_MAP = {
  blue: {
    bg: 'bg-primary-50',
    text: 'text-primary-900',
    icon: 'text-primary-600',
    iconBg: 'bg-primary-100',
  },
  green: {
    bg: 'bg-positive-50',
    text: 'text-positive-900',
    icon: 'text-positive-600',
    iconBg: 'bg-positive-100',
  },
  orange: {
    bg: 'bg-warning-50',
    text: 'text-warning-900',
    icon: 'text-warning-600',
    iconBg: 'bg-warning-100',
  },
};

function StatCard({
  title,
  value,
  trend,
  trendUp,
  color,
  loading,
  isAmount,
}: {
  title: string;
  value: number | string;
  trend: string;
  trendUp: boolean;
  color: 'blue' | 'green' | 'orange';
  loading: boolean;
  isAmount?: boolean;
}) {
  const c = COLOR_MAP[color];

  if (loading) {
    return <div className={`h-28 animate-pulse rounded-xl ${c.bg}`} />;
  }

  return (
    <div className={`relative overflow-hidden rounded-xl ${c.bg} p-5`}>
      <div className={`${c.iconBg} mb-3 inline-flex rounded-lg p-2`}>
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className={c.icon}
        >
          <rect x="2" y="5" width="20" height="14" rx="2" />
          <line x1="2" y1="10" x2="22" y2="10" />
        </svg>
      </div>
      <p className="text-sm font-medium text-neutral-600">{title}</p>
      <p className={`mt-1 text-2xl font-black ${c.text}`}>
        {typeof value === 'number' ? value.toLocaleString() : value}
      </p>
      <p
        className={`mt-1 text-xs font-medium ${
          trendUp ? 'text-positive-700' : 'text-error-600'
        }`}
      >
        {trendUp ? '↑' : '↓'} {trend}
      </p>
      {/* decorative circle */}
      <div
        className={`absolute -right-4 -top-4 h-20 w-20 rounded-full opacity-20 ${c.iconBg}`}
      />
    </div>
  );
}
