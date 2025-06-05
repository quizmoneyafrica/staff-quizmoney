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

const TransactionDetailsModal: React.FC<TransactionDetailsModalProps> = ({ isOpen, onClose, transactionData }) => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.3,
        ease: "easeOut"
      }
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
                transition={{ duration: 0.3, ease: "easeOut" }}
                className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white px-8 py-8 rounded-xl shadow-xl w-full max-w-lg focus:outline-none"
              >
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.1 }}
                >
                  <Dialog.Title className="text-xl font-semibold mb-6 text-gray-900">Transaction details</Dialog.Title>
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
                      className="flex items-center gap-4 pb-6 border-b border-gray-200"
                      variants={itemVariants}
                    >
                      <div className="flex-shrink-0 h-12 w-12">
                         <CustomImage className="h-12 w-12 rounded-full" src={transactionData.avatarUrl} alt={`${transactionData.username}'s avatar`} width={48} height={48} />
                      </div>
                      <div className="flex-1">
                        <div className="text-lg font-semibold text-gray-900">{transactionData.username}</div>
                        <div className="text-sm text-gray-500">{transactionData.username.toLowerCase()}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-gray-500 mb-1">Wallet Balance</div>
                        <div className="text-lg font-semibold text-gray-900">₦100,000.00</div>
                      </div>
                    </motion.div>

                    {/* Transaction Details */}
                    <motion.div 
                      className="flex flex-col gap-5"
                      variants={containerVariants}
                    >
                      <motion.div variants={itemVariants} className="flex justify-between items-center">
                        <div className="text-sm font-medium text-gray-600">Transaction ID</div>
                        <div className="text-sm font-semibold text-gray-900">{transactionData.id}</div>
                      </motion.div>
                      
                      <motion.div variants={itemVariants} className="flex justify-between items-center">
                        <div className="text-sm font-medium text-gray-600">Transaction Type</div>
                        <div className="text-sm font-semibold text-gray-900">{transactionData.transactionType}</div>
                      </motion.div>
                      
                      <motion.div variants={itemVariants} className="flex justify-between items-center">
                        <div className="text-sm font-medium text-gray-600">Transaction Amount</div>
                        <div className="text-sm font-semibold text-gray-900">{transactionData.transactionAmount}</div>
                      </motion.div>
                      
                      <motion.div variants={itemVariants} className="flex justify-between items-center">
                        <div className="text-sm font-medium text-gray-600">Transaction Method</div>
                        <div className="text-sm font-semibold text-gray-900">Paystack-Bank Transfer</div>
                      </motion.div>
                      
                      <motion.div variants={itemVariants} className="flex justify-between items-center">
                        <div className="text-sm font-medium text-gray-600">Transaction Time</div>
                        <div className="text-sm font-semibold text-gray-900">{transactionData.date}</div>
                      </motion.div>
                      
                      <motion.div variants={itemVariants} className="flex justify-between items-center pb-6 border-b border-dashed border-gray-300">
                        <div className="text-sm font-medium text-gray-600">Transaction Status</div>
                        <span className={classNames("px-3 py-1 text-xs font-semibold rounded-full", getStatusClass(transactionData.transactionStatus))}>
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
                    className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100 focus:outline-none transition-colors"
                  >
                    <X className="w-5 h-5 text-gray-400" />
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