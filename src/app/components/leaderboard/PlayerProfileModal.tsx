import React from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { X } from 'lucide-react';
import CustomImage from '@/app/components/CustomImage';

import classNames from 'classnames';

interface PlayerProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  playerData: any; // eslint-disable-line @typescript-eslint/no-explicit-any
}

const PlayerProfileModal: React.FC<PlayerProfileModalProps> = ({ isOpen, onClose, playerData }) => {
  return (
    <Dialog.Root open={isOpen} onOpenChange={onClose}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black opacity-30" />
        <Dialog.Content className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white px-6 py-10 rounded-lg shadow-lg w-full max-w-xl focus:outline-none">
          <Dialog.Title className="text-xl font-bold mb-4">Player profile</Dialog.Title>
          {playerData && (
            <div className="flex flex-col items-center text-center">
              <div className="md:text-4xl text-2xl font-bold text-[#BCDDF4] mb-4">{playerData.rank}st Position</div>
              <div className="relative mb-2">
        <div className={classNames(' flex items-center p-5 justify-center size-20 rounded-full ','bg-[#BCDDF4]')}>
          <CustomImage src={playerData?.avatarUrl} alt={`${playerData?.playerName}'s avatar`} className=" rounded-full" />
        </div>
        <div className="absolute bottom-4 right-0 -mr-4 bg-inherit rounded-full">
          <CustomImage src="/assets/images/third.svg" alt="3rd place ribbon" className=" size-7" />
        </div>
      </div>
              <div className="text-xl font-semibold mb-2">{playerData.username}</div>
              <div className="flex flex-col gap-2 text-black font-semibold items-center mb-4">
                <div className="flex items-center gap-2 text-black">
                 Joemicky Played <CustomImage alt='' src={'/icons/game.svg'}/> {playerData.games} games
                </div>
                <div className=" text-black font-semibold"> Joemicky has  Earned  <span className='text-gray-700'>{playerData.price}</span></div>
              </div>
            </div>
          )}
         {/* =================== */}
          <Dialog.Close asChild>
            <button className="absolute top-3 right-3 p-2 rounded-full hover:bg-gray-100 focus:outline-none">
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </Dialog.Close>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};

export default PlayerProfileModal; 