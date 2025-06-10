import React from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { X } from 'lucide-react';
import { motion } from 'framer-motion';

interface WithdrawalRequest {
  id: number;
  transactionId: string;
  transactionType: string;
  amount: string;
  dateTime: string;
  action: string;
  type: string;
  status?: string;
}

interface WithdrawDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  withdrawData: WithdrawalRequest | null;
}

const WithdrawDetailsModal: React.FC<WithdrawDetailsModalProps> = ({
  isOpen,
  onClose,
  withdrawData,
}) => {
  return (
    <Dialog.Root open={isOpen} onOpenChange={onClose}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black opacity-30" />
        <Dialog.Content asChild>
          <motion.div
            initial={{ opacity: 0, y: 60 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
            className="fixed left-1/2 top-1/2 max-h-[85vh] w-[90vw] max-w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-xl bg-white p-12 shadow-xl focus:outline-none"
            onClick={(e) => e.stopPropagation()}
          >
            <Dialog.Title className="mb-12 text-[32px] font-bold text-gray-900">
              Withdrawal Details
            </Dialog.Title>

            {withdrawData && (
              <div className="space-y-8 text-[20px]">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-gray-600">
                    Transaction ID
                  </span>
                  <span className="font-semibold text-gray-900">
                    ID{withdrawData.transactionId}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="font-medium text-gray-600">
                    Transaction Type
                  </span>
                  <span className="font-semibold text-gray-900">
                    {withdrawData.transactionType}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="font-medium text-gray-600">Amount</span>
                  <span className="text-[22px] font-bold text-gray-900">
                    ₦
                    {withdrawData.amount
                      .replace(/[₦,]/g, '')
                      .replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="font-medium text-gray-600">
                    Transaction Status
                  </span>
                  <span className="rounded-full bg-green-100 px-4 py-2 text-[16px] font-semibold text-green-700">
                    {withdrawData.status || 'Successful'}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="font-medium text-gray-600">Date & Time</span>
                  <span className="font-semibold text-gray-900">
                    {withdrawData.dateTime}
                  </span>
                </div>
              </div>
            )}

            <Dialog.Close asChild>
              <button
                className="focus:shadow-outline absolute right-8 top-8 inline-flex h-[36px] w-[36px] cursor-pointer items-center justify-center rounded-full outline-none transition-colors hover:bg-gray-100"
                aria-label="Close"
              >
                <X size={28} className="text-gray-700" />
              </button>
            </Dialog.Close>
          </motion.div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};

export default WithdrawDetailsModal;
