'use client';

import React, { useState, useEffect } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { X, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Joi from 'joi';

const validationSchema = Joi.object().keys({
  stakeMinimum: Joi.number().required().min(0).label('Minimum Stake'),
  stakeMaximum: Joi.number()
    .required()
    .greater(Joi.ref('stakeMinimum'))
    .label('Maximum Stake')
    .messages({
      'number.greater': 'Maximum stake must be greater than minimum stake',
      'number.base': 'Maximum stake must be a valid number',
    }),
  range: Joi.number().required().min(0).label('Range'),
  stakeMultiplier: Joi.number().required().min(0).label('Stake Multiplier'),
  baseTrial: Joi.number().required().min(1).label('Base Trial'),
  costPerTrial: Joi.number().required().min(0).label('Cost per Trial'),
  maxTrialPurchase: Joi.number().required().min(0).label('Max Trial Purchase'),
  lowerBound: Joi.number().required().min(0).label('Lower Bound'),
  upperBound: Joi.number()
    .required()
    .min(Joi.ref('lowerBound'))
    .label('Upper Bound')
    .messages({
      'number.min': 'Upper bound must be greater than lower bound',
    }),
});

interface GameConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    stakeRange: {
      minimum: number;
      maximum: number;
    };
    range: number;
    stakeMultiplier: number;
    baseTrial: number;
    costPerTrial: number;
    maxTrialPurchase: number;
    numberRange: {
      lowerBound: number;
      upperBound: number;
    };
  }) => void;
  loading?: boolean;
  mode: 'view' | 'edit';
  initialData?: {
    stakeMinimum?: number;
    stakeMaximum?: number;
    range?: number;
    stakeMultiplier?: number;
    baseTrial?: number;
    costPerTrial?: number;
    maxTrialPurchase?: number;
    lowerBound?: number;
    upperBound?: number;
  };
}

interface FormData {
  stakeMinimum: string;
  stakeMaximum: string;
  range: string;
  stakeMultiplier: string;
  baseTrial: string;
  costPerTrial: string;
  maxTrialPurchase: string;
  lowerBound: string;
  upperBound: string;
}

interface FormErrors {
  stakeMinimum?: string;
  stakeMaximum?: string;
  range?: string;
  stakeMultiplier?: string;
  baseTrial?: string;
  costPerTrial?: string;
  maxTrialPurchase?: string;
  lowerBound?: string;
  upperBound?: string;
}

