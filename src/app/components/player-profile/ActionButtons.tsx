'use client';

import React from 'react';
import { Flag, Trash2, Edit3 } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface ActionButtonsProps {
  onFlagClick: () => void;
  isBlacklisted: boolean;
  userId: string;
}

const ActionButtons: React.FC<ActionButtonsProps> = ({
  onFlagClick,
  isBlacklisted,
  userId,
}) => {
  const router = useRouter();

  return (
    <div className="rounded-[20px] bg-white p-6">
      <h2 className="mb-6 text-2xl font-semibold text-gray-900">Action</h2>

      <div className="flex gap-4">
        {/* Flag/Unflag User Button */}
        <button
          onClick={onFlagClick}
          className={`flex h-[47px] w-[164px] cursor-pointer items-center justify-center gap-2 rounded-[5px] transition-colors ${
            isBlacklisted
              ? 'bg-[#FFF6C5] hover:bg-[#FFF0A0]'
              : 'bg-pink-100 hover:bg-pink-200'
          }`}
        >
          <Flag
            className={`h-4 w-4 ${
              isBlacklisted ? 'text-[#ED7B2B]' : 'text-red-600'
            }`}
            fill="currentColor"
          />
          <span
            className={`text-sm font-medium ${
              isBlacklisted ? 'text-[#ED7B2B]' : 'text-red-600'
            }`}
          >
            {isBlacklisted ? 'Unflag User' : 'Flag User'}
          </span>
        </button>

        <button className="flex h-[47px] w-[164px] cursor-pointer items-center justify-center gap-2 rounded-[5px] bg-gray-100 transition-colors hover:bg-gray-200">
          <Trash2 className="h-4 w-4 text-gray-700" />
          <span className="text-sm font-medium text-gray-700">Delete User</span>
        </button>

        <button
          className="flex h-[47px] w-[164px] cursor-pointer items-center justify-center gap-2 rounded-[5px] bg-blue-50 transition-colors hover:bg-blue-100"
          onClick={() => {
            router.push(`/players/player-profile/${userId}/edit-profile`);
          }}
        >
          <Edit3 className="h-4 w-4 text-blue-600" />
          <span className="text-sm font-medium text-blue-600">
            Edit Profile
          </span>
        </button>
      </div>
    </div>
  );
};

export default ActionButtons;
