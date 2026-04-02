/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  Users,
  History,
  Settings,
  Search,
  Filter,
  Download,
  ChevronLeft,
  ChevronRight,
  X,
  Minus,
  Plus,
  RefreshCw,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { api } from '@/app/lib/api-client';
import { formatDateTime, cn } from '@/app/lib/utils';
import { ROUTES } from '@/app/lib/routes';
import { QmCoinIcon } from '@/app/icons/icons';

// ─── Types ────────────────────────────────────────────────────────────────────
interface QmCoinStats {
  total_earned: number;
  total_redeemed: number;
}
interface QmCoinSettings {
  id: string;
  tier1_coins: number;
  tier1_free_games: number;
  tier1_erasers: number;
  tier2_coins: number;
  tier2_free_games: number;
  tier2_erasers: number;
  participation_target_pct: number;
  max_monthly_redemption: number;
}
interface SettingsHistory {
  id: string;
  admin_username: string;
  action: string;
  created_at: string;
}
interface UserWithCoins {
  player_id: string;
  username: string;
  avatar_url?: string;
  email: string;
  current_balance: number;
  total_earned: number;
  last_transaction: string;
}
interface Redemption {
  id: string;
  player_id: string;
  username: string;
  avatar_url?: string;
  coins_spent: number;
  amount_paid: string;
  free_games: number;
  erasers: number;
  status: 'success' | 'failed';
  created_at: string;
}

// ─── API calls ────────────────────────────────────────────────────────────────
const qmApi = {
  stats: () =>
    api.get('/api/admin/qmcoins/stats').then((r) => r.data.data as QmCoinStats),
  users: (p: any) =>
    api.get('/api/admin/qmcoins/users', { params: p }).then((r) => r.data.data),
  redemptions: (p: any) =>
    api
      .get('/api/admin/qmcoins/redemptions', { params: p })
      .then((r) => r.data.data),
  settings: () =>
    api.get('/api/admin/qmcoins/settings').then(
      (r) =>
        r.data.data as {
          settings: QmCoinSettings;
          history: SettingsHistory[];
        },
    ),
  updateConversion: (body: any) =>
    api.patch('/api/admin/qmcoins/settings/conversion-rate', body),
  updateParticipation: (body: any) =>
    api.patch('/api/admin/qmcoins/settings/participation-target', body),
  updateMaxRedemption: (body: any) =>
    api.patch('/api/admin/qmcoins/settings/max-redemption', body),
  adjustBalance: (playerId: string, body: any) =>
    api.post(`/api/admin/qmcoins/users/${playerId}/adjust`, body),
};

// ─── Coin icon ────────────────────────────────────────────────────────────────
function CoinIcon({ size = 16 }: { size?: number }) {
  return (
    <span style={{ fontSize: size }} className="inline-block leading-none">
      🪙
    </span>
  );
}

