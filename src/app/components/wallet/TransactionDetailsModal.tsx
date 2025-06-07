import React from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { X } from 'lucide-react';
import CustomImage from '@/app/components/CustomImage';
import classNames from 'classnames';
import { motion, AnimatePresence } from 'framer-motion';

interface Transaction {
  id: string;
  username: string;
  avatarUrl: string;
  transactionType: string;
  transactionAmount: string;
  date: string;
  transactionStatus: 'Successful' | 'Failed' | 'Pending';
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
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.3,
        ease: 'easeOut',
      },
    },
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
                    Transaction details
                  </Dialog.Title>
                </motion.div>

                {transactionData && (
                  <motion.div
                    className="flex flex-col gap-6"
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                  >
                    {/* User Info */}
                    <motion.div
                      className="flex items-center gap-4 border-b border-gray-200 pb-6"
                      variants={itemVariants}
                    >
                      <div className="h-12 w-12 flex-shrink-0">
                        <CustomImage
                          className="h-12 w-12 rounded-full"
                          src={transactionData.avatarUrl}
                          alt={`${transactionData.username}'s avatar`}
                          width={48}
                          height={48}
                        />
                      </div>
                      <div className="flex-1">
                        <div className="text-lg font-semibold text-gray-900">
                          {transactionData.username}
                        </div>
                        <div className="text-sm text-gray-500">
                          {transactionData.username.toLowerCase()}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="mb-1 text-sm text-gray-500">
                          Wallet Balance
                        </div>
                        <div className="text-lg font-semibold text-gray-900">
                          ₦100,000.00
                        </div>
                      </div>
                    </motion.div>

                    {/* Transaction Details */}
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
                        <div className="text-sm font-semibold text-gray-900">
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
                        <div className="text-sm font-semibold text-gray-900">
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
                          {transactionData.transactionAmount}
                        </div>
                      </motion.div>

                      <motion.div
                        variants={itemVariants}
                        className="flex items-center justify-between"
                      >
                        <div className="text-sm font-medium text-gray-600">
                          Transaction Method
                        </div>
                        <div className="text-sm font-semibold text-gray-900">
                          Paystack-Bank Transfer
                        </div>
                      </motion.div>

                      <motion.div
                        variants={itemVariants}
                        className="flex items-center justify-between"
                      >
                        <div className="text-sm font-medium text-gray-600">
                          Transaction Time
                        </div>
                        <div className="text-sm font-semibold text-gray-900">
                          {transactionData.date}
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
                            'rounded-full px-3 py-1 text-xs font-semibold',
                            getStatusClass(transactionData.transactionStatus),
                          )}
                        >
                          {transactionData.transactionStatus}
                        </span>
                      </motion.div>
                    </motion.div>
                  </motion.div>
                )}

                <Dialog.Close asChild>
                  <motion.button
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4 }}
                    className="absolute right-4 top-4 rounded-full p-2 transition-colors hover:bg-gray-100 focus:outline-none"
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

const getStatusClass = (status: string) => {
  switch (status) {
    case 'Successful':
      return 'bg-green-100 text-green-700';
    case 'Failed':
      return 'bg-red-100 text-red-700';
    case 'Pending':
      return 'bg-yellow-100 text-yellow-700';
    default:
      return 'bg-gray-100 text-gray-700';
  }
};

export default TransactionDetailsModal;
