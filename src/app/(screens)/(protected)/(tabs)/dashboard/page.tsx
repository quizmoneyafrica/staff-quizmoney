'use client';
import DashboardApi from '@/app/api/dashboardApi';
import DashboardCards, {
  DashboardCardsLoading,
} from '@/app/components/screens/dashboard/Cards';
import LastGameWinners from '@/app/components/screens/dashboard/LastGameWinners';
import NextLiveGame from '@/app/components/screens/dashboard/NextLiveGame';
import RecentWithdraw from '@/app/components/screens/dashboard/RecentWithdraw';
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
import { formatNaira } from '@/app/utils/utils';
import { useQuery } from '@tanstack/react-query';
import React, { useState } from 'react';
import { convertToLocaleString } from '@/app/utils';
import { useAppSelector } from '@/app/hooks/useAuth';

function Page() {
  const [showTotalAmount, setShowTotalAmount] = useState(false);
  const user = useAppSelector((s) => s.auth.userEncryptedData);

  const { data: dashboardSummary, isLoading } = useQuery({
    queryKey: ['dashboardSummary'],
    queryFn: DashboardApi.fetchDashboardSummary,
  });

  return (
    <div className="space-y-10">
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {isLoading ? (
          <DashboardCardsLoading />
        ) : (
          <DashboardCards
            bgImage={<UsersIconBig />}
            title="Total No of Users"
            bgColor="blue"
            icon={<UsersIcon />}
          >
            <p>{convertToLocaleString(dashboardSummary?.totalUsers) ?? 0}</p>
          </DashboardCards>
        )}
        {isLoading ? (
          <DashboardCardsLoading />
        ) : (
          <DashboardCards
            bgImage={<GameIconBig />}
            title="No of last game players"
            bgColor="green"
            icon={<GameIcon />}
          >
            <p>
              {convertToLocaleString(dashboardSummary?.lastGamePlayers) ?? 0}
            </p>
          </DashboardCards>
        )}

        {['SUPER_ADMIN', 'MANAGER'].includes(user?.role) && isLoading ? (
          <DashboardCardsLoading />
        ) : (
          <DashboardCards
            bgImage={<WalletIconBig />}
            title="Available Wallet Balance"
            bgColor="cyan"
            icon={<WalletCardIcon />}
          >
            <p>
              {showTotalAmount ? (
                <span>
                  {formatNaira(
                    Number(dashboardSummary?.availableWalletBalance || 0),
                    true,
                  )}
                </span>
              ) : (
                <span>********</span>
              )}
            </p>
            {showTotalAmount ? (
              <button
                className="cursor-pointer"
                type="button"
                onClick={() => setShowTotalAmount(!showTotalAmount)}
              >
                <EyeIcon />
              </button>
            ) : (
              <button
                className="cursor-pointer"
                type="button"
                onClick={() => setShowTotalAmount(!showTotalAmount)}
              >
                <EyeSlash />
              </button>
            )}
          </DashboardCards>
        )}
      </div>
      <div className="grid w-full  grid-cols-1 gap-y-10 lg:grid-cols-3 lg:gap-4">
        <LastGameWinners />
        <NextLiveGame />
      </div>
      <div className="w-full rounded-lg bg-white ">
        <RecentWithdraw />
      </div>
    </div>
  );
}

export default Page;
