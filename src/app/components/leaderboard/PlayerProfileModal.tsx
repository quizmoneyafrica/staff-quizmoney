'use client';

import React from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { X } from 'lucide-react';
import CustomImage from '@/app/components/CustomImage';
import classNames from 'classnames';
import ordinalize from 'ordinalize';
import { RankBadge } from './RankBadge';

interface PlayerData {
  id: string;
  rank: number;
  date: string;
  username: string;
  avatarUrl: string | null;
  games: number;
  price?: string;
  coins?: number;
  kycVerified: boolean;
}

interface PlayerProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  playerData: PlayerData | null;
}

const PlayerProfileModal: React.FC<PlayerProfileModalProps> = ({
  isOpen,
  onClose,
  playerData,
}) => {
  if (!playerData) {
    return null;
  }

  return (
    <Dialog.Root open={isOpen} onOpenChange={onClose}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black opacity-30" />
        <Dialog.Content className="fixed left-1/2 top-1/2 w-full max-w-xl -translate-x-1/2 -translate-y-1/2 transform rounded-lg bg-white px-6 py-10 shadow-lg focus:outline-none">
          <Dialog.Title className="mb-4 text-xl font-bold">
            Player Profile
          </Dialog.Title>
          <div className="flex flex-col items-center text-center">
            <div className="mb-4 text-2xl font-bold text-[#BCDDF4] md:text-4xl">
              {ordinalize(playerData.rank)} Position
            </div>
            <div className="relative mb-2">
              <div
                className={classNames(
                  ' size-20 flex items-center justify-center rounded-full p-5 ',
                  'bg-[#BCDDF4]',
                )}
              >
                <CustomImage
                  src={playerData?.avatarUrl || ''}
                  alt={`${playerData?.username}'s avatar`}
                  className="rounded-full"
                  width={60}
                  height={60}
                />
              </div>

              <div className="absolute bottom-4 right-0 -mr-4 rounded-full bg-inherit">
                <RankBadge
                  rank={playerData.rank}
                  className="size-10 text-warning-800"
                />
              </div>
            </div>
            <div className="mb-2 text-xl font-semibold">
              {playerData.username}
            </div>
            <div className="mb-4 flex flex-col items-center gap-2 font-semibold text-black">
              <div className="flex items-center gap-2 text-black">
                {playerData.username} Played{' '}
                <CustomImage
                  alt=""
                  src={'/icons/game.svg'}
                  width={16}
                  height={16}
                />{' '}
                {playerData.games} games
              </div>
              <div className="font-semibold text-black">
                {playerData.username} has Earned{' '}
                <span className="text-gray-700">{playerData.price || '0'}</span>
              </div>
            </div>
          </div>
          <Dialog.Close asChild>
            <button className="absolute right-3 top-3 rounded-full p-2 hover:bg-gray-100 focus:outline-none">
              <X className="h-5 w-5 text-gray-500" />
            </button>
          </Dialog.Close>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};

export default PlayerProfileModal;
