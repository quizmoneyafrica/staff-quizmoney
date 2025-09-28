'use client';

import React, { useState, useEffect } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { X, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  validateGameConfig,
  prepareGameConfigData,
  type GameConfigFormData,
} from '@/app/components/number-guessing/GameConfigurationModal.schema';

interface GameConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    costPerTrial: number;
    numberRange: {
      lowerBound: number;
      upperBound: number;
    };
    baseTrial: number;
    maxTrialPurchase: number;
    stakeMultiplier: number;
  }) => void;
  loading?: boolean;
  mode: 'view' | 'edit';
  initialData?: {
    costPerTrial?: number;
    lowerBound?: number;
    upperBound?: number;
    range?: number;
    baseTrial?: number;
    maxTrialPurchase?: number;
    stakeMultiplier?: number;
  };
}

interface FormErrors {
  costPerTrial?: string;
  lowerBound?: string;
  upperBound?: string;
  range?: string;
  baseTrial?: string;
  maxTrialPurchase?: string;
  stakeMultiplier?: string;
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
    costPerTrial: '',
    lowerBound: '',
    upperBound: '',
    baseTrial: '',
    maxTrialPurchase: '',
    stakeMultiplier: '',
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
        costPerTrial: initialData.costPerTrial?.toString() || '',
        lowerBound: initialData.lowerBound?.toString() || '',
        upperBound: initialData.upperBound?.toString() || '',
        baseTrial: initialData.baseTrial?.toString() || '',
        maxTrialPurchase: initialData.maxTrialPurchase?.toString() || '',
        stakeMultiplier: initialData.stakeMultiplier
          ? `X ${initialData.stakeMultiplier}`
          : '',
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
      costPerTrial: '',
      lowerBound: '',
      upperBound: '',
      baseTrial: '',
      maxTrialPurchase: '',
      stakeMultiplier: '',
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
    formData.costPerTrial.trim() &&
    formData.lowerBound.trim() &&
    formData.upperBound.trim() &&
    formData.baseTrial.trim() &&
    formData.maxTrialPurchase.trim() &&
    formData.stakeMultiplier.trim() &&
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
                      Cost per Trial
                    </label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-medium text-gray-700">
                        ₦
                      </span>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={formData.costPerTrial}
                        onChange={(e) =>
                          handleInputChange('costPerTrial', e.target.value)
                        }
                        placeholder="100"
                        disabled={isViewMode || loading || isSubmitting}
                        className={`w-full rounded-md border py-3 pl-8 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-[#17478B] disabled:bg-gray-100 ${
                          errors.costPerTrial
                            ? 'border-red-500'
                            : 'border-gray-300'
                        }`}
                      />
                    </div>
                    {errors.costPerTrial && (
                      <p className="mt-1 text-sm text-red-600">
                        {errors.costPerTrial}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700">
                      Number Range
                    </label>
                    <div className="flex gap-4">
                      <div className="flex-1">
                        <input
                          type="number"
                          min="0"
                          value={formData.lowerBound}
                          onChange={(e) =>
                            handleInputChange('lowerBound', e.target.value)
                          }
                          placeholder="0"
                          disabled={isViewMode || loading || isSubmitting}
                          className={`w-full rounded-md border px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#17478B] disabled:bg-gray-100 ${
                            errors.lowerBound
                              ? 'border-red-500'
                              : 'border-gray-300'
                          }`}
                        />
                        <p className="mt-1 text-xs text-gray-500">
                          Lower Bound
                        </p>
                        {errors.lowerBound && (
                          <p className="mt-1 text-sm text-red-600">
                            {errors.lowerBound}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center justify-center py-3">
                        <div className="h-px w-4 bg-gray-300"></div>
                      </div>
                      <div className="flex-1">
                        <input
                          type="number"
                          min="0"
                          value={formData.upperBound}
                          onChange={(e) =>
                            handleInputChange('upperBound', e.target.value)
                          }
                          placeholder="5000"
                          disabled={isViewMode || loading || isSubmitting}
                          className={`w-full rounded-md border px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#17478B] disabled:bg-gray-100 ${
                            errors.upperBound
                              ? 'border-red-500'
                              : 'border-gray-300'
                          }`}
                        />
                        <p className="mt-1 text-xs text-gray-500">
                          Upper Bound
                        </p>
                        {errors.upperBound && (
                          <p className="mt-1 text-sm text-red-600">
                            {errors.upperBound}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700">
                      Base Trial
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={formData.baseTrial}
                      onChange={(e) =>
                        handleInputChange('baseTrial', e.target.value)
                      }
                      placeholder="3"
                      disabled={isViewMode || loading || isSubmitting}
                      className={`w-full rounded-md border px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#17478B] disabled:bg-gray-100 ${
                        errors.baseTrial ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                    {errors.baseTrial && (
                      <p className="mt-1 text-sm text-red-600">
                        {errors.baseTrial}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700">
                      Max Trial Purchase
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={formData.maxTrialPurchase}
                      onChange={(e) =>
                        handleInputChange('maxTrialPurchase', e.target.value)
                      }
                      placeholder="2"
                      disabled={isViewMode || loading || isSubmitting}
                      className={`w-full rounded-md border px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#17478B] disabled:bg-gray-100 ${
                        errors.maxTrialPurchase
                          ? 'border-red-500'
                          : 'border-gray-300'
                      }`}
                    />
                    {errors.maxTrialPurchase && (
                      <p className="mt-1 text-sm text-red-600">
                        {errors.maxTrialPurchase}
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
                      placeholder="X 3"
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
                    className={`
                      flex h-[53px] w-full
                      items-center justify-center space-x-2
                      rounded-[25px] bg-[#17478B] text-base 
                      font-semibold text-white
                      transition duration-200
                      hover:bg-[#133a6e] disabled:cursor-not-allowed disabled:opacity-50 md:w-[538px]
                    `}
                    style={{
                      fontFamily: 'Space Grotesk, sans-serif',
                    }}
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

                {/* Status Messages */}
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
