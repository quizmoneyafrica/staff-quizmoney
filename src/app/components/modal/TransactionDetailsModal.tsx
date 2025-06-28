import React from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { X } from 'lucide-react';
import { motion } from 'framer-motion';
import { formatNaira } from '@/app/utils/utils';
import { FormatDateOptions } from 'date-fns';

interface Transaction {
  id: string;
  transactionId?: string;
  transactionType?: string;
  type: string;
  amount: number;
  status: string;
  createdAt: {
    __type: string;
    iso: string;
  };
  description: string;

  dateTime?: string;
  action?: string;
  date?: string;
  [key: string]: unknown;
}

interface TransactionDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  transactionData: Transaction | null;
}

const TransactionDetailsModal: React.FC<TransactionDetailsModalProps> = ({
  isOpen,
  onClose,
  transactionData,
}) => {
  const getTransactionId = (transaction: Transaction) => {
    return transaction.transactionId || transaction.id || 'N/A';
  };

  const getTransactionType = (transaction: Transaction) => {
    return transaction.transactionType || transaction.type || 'N/A';
  };

  const formatDate = (transaction: Transaction) => {
    if (transaction.createdAt?.iso) {
      const date = new Date(transaction.createdAt.iso);
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      });
    }

    if (transaction.dateTime) {
      const date = new Date(transaction.dateTime);
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      });
    }

    if (transaction.date) {
      const date = new Date(transaction.date);
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      });
    }

    return 'N/A';
  };

  const formatAmount = (amount: number | string) => {
    const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
    if (isNaN(numAmount)) return '₦0';

    try {
      return formatNaira(amount);
    } catch {
      return new Intl.NumberFormat('en-NG', {
        style: 'currency',
        currency: 'NGN',
        minimumFractionDigits: 0,
      }).format(numAmount);
    }
  };

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
              Transaction Details
            </Dialog.Title>

            {transactionData && (
              <div className="space-y-8 text-[20px]">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-gray-600">
                    Transaction ID
                  </span>
                  <span className="font-semibold text-gray-900">
                    {getTransactionId(transactionData)}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="font-medium text-gray-600">
                    Transaction Type
                  </span>
                  <span className="font-semibold text-gray-900">
                    {getTransactionType(transactionData)}
                  </span>
                </div>

                {/* <div className="flex items-center justify-between">
                  <span className="font-medium text-gray-600">Description</span>
                  <span className="font-semibold text-gray-900">
                    {transactionData.description || 'N/A'}
                  </span>
                </div> */}

                <div className="flex items-center justify-between">
                  <span className="font-medium text-gray-600">Amount</span>
                  <span className="text-[22px] font-bold text-gray-900">
                    {formatAmount(transactionData.amount)}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="font-medium text-gray-600">
                    Transaction Status
                  </span>
                  <span
                    className={`rounded-full px-4 py-2 text-[16px] font-semibold ${
                      transactionData.status === 'completed'
                        ? 'bg-green-100 text-green-700'
                        : transactionData.status === 'pending'
                        ? 'bg-yellow-100 text-yellow-700'
                        : transactionData.status === 'failed'
                        ? 'bg-red-100 text-red-700'
                        : 'bg-gray-100 text-gray-700'
                    }`}
                  >
                    {transactionData.status || 'Unknown'}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="font-medium text-gray-600">Date & Time</span>
                  <span className="font-semibold text-gray-900">
                    {formatDate(transactionData)}
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

export default TransactionDetailsModal;
