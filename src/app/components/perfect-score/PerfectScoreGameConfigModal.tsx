'use client';

import React, { useState, useEffect, useCallback } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { X, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  validateGameConfig,
  prepareGameConfigData,
  type GameConfigFormData,
} from '@/app/components/perfect-score/PerfectScoreGameConfigModal.schema';
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
    minimumStake?: number;
    maximumStake?: number;
    maxRespin?: number;
    defaultSpin?: number;
    enableSpin?: boolean;
    spinAmount?: number;
    stakeMultiplier?: number;
    weightProbabilities?: Array<{
      id: string;
      chance: number;
      questions: number;
      weight:
        | 'FIVE'
        | 'TEN'
        | 'TWENTY'
        | 'FIFTY'
        | 'HUNDRED'
        | 'RESPIN'
        | 'SEVEN';
      status: 'ACTIVE' | 'INACTIVE';
    }>;
    gameId?: string;
  };
  gameData?: {
    config: {
      minimumStake: number;
      maximumStake: number;
      maxRespin: number;
      defaultSpin: number;
      enableSpin: boolean;
      spinAmount: number;
      stakeMultiplier: number;
      weightProbabilities: Array<{
        id: string;
        chance: number;
        questions: number;
        weight:
          | 'FIVE'
          | 'TEN'
          | 'TWENTY'
          | 'FIFTY'
          | 'HUNDRED'
          | 'RESPIN'
          | 'SEVEN';
        status: 'ACTIVE' | 'INACTIVE';
      }>;
    };
  };
  fetchGameData: () => Promise<void>;
}

type FormErrors = {
  [K in keyof GameConfigFormData]?: string;
};