// ─── Stat Card ────────────────────────────────────────────────────────────────
function StatCard({
  title,
  value,
  sub,
  bg,
  icon,
}: {
  title: string;
  value: string;
  sub?: string | React.ReactNode;
  bg: string;
  icon: React.ReactNode;
}) {
  return (
    <div className={`${bg} flex items-start gap-4 rounded-2xl p-5`}>
      <div className="rounded-xl bg-white/30 p-2.5">{icon}</div>
      <div>
        <p className="mb-0.5 text-xs font-medium opacity-80">{title}</p>
        <p className="text-2xl font-bold">{value}</p>
        {sub && <div className="mt-0.5 text-xs opacity-70">{sub}</div>}
      </div>
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
              ? 'bg-blue-600 text-white'
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

// ─── Adjust Balance Modal ─────────────────────────────────────────────────────
function AdjustBalanceModal({
  player,
  onClose,
}: {
  player: UserWithCoins;
  onClose: () => void;
}) {
  const qc = useQueryClient();
  const [mode, setMode] = useState<'add' | 'subtract'>('add');
  const [amount, setAmount] = useState('');
  const [reason, setReason] = useState('');

  const mut = useMutation({
    mutationFn: () =>
      qmApi.adjustBalance(player.player_id, {
        adjustment: mode === 'add' ? Number(amount) : -Number(amount),
        reason,
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['qmcoin-users'] });
      qc.invalidateQueries({ queryKey: ['qmcoin-stats'] });
      toast.success('Balance adjusted');
      onClose();
    },
    onError: () => toast.error('Adjustment failed'),
  });

  const canSubmit = amount && Number(amount) > 0 && reason.trim();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
          <div>
            <h3 className="font-semibold text-gray-900">Adjust Balance</h3>
            <p className="mt-0.5 text-xs text-gray-500">{player.username}</p>
          </div>
          <button onClick={onClose}>
            <X className="h-5 w-5 text-gray-400" />
          </button>
        </div>
        <div className="space-y-4 p-6">
          {/* Current balance */}
          <div className="flex items-center gap-2 rounded-xl bg-blue-50 p-3">
            <QmCoinIcon />
            <span className="text-sm font-medium text-blue-700">
              Current: {player.current_balance.toLocaleString()} QMC
            </span>
          </div>

          {/* Mode toggle */}
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => setMode('add')}
              className={cn(
                'flex items-center justify-center gap-2 rounded-xl border-2 py-2.5 text-sm font-medium transition-colors',
                mode === 'add'
                  ? 'border-green-500 bg-green-50 text-green-700'
                  : 'border-gray-200 text-gray-600 hover:bg-gray-50',
              )}
            >
              <Plus className="h-4 w-4" /> Add Coins
            </button>
            <button
              onClick={() => setMode('subtract')}
              className={cn(
                'flex items-center justify-center gap-2 rounded-xl border-2 py-2.5 text-sm font-medium transition-colors',
                mode === 'subtract'
                  ? 'border-red-500 bg-red-50 text-red-700'
                  : 'border-gray-200 text-gray-600 hover:bg-gray-50',
              )}
            >
              <Minus className="h-4 w-4" /> Subtract Coins
            </button>
          </div>

          {/* Amount */}
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Amount (QMC)
            </label>
            <input
              type="number"
              min="1"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Enter amount"
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Reason */}
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Reason
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Enter reason for adjustment..."
              rows={3}
              className="w-full resize-none rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
        <div className="px-6 pb-6">
          <button
            onClick={() => mut.mutate()}
            disabled={!canSubmit || mut.isPending}
            className={cn(
              'w-full rounded-lg py-2.5 text-sm font-medium text-white disabled:opacity-50',
              mode === 'add'
                ? 'bg-green-600 hover:bg-green-700'
                : 'bg-red-500 hover:bg-red-600',
            )}
          >
            {mut.isPending
              ? 'Saving…'
              : `${mode === 'add' ? 'Add' : 'Subtract'} ${amount || '0'} QMC`}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Tab: Users with Coins ────────────────────────────────────────────────────
