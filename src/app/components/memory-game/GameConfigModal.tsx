'use client';

import React, { useState, useEffect } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { X, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  validateGameConfig,
  prepareGameConfigData,
  type GameConfigFormData,
} from '@/app/components/memory-game/GameConfigurationModal.schema';
import { UpdateMemoryGamePayload } from '@/app/api/game';

interface GameConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: UpdateMemoryGamePayload) => void;
  loading?: boolean;
  mode: 'view' | 'edit';
  initialData?: {
    baseMoves?: number;
    maxMovePurchase?: number;
    costPerExtraMove?: number;
    stakeMultiplier?: number;
    numberOfCards?: number;
  };
}

interface FormErrors {
  baseMoves?: string;
  maxMovePurchase?: string;
  costPerExtraMove?: string;
  stakeMultiplier?: string;
  numberOfCards?: string;
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
    baseMoves: '',
    maxMovePurchase: '',
    costPerExtraMove: '',
    stakeMultiplier: '',
    numberOfCards: '',
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
        baseMoves: initialData.baseMoves?.toString() || '',
        maxMovePurchase: initialData.maxMovePurchase?.toString() || '',
        costPerExtraMove: initialData.costPerExtraMove?.toString() || '',
        stakeMultiplier: initialData.stakeMultiplier
          ? `X ${initialData.stakeMultiplier}`
          : '',
        numberOfCards: initialData.numberOfCards?.toString() || '',
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
      baseMoves: '',
      maxMovePurchase: '',
      costPerExtraMove: '',
      stakeMultiplier: '',
      numberOfCards: '',
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
    field: keyof GameConfigFormData,
    value: string,
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsSubmitting(true);
    setSubmitStatus('idle');

    try {
      const submitData = prepareGameConfigData(formData);

      await onSubmit({
        // type: 'memoryGame',
        gameId: '',
        minimumStake: 0,
        maximumStake: 0,
        ...submitData,
      });
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
    Object.values(formData).every((field) => field.trim()) &&
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
                    ? 'Game Configuration'
                    : 'Edit game Configuration'}
                </Dialog.Title>
                <motion.div
                  className="flex flex-col gap-6"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.2 }}
                >
                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700">
                      Base Moves
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={formData.baseMoves}
                      onChange={(e) =>
                        handleInputChange('baseMoves', e.target.value)
                      }
                      placeholder="10"
                      disabled={isViewMode || loading || isSubmitting}
                      className={`w-full rounded-md border px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#17478B] disabled:bg-gray-100 ${
                        errors.baseMoves ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                    {errors.baseMoves && (
                      <p className="mt-1 text-sm text-red-600">
                        {errors.baseMoves}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700">
                      Max Move Purchase
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={formData.maxMovePurchase}
                      onChange={(e) =>
                        handleInputChange('maxMovePurchase', e.target.value)
                      }
                      placeholder="5"
                      disabled={isViewMode || loading || isSubmitting}
                      className={`w-full rounded-md border px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#17478B] disabled:bg-gray-100 ${
                        errors.maxMovePurchase
                          ? 'border-red-500'
                          : 'border-gray-300'
                      }`}
                    />
                    {errors.maxMovePurchase && (
                      <p className="mt-1 text-sm text-red-600">
                        {errors.maxMovePurchase}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700">
                      Cost per Extra Move
                    </label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-medium text-gray-700">
                        ₦
                      </span>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={formData.costPerExtraMove}
                        onChange={(e) =>
                          handleInputChange('costPerExtraMove', e.target.value)
                        }
                        placeholder="50"
                        disabled={isViewMode || loading || isSubmitting}
                        className={`w-full rounded-md border py-3 pl-8 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-[#17478B] disabled:bg-gray-100 ${
                          errors.costPerExtraMove
                            ? 'border-red-500'
                            : 'border-gray-300'
                        }`}
                      />
                    </div>
                    {errors.costPerExtraMove && (
                      <p className="mt-1 text-sm text-red-600">
                        {errors.costPerExtraMove}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700">
                      Stake Multiplier
                    </label>
                    <input
                      type="text"
                      value={formData.stakeMultiplier}
                      onChange={(e) =>
                        handleInputChange('stakeMultiplier', e.target.value)
                      }
                      placeholder="X 2"
                      disabled={isViewMode || loading || isSubmitting}
                      className={`w-full rounded-md border px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#17478B] disabled:bg-gray-100 ${
                        errors.stakeMultiplier
                          ? 'border-red-500'
                          : 'border-gray-300'
                      }`}
                    />
                    {errors.stakeMultiplier && (
                      <p className="mt-1 text-sm text-red-600">
                        {errors.stakeMultiplier}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700">
                      Number of Cards
                    </label>
                    <input
                      type="number"
                      min="2"
                      step="2"
                      value={formData.numberOfCards}
                      onChange={(e) =>
                        handleInputChange('numberOfCards', e.target.value)
                      }
                      placeholder="12"
                      disabled={isViewMode || loading || isSubmitting}
                      className={`w-full rounded-md border px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#17478B] disabled:bg-gray-100 ${
                        errors.numberOfCards
                          ? 'border-red-500'
                          : 'border-gray-300'
                      }`}
                    />
                    {errors.numberOfCards && (
                      <p className="mt-1 text-sm text-red-600">
                        {errors.numberOfCards}
                      </p>
                    )}
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
