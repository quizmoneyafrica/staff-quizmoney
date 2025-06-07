'use client';
import React from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { X } from 'lucide-react';
import { motion } from 'framer-motion';
import CustomImage from '../CustomImage';

type GameHistoryItem = {
  id: string;
  date: string;
  reward: {
    type: 'money' | 'item';
    value: string;
    itemCount?: number;
  };
  status: 'Won' | 'Loss';
  correctScore: number;
  incorrectScore: number;
  totalTime: string;
};

type GameHistoryModalProps = {
  game: GameHistoryItem;
};

export default function GameHistoryModal({ game }: GameHistoryModalProps) {
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
              <span className="font-semibold text-black">ID{game.id}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium text-gray-700">Game Status</span>
              <span
                className={
                  game.status === 'Won'
                    ? 'font-semibold text-green-500'
                    : 'font-semibold text-red-600'
                }
              >
                {game.status}
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
                <CustomImage src={'/icons/tickRed.svg'} alt="tick green" />
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
              <span className="font-semibold text-black">{game.date}</span>
            </div>
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