function UsersTab() {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [adjustPlayer, setAdjustPlayer] = useState<UserWithCoins | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['qmcoin-users', page, search],
    queryFn: () =>
      qmApi.users({ page, limit: 20, search: search || undefined }),
    staleTime: 30_000,
  });

  const users: UserWithCoins[] = data?.users ?? [];
  const pagination = data?.pagination;
  const totalPages = pagination
    ? Math.ceil(pagination.total / pagination.limit)
    : 1;

  const exportCsv = () => {
    const rows = [
      [
        'User ID',
        'Username',
        'Email',
        'Current Balance',
        'Total Earned',
        'Last Transaction',
      ],
    ];
    users.forEach((u) =>
      rows.push([
        u.player_id,
        u.username,
        u.email,
        String(u.current_balance),
        String(u.total_earned),
        u.last_transaction,
      ]),
    );
    const csv = rows.map((r) => r.join(',')).join('\n');
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([csv]));
    a.download = 'qmcoin_users.csv';
    a.click();
  };

  return (
    <>
      <div className="mb-4 flex items-center gap-3">
        <div className="relative max-w-xs flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Search Users"
            className="w-full rounded-lg border border-gray-200 py-2 pl-9 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <button className="flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-600 hover:bg-gray-50">
          <Filter className="h-4 w-4" /> Filter by
        </button>
        <button
          onClick={exportCsv}
          className="ml-auto flex items-center gap-2 rounded-lg bg-blue-700 px-4 py-2 text-sm font-medium text-white hover:bg-blue-800"
        >
          <Download className="h-4 w-4" /> Export
        </button>
      </div>

      <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 text-left text-xs uppercase tracking-wide text-gray-500">
              <th className="px-5 py-3 font-medium">User ID</th>
              <th className="px-5 py-3 font-medium">Users</th>
              <th className="px-5 py-3 font-medium">Current Balance</th>
              <th className="px-5 py-3 font-medium">Total Earned</th>
              <th className="px-5 py-3 font-medium">Last Transaction</th>
              <th className="px-5 py-3 font-medium"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {isLoading ? (
              Array.from({ length: 7 }).map((_, i) => (
                <tr key={i}>
                  {Array.from({ length: 6 }).map((_, j) => (
                    <td key={j} className="px-5 py-4">
                      <div className="h-4 animate-pulse rounded bg-gray-100" />
                    </td>
                  ))}
                </tr>
              ))
            ) : users.length === 0 ? (
              <tr>
                <td
                  colSpan={6}
                  className="py-14 text-center text-sm text-gray-400"
                >
                  No users found
                </td>
              </tr>
            ) : (
              users.map((u) => (
                <tr key={u.player_id} className="hover:bg-gray-50">
                  <td className="px-5 py-4 font-mono text-xs text-gray-500">
                    {'ID' +
                      u.player_id.replace(/-/g, '').slice(0, 7).toUpperCase()}
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2.5">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-blue-400 to-blue-600 text-xs font-bold text-white">
                        {u.avatar_url ? (
                          <img
                            src={u.avatar_url}
                            alt=""
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          u.username?.[0]?.toUpperCase()
                        )}
                      </div>
                      <span className="text-sm font-medium text-blue-600">
                        {u.username}
                      </span>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <span className="flex items-center gap-1 text-sm font-medium text-gray-700">
                      <QmCoinIcon /> {u.current_balance.toLocaleString()}coin
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <span className="flex items-center gap-1 text-sm font-medium text-amber-600">
                      <QmCoinIcon /> {u.total_earned.toLocaleString()}coin
                    </span>
                  </td>
                  <td className="px-5 py-4 text-sm text-gray-500">
                    {formatDateTime(u.last_transaction)}
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() =>
                          router.push(ROUTES.PLAYER_PROFILE(u.player_id))
                        }
                        className="rounded-lg bg-blue-700 px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-800"
                      >
                        View Profile
                      </button>
                      <div className="group relative">
                        <button className="flex h-7 w-7 items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100">
                          <span className="text-lg leading-none">⋮</span>
                        </button>
                        <div className="absolute right-0 top-8 z-10 hidden w-36 overflow-hidden rounded-xl border border-gray-100 bg-white shadow-lg group-focus-within:block">
                          <button
                            onClick={() =>
                              router.push(ROUTES.PLAYER_PROFILE(u.player_id))
                            }
                            className="w-full px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-gray-50"
                          >
                            View Profile
                          </button>
                          <button
                            onClick={() => setAdjustPlayer(u)}
                            className="w-full px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-gray-50"
                          >
                            Adjust Balance
                          </button>
                        </div>
                      </div>
                    </div>
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

      {adjustPlayer && (
        <AdjustBalanceModal
          player={adjustPlayer}
          onClose={() => setAdjustPlayer(null)}
        />
      )}
    </>
  );
}

// ─── Tab: Redemption History ──────────────────────────────────────────────────
function RedemptionTab() {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ['qmcoin-redemptions', page, search],
    queryFn: () =>
      qmApi.redemptions({ page, limit: 20, search: search || undefined }),
    staleTime: 30_000,
  });

  const redemptions: Redemption[] = data?.redemptions ?? [];
  const pagination = data?.pagination;
  const totalPages = pagination
    ? Math.ceil(pagination.total / pagination.limit)
    : 1;

  const exportCsv = () => {
    const rows = [
      [
        'Transaction ID',
        'Username',
        'Coin Redeemed',
        'Amount Paid',
        'Date',
        'Status',
      ],
    ];
    redemptions.forEach((r) =>
      rows.push([
        r.id,
        r.username,
        String(r.coins_spent),
        r.amount_paid,
        r.created_at,
        r.status,
      ]),
    );
    const csv = rows.map((r) => r.join(',')).join('\n');
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([csv]));
    a.download = 'redemptions.csv';
    a.click();
  };

  return (
    <>
      <div className="mb-4 flex items-center gap-3">
        <div className="relative max-w-xs flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Search by Users name, Transaction..."
            className="w-full rounded-lg border border-gray-200 py-2 pl-9 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <button className="flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-600 hover:bg-gray-50">
          <Filter className="h-4 w-4" /> Filter by
        </button>
        <button
          onClick={exportCsv}
          className="ml-auto flex items-center gap-2 rounded-lg bg-blue-700 px-4 py-2 text-sm font-medium text-white hover:bg-blue-800"
        >
          <Download className="h-4 w-4" /> Export
        </button>
      </div>

      <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 text-left text-xs uppercase tracking-wide text-gray-500">
              <th className="px-5 py-3 font-medium">Transaction ID</th>
              <th className="px-5 py-3 font-medium">Users</th>
              <th className="px-5 py-3 font-medium">Coin Redeemed</th>
              <th className="px-5 py-3 font-medium">Amount Paid</th>
              <th className="px-5 py-3 font-medium">Last Transaction</th>
              <th className="px-5 py-3 font-medium">Status</th>
              <th className="px-5 py-3 font-medium">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {isLoading ? (
              Array.from({ length: 7 }).map((_, i) => (
                <tr key={i}>
                  {Array.from({ length: 7 }).map((_, j) => (
                    <td key={j} className="px-5 py-4">
                      <div className="h-4 animate-pulse rounded bg-gray-100" />
                    </td>
                  ))}
                </tr>
              ))
            ) : redemptions.length === 0 ? (
              <tr>
                <td
                  colSpan={7}
                  className="py-14 text-center text-sm text-gray-400"
                >
                  No redemptions found
                </td>
              </tr>
            ) : (
              redemptions.map((r) => (
                <tr key={r.id} className="hover:bg-gray-50">
                  <td className="px-5 py-4 font-mono text-xs text-gray-500">
                    {'ID' + r.id.replace(/-/g, '').slice(0, 7).toUpperCase()}
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2.5">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-blue-400 to-blue-600 text-xs font-bold text-white">
                        {r.avatar_url ? (
                          <img
                            src={r.avatar_url}
                            alt=""
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          r.username?.[0]?.toUpperCase()
                        )}
                      </div>
                      <span className="text-sm font-medium text-blue-600">
                        {r.username}
                      </span>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <span className="flex items-center gap-1 text-sm font-medium text-amber-600">
                      <QmCoinIcon /> {r.coins_spent.toLocaleString()}coin
                    </span>
                  </td>
                  <td className="px-5 py-4 text-sm text-gray-700">
                    {r.amount_paid}
                  </td>
                  <td className="px-5 py-4 text-sm text-gray-500">
                    {formatDateTime(r.created_at)}
                  </td>
                  <td className="px-5 py-4">
                    <span
                      className={cn(
                        'inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium',
                        r.status === 'success'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-red-100 text-red-600',
                      )}
                    >
                      {r.status === 'success' ? 'Successful' : 'Failed'}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <button className="flex h-7 w-7 items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100">
                      <span className="text-lg leading-none">⋮</span>
                    </button>
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
    </>
  );
}

// ─── Tab: Settings ────────────────────────────────────────────────────────────
function SettingsTab() {
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['qmcoin-settings'],
    queryFn: qmApi.settings,
    staleTime: 60_000,
  });

  const settings: QmCoinSettings | undefined = data?.settings;
  const history: SettingsHistory[] = data?.history ?? [];

  // Local form state — initialised from settings
  const [t1Coins, setT1Coins] = useState('');
  const [t1Games, setT1Games] = useState('');
  const [t1Erasers, setT1Erasers] = useState('');
  const [t2Coins, setT2Coins] = useState('');
  const [t2Games, setT2Games] = useState('');
  const [t2Erasers, setT2Erasers] = useState('');
  const [partPct, setPartPct] = useState('');
  const [maxRedeem, setMaxRedeem] = useState('');

  // Pre-fill once settings load
  const [prefilled, setPrefilled] = useState(false);
  if (settings && !prefilled) {
    setT1Coins(String(settings.tier1_coins));
    setT1Games(String(settings.tier1_free_games));
    setT1Erasers(String(settings.tier1_erasers));
    setT2Coins(String(settings.tier2_coins));
    setT2Games(String(settings.tier2_free_games));
    setT2Erasers(String(settings.tier2_erasers));
    setPartPct(String(settings.participation_target_pct));
    setMaxRedeem(String(settings.max_monthly_redemption));
    setPrefilled(true);
  }

  const invalidate = () =>
    qc.invalidateQueries({ queryKey: ['qmcoin-settings'] });

  const convMut = useMutation({
    mutationFn: () =>
      qmApi.updateConversion({
        tier1_coins: Number(t1Coins),
        tier1_free_games: Number(t1Games),
        tier1_erasers: Number(t1Erasers),
        tier2_coins: Number(t2Coins),
        tier2_free_games: Number(t2Games),
        tier2_erasers: Number(t2Erasers),
      }),
    onSuccess: () => {
      invalidate();
      toast.success('Conversion rate updated');
    },
    onError: () => toast.error('Failed to update'),
  });

  const partMut = useMutation({
    mutationFn: () =>
      qmApi.updateParticipation({ participation_target_pct: Number(partPct) }),
    onSuccess: () => {
      invalidate();
      toast.success('Participation target updated');
    },
    onError: () => toast.error('Failed to update'),
  });

  const maxMut = useMutation({
    mutationFn: () =>
      qmApi.updateMaxRedemption({ max_monthly_redemption: Number(maxRedeem) }),
    onSuccess: () => {
      invalidate();
      toast.success('Max redemption updated');
    },
    onError: () => toast.error('Failed to update'),
  });

  if (isLoading)
    return (
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-40 animate-pulse rounded-2xl bg-gray-100" />
        ))}
      </div>
    );

  const inputCls =
    'w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500';
  const labelCls = 'block text-sm font-medium text-gray-700 mb-1';
  const saveBtnCls =
    'bg-blue-700 text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-blue-800 disabled:opacity-50';
  const sectionCls =
    'bg-white rounded-2xl border border-gray-100 shadow-sm p-6';

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-base font-semibold text-gray-900">
          QM Coin settings
        </h2>
        <p className="mt-0.5 text-xs text-gray-500">
          Manage all QM coin Configuration
        </p>
      </div>

      {/* Conversion rate */}
      <div className={sectionCls}>
        <div className="mb-1 flex items-center gap-2">
          <h3 className="text-sm font-semibold text-gray-800">
            Set Conversion rate
          </h3>
          <span className="text-xs text-gray-500">
            ({t1Coins} = {t1Games} free game & {t1Erasers} eraser) &nbsp;&nbsp;
            ({t2Coins} = {t2Games} free game & {t2Erasers} eraser)
          </span>
        </div>
        <div className="mt-4 grid grid-cols-3 gap-3">
          <div>
            <label className={labelCls}>Enter Points (Tier 1)</label>
            <input
              type="number"
              value={t1Coins}
              onChange={(e) => setT1Coins(e.target.value)}
              className={inputCls}
              placeholder="e.g. 1500"
            />
          </div>
          <div>
            <label className={labelCls}>Free Game</label>
            <select
              value={t1Games}
              onChange={(e) => setT1Games(e.target.value)}
              className={inputCls}
            >
              {[1, 2, 3, 4, 5].map((n) => (
                <option key={n} value={n}>
                  {n} free game{n > 1 ? 's' : ''}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelCls}>Free Eraser</label>
            <select
              value={t1Erasers}
              onChange={(e) => setT1Erasers(e.target.value)}
              className={inputCls}
            >
              {[1, 2, 3, 4, 5].map((n) => (
                <option key={n} value={n}>
                  {n} eraser{n > 1 ? 's' : ''}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelCls}>Enter Points (Tier 2)</label>
            <input
              type="number"
              value={t2Coins}
              onChange={(e) => setT2Coins(e.target.value)}
              className={inputCls}
              placeholder="e.g. 3000"
            />
          </div>
          <div>
            <label className={labelCls}>Free Game</label>
            <select
              value={t2Games}
              onChange={(e) => setT2Games(e.target.value)}
              className={inputCls}
            >
              {[1, 2, 3, 4, 5].map((n) => (
                <option key={n} value={n}>
                  {n} free game{n > 1 ? 's' : ''}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelCls}>Free Eraser</label>
            <select
              value={t2Erasers}
              onChange={(e) => setT2Erasers(e.target.value)}
              className={inputCls}
            >
              {[1, 2, 3, 4, 5].map((n) => (
                <option key={n} value={n}>
                  {n} eraser{n > 1 ? 's' : ''}
                </option>
              ))}
            </select>
          </div>
        </div>
        <button
          onClick={() => convMut.mutate()}
          disabled={convMut.isPending}
          className={`${saveBtnCls} mt-4`}
        >
          {convMut.isPending ? 'Saving…' : 'Save Changes'}
        </button>
      </div>

      {/* Participation target */}
      <div className={sectionCls}>
        <h3 className="mb-0.5 text-sm font-semibold text-gray-800">
          Set Monthly Game participation Target
        </h3>
        <p className="mb-4 text-xs text-red-500">
          User must complete {partPct || settings?.participation_target_pct}% of
          games in a month to redeem QM coin.
        </p>
        <div className="max-w-xs">
          <label className={labelCls}>Target Percentage</label>
          <input
            type="number"
            min="1"
            max="100"
            value={partPct}
            onChange={(e) => setPartPct(e.target.value)}
            className={inputCls}
            placeholder="Enter percentage"
          />
        </div>
        <button
          onClick={() => partMut.mutate()}
          disabled={partMut.isPending}
          className={`${saveBtnCls} mt-4`}
        >
          {partMut.isPending ? 'Saving…' : 'Save Changes'}
        </button>
      </div>

      {/* Max monthly redemption */}
      <div className={sectionCls}>
        <h3 className="mb-4 text-sm font-semibold text-gray-800">
          Max Coins Redeemable per User (Monthly)
        </h3>
        <div className="max-w-xs">
          <label className={labelCls}>Maximum Coin</label>
          <input
            type="number"
            min="1"
            value={maxRedeem}
            onChange={(e) => setMaxRedeem(e.target.value)}
            className={inputCls}
            placeholder="Enter Maximum Coin"
          />
        </div>
        <button
          onClick={() => maxMut.mutate()}
          disabled={maxMut.isPending}
          className={`${saveBtnCls} mt-4`}
        >
          {maxMut.isPending ? 'Saving…' : 'Save Changes'}
        </button>
      </div>

      {/* Settings history */}
      <div className={sectionCls}>
        <h3 className="mb-4 text-sm font-semibold text-gray-800">
          Settings Change History
        </h3>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 text-left text-xs uppercase tracking-wide text-gray-500">
              <th className="pb-2 font-medium">Date</th>
              <th className="pb-2 font-medium">Admin</th>
              <th className="pb-2 font-medium">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {history.length === 0 ? (
              <tr>
                <td
                  colSpan={3}
                  className="py-6 text-center text-xs text-gray-400"
                >
                  No changes yet
                </td>
              </tr>
            ) : (
              history.map((h) => (
                <tr key={h.id}>
                  <td className="py-2.5 text-gray-500">
                    {formatDateTime(h.created_at)}
                  </td>
                  <td className="py-2.5 text-gray-700">{h.admin_username}</td>
                  <td className="py-2.5 text-gray-600">{h.action}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
type Tab = 'users' | 'redemptions' | 'settings';

export default function QmCoinsPage() {
  const [tab, setTab] = useState<Tab>('users');

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['qmcoin-stats'],
    queryFn: qmApi.stats,
    staleTime: 60_000,
  });

  const { data: settingsData } = useQuery({
    queryKey: ['qmcoin-settings'],
    queryFn: qmApi.settings,
    staleTime: 60_000,
  });
  const settings = settingsData?.settings;

  const tabs: { key: Tab; label: string; icon: React.ReactNode }[] = [
    {
      key: 'users',
      label: 'Users with Coins',
      icon: <Users className="h-4 w-4" />,
    },
    {
      key: 'redemptions',
      label: 'Redemption History',
      icon: <History className="h-4 w-4" />,
    },
    {
      key: 'settings',
      label: 'Settings',
      icon: <Settings className="h-4 w-4" />,
    },
  ];

  return (
    <div className="space-y-6 p-6">
      <h1 className="text-2xl font-bold text-gray-900">QM Coins</h1>

      {/* Stat cards */}
      <div className="grid grid-cols-3 gap-4">
        <StatCard
          title="Total Earned Coin"
          value={
            statsLoading
              ? '—'
              : `${(stats?.total_earned ?? 0).toLocaleString()} QM`
          }
          bg="bg-blue-50 text-blue-800"
          icon={<QmCoinIcon />}
        />
        <StatCard
          title="Total Redeemed"
          value={
            statsLoading
              ? '—'
              : `${(stats?.total_redeemed ?? 0).toLocaleString()} QM`
          }
          bg="bg-blue-50 text-blue-800"
          icon={<QmCoinIcon />}
        />
        <StatCard
          title="Conversion rate"
          value=""
          bg="bg-pink-50 text-pink-800"
          icon={<RefreshCw className="h-5 w-5 text-pink-500" />}
          sub={
            settings ? (
              <span>
                {settings.tier1_coins} = {settings.tier1_free_games} free game &{' '}
                {settings.tier1_erasers} eraser
                <br />
                {settings.tier2_coins} = {settings.tier2_free_games} free game &{' '}
                {settings.tier2_erasers} eraser
              </span>
            ) : (
              '—'
            )
          }
        />
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <div className="flex gap-6">
          {tabs.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={cn(
                '-mb-px flex items-center gap-2 border-b-2 pb-3 text-sm font-medium transition-colors',
                tab === t.key
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700',
              )}
            >
              {t.icon} {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab content */}
      {tab === 'users' && <UsersTab />}
      {tab === 'redemptions' && <RedemptionTab />}
      {tab === 'settings' && <SettingsTab />}
    </div>
  );
}