const PerfectScoreGameConfigModal = ({
  isOpen,
  onClose,
  onSubmit,
  initialData = {},
  gameData,
  fetchGameData,
  mode = 'view',
}: GameConfigModalProps) => {
  const [formData, setFormData] = useState<GameConfigFormData>(() => {
    return {
      minimumStake: initialData?.minimumStake ?? 0,
      maximumStake: initialData?.maximumStake ?? 0,
      maxRespin: initialData?.maxRespin ?? 0,
      defaultSpin: initialData?.defaultSpin ?? 0,
      enableSpin: initialData?.enableSpin ?? false,
      spinAmount: initialData?.spinAmount ?? 0,
      stakeMultiplier: initialData?.stakeMultiplier ?? 0,

      weightProbabilities:
        initialData?.weightProbabilities?.map((wp) => ({
          id: wp.id,
          chance: wp.chance,
          questions: wp.questions,
          weight: wp.weight as
            | 'FIVE'
            | 'TEN'
            | 'TWENTY'
            | 'FIFTY'
            | 'HUNDRED'
            | 'RESPIN'
            | 'SEVEN',
          status: wp.status as 'ACTIVE' | 'INACTIVE',
        })) || [],
    };
  });

  const [currentMode, setCurrentMode] = useState<'view' | 'edit'>(mode);
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<
    'idle' | 'success' | 'error'
  >('idle');
  const [loading, setLoading] = useState(false);

  const isViewMode = currentMode === 'view';

  useEffect(() => {
    if (gameData?.config) {
      setFormData((prev) => ({
        ...prev,
        minimumStake: gameData.config.minimumStake ?? 1000,
        maximumStake: gameData.config.maximumStake ?? 1000000,
        maxRespin: gameData.config.maxRespin ?? 3,
        defaultSpin: gameData.config.defaultSpin ?? 0,
        enableSpin: gameData.config.enableSpin ?? false,
        spinAmount: gameData.config.spinAmount ?? 1000,
        stakeMultiplier: gameData.config.stakeMultiplier ?? 3,
        weightProbabilities: gameData.config.weightProbabilities ?? [
          {
            id: '1',
            chance: 10,
            questions: 5,
            weight: 'FIVE',
            status: 'ACTIVE',
          },
        ],
      }));
    }
  }, [gameData]);

  useEffect(() => {
    const updateFormData = () => {
      if (gameData?.config) {
        setFormData({
          minimumStake: gameData.config.minimumStake ?? 1000,
          maximumStake: gameData.config.maximumStake ?? 1000000,
          maxRespin: gameData.config.maxRespin ?? 3,
          defaultSpin: gameData.config.defaultSpin ?? 0,
          enableSpin: gameData.config.enableSpin ?? false,
          spinAmount: gameData.config.spinAmount ?? 1000,
          stakeMultiplier: gameData.config.stakeMultiplier ?? 3,
          weightProbabilities: gameData.config.weightProbabilities?.map(
            (wp) => ({
              ...wp,
              weight: wp.weight as
                | 'FIVE'
                | 'TEN'
                | 'TWENTY'
                | 'FIFTY'
                | 'HUNDRED',
              status: wp.status as 'ACTIVE' | 'INACTIVE',
            }),
          ) || [
            {
              id: '1',
              chance: 10,
              questions: 5,
              weight: 'FIVE',
              status: 'ACTIVE',
            },
          ],
        });
      } else if (initialData) {
        setFormData({
          minimumStake: initialData.minimumStake ?? 1000,
          maximumStake: initialData.maximumStake ?? 1000000,
          maxRespin: initialData.maxRespin ?? 3,
          defaultSpin: initialData.defaultSpin ?? 0,
          enableSpin: initialData.enableSpin ?? false,
          spinAmount: initialData.spinAmount ?? 1000,
          stakeMultiplier: initialData.stakeMultiplier ?? 3,
          weightProbabilities: initialData.weightProbabilities?.map((wp) => ({
            ...wp,
            weight: wp.weight as
              | 'FIVE'
              | 'TEN'
              | 'TWENTY'
              | 'FIFTY'
              | 'HUNDRED',
            status: wp.status as 'ACTIVE' | 'INACTIVE',
          })) || [
            {
              id: '1',
              chance: 10,
              questions: 5,
              weight: 'FIVE',
              status: 'ACTIVE',
            },
          ],
        });
      }
    };

    updateFormData();
  }, [gameData, initialData]);

  useEffect(() => {
    const loadData = async () => {
      if (isOpen) {
        try {
          await fetchGameData();
        } catch (error) {
          // Error is handled by the UI state
        }
      }
    };

    loadData();
  }, [isOpen, fetchGameData]);

  useEffect(() => {
    if (!isOpen) {
      resetForm();
    }
  }, [isOpen]);

  const resetForm = useCallback(() => {
    setFormData({
      minimumStake: initialData?.minimumStake ?? 1000,
      maximumStake: initialData?.maximumStake ?? 1000000,
      maxRespin: initialData?.maxRespin ?? 3,
      defaultSpin: initialData?.defaultSpin ?? 0,
      enableSpin: initialData?.enableSpin ?? false,
      spinAmount: initialData?.spinAmount ?? 1000,
      stakeMultiplier: initialData?.stakeMultiplier ?? 3,
      weightProbabilities: initialData?.weightProbabilities ?? [
        {
          id: '1',
          chance: 10,
          questions: 5,
          weight: 'FIVE',
          status: 'ACTIVE',
        },
      ],
    });
    setErrors({});
    setSubmitStatus('idle');
    setIsSubmitting(false);
    setCurrentMode(mode);
  }, [initialData, mode]);

  const validateForm = useCallback((): boolean => {
    const { isValid, errors: validationErrors } = validateGameConfig(formData);
    setErrors(validationErrors);
    return isValid;
  }, [formData]);

  const handleInputChange = useCallback(
    (
      field: keyof Omit<GameConfigFormData, 'weightProbabilities'>,
      value: string | number | boolean,
    ) => {
      const numericFields = [
        'minimumStake',
        'maximumStake',
        'maxRespin',
        'defaultSpin',
        'spinAmount',
        'stakeMultiplier',
      ];

      const processedValue = numericFields.includes(field as string)
        ? typeof value === 'string'
          ? parseFloat(value) || 0
          : value
        : value;

      setFormData((prev) => ({ ...prev, [field]: processedValue }));

      if (errors[field as keyof typeof errors]) {
        setErrors((prev) => ({ ...prev, [field]: undefined }));
      }
    },
    [errors],
  );

  const handleSwitchChange = useCallback(
    (
      field: keyof Omit<GameConfigFormData, 'weightProbabilities'>,
      checked: boolean,
    ) => {
      setFormData((prev) => ({ ...prev, [field]: checked }));
      if (errors[field as keyof typeof errors]) {
        setErrors((prev) => ({ ...prev, [field]: undefined }));
      }
    },
    [errors],
  );

  const handleClose = useCallback(() => {
    if (!loading && !isSubmitting) {
      resetForm();
      onClose();
    }
  }, [loading, isSubmitting, resetForm, onClose]);

  const handleSubmit = useCallback(async () => {
    const validatedWeightProbabilities = formData.weightProbabilities.map(
      (wp) => ({
        ...wp,
        questions: Math.max(1, Number(wp.questions) || 1),
        chance: Number(wp.chance),
      }),
    );

    const validatedFormData = {
      ...formData,
      weightProbabilities: validatedWeightProbabilities,
      minimumStake: Number(formData.minimumStake),
      maximumStake: Number(formData.maximumStake),
      maxRespin: Number(formData.maxRespin),
      defaultSpin: Number(formData.defaultSpin),
      spinAmount: Number(formData.spinAmount),
      stakeMultiplier: Number(formData.stakeMultiplier),
    };

    setFormData(validatedFormData);

    if (!validateGameConfig(validatedFormData).isValid) {
      setErrors(validateGameConfig(validatedFormData).errors);
      return;
    }

    setIsSubmitting(true);
    setSubmitStatus('idle');
    try {
      const submitData = {
        ...validatedFormData,
        type: 'PerfectScoreConfigRequest',
        gameId: initialData?.gameId || '',
        weightProbabilities: validatedFormData.weightProbabilities.map(
          (wp) => ({
            ...wp,
            chance: Number(wp.chance),
            questions: Number(wp.questions),
          }),
        ),
      };

      await onSubmit(submitData);

      await fetchGameData();

      setSubmitStatus('success');
      setTimeout(() => {
        handleClose();
      }, 1000);
    } catch (error) {
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  }, [formData, validateForm, handleClose, onSubmit, fetchGameData]);

  const handleEditToggle = () => {
    setCurrentMode(currentMode === 'view' ? 'edit' : 'view');
    setErrors({});
    setSubmitStatus('idle');
  };

  // const handleAddWeightProbability = useCallback(() => {
  //   setFormData((prev) => {

  //     const updatedWeightProbabilities = prev.weightProbabilities.map((wp) => ({
  //       ...wp,
  //       questions: Math.max(1, wp.questions || 1),
  //     }));

  //     return {
  //       ...prev,
  //       weightProbabilities: [
  //         ...updatedWeightProbabilities,
  //         {
  //           id: `new-${Date.now()}`,
  //           weight: 'FIVE',
  //           chance: 10,
  //           questions: 1, // Default to 1 question
  //           status: 'ACTIVE' as const,
  //         },
  //       ],
  //     };
  //   });
  // }, []);

  React.useEffect(() => {
    const isMinStakeValid = formData.minimumStake > 0;
    const isMaxStakeValid = formData.maximumStake > formData.minimumStake;
    const isSpinAmountValid = formData.spinAmount >= 0;
    const isStakeMultiplierValid = formData.stakeMultiplier >= 0;
    const isMaxRespinValid = formData.maxRespin >= 0;
    const isDefaultSpinValid = formData.defaultSpin >= 0;

    const weightProbabilitiesValidation = formData.weightProbabilities.map(
      (wp) => ({
        isQuestionsValid: wp.questions >= 1,
        isWeightValid: [
          'FIVE',
          'TEN',
          'TWENTY',
          'FIFTY',
          'HUNDRED',
          'RESPIN',
          'SEVEN',
        ].includes(wp.weight),
        isStatusValid: ['ACTIVE', 'INACTIVE'].includes(wp.status),
      }),
    );
  }, [formData, errors]);

  const isFormValid = true;

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
                      Spin Amount
                    </label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-medium text-gray-700">
                        ₦
                      </span>
                      <input
                        type="number"
                        min="0"
                        value={formData.spinAmount}
                        onChange={(e) =>
                          handleInputChange('spinAmount', e.target.value)
                        }
                        placeholder="1000"
                        disabled={isViewMode || loading || isSubmitting}
                        className={`w-full rounded-md border py-3 pl-8 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-[#17478B] disabled:bg-gray-100 ${
                          errors.spinAmount
                            ? 'border-red-500'
                            : 'border-gray-300'
                        }`}
                      />
                    </div>
                    {errors.spinAmount && (
                      <p className="mt-1 text-sm text-red-600">
                        {errors.spinAmount}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700">
                      Stake Range
                    </label>
                    <div className="flex gap-4">
                      <div className="flex-1">
                        <div className="relative">
                          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-medium text-gray-700">
                            ₦
                          </span>
                          <input
                            type="number"
                            min="0"
                            value={formData.minimumStake}
                            onChange={(e) =>
                              handleInputChange('minimumStake', e.target.value)
                            }
                            placeholder="1000"
                            disabled={isViewMode || loading || isSubmitting}
                            className={`w-full rounded-md border py-3 pl-8 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-[#17478B] disabled:bg-gray-100 ${
                              errors.minimumStake
                                ? 'border-red-500'
                                : 'border-gray-300'
                            }`}
                          />
                        </div>
                        <p className="mt-1 text-xs text-gray-500">Minimum</p>
                        {errors.minimumStake && (
                          <p className="mt-1 text-sm text-red-600">
                            {errors.minimumStake}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center pt-3">
                        <div className="h-px w-4 bg-gray-300"></div>
                      </div>
                      <div className="flex-1">
                        <div className="relative">
                          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-medium text-gray-700">
                            ₦
                          </span>
                          <input
                            type="number"
                            min="0"
                            value={formData.maximumStake}
                            onChange={(e) =>
                              handleInputChange('maximumStake', e.target.value)
                            }
                            placeholder="1,000,000"
                            disabled={isViewMode || loading || isSubmitting}
                            className={`w-full rounded-md border py-3 pl-8 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-[#17478B] disabled:bg-gray-100 ${
                              errors.maximumStake
                                ? 'border-red-500'
                                : 'border-gray-300'
                            }`}
                          />
                        </div>
                        <p className="mt-1 text-xs text-gray-500">Maximum</p>
                        {errors.maximumStake && (
                          <p className="mt-1 text-sm text-red-600">
                            {errors.maximumStake}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700">
                      Max Respin
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={formData.maxRespin}
                      onChange={(e) =>
                        handleInputChange('maxRespin', e.target.value)
                      }
                      placeholder="3"
                      disabled={isViewMode || loading || isSubmitting}
                      className={`w-full rounded-md border px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#17478B] disabled:bg-gray-100 ${
                        errors.maxRespin ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                    {errors.maxRespin && (
                      <p className="mt-1 text-sm text-red-600">
                        {errors.maxRespin}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700">
                      Default Spin
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={formData.defaultSpin}
                      onChange={(e) =>
                        handleInputChange('defaultSpin', e.target.value)
                      }
                      placeholder="0"
                      disabled={isViewMode || loading || isSubmitting}
                      className={`w-full rounded-md border px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#17478B] disabled:bg-gray-100 ${
                        errors.defaultSpin
                          ? 'border-red-500'
                          : 'border-gray-300'
                      }`}
                    />
                    {errors.defaultSpin && (
                      <p className="mt-1 text-sm text-red-600">
                        {errors.defaultSpin}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700">
                      Stake Multiplier
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="0.1"
                      value={formData.stakeMultiplier}
                      onChange={(e) =>
                        handleInputChange('stakeMultiplier', e.target.value)
                      }
                      placeholder="3"
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

                  <div className="flex items-center justify-between rounded-lg bg-gray-50 p-4">
                    <div>
                      <h4 className="font-medium text-gray-800">Enable Spin</h4>
                      <p className="text-sm text-gray-500">
                        Enable or disable the spin feature
                      </p>
                    </div>
                    <Switch
                      id="enable-spin"
                      checked={formData.enableSpin}
                      onCheckedChange={(checked) =>
                        handleSwitchChange('enableSpin', checked)
                      }
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

export default PerfectScoreGameConfigModal;
