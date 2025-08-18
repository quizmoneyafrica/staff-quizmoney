'use client';

import * as React from 'react';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import Link from 'next/link';
import { Avatar } from '@radix-ui/themes';
import { formatNaira } from '@/app/utils/utils';

import DashboardApi, { LeaderboardResponse } from '@/app/api/dashboardApi';

const LastGameWinners: React.FunctionComponent = () => {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['lastGameWinners'],
    queryFn: () => DashboardApi.getLeaderboard(0, 5),
  });

  if (isError) {
    toast.error('Error loading Last Game Winners, please refresh');
  }

  if (isLoading) {
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
        {data?.data?.data?.content && data.data.data.content.length > 0 ? (
          data.data.data.content.map(
            (item: LeaderboardResponse, index: number) => (
              <UserTable
                key={index}
                num={item.rank}
                image={null}
                name={item.playerName}
                amount={item.prizeWon}
              />
            ),
          )
        ) : (
          <div className="flex h-48 items-center justify-center text-sm text-gray-500">
            No winners found for the last game.
          </div>
        )}
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
