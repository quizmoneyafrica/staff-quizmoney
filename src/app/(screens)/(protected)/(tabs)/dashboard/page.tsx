'use client';
import DashboardApi from '@/app/api/dashboardApi';
import { getAuthUser } from '@/app/api/userApi';
import DashboardCards, {
  DashboardCardsLoading,
} from '@/app/components/screens/dashboard/Cards';
import LastGameWinners from '@/app/components/screens/dashboard/LastGameWinners';
import NextLiveGame from '@/app/components/screens/dashboard/NextLiveGame';
import RecentWithdraw from '@/app/components/screens/dashboard/RecentWithdraw';
import { useAppDispatch, useAppSelector } from '@/app/hooks/useAuth';
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
import { setDashboardDetails } from '@/app/store/dashboardSlice';
import { formatNaira } from '@/app/utils/utils';
import React, { useCallback, useState } from 'react';
import { toast } from 'sonner';

function Page() {
  const user = getAuthUser();
  const dispatch = useAppDispatch();
  const [fetchingDashData, setFetchingDashData] = useState(false);
  const { noOfUsers, lastGamePlayers, availableWalletBalance } = useAppSelector(
    (state) => state.dashboard,
  );
  const [showTotalAmount, setShowTotalAmount] = useState(false);

  const fetchDashboardData = useCallback(async () => {
    if (noOfUsers && lastGamePlayers && availableWalletBalance) return;
    setFetchingDashData(true);
    try {
      const res = await DashboardApi.fetchDashboardDetails(user.objectId);
      dispatch(setDashboardDetails(res.data.result));
      setFetchingDashData(false);
    } catch {
      toast.error('Error loading Dashboard Details, please refresh');
      setFetchingDashData(false);
    }
  }, [
    availableWalletBalance,
    dispatch,
    lastGamePlayers,
    noOfUsers,
    user.objectId,
  ]);

  React.useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  return (
    <div className="space-y-10">
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {fetchingDashData ? (
          <DashboardCardsLoading />
        ) : (
          <DashboardCards
            bgImage={<UsersIconBig />}
            title="Total No of Users"
            bgColor="blue"
            icon={<UsersIcon />}
          >
            <p>{noOfUsers}</p>
          </DashboardCards>
        )}
        {fetchingDashData ? (
          <DashboardCardsLoading />
        ) : (
          <DashboardCards
            bgImage={<GameIconBig />}
            title="No of last game players"
            bgColor="green"
            icon={<GameIcon />}
          >
            <p>{lastGamePlayers}</p>
          </DashboardCards>
        )}
        {fetchingDashData ? (
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
                <span>{formatNaira(Number(availableWalletBalance), true)}</span>
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
