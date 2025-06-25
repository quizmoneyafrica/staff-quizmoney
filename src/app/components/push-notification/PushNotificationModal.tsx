import React, { useState, useEffect } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { X, Upload, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface NotificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { subject: string; body: string; image?: string }) => void;
  onUpdate?: (data: {
    notificationId: string;
    subject: string;
    body: string;
    image?: string;
  }) => void;
  loading?: boolean;
  mode?: 'create' | 'edit';
  editData?: {
    id: string;
    subject: string;
    body: string;
    image?: string;
  };
}

const NotificationModal: React.FC<NotificationModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  onUpdate,
  loading = false,
  mode = 'create',
  editData,
}) => {
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [image, setImage] = useState('');
  const [imagePreview, setImagePreview] = useState('');

  useEffect(() => {
    if (mode === 'edit' && editData && isOpen) {
      setSubject(editData.subject || '');
      setBody(editData.body || '');
      setImage(editData.image || '');

      if (
        editData.image &&
        (editData.image.startsWith('http') ||
          editData.image.startsWith('data:'))
      ) {
        setImagePreview(editData.image);
      } else {
        setImagePreview('');
      }
    }
  }, [mode, editData, isOpen]);

  const handleSubmit = () => {
    if (subject.trim() && body.trim()) {
      if (mode === 'edit' && editData && onUpdate) {
        onUpdate({
          notificationId: editData.id,
          subject: subject.trim(),
          body: body.trim(),
          image: image.trim() || undefined,
        });
      } else {
        onSubmit({
          subject: subject.trim(),
          body: body.trim(),
          image: image.trim() || undefined,
        });
      }
    }
  };

  const handleClose = () => {
    if (!loading) {
      resetForm();
      onClose();
    }
  };

  const resetForm = () => {
    setSubject('');
    setBody('');
    setImage('');
    setImagePreview('');
  };

  const handleImageUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const url = e.target.value;
    setImage(url);

    if (url && (url.startsWith('http') || url.startsWith('data:'))) {
      setImagePreview(url);
    } else {
      setImagePreview('');
    }
  };

  useEffect(() => {
    if (!isOpen && mode === 'create') {
      resetForm();
    }
  }, [isOpen, mode]);

  const isEdit = mode === 'edit';
  const title = isEdit ? 'Edit Notification' : 'Create New Notification';
  const submitButtonText = isEdit
    ? 'Update Notification'
    : 'Create Notification';
  const loadingText = isEdit ? 'Updating...' : 'Creating...';

  return (
    <Dialog.Root open={isOpen} onOpenChange={handleClose}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-40 bg-black/50" />
        <AnimatePresence>
          {isOpen && (
            <Dialog.Content asChild>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                transition={{ duration: 0.3, ease: 'easeOut' }}
                className="fixed left-1/2 top-1/2 z-50 max-h-[90vh] w-full max-w-lg -translate-x-1/2 -translate-y-1/2 transform overflow-y-auto rounded-xl bg-white px-8 py-8 shadow-xl focus:outline-none"
              >
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.1 }}
                >
                  <Dialog.Title className="mb-6 text-xl font-bold text-gray-900">
                    {title}
                  </Dialog.Title>
                </motion.div>

                <motion.div
                  className="flex flex-col gap-6"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.2 }}
                >
                  {/* Subject Field */}
                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-600">
                      Subject
                    </label>
                    <input
                      type="text"
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      placeholder="Enter notification subject..."
                      disabled={loading}
                      className="focus:ring-primary-500 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-transparent focus:outline-none focus:ring-2 disabled:cursor-not-allowed disabled:bg-gray-100"
                      maxLength={100}
                    />
                    <div className="mt-1 text-xs text-gray-400">
                      {subject.length}/100 characters
                    </div>
                  </div>

                  {/* Body Field */}
                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-600">
                      Message
                    </label>
                    <textarea
                      value={body}
                      onChange={(e) => setBody(e.target.value)}
                      placeholder="Enter notification message..."
                      disabled={loading}
                      className="focus:ring-primary-500 min-h-[120px] w-full resize-none rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-transparent focus:outline-none focus:ring-2 disabled:cursor-not-allowed disabled:bg-gray-100"
                      maxLength={500}
                    />
                    <div className="mt-1 text-xs text-gray-400">
                      {body.length}/500 characters
                    </div>
                  </div>

                  {/* Image Field */}
                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-600">
                      Image URL (Optional)
                    </label>
                    <div className="space-y-3">
                      <input
                        type="url"
                        value={image}
                        onChange={handleImageUrlChange}
                        placeholder="https://example.com/image.jpg"
                        disabled={loading}
                        className="focus:ring-primary-500 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-transparent focus:outline-none focus:ring-2 disabled:cursor-not-allowed disabled:bg-gray-100"
                      />

                      {imagePreview && (
                        <div className="relative">
                          <img
                            src={imagePreview}
                            alt="Preview"
                            className="h-20 w-20 rounded-md border border-gray-200 object-cover"
                            onError={() => setImagePreview('')}
                          />
                          <button
                            type="button"
                            onClick={() => {
                              setImage('');
                              setImagePreview('');
                            }}
                            disabled={loading}
                            className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs text-white hover:bg-red-600 disabled:opacity-50"
                          >
                            ×
                          </button>
                        </div>
                      )}
                    </div>
                    <div className="mt-1 text-xs text-gray-400">
                      Provide a direct URL to an image (JPG, PNG, GIF)
                    </div>
                  </div>

                  <div className="flex justify-end gap-3 pt-2">
                    <button
                      type="button"
                      onClick={handleClose}
                      disabled={loading}
                      className="rounded-md border border-gray-300 px-6 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleSubmit}
                      disabled={!subject.trim() || !body.trim() || loading}
                      className={`flex items-center gap-2 rounded-md px-6 py-2 text-sm font-medium text-white transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${
                        isEdit
                          ? 'bg-green-500 hover:bg-green-600 focus:ring-green-500'
                          : 'bg-blue-500 hover:bg-blue-600 focus:ring-blue-500'
                      }`}
                    >
                      {loading ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          {loadingText}
                        </>
                      ) : (
                        submitButtonText
                      )}
                    </button>
                  </div>
                </motion.div>

                <Dialog.Close asChild>
                  <motion.button
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4 }}
                    disabled={loading}
                    className="absolute right-4 top-4 rounded-full p-2 transition-colors hover:bg-gray-100 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                    onClick={handleClose}
                  >
                    <X className="h-5 w-5 text-black" />
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

export default NotificationModal;
