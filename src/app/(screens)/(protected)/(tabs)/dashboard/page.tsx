/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useState } from 'react';
import { useAuthStore } from '@/app/lib/auth-store';
import { useDashboardStats, useBasicDashboardStats } from '@/app/lib/queries';
import { hasPermission } from '@/app/lib/permissions';
import { formatNaira } from '@/app/lib/utils';
import LastGameWinners from '@/app/components/screens/dashboard/LastGameWinners';
import NextLiveGame from '@/app/components/screens/dashboard/NextLiveGame';
import RecentWithdraw from '@/app/components/screens/dashboard/RecentWithdraw';
import StatCard from '@/app/components/screens/dashboard/Cards';
import {
  EyeIcon,
  EyeSlash,
  GameIcon,
  GameIconBig,
  UsersIcon,
  UsersIconBig,
  WalletCardIcon,
  WalletIconBig,
} from '@/app/icons/icons';
export default function DashboardPage() {
  const [showBalance, setShowBalance] = useState(false);
  const user = useAuthStore((s) => s.user);
  const canSeeFull = user ? hasPermission(user.role, 'dashboard.full') : false;

  const fullQuery = useDashboardStats();
  const basicQuery = useBasicDashboardStats();

  const { data, isLoading } = canSeeFull ? fullQuery : basicQuery;

  const totalPlayers = data?.players?.total ?? 0;
  const lastGamePlayers = data?.games?.recent?.[0]?.total_players ?? 0;
  const totalDeposits =
    canSeeFull && 'revenue' in (data ?? {})
      ? (data as any).revenue?.total_deposits_kobo ?? 0
      : null;

  return (
    <div className="space-y-8">
      {/* Stat Cards */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <StatCard
          bgImage={<UsersIconBig />}
          title="Total Users"
          icon={<UsersIcon />}
          bgColor="blue"
          loading={isLoading}
        >
          <p className="text-primary-900 text-2xl font-bold">
            {totalPlayers.toLocaleString()}
          </p>
        </StatCard>

        <StatCard
          bgImage={<GameIconBig />}
          title="Last Game Players"
          icon={<GameIcon />}
          bgColor="green"
          loading={isLoading}
        >
          <p className="text-positive-900 text-2xl font-bold">
            {lastGamePlayers.toLocaleString()}
          </p>
        </StatCard>

        {canSeeFull && (
          <StatCard
            bgImage={<WalletIconBig />}
            title="Total Deposits"
            icon={<WalletCardIcon />}
            bgColor="cyan"
            loading={isLoading}
            action={
              <button
                type="button"
                onClick={() => setShowBalance((v) => !v)}
                className="cursor-pointer text-neutral-400 hover:text-neutral-600"
              >
                {showBalance ? <EyeIcon /> : <EyeSlash />}
              </button>
            }
          >
            <p className="text-secondary-900 text-2xl font-bold">
              {showBalance ? formatNaira(totalDeposits ?? 0) : '₦ ••••••'}
            </p>
          </StatCard>
        )}
      </div>

      {/* Middle row */}
      <div className="grid w-full grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="lg:col-span-1">
          <LastGameWinners />
        </div>
        <div className="lg:col-span-2">
          <NextLiveGame />
        </div>
      </div>

      {/* Recent Withdrawals */}
      <div className="w-full rounded-xl bg-white">
        <RecentWithdraw />
      </div>
    </div>
  );
}

// ─── Stat Card ────────────────────────────────────────────────

// interface StatCardProps {
//   title: string
//   icon: React.ReactNode
//   bgColor: string
//   loading: boolean
//   children: React.ReactNode
//   action?: React.ReactNode
// }

// function StatCard({ title, icon, bgColor, loading, children, action }: StatCardProps) {
//   if (loading) {
//     return <div className="h-28 w-full animate-pulse rounded-xl bg-neutral-200" />
//   }

//   return (
//     <div className="flex items-center justify-between rounded-xl bg-white p-5 shadow-sm">
//       <div className="space-y-1">
//         <p className="text-sm text-neutral-500">{title}</p>
//         {children}
//       </div>
//       <div className="flex flex-col items-end gap-2">
//         <div className={`${bgColor} rounded-full p-3`}>{icon}</div>
//         {action}
//       </div>
//     </div>
//   )
// }
