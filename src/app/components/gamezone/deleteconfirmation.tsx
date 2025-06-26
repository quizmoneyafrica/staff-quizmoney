import * as React from 'react';
import { X, Loader2 } from 'lucide-react';

interface IDeleteConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  title?: string;
  isLoading?: boolean;
}

const DeleteConfirmationModal: React.FunctionComponent<
  IDeleteConfirmationModalProps
> = ({
  isOpen,
  onClose,
  onConfirm,
  title = 'Are you sure you want to delete this game?',
  isLoading = false,
}) => {
  if (!isOpen) return null;

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget && !isLoading) {
      onClose();
    }
  };

  const handleConfirm = async () => {
    await onConfirm();
  };

  const handleClose = () => {
    if (!isLoading) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/30"
      onClick={handleBackdropClick}
    >
      <div className="relative mx-4 w-full max-w-md rounded-lg bg-white p-6 shadow-lg">
        <button
          onClick={handleClose}
          disabled={isLoading}
          className="absolute right-4 top-6 cursor-pointer text-black transition-colors hover:text-gray-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <X size={24} />
        </button>

        <div className="pb-8 pt-8">
          <div className="mb-8 text-center">
            <p className="text-lg font-bold text-black">
              Are you sure you want to
            </p>
            <p className="text-lg font-bold text-black">
              {title.replace('Are you sure you want to ', '')}
            </p>
          </div>

          <div className="flex justify-center gap-4">
            <button
              onClick={handleConfirm}
              disabled={isLoading}
              className="flex cursor-pointer items-center justify-center gap-2 rounded-full bg-blue-900 px-6 py-2 font-medium text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
              {isLoading ? 'Deleting...' : 'Yes, Delete'}
            </button>
            <button
              onClick={handleClose}
              disabled={isLoading}
              className="cursor-pointer rounded-full bg-red-500 px-6 py-2 font-medium text-white transition-colors hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-50"
            >
              No, Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeleteConfirmationModal;
