'use client';

import React from 'react';
import { Flag, X } from 'lucide-react';
import { useDeletePlayer } from '@/app/api/playersApi';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

interface DeleteUserModalProps {
  onClose: () => void;
  userId: string;
}

const DeleteUserModal: React.FC<DeleteUserModalProps> = ({
  onClose,
  userId,
}) => {
  const router = useRouter();

  const { mutateAsync: deletePlayer, isPending } = useDeletePlayer();

  const handleFlag = async () => {
    try {
      try {
        const response = await deletePlayer({
          userId,
        });

        if (response?.result?.status === 'error') {
          toast.error(response?.result?.message);
        } else {
          toast.success(response?.result?.message);
          router.push('/players');
        }
      } catch (error) {
        toast.error(error?.result?.message);
      }
    } catch (error) {
      console.error('Error deleting user:', error);
    }
  };

  return (
    <div className="bg-opacity-500 fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4">
      <div className="relative w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-gray-500 transition-colors hover:text-gray-700"
          aria-label="Close modal"
          disabled={isPending}
        >
          <X className="h-5 w-5" />
        </button>

        <div className="mb-6 flex items-center justify-center">
          <Flag className={`mr-2 h-5 w-5 text-red-500`} />
          <h2 className="text-lg font-semibold text-gray-900">
            Delete User Account?
          </h2>
        </div>

        <div className="mb-8 text-center">
          <p className="leading-relaxed text-gray-700">
            This action is irreversible. All user data, wallet balance, and
            activity history will be permanently deleted. Are you sure you want
            to proceed?
          </p>
        </div>

        <div className="flex justify-center gap-3">
          <button
            onClick={onClose}
            className="rounded-full border border-gray-300 px-6 py-2 font-medium text-gray-700 transition-colors hover:bg-gray-50"
            disabled={isPending}
          >
            No, cancel
          </button>
          <button
            onClick={handleFlag}
            disabled={isPending}
            className="rounded-full bg-blue-600 px-6 py-2 font-medium text-white transition-colors hover:bg-blue-700 disabled:opacity-50"
          >
            {isPending ? 'Processing...' : `Yes, Delete this user`}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteUserModal;
