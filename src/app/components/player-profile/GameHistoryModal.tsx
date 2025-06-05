'use client'
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
          className="fixed top-1/2 left-1/2 max-h-[85vh] w-[90vw] max-w-[550px] -translate-x-1/2 -translate-y-1/2 rounded-lg bg-white p-10 shadow-lg focus:outline-none"
        >
          <Dialog.Title className="text-[28px] font-bold mb-8 text-black">Game History</Dialog.Title>
          <div className="space-y-7 text-[18px]">
            <div className="flex justify-between">
              <span className="text-gray-700 font-medium">Game ID</span>
              <span className="text-black font-semibold">ID{game.id}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-700 font-medium">Game Status</span>
              <span className={game.status === 'Won' ? 'text-green-500 font-semibold' : 'text-red-600 font-semibold'}>
                {game.status}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-700 font-medium">Rewards</span>
              <span className="text-primary-900 font-semibold">
                {game.reward.type === 'money'
                  ? `${game.reward.value}`
                  : `${game.reward.value} x${game.reward.itemCount}`}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-700 font-medium">Game score</span>
              <span className="flex items-center gap-4">
                <span className="font-bold">{game.correctScore} Correct</span>
               <CustomImage src={'/icons/tickGreen.svg'} alt='tick green'/>
                <span className="font-bold">{game.incorrectScore} Incorrect</span>
                              <CustomImage src={'/icons/tickRed.svg'} alt='tick green'/>

              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-700 font-medium">Total Time used</span>
              <span className="text-black font-semibold">{game.totalTime}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-700 font-medium">Game date &amp; time</span>
              <span className="text-black font-semibold">{game.date}</span>
            </div>
          </div>
          <Dialog.Close asChild>
            <button
              className="absolute top-6 right-6 inline-flex h-[32px] w-[32px] items-center justify-center rounded-full hover:bg-gray-200 focus:shadow-outline outline-none cursor-pointer"
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
