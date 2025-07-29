'use client';

import * as React from 'react';
import { motion } from 'framer-motion';
import { useAppDispatch, useAppSelector } from '@/app/hooks/useAuth';
import LeaderboardAPI from '@/app/api/leaderboardApi';
import { toast } from 'sonner';
import Link from 'next/link';
import { setLastGameLeaderboard } from '@/app/store/leaderboardSlice';
import { Avatar } from '@radix-ui/themes';
import { formatNaira } from '@/app/utils/utils';

const LastGameWinners: React.FunctionComponent = () => {
  const dispatch = useAppDispatch();
  const { lastGame } = useAppSelector((state) => state.leaderboard);
  const [fetching, setFetching] = React.useState(false);

  const fetchLastGameWinners = React.useCallback(async () => {
    if (lastGame.length > 0) return;
    setFetching(true);
    try {
      const res = await LeaderboardAPI.getLastGameLeaderboardAdmin(1, 5, '');

      const transformedData = res.data.result.data.map((ranking) => ({
        position: ranking.position,
        prize: ranking.prize,
        coins: ranking.coins,

        totalTime: '0',
        totalCorrect: 0,

        user: {
          ...ranking.user,
          noOfGamesPlayed: ranking.noOfGamesPlayed,
          facebook: '',
          twitter: '',
          instagram: '',
        },
      }));

      dispatch(setLastGameLeaderboard(transformedData));
    } catch (error) {
      console.error('Failed to fetch last game winners:', error);
      toast.error('Error loading Last Game Winners, please refresh');
    } finally {
      setFetching(false);
    }
  }, [dispatch, lastGame]);

  React.useEffect(() => {
    fetchLastGameWinners();
  }, [fetchLastGameWinners]);

  if (fetching) {
    return (
      <motion.div
        layout
        className="h-[323px] w-full animate-pulse rounded-lg bg-neutral-300 p-4 lg:col-span-1"
      ></motion.div>
    );
  }

  return (
    <motion.div className="order-2 h-[323px] w-full rounded-lg bg-white p-4 lg:order-1 lg:col-span-1">
      <div className="flex items-center justify-between">
        <p>Last Game Winners</p>
        <Link
          href="/leaderboard"
          className="font-heading text-secondary-900 underline"
        >
          Show all
        </Link>
      </div>

      <div className="mt-3 space-y-4">
        {lastGame.slice(0, 5).map((item, index) => {
          return (
            <UserTable
              key={index}
              num={item.position}
              image={item.user.avatar}
              name={item.user.firstName}
              amount={item.prize}
            />
          );
        })}
      </div>
    </motion.div>
  );
};

export default LastGameWinners;

interface UserTableProp {
  num: number;
  image: string | null;
  name: string;
  amount: number;
}
const UserTable: React.FunctionComponent<UserTableProp> = ({
  num,
  image,
  name,
  amount,
}) => {
  return (
    <div className="grid grid-cols-2 items-center">
      <div className="flex items-center gap-2 overflow-clip">
        <p className="font-heading text-neutral-900">{num}</p>
        <div className="bg-primary-50 flex h-[40px] w-[40px] items-center justify-center rounded-full">
          <Avatar
            src={image || undefined}
            fallback={name?.charAt(0).toUpperCase()}
            radius="full"
            className="bg-primary-50"
          />
        </div>
        <p className="text-primary-800 font-bold capitalize">{name}</p>
      </div>

      <div className="flex items-center justify-end overflow-clip">
        <p className="text-primary-800 bg-primary-50 inline-block rounded-xl px-2 py-1">
          {formatNaira(Number(amount), true)}
        </p>
      </div>
    </div>
  );
};
