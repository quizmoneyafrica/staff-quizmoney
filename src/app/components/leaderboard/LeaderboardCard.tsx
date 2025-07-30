'use client';
import CustomImage from '@/app/components/CustomImage';
import classNames from 'classnames';
import React from 'react';
import { motion } from 'framer-motion';

import ordinalize from 'ordinalize';

interface LeaderboardCardProps {
  rank: number;
  playerName: string;
  gamesPlayed: number;
  prize?: string;
  avatarUrl: string;
}

const LeaderboardCard: React.FC<LeaderboardCardProps> = ({
  rank,
  playerName,
  gamesPlayed,
  prize,
  avatarUrl,
}) => {
  const cardStyles =
    rank === 1 ? 'bg-[#E4F1FA]' : rank === 2 ? 'bg-[#E7FEED]' : 'bg-[#FFFCE7]';
  const rankStyles =
    rank === 1
      ? 'text-[#BCDDF4]'
      : rank === 2
      ? 'text-[#C4FBD2]'
      : 'text-[#FFF6C5]';
  const prizeStyle =
    rank === 1 ? 'bg-[#BCDDF4]' : rank === 2 ? 'bg-[#C4FBD2]' : 'bg-[#FFF6C5]';
  const nameStyles =
    rank === 1
      ? 'text-[#17478B]'
      : rank === 2
      ? 'text-[#009028]'
      : 'text-[#ED7B2B]';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: rank * 0.1 }}
      whileHover={{ scale: 1.02 }}
      className={`relative flex w-full flex-col items-center rounded-lg px-4 py-8 ${cardStyles}`}
    >
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, delay: rank * 0.1 + 0.2 }}
        className={`absolute left-0 mb-4 ml-5 text-4xl font-bold ${rankStyles}`}
      >
        {ordinalize(rank)}
      </motion.div>
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{
          type: 'spring',
          stiffness: 260,
          damping: 20,
          delay: rank * 0.1 + 0.3,
        }}
        className="relative mb-2"
      >
        <div
          className={classNames(
            'size-16 flex items-center justify-center rounded-full',
            prizeStyle,
          )}
        >
          <CustomImage
            src={avatarUrl}
            alt={`${playerName}'s avatar`}
            className="h-10 w-10 rounded-full"
          />
        </div>
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{
            type: 'spring',
            stiffness: 260,
            damping: 20,
            delay: rank * 0.1 + 0.4,
          }}
          className="absolute bottom-3 right-0 -mr-4 rounded-full bg-inherit"
        >
          {rank === 1 && (
            <CustomImage
              src="/assets/images/first.svg"
              alt="1st place ribbon"
              className="size-7"
            />
          )}
          {rank === 2 && (
            <CustomImage
              src="/assets/images/second.svg"
              alt="2nd place ribbon"
              className="size-7"
            />
          )}
          {rank === 3 && (
            <CustomImage
              src="/assets/images/third.svg"
              alt="3rd place ribbon"
              className="size-7"
            />
          )}
        </motion.div>
      </motion.div>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: rank * 0.1 + 0.5 }}
        className={`mb-2 text-lg font-semibold ${nameStyles}`}
      >
        {playerName}
      </motion.div>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: rank * 0.1 + 0.6 }}
        className="mb-2 flex w-full justify-center gap-3"
      >
        <span
          className={classNames(
            'rounded-full px-3 py-1 text-sm',
            prizeStyle,
            nameStyles,
          )}
        >
          {gamesPlayed} games
        </span>
        {prize && (
          <span
            className={classNames(
              'rounded-full px-3 py-1 text-sm',
              prizeStyle,
              nameStyles,
            )}
          >
            {prize}
          </span>
        )}
      </motion.div>
    </motion.div>
  );
};

export default LeaderboardCard;
