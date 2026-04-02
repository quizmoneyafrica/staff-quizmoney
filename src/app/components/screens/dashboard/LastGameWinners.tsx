/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { motion } from 'framer-motion';
import { useLastGameLeaderboard } from '@/app/lib/queries';
import { Avatar } from '@radix-ui/themes';
import { getInitials, formatNaira } from '@/app/lib/utils';
import { Trophy } from 'lucide-react';
import Link from 'next/link';
import { ROUTES } from '@/app/lib/routes';

const RANK_COLORS = [
  'text-warning-500',
  'text-neutral-400',
  'text-warning-700',
];

export default function LastGameWinners() {
  const { data, isLoading } = useLastGameLeaderboard();

  if (isLoading) {
    return (
      <motion.div
        layout
        className="h-80.75 w-full animate-pulse rounded-lg bg-neutral-300 p-4 lg:col-span-1"
      ></motion.div>
    );
  }

  const entries = data?.leaderboard?.slice(0, 5) ?? [];
  const meta = data?.meta;

  return (
    <motion.div
      layout
      className="h-80.75 w-full overflow-hidden rounded-xl bg-white p-4"
    >
      <div className="flex items-center justify-between">
        <p className="font-medium text-neutral-800">Last Game Winners</p>
        <Link
          href={ROUTES.DASHBOARD}
          className="font-heading text-secondary-900 text-sm underline"
        >
          {/* Show all */}
          {meta && (
            <span>
              {new Date(meta.date).toLocaleDateString('en-NG', {
                dateStyle: 'medium',
              })}
            </span>
          )}
        </Link>
      </div>

      <div className="mt-3 space-y-3">
        {entries.length > 0 ? (
          entries.map((entry: any, index: number) => (
            <UserTable
              key={index}
              id={entry?.player_id}
              rank={entry?.rank}
              username={entry?.username}
              // score={entry?.score}
              // image={entry?.avatarUrl}
              prize={entry?.prize}
              prize_type={entry?.prize_type || ''}
            />
          ))
        ) : (
          <div className="flex h-48 flex-col items-center justify-center gap-2 text-neutral-400">
            <Trophy size={32} className="opacity-30" />
            <p className="text-sm">No winners yet</p>
          </div>
        )}
      </div>
    </motion.div>
  );
}

interface UserTableProp {
  id: string;
  rank: number;
  image?: string | null;
  username: string;
  // score: number;
  prize?: number;
  prize_type?: string | null;
}
const UserTable: React.FunctionComponent<UserTableProp> = ({
  id,
  rank,
  image,
  username,
  // score,
  prize_type,
  prize,
}) => {
  console.log(image);

  return (
    <Link href={`${ROUTES.PLAYER_PROFILE(id)}`}>
      <div className="grid grid-cols-1 items-center">
        <div className="flex items-center gap-2 overflow-auto">
          <p className="mr-4 font-bold text-neutral-900">{rank}</p>
          <div className="bg-primary-50 flex h-10 w-10 items-center justify-center rounded-full">
            {/* <Avatar
              src={image || undefined}
              fallback={getInitials(username)}
              radius="full"
              className="bg-primary-50"
            /> */}
            <div className="bg-linear-to-br flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-full from-blue-400 to-blue-600 text-xs font-bold text-white">
              {(username?.[0] ?? '?').toUpperCase()}
            </div>
          </div>
          <p className="text-primary-800 font-bold capitalize">{username}</p>
        </div>

        <div className="flex items-center justify-end overflow-clip">
          <p className="text-primary-800 bg-primary-50 inline-block rounded-xl px-2 py-1">
            {prize_type === 'ngn'
              ? formatNaira(prize || 0)
              : `${prize || 0} QMC`}
          </p>
        </div>
      </div>
    </Link>
  );
};
