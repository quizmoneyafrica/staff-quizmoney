import React from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { X } from 'lucide-react';
import { motion } from 'framer-motion';

interface Transaction {
  id: number;
  transactionId: string;
  transactionType: string;
  amount: string;
  dateTime: string;
  action: string;
  type: string;
  status?: string;
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
  return (
    <Dialog.Root open={isOpen} onOpenChange={onClose}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black opacity-30"/>
        <Dialog.Content asChild>
          <motion.div
            initial={{ opacity: 0, y: 60 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
            className="fixed top-1/2 left-1/2 max-h-[85vh] w-[90vw] max-w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-xl bg-white p-12 shadow-xl focus:outline-none"
            onClick={(e) => e.stopPropagation()}
          >
            <Dialog.Title className="text-[32px] font-bold mb-12 text-gray-900">Transaction History</Dialog.Title>

            {transactionData && (
              <div className="space-y-8 text-[20px]">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 font-medium">Transaction ID</span>
                  <span className="text-gray-900 font-semibold">ID{transactionData.transactionId}</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 font-medium">Transaction Type</span>
                  <span className="text-gray-900 font-semibold">{transactionData.transactionType}</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 font-medium">Amount</span>
                  <span className="text-gray-900 font-bold text-[22px]">
                    ₦{transactionData.amount.replace(/[₦,]/g, '').replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                  </span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 font-medium">Transaction Status</span>
                  <span className="bg-green-100 text-green-700 text-[16px] font-semibold px-4 py-2 rounded-full">
                    {transactionData.status || 'Successful'}
                  </span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 font-medium">Date & time</span>
                  <span className="text-gray-900 font-semibold">{transactionData.dateTime}</span>
                </div>
              </div>
            )}

            <Dialog.Close asChild>
              <button
                className="absolute top-8 right-8 inline-flex h-[36px] w-[36px] items-center justify-center rounded-full hover:bg-gray-100 focus:shadow-outline outline-none cursor-pointer transition-colors"
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
