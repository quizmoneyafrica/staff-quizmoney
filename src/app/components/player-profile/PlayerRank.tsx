'use client';
import React from 'react';
import { motion } from 'framer-motion';
import CustomImage from '../CustomImage';

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

export default function PlayerRank() {
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
            Joemicky is Ranked 1<sup>st</sup> position
          </motion.p>
          <motion.p
            className="flex items-center gap-1.5 text-xs font-medium text-green-500 sm:gap-2 sm:text-base"
            variants={itemVariants}
          >
            Joemicky Played{' '}
            <CustomImage
              alt=""
              src={'/icons/gamePad.svg'}
              className="size-3.5 sm:size-5"
            />{' '}
            10 games
          </motion.p>
          <motion.p
            className="text-primary-900 text-xs font-medium sm:text-base"
            variants={itemVariants}
          >
            Joemicky has Earned <span className="text-yellow-500">₦50,000</span>
          </motion.p>
        </div>
      </div>
      <motion.div
        className="relative h-16 w-16 flex-shrink-0 sm:h-24 sm:w-24"
        variants={itemVariants}
      >
        <CustomImage
          alt=""
          src={'/icons/rank.svg'}
          className="h-full w-full object-contain"
        />
      </motion.div>
    </motion.div>
  );
}
