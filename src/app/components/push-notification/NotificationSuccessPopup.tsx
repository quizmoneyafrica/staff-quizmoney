import React, { useEffect, useState } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, Users, Send, X } from 'lucide-react';
import { convertToLocaleString } from '@/app/utils';

interface NotificationSuccessPopupProps {
  isOpen: boolean;
  onClose: () => void;
  recipientCount: number;
  isAllUsers: boolean;
  notificationTitle: string;
}

const NotificationSuccessPopup: React.FC<NotificationSuccessPopupProps> = ({
  isOpen,
  onClose,
  recipientCount,
  isAllUsers,
  notificationTitle,
}) => {
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setShowConfetti(true);
      // Auto close after 4 seconds
      const timer = setTimeout(() => {
        onClose();
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [isOpen, onClose]);

  return (
    <Dialog.Root open={isOpen} onOpenChange={onClose}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/30 backdrop-blur-sm" />
        <AnimatePresence>
          {isOpen && (
            <Dialog.Content asChild>
              <motion.div
                initial={{ opacity: 0, scale: 0.8, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.8, y: 20 }}
                transition={{
                  duration: 0.4,
                  ease: [0.4, 0, 0.2, 1],
                  type: 'spring',
                  damping: 25,
                  stiffness: 300,
                }}
                className="fixed left-1/2 top-1/2 w-full max-w-md -translate-x-1/2 -translate-y-1/2 transform rounded-2xl border border-gray-100 bg-white p-8 shadow-2xl focus:outline-none"
              >
                {showConfetti && (
                  <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-2xl">
                    {[...Array(12)].map((_, i) => (
                      <motion.div
                        key={i}
                        className="absolute h-2 w-2 rounded-full bg-gradient-to-r from-green-400 to-blue-500"
                        initial={{
                          x: Math.random() * 300 - 150,
                          y: -20,
                          opacity: 1,
                          scale: 0,
                        }}
                        animate={{
                          y: 400,
                          opacity: 0,
                          scale: 1,
                          rotate: 360,
                        }}
                        transition={{
                          duration: 2,
                          delay: i * 0.1,
                          ease: 'easeOut',
                        }}
                        style={{
                          left: '50%',
                          top: '20%',
                        }}
                      />
                    ))}
                  </div>
                )}

                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{
                    delay: 0.2,
                    duration: 0.5,
                    type: 'spring',
                    damping: 15,
                    stiffness: 300,
                  }}
                  className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-r from-green-400 to-green-500 shadow-lg"
                >
                  <CheckCircle className="h-8 w-8 text-white" />
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3, duration: 0.4 }}
                  className="text-center"
                >
                  <h3 className="mb-2 text-2xl font-bold text-gray-900">
                    Notification Sent!
                  </h3>
                  <p className="mb-6 text-gray-600">
                    Your push notification has been successfully delivered
                  </p>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4, duration: 0.4 }}
                  className="space-y-4"
                >
                  <div className="rounded-lg bg-gray-50 p-4">
                    <div className="mb-2 flex items-center gap-3">
                      <Send className="h-4 w-4 text-blue-500" />
                      <span className="text-sm font-medium text-gray-700">
                        Notification Title
                      </span>
                    </div>
                    <p className="text-sm font-medium text-gray-900">
                      {notificationTitle}
                    </p>
                  </div>

                  <div className="rounded-lg bg-gradient-to-r from-blue-50 to-green-50 p-4">
                    <div className="mb-2 flex items-center gap-3">
                      <Users className="h-4 w-4 text-blue-500" />
                      <span className="text-sm font-medium text-gray-700">
                        Recipients
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-lg font-bold text-blue-600">
                        {convertToLocaleString(recipientCount)}
                      </span>
                      <span className="text-sm text-gray-600">
                        {isAllUsers ? 'all users' : 'selected users'}
                      </span>
                    </div>
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5, duration: 0.3 }}
                  className="mt-6"
                >
                  <div className="h-1 overflow-hidden rounded-full bg-gray-200">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: '100%' }}
                      transition={{
                        delay: 0.6,
                        duration: 3.4,
                        ease: 'easeInOut',
                      }}
                      className="h-full rounded-full bg-gradient-to-r from-green-400 to-blue-500"
                    />
                  </div>
                  <p className="mt-2 text-center text-xs text-gray-500">
                    Auto-closing in 4 seconds...
                  </p>
                </motion.div>

                <Dialog.Close asChild>
                  <motion.button
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.7 }}
                    className="absolute right-4 top-4 rounded-full p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                  >
                    <X className="h-5 w-5" />
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

export default NotificationSuccessPopup;
