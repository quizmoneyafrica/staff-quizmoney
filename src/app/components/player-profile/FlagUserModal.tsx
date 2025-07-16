'use client';

import React, { useState } from 'react';
import { Flag, X } from 'lucide-react';

interface FlagUserModalProps {
  onClose: () => void;
  onFlag: () => Promise<void>;
  isBlacklisted: boolean;
}

const FlagUserModal: React.FC<FlagUserModalProps> = ({
  onClose,
  onFlag,
  isBlacklisted,
}) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleFlag = async () => {
    setIsLoading(true);
    try {
      await onFlag();
      onClose();
    } catch (error) {
      console.error('Error flagging user:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-opacity-500 fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4">
      <div className="relative w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-gray-500 transition-colors hover:text-gray-700"
          aria-label="Close modal"
          disabled={isLoading}
        >
          <X className="h-5 w-5" />
        </button>

        <div className="mb-6 flex items-center justify-center">
          <Flag
            className={`mr-2 h-5 w-5 ${
              isBlacklisted ? 'text-[#ED7B2B]' : 'text-red-500'
            }`}
          />
          <h2 className="text-lg font-semibold text-gray-900">
            {isBlacklisted ? 'Unflag User' : 'Flag User'}
          </h2>
        </div>

        <div className="mb-8 text-center">
          <p className="leading-relaxed text-gray-700">
            {isBlacklisted
              ? 'Are you sure you want to unflag this user? This action will restore their account activities and remove the flag.'
              : 'Are you sure you want to flag this user? This action will restrict their account activities and mark them for review.'}
          </p>
        </div>

        <div className="flex justify-center gap-3">
          <button
            onClick={onClose}
            className="rounded-full border border-gray-300 px-6 py-2 font-medium text-gray-700 transition-colors hover:bg-gray-50"
            disabled={isLoading}
          >
            No, cancel
          </button>
          <button
            onClick={handleFlag}
            disabled={isLoading}
            className="rounded-full bg-blue-600 px-6 py-2 font-medium text-white transition-colors hover:bg-blue-700 disabled:opacity-50"
          >
            {isLoading
              ? 'Processing...'
              : `Yes, ${isBlacklisted ? 'unflag' : 'flag'} this user`}
          </button>
        </div>
      </div>
    </div>
  );
};

export default FlagUserModal;
