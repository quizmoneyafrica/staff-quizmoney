import * as React from 'react';
import { X } from 'lucide-react';

interface IDeleteConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
}

const DeleteConfirmationModal: React.FunctionComponent<
  IDeleteConfirmationModalProps
> = ({
  isOpen,
  onClose,
  onConfirm,
  title = 'Are you sure you want to delete this game?',
}) => {
  if (!isOpen) return null;

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/30"
      onClick={handleBackdropClick}
    >
      <div className="relative mx-4 w-full max-w-md rounded-lg bg-white p-6 shadow-lg">
        <button
          onClick={onClose}
          className="absolute right-4 top-6 cursor-pointer text-black transition-colors hover:text-gray-700"
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
              className="cursor-pointer  rounded-full bg-blue-900 px-6 py-2 font-medium text-white transition-colors hover:bg-blue-700"
            >
              Yes, Delete
            </button>
            <button
              onClick={onClose}
              className="cursor-pointer rounded-full bg-red-500 px-6 py-2 font-medium text-white transition-colors hover:bg-red-600"
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
