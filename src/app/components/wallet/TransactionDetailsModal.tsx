'use client';

import React from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { X } from 'lucide-react';
import { Avatar } from '@radix-ui/themes';
import classNames from 'classnames';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import { WalletTransactionResponse } from '@/app/api/wallet';
import { formatDateTime, formatNaira } from '@/app/utils/utils';
// import { VerifiedIcon } from '@/app/icons/icons';

interface TransactionDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  transactionData: WalletTransactionResponse | null;
}

const TransactionDetailsModal: React.FC<TransactionDetailsModalProps> = ({
  isOpen,
  onClose,
  transactionData,
}) => {
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
        type: 'tween' as const,
        ease: [0.4, 0, 0.2, 1] as const,
      },
    },
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.3,
        type: 'tween' as const,
        ease: [0.4, 0, 0.2, 1] as const,
      },
    },
  };

  if (!transactionData) return null;

  const { time, fullDate } = formatDateTime(transactionData.transactionDate);
  const fullName = `${transactionData.firstName} ${transactionData.lastName}`;

  const getStatusClass = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'successful':
        return 'bg-green-100 text-green-700';
      case 'failed':
        return 'bg-red-100 text-red-700';
      case 'pending':
        return 'bg-yellow-100 text-yellow-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <Dialog.Root open={isOpen} onOpenChange={onClose}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50" />
        <AnimatePresence>
          {isOpen && (
            <Dialog.Content asChild>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                transition={{ duration: 0.3, ease: 'easeOut' }}
                className="fixed left-1/2 top-1/2 w-full max-w-lg -translate-x-1/2 -translate-y-1/2 transform rounded-xl bg-white px-8 py-8 shadow-xl focus:outline-none"
              >
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.1 }}
                >
                  <Dialog.Title className="mb-6 text-xl font-semibold text-gray-900">
                    Transaction Details
                  </Dialog.Title>
                </motion.div>

                <motion.div
                  className="flex flex-col gap-6"
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                >
                  <motion.div
                    className="flex items-center justify-between border-b border-gray-200 pb-6"
                    variants={itemVariants}
                  >
                    <div className="flex items-center gap-4">
                      <div className="bg-primary-100 flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-full">
                        <Avatar
                          fallback={fullName.charAt(0).toUpperCase()}
                          radius="full"
                          size="3"
                        />
                      </div>
                      <div>
                        <div className="text-lg font-semibold capitalize text-gray-900">
                          {fullName}
                        </div>
                        <div>
                          <button
                            type="button"
                            className="bg-primary-800 hover:bg-primary-900 mt-3 rounded-full px-4 py-2 text-sm font-medium text-white"
                          >
                            View user Profile
                          </button>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-semibold text-gray-700">
                        Wallet Balance
                      </div>
                      <div className="text-base font-bold text-gray-900">
                        {formatNaira(transactionData.walletBalance ?? 0)}
                      </div>
                    </div>
                  </motion.div>

                  <motion.div
                    className="flex flex-col gap-5"
                    variants={containerVariants}
                  >
                    <motion.div
                      variants={itemVariants}
                      className="flex items-center justify-between"
                    >
                      <div className="text-sm font-medium text-gray-600">
                        Transaction ID
                      </div>
                      <div className="text-sm font-semibold uppercase text-gray-900">
                        {transactionData.id}
                      </div>
                    </motion.div>

                    <motion.div
                      variants={itemVariants}
                      className="flex items-center justify-between"
                    >
                      <div className="text-sm font-medium text-gray-600">
                        Transaction Type
                      </div>
                      <div className="text-sm font-semibold capitalize text-gray-900">
                        {transactionData.transactionType}
                      </div>
                    </motion.div>

                    <motion.div
                      variants={itemVariants}
                      className="flex items-center justify-between"
                    >
                      <div className="text-sm font-medium text-gray-600">
                        Transaction Amount
                      </div>
                      <div className="text-sm font-semibold text-gray-900">
                        {formatNaira(transactionData.amount)}
                      </div>
                    </motion.div>

                    <motion.div
                      variants={itemVariants}
                      className="flex items-center justify-between"
                    >
                      <div className="text-sm font-medium text-gray-600">
                        Transaction Date
                      </div>
                      <div className="text-sm font-semibold text-gray-900">
                        {fullDate} • {time}
                      </div>
                    </motion.div>

                    <motion.div
                      variants={itemVariants}
                      className="flex items-center justify-between border-b border-dashed border-gray-300 pb-6"
                    >
                      <div className="text-sm font-medium text-gray-600">
                        Transaction Status
                      </div>
                      <span
                        className={classNames(
                          'rounded-full px-3 py-1 text-xs font-semibold capitalize',
                          getStatusClass(transactionData.transactionStatus),
                        )}
                      >
                        {transactionData.transactionStatus}
                      </span>
                    </motion.div>

                    <motion.div
                      variants={itemVariants}
                      className="flex items-center justify-between"
                    >
                      <div className="text-sm font-medium text-gray-600">
                        Narration
                      </div>
                      <div className="text-sm font-semibold text-gray-900">
                        {transactionData.narration}
                      </div>
                    </motion.div>

                    <motion.div
                      variants={itemVariants}
                      className="flex items-center justify-between"
                    >
                      <div className="text-sm font-medium text-gray-600">
                        Direction
                      </div>
                      <div className="text-sm font-semibold capitalize text-gray-900">
                        {transactionData.direction}
                      </div>
                    </motion.div>
                  </motion.div>
                </motion.div>

                <Dialog.Close asChild>
                  <motion.button
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4 }}
                    className="absolute right-4 top-4 rounded-full p-2 transition-colors hover:bg-gray-100 focus:outline-none"
                    onClick={onClose}
                  >
                    <X className="h-5 w-5 text-gray-400" />
                  </motion.button>
                </Dialog.Close>
              </motion.div>
            </Dialog.Content>
          )}
        </AnimatePresence>
      </Dialog.Portal>
    </Dialog.Root>
  );
};

export default TransactionDetailsModal;
