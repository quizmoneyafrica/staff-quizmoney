import React from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { X } from 'lucide-react';
import CustomImage from '@/app/components/CustomImage';
import classNames from 'classnames';
import { motion, AnimatePresence } from 'framer-motion';
import { WithdrawalRequest } from '@/app/store/withdrawalSlice';
import { formatNaira, formatDateTime } from '@/app/utils/utils';

interface ExtendedWithdrawalRequest extends WithdrawalRequest {
  userId?: string;
  bankName?: string;
  accountNumber?: string;
}

interface WithdrawalModalProps {
  isOpen: boolean;
  onClose: () => void;
  withdrawalData: ExtendedWithdrawalRequest | null;
}

const WithdrawalModal: React.FC<WithdrawalModalProps> = ({
  isOpen,
  onClose,
  withdrawalData,
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

  const getFormattedDateTime = () => {
    if (!withdrawalData?.createdAt?.iso) return { time: '', fullDate: '' };
    return formatDateTime(withdrawalData.createdAt.iso);
  };

  const { time, fullDate } = getFormattedDateTime();

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
                    Withdrawal Request Details
                  </Dialog.Title>
                </motion.div>

                {withdrawalData && (
                  <motion.div
                    className="flex flex-col gap-6"
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                  >
                    <motion.div
                      className="flex items-center gap-4 border-b border-gray-200 pb-6"
                      variants={itemVariants}
                    >
                      <div className="h-12 w-12 flex-shrink-0">
                        <div className="bg-primary-50 flex h-12 w-12 items-center justify-center rounded-full">
                          <span className="text-primary-800 text-lg font-semibold">
                            {withdrawalData.firstName
                              ?.charAt(0)
                              .toUpperCase() || 'U'}
                          </span>
                        </div>
                      </div>
                      <div className="flex-1">
                        <div className="text-lg font-semibold capitalize text-gray-900">
                          {withdrawalData.firstName || 'Unknown User'}
                        </div>
                        <div className="text-sm text-gray-500">
                          User ID: {withdrawalData.userId || 'N/A'}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="mb-1 text-sm text-gray-500">
                          Wallet Balance
                        </div>
                        <div className="text-lg font-semibold text-gray-900">
                          {formatNaira(
                            Number(withdrawalData.balance || 0),
                            true,
                          )}
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
                          Request ID
                        </div>
                        <div className="text-sm font-semibold text-gray-900">
                          {withdrawalData.id || 'N/A'}
                        </div>
                      </motion.div>

                      <motion.div
                        variants={itemVariants}
                        className="flex items-center justify-between"
                      >
                        <div className="text-sm font-medium text-gray-600">
                          Request Amount
                        </div>
                        <div className="text-sm font-semibold text-gray-900">
                          {formatNaira(
                            Number(withdrawalData.amount || 0),
                            true,
                          )}
                        </div>
                      </motion.div>

                      <motion.div
                        variants={itemVariants}
                        className="flex items-center justify-between"
                      >
                        <div className="text-sm font-medium text-gray-600">
                          Withdrawal Account
                        </div>
                        <div className="text-sm font-semibold text-gray-900">
                          {withdrawalData.bankName
                            ? `${withdrawalData.bankName} - ${
                                withdrawalData.accountNumber || '****'
                              }`
                            : 'Bank Transfer'}
                        </div>
                      </motion.div>

                      <motion.div
                        variants={itemVariants}
                        className="flex items-center justify-between"
                      >
                        <div className="text-sm font-medium text-gray-600">
                          Request Date
                        </div>
                        <div className="text-sm font-semibold text-gray-900">
                          {fullDate || 'N/A'}
                        </div>
                      </motion.div>

                      <motion.div
                        variants={itemVariants}
                        className="flex items-center justify-between"
                      >
                        <div className="text-sm font-medium text-gray-600">
                          Request Time
                        </div>
                        <div className="text-sm font-semibold text-gray-900">
                          {time || 'N/A'}
                        </div>
                      </motion.div>

                      <motion.div
                        variants={itemVariants}
                        className="flex items-center justify-between border-b border-dashed border-gray-300 pb-6"
                      >
                        <div className="text-sm font-medium text-gray-600">
                          Status
                        </div>
                        <span
                          className={classNames(
                            'rounded-full px-3 py-1 text-xs font-semibold capitalize',
                            getStatusClass(withdrawalData.status || 'pending'),
                          )}
                        >
                          {withdrawalData.status || 'pending'}
                        </span>
                      </motion.div>
                    </motion.div>

                    {withdrawalData.status?.toLowerCase() !== 'resolved' && (
                      <motion.div
                        className="flex flex-col gap-4"
                        variants={containerVariants}
                      >
                        <motion.div variants={itemVariants}>
                          <label className="mb-2 block text-sm font-medium text-gray-600">
                            Comments/Notes
                          </label>
                          <textarea
                            placeholder="Add comments or notes about this withdrawal request..."
                            className="focus:ring-primary-500 min-h-[100px] w-full resize-none rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-transparent focus:outline-none focus:ring-2"
                          />
                        </motion.div>

                        <motion.div
                          variants={itemVariants}
                          className="flex justify-end gap-3 pt-2"
                        >
                          <button
                            type="button"
                            className="rounded-md bg-red-500 px-6 py-2 text-sm font-medium text-white transition-colors hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                          >
                            Reject
                          </button>
                          <button
                            type="button"
                            className="rounded-md bg-green-500 px-6 py-2 text-sm font-medium text-white transition-colors hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                          >
                            Accept
                          </button>
                        </motion.div>
                      </motion.div>
                    )}
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
  switch (status.toLowerCase()) {
    case 'resolved':
    case 'approved':
    case 'successful':
      return 'bg-green-100 text-green-700';
    case 'failed':
    case 'rejected':
      return 'bg-red-100 text-red-700';
    case 'pending':
    default:
      return 'bg-yellow-100 text-yellow-700';
  }
};

export default WithdrawalModal;
