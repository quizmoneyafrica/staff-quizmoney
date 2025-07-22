'use client';

import React from 'react';
import { Flag, Trash2, Edit3 } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface GameHistoryActionsProps {
  onFlagClick: () => void;
  isBlacklisted: boolean;
  userId: string;
  onDeleteClick?: () => void;
}

const GameHistoryActions: React.FC<GameHistoryActionsProps> = ({
  onFlagClick,
  isBlacklisted,
  userId,
  onDeleteClick,
}) => {
  const router = useRouter();

  return (
    <div className="flex justify-center gap-2 sm:justify-end">
      <button
        onClick={onFlagClick}
        className={`flex h-[35px] items-center justify-center gap-2 rounded-[5px] px-2 text-xs font-medium transition-colors sm:px-3 ${
          isBlacklisted
            ? 'bg-[#FFF6C5] hover:bg-[#FFF0A0]'
            : 'bg-red-200 hover:bg-red-300'
        }`}
      >
        <Flag
          className={`h-3 w-3 ${
            isBlacklisted ? 'text-[#ED7B2B]' : 'text-red-600'
          }`}
          fill="currentColor"
        />
        <span
          className={`hidden sm:inline ${
            isBlacklisted ? 'text-[#ED7B2B]' : 'text-red-600'
          }`}
        >
          Flag User
        </span>
      </button>

      <button
        className="flex h-[35px] items-center justify-center gap-2 rounded-[5px] bg-blue-100 px-2 text-xs font-medium text-blue-600 transition-colors hover:bg-blue-300 sm:px-3"
        onClick={() => {
          router.push(`/players/player-profile/${userId}/edit-profile`);
        }}
      >
        <Edit3 className="h-3 w-3 text-blue-600" />
        <span className="hidden sm:inline">Edit Profile</span>
      </button>

      <button
        className="flex h-[35px] items-center justify-center gap-2 rounded-[5px] bg-gray-300 px-2 text-xs font-medium text-gray-700 transition-colors hover:bg-gray-400 sm:px-3"
        onClick={onDeleteClick}
      >
        <Trash2 className="h-3 w-3 text-gray-700" />
        <span className="hidden sm:inline">Delete User</span>
      </button>
    </div>
  );
};

export default GameHistoryActions;
