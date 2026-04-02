/* eslint-disable @next/next/no-img-element */
'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import {
  Users,
  Gift,
  Clock,
  CheckCircle2,
  XCircle,
  Search,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  ArrowUpDown,
  BadgeCheck,
  Share2,
  Award,
  RefreshCw,
} from 'lucide-react';
import { api } from '@/app/lib/api-client';
import { formatDateTime } from '@/app/lib/utils';
import { ROUTES } from '@/app/lib/routes';
import { Button } from '@/app/components/ui/button';

// ── Types ─────────────────────────────────────────────────────────────────────

type ReferralStatus = 'pending' | 'rewarded' | 'expired' | 'all';
type SortField = 'created_at' | 'rewarded_at' | 'status';
type SortDir = 'asc' | 'desc';

interface ReferralRow {
  id: string;
  status: string;
  created_at: string;
  rewarded_at: string | null;
  referrer: {
    id: string;
    username: string;
    avatar_url: string | null;
    email: string;
    referral_code: string;
  };
  referee: {
    id: string;
    username: string;
    avatar_url: string | null;
    email: string;
    email_verified: boolean;
    created_at: string;
  };
}

interface ReferralStats {
  total: number;
  rewarded: number;
  pending: number;
  expired: number;
  top_referrers: TopReferrer[];
}

interface TopReferrer {
  player_id: string;
  username: string;
  avatar_url: string | null;
  referral_code: string;
  total_referrals: number;
  rewarded_referrals: number;
}

interface ReferralListData {
  referrals: ReferralRow[];
  total: number;
  page: number;
  limit: number;
  stats: ReferralStats;
}

// ── API Hooks ─────────────────────────────────────────────────────────────────

function useReferrals(params: {
  page: number;
  limit: number;
  status: ReferralStatus;
  search: string;
  sort_by: SortField;
  sort_dir: SortDir;
}) {
  return useQuery({
    queryKey: ['referrals', params],
    queryFn: async (): Promise<ReferralListData> => {
      const res = await api.get('/api/admin/referrals', { params });
      return res.data.data;
    },
    staleTime: 60_000,
    placeholderData: (prev) => prev,
  });
}

// ── Helpers ───────────────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<
  string,
  { label: string; color: string; icon: React.ReactNode }
> = {
  rewarded: {
    label: 'Rewarded',
    color: 'bg-emerald-100 text-emerald-700',
    icon: <CheckCircle2 className="h-3 w-3" />,
  },
  pending: {
    label: 'Pending',
    color: 'bg-amber-100 text-amber-700',
    icon: <Clock className="h-3 w-3" />,
  },
  expired: {
    label: 'Expired',
    color: 'bg-red-100 text-red-700',
    icon: <XCircle className="h-3 w-3" />,
  },
};

function StatusBadge({ status }: { status: string }) {
  const cfg = STATUS_CONFIG[status] ?? {
    label: status,
    color: 'bg-gray-100 text-gray-600',
    icon: null,
  };
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${cfg.color}`}
    >
      {cfg.icon}
      {cfg.label}
    </span>
  );
}

function Avatar({
  url,
  username,
  size = 8,
}: {
  url?: string | null;
  username: string;
  size?: number;
}) {
  const initials = username.slice(0, 2).toUpperCase();
  const sizeClass = `w-${size} h-${size}`;
  if (url) {
    return (
      <img
        src={url}
        alt={username}
        className={`${sizeClass} shrink-0 rounded-full object-cover`}
      />
    );
  }
  return (
    <div
      className={`${sizeClass} flex shrink-0 items-center justify-center rounded-full bg-[#CCFF00]/20`}
    >
      <span className="text-xs font-bold text-[#CCFF00]">{initials}</span>
    </div>
  );
}

