'use client';

import React, { useState, useEffect } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { X, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  validateGameConfig,
  prepareGameConfigData,
  type GameConfigFormData,
} from '@/app/components/perfect-score/GameConfigModal.schema';
import { UpdatePerfectScoreGamePayload } from '@/app/api/game';

import { Switch } from '../ui/switch';

interface GameConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (
    data: Omit<UpdatePerfectScoreGamePayload, 'gameId' | 'type'>,
  ) => void;
  loading?: boolean;
  mode: 'view' | 'edit';
  initialData?: {
    costPerSpin?: number;
    maximumSpinPerUser?: number;
    respinFeatureEnabled?: boolean;
  };
}

interface FormErrors {
  costPerSpin?: string;
  maximumSpinPerUser?: string;
  respinFeatureEnabled?: string;
}

const GameConfigModal: React.FC<GameConfigModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  loading = false,
  mode,
  initialData,
}) => {
  const [formData, setFormData] = useState<GameConfigFormData>({
    costPerSpin: '',
    maximumSpinPerUser: '',
    respinFeatureEnabled: false,
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<
    'idle' | 'success' | 'error'
  >('idle');
  const [currentMode, setCurrentMode] = useState(mode);

  useEffect(() => {
    if (isOpen && initialData) {
      setFormData({
        costPerSpin: initialData.costPerSpin?.toString() || '',
        maximumSpinPerUser: initialData.maximumSpinPerUser?.toString() || '',
        respinFeatureEnabled: initialData.respinFeatureEnabled || false,
      });
    }
    setCurrentMode(mode);
  }, [isOpen, initialData, mode]);

  useEffect(() => {
    if (!isOpen) {
      resetForm();
    }
  }, [isOpen]);

  const resetForm = () => {
    setFormData({
      costPerSpin: '',
      maximumSpinPerUser: '',
      respinFeatureEnabled: false,
    });
    setErrors({});
    setSubmitStatus('idle');
    setIsSubmitting(false);
    setCurrentMode(mode);
  };

  const validateForm = (): boolean => {
    const { isValid, errors: validationErrors } = validateGameConfig(formData);
    setErrors(validationErrors);
    return isValid;
  };

  const handleInputChange = (
    field: keyof Omit<GameConfigFormData, 'respinFeatureEnabled'>,
    value: string,
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const handleSwitchChange = (checked: boolean) => {
    setFormData((prev) => ({ ...prev, respinFeatureEnabled: checked }));
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsSubmitting(true);
    setSubmitStatus('idle');

    try {
      const submitData = prepareGameConfigData(formData);
      await onSubmit(submitData);
      setSubmitStatus('success');
      setTimeout(() => {
        handleClose();
      }, 1000);
    } catch (error) {
      console.error('Error updating game configuration:', error);
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!loading && !isSubmitting) {
      resetForm();
      onClose();
    }
  };

  const handleEditToggle = () => {
    setCurrentMode(currentMode === 'view' ? 'edit' : 'view');
    setErrors({});
    setSubmitStatus('idle');
  };

  const isFormValid =
    formData.costPerSpin.trim() &&
    formData.maximumSpinPerUser.trim() &&
    Object.keys(errors).length === 0;
  const isViewMode = currentMode === 'view';

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
                className="fixed left-1/2 top-1/2 z-50 max-h-[90vh] w-full max-w-lg -translate-x-1/2 -translate-y-1/2 transform overflow-y-auto rounded-[20px] bg-white px-8 py-8 shadow-xl focus:outline-none"
              >
                <Dialog.Title className="mb-6 text-xl font-bold text-gray-900">
                  {isViewMode
                    ? 'Spin Configuration'
                    : 'Edit Spin Configuration'}
                </Dialog.Title>
                <motion.div
                  className="flex flex-col gap-6"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.2 }}
                >
                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700">
                      Cost per Spin
                    </label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-medium text-gray-700">
                        ₦
                      </span>
                      <input
                        type="number"
                        min="0"
                        value={formData.costPerSpin}
                        onChange={(e) =>
                          handleInputChange('costPerSpin', e.target.value)
                        }
                        placeholder="100"
                        disabled={isViewMode || loading || isSubmitting}
                        className={`w-full rounded-md border py-3 pl-8 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-[#17478B] disabled:bg-gray-100 ${
                          errors.costPerSpin
                            ? 'border-red-500'
                            : 'border-gray-300'
                        }`}
                      />
                    </div>
                    {errors.costPerSpin && (
                      <p className="mt-1 text-sm text-red-600">
                        {errors.costPerSpin}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700">
                      Maximum Spin per User
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={formData.maximumSpinPerUser}
                      onChange={(e) =>
                        handleInputChange('maximumSpinPerUser', e.target.value)
                      }
                      placeholder="10"
                      disabled={isViewMode || loading || isSubmitting}
                      className={`w-full rounded-md border px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#17478B] disabled:bg-gray-100 ${
                        errors.maximumSpinPerUser
                          ? 'border-red-500'
                          : 'border-gray-300'
                      }`}
                    />
                    {errors.maximumSpinPerUser && (
                      <p className="mt-1 text-sm text-red-600">
                        {errors.maximumSpinPerUser}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center justify-between rounded-lg bg-gray-50 p-4">
                    <div>
                      <h4 className="font-medium text-gray-800">
                        Re-spin Feature
                      </h4>
                      <p className="text-sm text-gray-500">
                        Allow users to re-spin after a game
                      </p>
                    </div>
                    <Switch
                      id="respin-feature"
                      checked={formData.respinFeatureEnabled}
                      onCheckedChange={handleSwitchChange}
                      disabled={isViewMode || loading || isSubmitting}
                    />
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.3 }}
                  className="mt-8 flex justify-center"
                >
                  <button
                    type="button"
                    onClick={isViewMode ? handleEditToggle : handleSubmit}
                    disabled={
                      (!isFormValid && !isViewMode) || loading || isSubmitting
                    }
                    className={`flex h-[53px] w-full items-center justify-center space-x-2 rounded-[25px] bg-[#17478B] text-base font-semibold text-white transition duration-200 hover:bg-[#133a6e] disabled:cursor-not-allowed disabled:opacity-50 md:w-[538px]`}
                    style={{ fontFamily: 'Space Grotesk, sans-serif' }}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="h-5 w-5 animate-spin" />
                        <span>Saving changes...</span>
                      </>
                    ) : submitStatus === 'success' ? (
                      <>
                        <CheckCircle className="h-5 w-5" />
                        <span>Changes Saved!</span>
                      </>
                    ) : submitStatus === 'error' ? (
                      <>
                        <AlertCircle className="h-5 w-5" />
                        <span>Try Again</span>
                      </>
                    ) : isViewMode ? (
                      <span>Edit game</span>
                    ) : (
                      <span>Save changes</span>
                    )}
                  </button>
                </motion.div>

                {submitStatus === 'error' && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="mt-4 text-center text-sm text-red-600"
                  >
                    Failed to save changes. Please try again.
                  </motion.div>
                )}

                <Dialog.Close asChild>
                  <motion.button
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4 }}
                    disabled={loading || isSubmitting}
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

export default GameConfigModal;