const GameConfigModal: React.FC<GameConfigModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  loading = false,
  mode,
  initialData,
}) => {
  const [formData, setFormData] = useState<FormData>({
    stakeMinimum: '',
    stakeMaximum: '',
    range: '',
    stakeMultiplier: '',
    baseTrial: '',
    costPerTrial: '',
    maxTrialPurchase: '',
    lowerBound: '',
    upperBound: '',
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
        stakeMinimum: initialData.stakeMinimum?.toString() || '',
        stakeMaximum: initialData.stakeMaximum?.toString() || '',
        range: initialData.range?.toString() || '',
        stakeMultiplier: initialData.stakeMultiplier?.toString() || '',
        baseTrial: initialData.baseTrial?.toString() || '',
        costPerTrial: initialData.costPerTrial?.toString() || '',
        maxTrialPurchase: initialData.maxTrialPurchase?.toString() || '',
        lowerBound: initialData.lowerBound?.toString() || '',
        upperBound: initialData.upperBound?.toString() || '',
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
      stakeMinimum: '',
      stakeMaximum: '',
      range: '',
      stakeMultiplier: '',
      baseTrial: '',
      costPerTrial: '',
      maxTrialPurchase: '',
      lowerBound: '',
      upperBound: '',
    });
    setErrors({});
    setSubmitStatus('idle');
    setIsSubmitting(false);
    setCurrentMode(mode);
  };

  const validateField = async (field: keyof FormData, value: string) => {
    try {
      if (value === '') {
        setErrors((prev) => ({ ...prev, [field]: undefined }));
        return;
      }

      if (
        [
          'stakeMinimum',
          'stakeMaximum',
          'range',
          'stakeMultiplier',
          'baseTrial',
          'costPerTrial',
          'maxTrialPurchase',
          'lowerBound',
          'upperBound',
        ].includes(field)
      ) {
        if (isNaN(parseFloat(value)) || value.trim() === '') {
          setErrors((prev) => ({
            ...prev,
            [field]: 'Please enter a valid number',
          }));
          return;
        }
      }

      if (field === 'stakeMaximum' && value && formData.stakeMinimum) {
        const min = parseFloat(formData.stakeMinimum);
        const max = parseFloat(value);
        if (min === max) {
          setErrors((prev) => ({
            ...prev,
            stakeMaximum: 'Minimum and maximum stake cannot be the same',
          }));
          return;
        }
        if (max < min) {
          setErrors((prev) => ({
            ...prev,
            stakeMaximum: 'Maximum stake must be greater than minimum stake',
          }));
          return;
        }
      }

      if (field === 'stakeMinimum' && value && formData.stakeMaximum) {
        const min = parseFloat(value);
        const max = parseFloat(formData.stakeMaximum);
        if (min === max) {
          setErrors((prev) => ({
            ...prev,
            stakeMinimum: 'Minimum and maximum stake cannot be the same',
          }));
          return;
        }
        if (min > max) {
          setErrors((prev) => ({
            ...prev,
            stakeMinimum: 'Minimum stake must be less than maximum stake',
          }));
          return;
        }
      }

      setErrors((prev) => ({ ...prev, [field]: undefined }));
    } catch (error) {
      if (error instanceof Error) {
        if (error instanceof Joi.ValidationError) {
          const errorMessage = error.details?.[0]?.message;
          if (errorMessage && !errorMessage.includes('is not allowed')) {
            setErrors((prev) => ({ ...prev, [field]: errorMessage }));
          } else {
            setErrors((prev) => ({ ...prev, [field]: undefined }));
          }
        } else {
          setErrors((prev) => ({ ...prev, [field]: error.message }));
        }
      } else {
        setErrors((prev) => ({
          ...prev,
          [field]: 'An unknown error occurred',
        }));
      }
    }
  };

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));

    validateField(field, value);
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setSubmitStatus('idle');
    setErrors({});

    try {
      const validatedData = {
        stakeMinimum: parseFloat(formData.stakeMinimum),
        stakeMaximum: parseFloat(formData.stakeMaximum),
        range: parseFloat(formData.range),
        stakeMultiplier: parseFloat(formData.stakeMultiplier),
        baseTrial: parseInt(formData.baseTrial),
        costPerTrial: parseFloat(formData.costPerTrial),
        maxTrialPurchase: parseInt(formData.maxTrialPurchase),
        lowerBound: parseFloat(formData.lowerBound),
        upperBound: parseFloat(formData.upperBound),
      };

      const { error } = await validationSchema.validateAsync(validatedData, {
        abortEarly: false,
      });

      if (error) {
        const validationErrors: FormErrors = {};
        error.details.forEach((detail) => {
          const key = detail.path[0] as keyof FormErrors;
          validationErrors[key] = detail.message;
        });
        setErrors(validationErrors);
        throw new Error('Validation failed');
      }
      const submitData = {
        stakeRange: {
          minimum: parseFloat(formData.stakeMinimum),
          maximum: parseFloat(formData.stakeMaximum),
        },
        range: parseFloat(formData.range),
        stakeMultiplier: parseFloat(formData.stakeMultiplier),
        baseTrial: parseInt(formData.baseTrial),
        costPerTrial: parseFloat(formData.costPerTrial),
        maxTrialPurchase: parseInt(formData.maxTrialPurchase),
        numberRange: {
          lowerBound: parseFloat(formData.lowerBound),
          upperBound: parseFloat(formData.upperBound),
        },
      };

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
                  {/* Stake Range */}
                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-900">
                      Stake Range
                    </label>
                    <div className="flex gap-4">
                      <div className="flex-1">
                        <div className="relative h-[72px]">
                          <div className="absolute inset-0 flex items-center">
                            <div className="relative w-full">
                              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-semibold text-gray-900">
                                ₦
                              </span>
                              <input
                                type="number"
                                value={formData.stakeMinimum}
                                onChange={(e) =>
                                  handleInputChange(
                                    'stakeMinimum',
                                    e.target.value,
                                  )
                                }
                                placeholder="Enter minimum stake"
                                disabled={isViewMode || loading || isSubmitting}
                                className={`w-full rounded-md border ${
                                  errors.stakeMinimum
                                    ? 'border-red-500'
                                    : 'border-gray-300'
                                } bg-gray-50 py-3 pl-8 pr-12 text-sm font-medium text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100`}
                              />
                              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-gray-500">
                                Minimum
                              </span>
                            </div>
                          </div>
                          {errors.stakeMinimum && (
                            <div className="absolute -bottom-5 left-0 w-full">
                              <p className="text-xs text-red-500">
                                {errors.stakeMinimum}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center justify-center py-3">
                        <div className="h-px w-4 bg-gray-300"></div>
                      </div>
                      <div className="flex-1">
                        <div className="relative h-[72px]">
                          <div className="absolute inset-0 flex items-center">
                            <div className="relative w-full">
                              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-semibold text-gray-900">
                                ₦
                              </span>
                              <input
                                type="number"
                                value={formData.stakeMaximum}
                                onChange={(e) =>
                                  handleInputChange(
                                    'stakeMaximum',
                                    e.target.value,
                                  )
                                }
                                placeholder="Enter maximum stake"
                                disabled={isViewMode || loading || isSubmitting}
                                className={`w-full rounded-md border ${
                                  errors.stakeMaximum
                                    ? 'border-red-500'
                                    : 'border-gray-300'
                                } bg-gray-50 py-3 pl-8 pr-12 text-sm font-medium text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100`}
                              />
                              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-gray-500">
                                Maximum
                              </span>
                            </div>
                          </div>
                          {errors.stakeMaximum && (
                            <div className="absolute -bottom-5 left-0 w-full">
                              <p className="text-xs text-red-500">
                                {errors.stakeMaximum}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Range */}
                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-900">
                      Range
                    </label>
                    <input
                      type="number"
                      value={formData.range}
                      onChange={(e) =>
                        handleInputChange('range', e.target.value)
                      }
                      placeholder="Enter range"
                      disabled={isViewMode || loading || isSubmitting}
                      className="w-full rounded-md border border-gray-300 bg-gray-50 px-4 py-3 text-sm font-medium text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                    />
                  </div>

                  {/* Stake Multiplier */}
                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-900">
                      Stake Multiplier
                    </label>
                    <input
                      type="text"
                      value={formData.stakeMultiplier}
                      onChange={(e) =>
                        handleInputChange('stakeMultiplier', e.target.value)
                      }
                      placeholder="Enter stake multiplier"
                      disabled={isViewMode || loading || isSubmitting}
                      className="w-full rounded-md border border-gray-300 bg-gray-50 px-4 py-3 text-sm font-medium text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                    />
                  </div>

                  {/* Base Trial */}
                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-900">
                      Base Trial
                    </label>
                    <input
                      type="number"
                      value={formData.baseTrial}
                      onChange={(e) =>
                        handleInputChange('baseTrial', e.target.value)
                      }
                      placeholder="Enter base trials"
                      disabled={isViewMode || loading || isSubmitting}
                      className="w-full rounded-md border border-gray-300 bg-gray-50 px-4 py-3 text-sm font-medium text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                    />
                  </div>

                  {/* Cost per Trial */}
                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-900">
                      Cost per Trial
                    </label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-semibold text-gray-900">
                        ₦
                      </span>
                      <input
                        type="number"
                        value={formData.costPerTrial}
                        onChange={(e) =>
                          handleInputChange('costPerTrial', e.target.value)
                        }
                        placeholder="1000"
                        disabled={isViewMode || loading || isSubmitting}
                        className="w-full rounded-md border border-gray-300 bg-gray-50 py-3 pl-8 pr-4 text-sm font-medium text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                      />
                    </div>
                  </div>

                  {/* Max Trial Purchase */}
                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-900">
                      Max Trial Purchase
                    </label>
                    <input
                      type="number"
                      value={formData.maxTrialPurchase}
                      onChange={(e) =>
                        handleInputChange('maxTrialPurchase', e.target.value)
                      }
                      placeholder="Enter max trial purchase"
                      disabled={isViewMode || loading || isSubmitting}
                      className="w-full rounded-md border border-gray-300 bg-gray-50 px-4 py-3 text-sm font-medium text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                    />
                  </div>

                  {/* Number Range */}
                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-900">
                      Number Range
                    </label>
                    <div className="flex gap-4">
                      <div className="flex-1">
                        <div className="relative">
                          <input
                            type="number"
                            value={formData.lowerBound}
                            onChange={(e) =>
                              handleInputChange('lowerBound', e.target.value)
                            }
                            placeholder="Enter lower bound"
                            disabled={isViewMode || loading || isSubmitting}
                            className="w-full rounded-md border border-gray-300 bg-gray-50 px-4 py-3 text-sm font-medium text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                          />
                          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-gray-500">
                            Lower Bound
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center justify-center py-3">
                        <div className="h-px w-4 bg-gray-300"></div>
                      </div>
                      <div className="flex-1">
                        <div className="relative">
                          <input
                            type="number"
                            value={formData.upperBound}
                            onChange={(e) =>
                              handleInputChange('upperBound', e.target.value)
                            }
                            placeholder="Enter upper bound"
                            disabled={isViewMode || loading || isSubmitting}
                            className="w-full rounded-md border border-gray-300 bg-gray-50 px-4 py-3 text-sm font-medium text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                          />
                          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-gray-500">
                            Upper Bound
                          </span>
                        </div>
                      </div>
                    </div>
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
                    disabled={loading || isSubmitting}
                    className="flex h-[53px] w-full items-center justify-center space-x-2 rounded-lg bg-[#2563EB] text-base font-semibold text-white transition duration-200 hover:bg-[#1d4ed8] disabled:cursor-not-allowed disabled:opacity-50"
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