function StatCard({
  label,
  value,
  icon,
  color,
  sub,
}: {
  label: string;
  value: number | string;
  icon: React.ReactNode;
  color: string;
  sub?: string;
}) {
  return (
    <div className="border-primary-100 bg-primary-50 flex items-start gap-4 rounded-2xl p-5">
      <div
        className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${color}`}
      >
        {icon}
      </div>
      <div>
        <p className="text-primary-800 text-xs font-medium">{label}</p>
        <p className="text-primary-500 mt-0.5 text-2xl font-bold">{value}</p>
        {sub && <p className="text-primary-500 mt-0.5 text-xs">{sub}</p>}
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function ReferralsPage() {
  const router = useRouter();

  const [page, setPage] = useState(1);
  const [status, setStatus] = useState<ReferralStatus>('all');
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [sortBy, setSortBy] = useState<SortField>('created_at');
  const [sortDir, setSortDir] = useState<SortDir>('desc');
  const [activeTab, setActiveTab] = useState<'referrals' | 'top-referrers'>(
    'referrals',
  );

  const LIMIT = 20;

  const { data, isLoading, isFetching, isError, refetch } = useReferrals({
    page,
    limit: LIMIT,
    status,
    search,
    sort_by: sortBy,
    sort_dir: sortDir,
  });

  const totalPages = data ? Math.ceil(data.total / LIMIT) : 0;
  const stats = data?.stats;

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    setSearch(searchInput.trim());
    setPage(1);
  }

  function handleStatusFilter(s: ReferralStatus) {
    setStatus(s);
    setPage(1);
  }

  function handleSort(field: SortField) {
    if (sortBy === field) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortBy(field);
      setSortDir('desc');
    }
    setPage(1);
  }

  function SortButton({ field, label }: { field: SortField; label: string }) {
    const active = sortBy === field;
    return (
      <button
        onClick={() => handleSort(field)}
        className={`flex items-center gap-1 text-xs font-semibold transition-colors ${
          active ? 'text-primary-500' : 'text-gray-500'
        }`}
      >
        {label}
        <ArrowUpDown
          className={`h-3 w-3 ${active ? 'opacity-100' : 'opacity-40'}`}
        />
      </button>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="mx-auto max-w-7xl space-y-8 px-4 py-8 sm:px-6 lg:px-8">
        {/* ── Header ── */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-primary-50 flex h-9 w-9 items-center justify-center rounded-xl">
              <Share2 className="text-primary-500 h-5 w-5" />
            </div>
            <p className="text-primary-700 mt-1 text-sm">
              Track player referrals and reward activity
            </p>
          </div>
          <Button
            size="sm"
            onClick={() => refetch()}
            className="flex items-center gap-2 rounded-xl px-4 py-2 text-sm transition-all"
          >
            <RefreshCw
              className={`h-4 w-4 ${isFetching ? 'animate-spin' : ''}`}
            />
            Refresh
          </Button>
        </div>

        {/* ── Stats ── */}
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          <StatCard
            label="Total Referrals"
            value={stats?.total ?? '—'}
            icon={<Users className="h-5 w-5 text-white" />}
            color="bg-primary-800"
          />
          <StatCard
            label="Rewarded"
            value={stats?.rewarded ?? '—'}
            icon={<Gift className="h-5 w-5 text-white" />}
            color="bg-primary-800"
            sub={
              stats?.total
                ? `${Math.round(
                    (stats.rewarded / stats.total) * 100,
                  )}% conversion`
                : undefined
            }
          />
          <StatCard
            label="Pending"
            value={stats?.pending ?? '—'}
            icon={<Clock className="h-5 w-5 text-white" />}
            color="bg-primary-800"
          />
          <StatCard
            label="Expired"
            value={stats?.expired ?? '—'}
            icon={<XCircle className="h-5 w-5 text-white" />}
            color="bg-primary-800"
          />
        </div>

        {/* ── Tabs ── */}
        <div className="flex w-fit gap-1 rounded-xl bg-white/5 p-1">
          {(['referrals', 'top-referrers'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`rounded-lg px-5 py-2 text-sm font-medium transition-all ${
                activeTab === tab
                  ? 'bg-primary-800 text-white'
                  : 'hover:bg-primary-50 text-neutral-500'
              }`}
            >
              {tab === 'referrals' ? 'All Referrals' : 'Top Referrers'}
            </button>
          ))}
        </div>

        {/* ── Referrals Tab ── */}
        {activeTab === 'referrals' && (
          <div className="space-y-4">
            {/* Filters Row */}
            <div className="flex flex-col gap-3 sm:flex-row">
              {/* Search */}
              <form onSubmit={handleSearch} className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-500" />
                  <input
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    placeholder="Search username, email, referral code…"
                    className="caret-primary-600 focus:border-primary-500 w-full rounded-xl border border-neutral-200 bg-white py-2.5 pl-9 pr-4 text-sm text-black placeholder-neutral-500 transition-colors focus:outline-none"
                  />
                </div>
              </form>

              {/* Status filter */}
              <div className="flex items-center gap-1 rounded-xl border border-neutral-200 bg-white p-1">
                {(
                  ['all', 'pending', 'rewarded', 'expired'] as ReferralStatus[]
                ).map((s) => (
                  <button
                    key={s}
                    onClick={() => handleStatusFilter(s)}
                    className={`rounded-lg px-3 py-1.5 text-xs font-medium capitalize transition-all ${
                      status === s
                        ? 'bg-primary-800 text-white'
                        : 'hover:bg-primary-50 text-neutral-500'
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {/* Table */}
            <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-100 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                      <th className="px-5 py-3.5 text-left">
                        <span>Referrer</span>
                      </th>
                      <th className="px-5 py-3.5 text-left">
                        <span>Referee</span>
                      </th>
                      <th className="px-5 py-3.5 text-left">
                        <span>Code Used</span>
                      </th>
                      <th className="px-5 py-3.5 text-left">
                        <SortButton field="status" label="Status" />
                      </th>
                      <th className="px-5 py-3.5 text-left">
                        <SortButton field="created_at" label="Referred On" />
                      </th>
                      <th className="px-5 py-3.5 text-left">
                        <SortButton field="rewarded_at" label="Rewarded On" />
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {isLoading ? (
                      Array.from({ length: 6 }).map((_, i) => (
                        <td key={i} className="px-5 py-3.5">
                          <div className="h-4 animate-pulse rounded bg-gray-100" />
                        </td>
                      ))
                    ) : isError ? (
                      <tr>
                        <td colSpan={6} className="px-5 py-16 text-center">
                          <div className="flex flex-col items-center gap-3 text-gray-400">
                            <XCircle className="mx-auto mb-2 h-10 w-10" />
                            <p className="text-sm">Failed to load referrals</p>
                            <Button
                              size="sm"
                              onClick={() => refetch()}
                              className="text-xs"
                            >
                              Retry
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ) : !data?.referrals.length ? (
                      <tr>
                        <td colSpan={6} className="px-5 py-16 text-center">
                          <div className="flex flex-col items-center gap-3 text-gray-400">
                            <Share2 className="h-8 w-8" />
                            <p className="text-sm">No referrals found</p>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      data.referrals.map((row) => (
                        <tr
                          key={row.id}
                          className="text-neutral-600 transition-colors hover:bg-gray-50"
                        >
                          {/* Referrer */}
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-3">
                              <Avatar
                                url={row.referrer.avatar_url}
                                username={row.referrer.username}
                              />
                              <div>
                                <button
                                  onClick={() =>
                                    router.push(
                                      ROUTES.PLAYER_PROFILE(row.referrer.id),
                                    )
                                  }
                                  className="flex items-center gap-1 text-sm font-medium text-white transition-colors hover:text-[#CCFF00]"
                                >
                                  @{row.referrer.username}
                                  <ExternalLink className="h-3 w-3 opacity-0 transition-opacity group-hover:opacity-60" />
                                </button>
                                <p className="mt-0.5 text-xs text-white/30">
                                  {row.referrer.email}
                                </p>
                              </div>
                            </div>
                          </td>

                          {/* Referee */}
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-3">
                              <Avatar
                                url={row.referee.avatar_url}
                                username={row.referee.username}
                              />
                              <div>
                                <button
                                  onClick={() =>
                                    router.push(
                                      ROUTES.PLAYER_PROFILE(row.referee.id),
                                    )
                                  }
                                  className="flex items-center gap-1 text-sm font-medium text-white transition-colors hover:text-[#CCFF00]"
                                >
                                  @{row.referee.username}
                                  <ExternalLink className="h-3 w-3 opacity-0 transition-opacity group-hover:opacity-60" />
                                </button>
                                <div className="mt-0.5 flex items-center gap-1.5">
                                  <p className="text-xs text-white/30">
                                    {row.referee.email}
                                  </p>
                                  {row.referee.email_verified && (
                                    <BadgeCheck className="h-3 w-3 text-[#CCFF00]/70" />
                                  )}
                                </div>
                              </div>
                            </div>
                          </td>

                          {/* Referral Code */}
                          <td className="px-5 py-4">
                            <code className="rounded-md bg-white/5 px-2 py-1 font-mono text-xs text-[#CCFF00]/80">
                              {row.referrer.referral_code}
                            </code>
                          </td>

                          {/* Status */}
                          <td className="px-5 py-4">
                            <StatusBadge status={row.status} />
                          </td>

                          {/* Referred On */}
                          <td className="px-5 py-4">
                            <span className="text-xs text-white/50">
                              {formatDateTime(row.created_at)}
                            </span>
                          </td>

                          {/* Rewarded On */}
                          <td className="px-5 py-4">
                            {row.rewarded_at ? (
                              <span className="text-xs text-emerald-400/70">
                                {formatDateTime(row.rewarded_at)}
                              </span>
                            ) : (
                              <span className="text-xs text-white/20">—</span>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between border-t border-white/5 px-5 py-4">
                  <span className="text-xs text-white/30">
                    {data?.total} referrals · Page {page} of {totalPages}
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={page === 1}
                      className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/5 transition-all hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-30"
                    >
                      <ChevronLeft className="h-4 w-4 text-white/60" />
                    </button>

                    {/* Page pills */}
                    {Array.from({ length: Math.min(5, totalPages) }).map(
                      (_, i) => {
                        let pageNum: number;
                        if (totalPages <= 5) {
                          pageNum = i + 1;
                        } else if (page <= 3) {
                          pageNum = i + 1;
                        } else if (page >= totalPages - 2) {
                          pageNum = totalPages - 4 + i;
                        } else {
                          pageNum = page - 2 + i;
                        }
                        return (
                          <button
                            key={pageNum}
                            onClick={() => setPage(pageNum)}
                            className={`flex h-8 w-8 items-center justify-center rounded-lg text-xs font-medium transition-all ${
                              page === pageNum
                                ? 'bg-[#CCFF00] text-black'
                                : 'bg-white/5 text-white/50 hover:bg-white/10'
                            }`}
                          >
                            {pageNum}
                          </button>
                        );
                      },
                    )}

                    <button
                      onClick={() =>
                        setPage((p) => Math.min(totalPages, p + 1))
                      }
                      disabled={page === totalPages}
                      className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/5 transition-all hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-30"
                    >
                      <ChevronRight className="h-4 w-4 text-white/60" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── Top Referrers Tab ── */}
        {activeTab === 'top-referrers' && (
          <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
            {isLoading ? (
              <div className="space-y-4 p-5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div
                    key={i}
                    className="flex animate-pulse items-center gap-4 "
                  >
                    <div className="h-8 w-8 shrink-0 rounded-full bg-gray-100" />
                    <div className="h-10 w-10 shrink-0 rounded-full bg-gray-100" />
                    <div className="flex-1 space-y-2">
                      <div className="h-3 w-32 rounded bg-gray-100" />
                      <div className="h-2.5 w-20 rounded bg-gray-100" />
                    </div>
                    <div className="h-5 w-16 rounded bg-gray-100" />
                    <div className="h-5 w-20 rounded bg-gray-100" />
                  </div>
                ))}
              </div>
            ) : !stats?.top_referrers.length ? (
              <div className="flex flex-col items-center gap-3 py-10 text-gray-400">
                <Award className="h-8 w-8" />
                <p className="text-sm">No referral data yet</p>
              </div>
            ) : (
              <>
                <div className="border-b border-white/5 px-5 py-4">
                  <p className="text-xs font-semibold text-white/50">
                    Top {stats.top_referrers.length} Referrers
                  </p>
                </div>
                <div className="divide-y divide-white/5">
                  {stats.top_referrers.map((r, i) => {
                    const conversionRate =
                      r.total_referrals > 0
                        ? Math.round(
                            (r.rewarded_referrals / r.total_referrals) * 100,
                          )
                        : 0;
                    return (
                      <div
                        key={r.player_id}
                        className="hover:bg-white/2 flex items-center gap-4 px-5 py-4 transition-colors"
                      >
                        {/* Rank */}
                        <div
                          className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-xs font-bold ${
                            i === 0
                              ? 'bg-yellow-400/20 text-yellow-400'
                              : i === 1
                              ? 'bg-gray-300/20 text-gray-300'
                              : i === 2
                              ? 'bg-orange-400/20 text-orange-400'
                              : 'bg-white/5 text-white/40'
                          }`}
                        >
                          {i + 1}
                        </div>

                        {/* Avatar */}
                        <Avatar
                          url={r.avatar_url}
                          username={r.username}
                          size={10}
                        />

                        {/* Info */}
                        <div className="min-w-0 flex-1">
                          <button
                            onClick={() =>
                              router.push(ROUTES.PLAYER_PROFILE(r.player_id))
                            }
                            className="flex items-center gap-1 text-sm font-medium text-white transition-colors hover:text-[#CCFF00]"
                          >
                            @{r.username}
                            <ExternalLink className="h-3 w-3 opacity-60" />
                          </button>
                          <code className="mt-0.5 block font-mono text-xs text-[#CCFF00]/60">
                            {r.referral_code}
                          </code>
                        </div>

                        {/* Stats */}
                        <div className="flex shrink-0 items-center gap-6">
                          <div className="text-right">
                            <p className="text-sm font-bold text-white">
                              {r.total_referrals}
                            </p>
                            <p className="text-xs text-white/30">total</p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-bold text-emerald-400">
                              {r.rewarded_referrals}
                            </p>
                            <p className="text-xs text-white/30">rewarded</p>
                          </div>
                          <div className="text-right">
                            {/* Conversion bar */}
                            <div className="w-20">
                              <div className="mb-1 flex justify-between">
                                <span className="text-xs text-white/40">
                                  {conversionRate}%
                                </span>
                              </div>
                              <div className="h-1.5 overflow-hidden rounded-full bg-white/10">
                                <div
                                  className="h-full rounded-full bg-[#CCFF00] transition-all"
                                  style={{ width: `${conversionRate}%` }}
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
