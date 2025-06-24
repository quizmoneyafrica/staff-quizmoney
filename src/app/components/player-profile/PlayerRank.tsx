// PlayerRank.tsx
'use client';
import React from 'react';
import { motion } from 'framer-motion';
import CustomImage from '../CustomImage';

interface GameStats {
  totalGamesPlayed: number;
  gamesWon: number;
  totalRewards: number;
  winRate: string;
}

interface PlayerRankProps {
  gameStats?: GameStats;
  userName?: string;
  playerRank?: number;
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
    },
  },
};

export default function PlayerRank({
  gameStats,
  userName = 'Player',
  playerRank = 1,
}: PlayerRankProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const getOrdinalSuffix = (rank: number) => {
    const j = rank % 10;
    const k = rank % 100;
    if (j === 1 && k !== 11) {
      return rank + 'st';
    }
    if (j === 2 && k !== 12) {
      return rank + 'nd';
    }
    if (j === 3 && k !== 13) {
      return rank + 'rd';
    }
    return rank + 'th';
  };

  if (!gameStats) {
    return (
      <motion.div
        className="flex flex-row items-center justify-between gap-2 rounded-xl bg-white p-3 sm:gap-4 sm:p-6"
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        <div className="w-full space-y-1 sm:space-y-3">
          <motion.h2
            className="text-base font-semibold text-gray-900 sm:text-lg"
            variants={itemVariants}
          >
            Rank on Leaderboard
          </motion.h2>
          <motion.p
            className="text-xs text-gray-500 sm:text-sm"
            variants={itemVariants}
          >
            No game data available
          </motion.p>
        </div>
        <motion.div
          className="relative h-16 w-16 flex-shrink-0 sm:h-24 sm:w-24"
          variants={itemVariants}
        >
          <CustomImage
            alt="Rank badge"
            src={'/icons/rank.svg'}
            className="h-full w-full object-contain opacity-50"
          />
        </motion.div>
      </motion.div>
    );
  }

  return (
    <motion.div
      className="flex flex-row items-center justify-between gap-2 rounded-xl bg-white p-3 sm:gap-4 sm:p-6"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      <div className="w-full space-y-1 sm:space-y-3">
        <motion.h2
          className="text-base font-semibold text-gray-900 sm:text-lg"
          variants={itemVariants}
        >
          Rank on Leaderboard
        </motion.h2>
        <div className="flex-col space-y-0.5 sm:space-y-2">
          <motion.p
            className="text-xs font-medium text-cyan-500 sm:text-base"
            variants={itemVariants}
          >
            {userName} is Ranked {getOrdinalSuffix(playerRank)} position
          </motion.p>
          <motion.p
            className="flex items-center gap-1.5 text-xs font-medium text-green-500 sm:gap-2 sm:text-base"
            variants={itemVariants}
          >
            {userName} Played{' '}
            <CustomImage
              alt="Game controller"
              src={'/icons/gamePad.svg'}
              className="size-3.5 sm:size-5"
            />{' '}
            {gameStats.totalGamesPlayed} games
          </motion.p>
          <motion.p
            className="text-primary-900 text-xs font-medium sm:text-base"
            variants={itemVariants}
          >
            {userName} has Earned{' '}
            <span className="text-yellow-500">
              {formatCurrency(gameStats.totalRewards)}
            </span>
          </motion.p>
          <motion.p
            className="text-xs font-medium text-blue-600 sm:text-sm"
            variants={itemVariants}
          >
            Win Rate: {gameStats.winRate} ({gameStats.gamesWon}/
            {gameStats.totalGamesPlayed})
          </motion.p>
        </div>
      </div>
      <motion.div
        className="relative h-16 w-16 flex-shrink-0 sm:h-24 sm:w-24"
        variants={itemVariants}
      >
        <CustomImage
          alt="Rank badge"
          src={'/icons/rank.svg'}
          className="h-full w-full object-contain"
        />
        {/* Optional: Add rank number overlay */}
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-xs font-bold text-white sm:text-sm">
            #{playerRank}
          </span>
        </div>
      </motion.div>
    </motion.div>
  );
}
