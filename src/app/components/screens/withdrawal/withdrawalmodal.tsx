import React, { useState, useEffect } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { X, Copy, Check } from 'lucide-react';
import classNames from 'classnames';
import { motion, AnimatePresence } from 'framer-motion';
import { formatNaira, formatDateTime } from '@/app/utils/utils';
import {
  useApproveWithdrawal,
  useRejectWithdrawal,
  useGetWithdrawalRequest,
} from '@/app/api/withdrawal';
import { toast } from 'sonner';
import { toastPosition } from '@/app/utils/utils';

interface WithdrawalRequest {
  id: string;
  purpose: string;
  comment: string;
  amount: number;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  processAt: string;
  createdAt: string;
  firstName: string;
  availableBalance: number;
  approvedBy?: string;
}

interface WithdrawalModalProps {
  isOpen: boolean;
  onClose: () => void;
  withdrawalData: WithdrawalRequest | null;
}

interface ApiError {
  message?: string;
  error?: string;
}

const WithdrawalModal: React.FC<WithdrawalModalProps> = ({
  isOpen,
  onClose,
  withdrawalData,
}) => {
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [comment, setComment] = useState('');

  const { data: detailedWithdrawalData, isLoading: loadingDetails } =
    useGetWithdrawalRequest(withdrawalData?.id || '');

  const { mutateAsync: approveWithdrawal, isPending } = useApproveWithdrawal();
  const { mutateAsync: rejectWithdrawal, isPending: isRejecting } =
    useRejectWithdrawal();

  const currentWithdrawalData = detailedWithdrawalData || withdrawalData;

  useEffect(() => {
    if (isOpen) {
      setComment('');
    }
  }, [isOpen]);

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

  const copyToClipboard = async (text: string, fieldName: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(fieldName);
      setTimeout(() => setCopiedField(null), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  const CopyButton: React.FC<{ text: string; fieldName: string }> = ({
    text,
    fieldName,
  }) => (
    <button
      onClick={() => copyToClipboard(text, fieldName)}
      className="ml-2 rounded p-1 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
      title={`Copy ${fieldName}`}
    >
      {copiedField === fieldName ? (
        <Check className="h-4 w-4 text-green-500" />
      ) : (
        <Copy className="h-4 w-4" />
      )}
    </button>
  );

  const getFormattedDateTime = () => {
    if (!currentWithdrawalData?.createdAt) return { time: '', fullDate: '' };
    return formatDateTime(currentWithdrawalData.createdAt);
  };

  const { time, fullDate } = getFormattedDateTime();

  const handleApproveWithdrawal = async () => {
    if (!currentWithdrawalData?.id) return;

    try {
      const response = await approveWithdrawal({
        id: currentWithdrawalData.id,
        comment: comment.trim() || 'Approved',
      });

      if (response) {
        toast.success(response.message || 'Withdrawal approved successfully', {
          position: toastPosition,
        });
        onClose();
      }
    } catch (error) {
      const apiError = error as ApiError;
      const errorMessage =
        apiError?.message || apiError?.error || 'Failed to approve withdrawal';
      toast.error(errorMessage, {
        position: toastPosition,
      });
    }
  };

  const handleRejectWithdrawal = async () => {
    if (!currentWithdrawalData?.id) return;

    if (comment.trim() === '') {
      toast.error('Please add a comment or reason for rejection.', {
        position: toastPosition,
      });
      return;
    }

    try {
      const response = await rejectWithdrawal({
        id: currentWithdrawalData.id,
        comment: comment.trim(),
      });

      if (response) {
        toast.success(response.message || 'Withdrawal rejected successfully', {
          position: toastPosition,
        });
        onClose();
      }
    } catch (error) {
      const apiError = error as ApiError;
      const errorMessage =
        apiError?.message || apiError?.error || 'Failed to reject withdrawal';
      toast.error(errorMessage, {
        position: toastPosition,
      });
    }
  };

  if (loadingDetails && !currentWithdrawalData) {
    return (
      <Dialog.Root open={isOpen} onOpenChange={onClose}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/50" />
          <Dialog.Content className="fixed left-1/2 top-1/2 w-full max-w-lg -translate-x-1/2 -translate-y-1/2 transform rounded-xl bg-white px-8 py-8 shadow-xl focus:outline-none">
            <div className="flex items-center justify-center py-12">
              <div className="text-gray-500">Loading withdrawal details...</div>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    );
  }

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

                {currentWithdrawalData && (
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
                      <div className="relative h-12 w-12 flex-shrink-0">
                        <div className="bg-primary-50 flex h-12 w-12 items-center justify-center rounded-full">
                          <span className="text-primary-800 text-lg font-semibold">
                            {currentWithdrawalData.firstName
                              ?.charAt(0)
                              .toUpperCase() || 'U'}
                          </span>
                        </div>
                      </div>
                      <div className="flex-1">
                        <div className="text-lg font-semibold capitalize text-gray-900">
                          {currentWithdrawalData.firstName || 'Unknown User'}
                        </div>
                        <div className="text-sm text-gray-500">
                          Request ID: {currentWithdrawalData.id}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="mb-1 text-sm text-gray-500">
                          Available Balance
                        </div>
                        <div className="text-lg font-semibold text-gray-900">
                          {formatNaira(
                            currentWithdrawalData.availableBalance,
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
                          Request Amount
                        </div>
                        <div className="flex items-center text-sm font-semibold text-gray-900">
                          {formatNaira(currentWithdrawalData.amount, true)}
                          <CopyButton
                            text={String(currentWithdrawalData.amount)}
                            fieldName="Request Amount"
                          />
                        </div>
                      </motion.div>

                      <motion.div
                        variants={itemVariants}
                        className="flex items-center justify-between"
                      >
                        <div className="text-sm font-medium text-gray-600">
                          Purpose
                        </div>
                        <div className="flex items-center text-sm font-semibold text-gray-900">
                          {currentWithdrawalData.purpose || 'N/A'}
                          {currentWithdrawalData.purpose && (
                            <CopyButton
                              text={currentWithdrawalData.purpose}
                              fieldName="Purpose"
                            />
                          )}
                        </div>
                      </motion.div>

                      {currentWithdrawalData.comment && (
                        <motion.div
                          variants={itemVariants}
                          className="flex items-start justify-between"
                        >
                          <div className="text-sm font-medium text-gray-600">
                            User Comment
                          </div>
                          <div className="flex max-w-xs items-start text-right text-sm font-semibold text-gray-900">
                            <span className="break-words">
                              {currentWithdrawalData.comment}
                            </span>
                            <CopyButton
                              text={currentWithdrawalData.comment}
                              fieldName="User Comment"
                            />
                          </div>
                        </motion.div>
                      )}

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

                      {currentWithdrawalData.processAt && (
                        <motion.div
                          variants={itemVariants}
                          className="flex items-center justify-between"
                        >
                          <div className="text-sm font-medium text-gray-600">
                            Process Date
                          </div>
                          <div className="text-sm font-semibold text-gray-900">
                            {
                              formatDateTime(currentWithdrawalData.processAt)
                                .fullDate
                            }
                          </div>
                        </motion.div>
                      )}

                      {currentWithdrawalData.approvedBy && (
                        <motion.div
                          variants={itemVariants}
                          className="flex items-center justify-between"
                        >
                          <div className="text-sm font-medium text-gray-600">
                            Approved By
                          </div>
                          <div className="text-sm font-semibold text-gray-900">
                            {currentWithdrawalData.approvedBy}
                          </div>
                        </motion.div>
                      )}

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
                            getStatusClass(currentWithdrawalData.status),
                          )}
                        >
                          {currentWithdrawalData.status.toLowerCase()}
                        </span>
                      </motion.div>
                    </motion.div>

                    {currentWithdrawalData.status === 'PENDING' && (
                      <motion.div
                        className="flex flex-col gap-4"
                        variants={containerVariants}
                      >
                        <motion.div variants={itemVariants}>
                          <label className="mb-2 block text-sm font-medium text-gray-600">
                            Comments/Notes
                          </label>
                          <textarea
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
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
                            onClick={handleRejectWithdrawal}
                            disabled={isRejecting || isPending}
                            className="rounded-md bg-red-500 px-6 py-2 text-sm font-medium text-white transition-colors hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50"
                          >
                            {isRejecting ? 'Rejecting...' : 'Reject'}
                          </button>
                          <button
                            type="button"
                            onClick={handleApproveWithdrawal}
                            disabled={isPending || isRejecting}
                            className="rounded-md bg-green-500 px-6 py-2 text-sm font-medium text-white transition-colors hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50"
                          >
                            {isPending ? 'Approving...' : 'Approve'}
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
  switch (status.toUpperCase()) {
    case 'APPROVED':
      return 'bg-green-100 text-green-700';
    case 'REJECTED':
      return 'bg-red-100 text-red-700';
    case 'PENDING':
    default:
      return 'bg-yellow-100 text-yellow-700';
  }
};

export default WithdrawalModal;
