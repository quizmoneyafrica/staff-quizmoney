// Updated TotalTransactionModal.tsx
import React, { useState } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { X, Copy, Check } from 'lucide-react';
import classNames from 'classnames';
import { motion, AnimatePresence } from 'framer-motion';
import { StoreTransaction } from '@/app/store/salesSlice';
import { formatNaira, formatDateTime } from '@/app/utils/utils';

interface TotalTransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  transactionData: StoreTransaction | null;
}

const TotalTransactionModal: React.FC<TotalTransactionModalProps> = ({
  isOpen,
  onClose,
  transactionData,
}) => {
  const [copiedField, setCopiedField] = useState<string | null>(null);

  // const [comment, setComment] = useState('');

  // const { mutateAsync: approveTransaction, isPending } = useApproveTransaction();
  // const { mutateAsync: rejectTransaction, isPending: isRejecting } = useRejectTransaction();

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
    if (!transactionData?.createdAt?.iso) return { time: '', fullDate: '' };
    return formatDateTime(transactionData.createdAt.iso);
  };

  const { time, fullDate } = getFormattedDateTime();

  // const handleApproveTransaction = async () => {
  //   try {
  //     const response = await approveTransaction({
  //       transactionId: transactionData?.objectId,
  //       fee: 0,
  //     });
  //     if (response) {
  //       toast.success(response?.result?.message, {
  //         position: toastPosition,
  //       });
  //       onClose();
  //     }
  //   } catch (error: { error?: string } | unknown) {
  //     if (error && typeof error === 'object' && 'error' in error) {
  //       toast.error(error.error as string, {
  //         position: toastPosition,
  //       });
  //     }
  //   }
  // };

  // const handleRejectTransaction = async () => {
  //   if (comment.trim() === '') {
  //     toast.error('Please add a comment or reason for rejection.', {
  //       position: toastPosition,
  //     });
  //     return;
  //   }

  //   try {
  //     const response = await rejectTransaction({
  //       transactionId: transactionData?.objectId,
  //       reason: comment,
  //     });
  //     if (response) {
  //       toast.success(response?.result?.message, {
  //         position: toastPosition,
  //       });
  //       onClose();
  //     }
  //   } catch (error: { error?: string } | unknown) {
  //     if (error && typeof error === 'object' && 'error' in error) {
  //       toast.error(error.error as string, {
  //         position: toastPosition,
  //       });
  //     }
  //   }
  // };

  const getStatusClass = (status: string) => {
    const statusLower = status.toLowerCase();

    if (statusLower === 'completed') {
      return 'bg-green-100 text-green-800';
    }
    if (statusLower === 'failed') {
      return 'bg-red-100 text-red-800';
    }
    if (statusLower === 'pending') {
      return 'bg-yellow-100 text-yellow-800';
    }

    return 'bg-gray-100 text-gray-800';
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

                {transactionData && (
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
                            {transactionData.firstName
                              ?.charAt(0)
                              .toUpperCase() || 'U'}
                          </span>
                        </div>
                      </div>
                      <div className="flex-1">
                        <div className="text-lg font-semibold capitalize text-gray-900">
                          {transactionData.firstName || 'Unknown User'}
                        </div>
                        <div className="text-sm text-gray-500">
                          User ID: {transactionData.userId || 'N/A'}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="mb-1 text-sm text-gray-500">
                          Transaction Amount
                        </div>
                        <div className="text-lg font-semibold text-gray-900">
                          {formatNaira(
                            Number(transactionData.amount || 0),
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
                          Transaction ID
                        </div>
                        <div className="flex items-center text-sm font-semibold text-gray-900">
                          {transactionData.objectId || 'N/A'}
                          <CopyButton
                            text={transactionData.objectId || ''}
                            fieldName="Transaction ID"
                          />
                        </div>
                      </motion.div>

                      <motion.div
                        variants={itemVariants}
                        className="flex items-center justify-between"
                      >
                        <div className="text-sm font-medium text-gray-600">
                          Transaction Type
                        </div>
                        <div className="flex items-center text-sm font-semibold text-gray-900">
                          {transactionData.product?.productName || 'N/A'}
                          {transactionData.product?.productName && (
                            <CopyButton
                              text={transactionData.product.productName}
                              fieldName="Transaction Type"
                            />
                          )}
                        </div>
                      </motion.div>

                      <motion.div
                        variants={itemVariants}
                        className="flex items-center justify-between"
                      >
                        <div className="text-sm font-medium text-gray-600">
                          Transaction Amount
                        </div>
                        <div className="flex items-center text-sm font-semibold text-gray-900">
                          {formatNaira(
                            Number(transactionData.amount || 0),
                            true,
                          )}
                          <CopyButton
                            text={String(transactionData.amount || 0)}
                            fieldName="Transaction Amount"
                          />
                        </div>
                      </motion.div>

                      <motion.div
                        variants={itemVariants}
                        className="flex items-center justify-between"
                      >
                        <div className="text-sm font-medium text-gray-600">
                          Bank Name
                        </div>
                        <div className="flex items-center text-sm font-semibold text-gray-900">
                          {transactionData.bankAccount?.bankName || 'N/A'}
                          {transactionData.bankAccount?.bankName && (
                            <CopyButton
                              text={transactionData.bankAccount.bankName}
                              fieldName="Bank Name"
                            />
                          )}
                        </div>
                      </motion.div>

                      <motion.div
                        variants={itemVariants}
                        className="flex items-center justify-between"
                      >
                        <div className="text-sm font-medium text-gray-600">
                          Account No
                        </div>
                        <div className="flex items-center text-sm font-semibold text-gray-900">
                          {transactionData.bankAccount?.accountNumber || 'N/A'}
                          {transactionData.bankAccount?.accountNumber && (
                            <CopyButton
                              text={transactionData.bankAccount.accountNumber}
                              fieldName="Account Number"
                            />
                          )}
                        </div>
                      </motion.div>

                      <motion.div
                        variants={itemVariants}
                        className="flex items-center justify-between"
                      >
                        <div className="text-sm font-medium text-gray-600">
                          Account Holder
                        </div>
                        <div className="flex items-center text-sm font-semibold text-gray-900">
                          {transactionData.firstName || 'N/A'}
                          {transactionData.firstName && (
                            <CopyButton
                              text={transactionData.firstName}
                              fieldName="Name"
                            />
                          )}
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
                          {fullDate || 'N/A'}
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
                            getStatusClass(transactionData.status || 'pending'),
                          )}
                        >
                          {transactionData.status || 'pending'}
                        </span>
                      </motion.div>
                    </motion.div>

                    {/*  Approval/Rejection  */}
                    {/* 
                    {!['resolved', 'rejected'].includes(
                      transactionData.status?.toLowerCase() || '',
                    ) && (
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
                            placeholder="Add comments or notes about this transaction..."
                            className="focus:ring-primary-500 min-h-[100px] w-full resize-none rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-transparent focus:outline-none focus:ring-2"
                          />
                        </motion.div>

                        <motion.div
                          variants={itemVariants}
                          className="flex justify-end gap-3 pt-2"
                        >
                          <button
                            type="button"
                            onClick={handleRejectTransaction}
                            disabled={isRejecting}
                            className="rounded-md bg-red-500 px-6 py-2 text-sm font-medium text-white transition-colors hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                          >
                            Reject
                          </button>
                          <button
                            type="button"
                            onClick={handleApproveTransaction}
                            disabled={isPending}
                            className="rounded-md bg-green-500 px-6 py-2 text-sm font-medium text-white transition-colors hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                          >
                            Accept
                          </button>
                        </motion.div>
                      </motion.div>
                    )}
                    */}
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

export default TotalTransactionModal;
