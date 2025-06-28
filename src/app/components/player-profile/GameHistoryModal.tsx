'use client';
import React from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { X } from 'lucide-react';
import { motion } from 'framer-motion';
import CustomImage from '../CustomImage';

type GameHistoryItem = {
  id: string;
  date: string | { iso: string };
  reward: {
    type: 'money' | 'item';
    value: string;
    itemCount?: number;
  };
  status: 'Won' | 'Loss' | 'won' | 'lost';
  correctScore: number;
  incorrectScore: number;
  totalTime: string;
  gameId?: string;
  position?: number;
};

type GameHistoryModalProps = {
  game: GameHistoryItem;
};

export default function GameHistoryModal({ game }: GameHistoryModalProps) {
  const formatDateTime = (dateValue: string | { iso: string }): string => {
    try {
      let dateObj: Date;

      if (typeof dateValue === 'string') {
        dateObj = new Date(dateValue);
      } else if (
        dateValue &&
        typeof dateValue === 'object' &&
        'iso' in dateValue
      ) {
        dateObj = new Date(dateValue.iso);
      } else {
        return 'Invalid Date';
      }

      if (isNaN(dateObj.getTime())) {
        return 'Invalid Date';
      }

      const dateOptions: Intl.DateTimeFormatOptions = {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      };

      const timeOptions: Intl.DateTimeFormatOptions = {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      };

      const formattedDate = dateObj.toLocaleDateString('en-US', dateOptions);
      const formattedTime = dateObj.toLocaleTimeString('en-US', timeOptions);

      return `${formattedDate} at ${formattedTime}`;
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Invalid Date';
    }
  };

  const getStatusDisplay = (status: string) => {
    const normalizedStatus = status.toLowerCase();
    const isWon = normalizedStatus === 'won';
    const displayText = isWon ? 'Won' : 'Lost';
    const colorClass = isWon ? 'text-green-500' : 'text-red-600';

    return { displayText, colorClass };
  };

  const statusDisplay = getStatusDisplay(game.status);

  return (
    <Dialog.Portal>
      <Dialog.Overlay className="fixed inset-0 bg-black opacity-30" />
      <Dialog.Content asChild>
        <motion.div
          initial={{ opacity: 0, y: 60 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
          className="fixed left-1/2 top-1/2 max-h-[85vh] w-[90vw] max-w-[550px] -translate-x-1/2 -translate-y-1/2 rounded-lg bg-white p-10 shadow-lg focus:outline-none"
        >
          <Dialog.Title className="mb-8 text-[28px] font-bold text-black">
            Game History
          </Dialog.Title>
          <div className="space-y-7 text-[18px]">
            <div className="flex justify-between">
              <span className="font-medium text-gray-700">Game ID</span>

              <span className="font-semibold text-black">{game.id}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium text-gray-700">Game Status</span>

              <span className={`font-semibold ${statusDisplay.colorClass}`}>
                {statusDisplay.displayText}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium text-gray-700">Rewards</span>
              <span className="text-primary-900 font-semibold">
                {game.reward.type === 'money'
                  ? `${game.reward.value}`
                  : `${game.reward.value} x${game.reward.itemCount}`}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="font-medium text-gray-700">Game score</span>
              <span className="flex items-center gap-4">
                <span className="font-bold">{game.correctScore} Correct</span>
                <CustomImage src={'/icons/tickGreen.svg'} alt="tick green" />
                <span className="font-bold">
                  {game.incorrectScore} Incorrect
                </span>
                <CustomImage src={'/icons/tickRed.svg'} alt="tick red" />
              </span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium text-gray-700">Total Time used</span>
              <span className="font-semibold text-black">{game.totalTime}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium text-gray-700">
                Game date &amp; time
              </span>

              <span className="font-semibold text-black">
                {formatDateTime(game.date)}
              </span>
            </div>

            {/* {game.position && (
              <div className="flex justify-between">
                <span className="font-medium text-gray-700">Position</span>
                <span className="font-semibold text-black">
                  #{game.position}
                </span>
              </div>
            )} */}
          </div>
          <Dialog.Close asChild>
            <button
              className="focus:shadow-outline absolute right-6 top-6 inline-flex h-[32px] w-[32px] cursor-pointer items-center justify-center rounded-full outline-none hover:bg-gray-200"
              aria-label="Close"
            >
              <X size={24} />
            </button>
          </Dialog.Close>
        </motion.div>
      </Dialog.Content>
    </Dialog.Portal>
  );
}
