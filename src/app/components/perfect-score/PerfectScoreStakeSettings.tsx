'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  X,
  Pencil,
  Trash2,
  ChevronDown,
  Loader2,
  CheckCircle,
  AlertCircle,
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import {
  validateGameConfig,
  type GameConfigFormData,
} from '@/app/components/perfect-score/PerfectScoreGameConfigModal.schema';
import {
  PerfectScoreGame,
  UpdatePerfectScoreGamePayload,
} from '@/app/api/game';
import GameApi from '@/app/api/game';
import { toast } from 'sonner';

type FormErrors = {
  [K in keyof GameConfigFormData]?: string;
};

type WeightType =
  | 'FIVE'
  | 'TEN'
  | 'TWENTY'
  | 'FIFTY'
  | 'HUNDRED'
  | 'RESPIN'
  | 'SEVEN';
type StatusType = 'ACTIVE' | 'INACTIVE';

const weightOptions: WeightType[] = ['FIVE', 'SEVEN', 'TEN', 'RESPIN'];

export default function PerfectScoreStakeSettings() {
  const router = useRouter();
  const [formData, setFormData] = useState<GameConfigFormData>({
    minimumStake: 1000,
    maximumStake: 1000000,
    maxRespin: 3,
    defaultSpin: 0,
    enableSpin: false,
    spinAmount: 1000,
    stakeMultiplier: 3,
    weightProbabilities: [],
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<
    'idle' | 'success' | 'error'
  >('idle');
  const [editingWeightId, setEditingWeightId] = useState<string | null>(null);

  const {
    data: gameData,
    isLoading,
    error,
    refetch,
  } = useQuery<PerfectScoreGame>({
    queryKey: ['perfectScoreGame'],
    queryFn: async () => {
      const response = await GameApi.getGame<PerfectScoreGame>('PERFECT_SCORE');
      return response.data.data;
    },
  });

  useEffect(() => {
    if (gameData?.config) {
      setFormData({
        minimumStake: gameData.config.minimumStake ?? 1000,
        maximumStake: gameData.config.maximumStake ?? 1000000,
        maxRespin: gameData.config.maxRespin ?? 3,
        defaultSpin: gameData.config.defaultSpin ?? 0,
        enableSpin: gameData.config.enableSpin ?? false,
        spinAmount: gameData.config.spinAmount ?? 1000,
        stakeMultiplier: gameData.config.stakeMultiplier ?? 3,
        weightProbabilities:
          gameData.config.weightProbabilities?.map((wp) => ({
            id: wp.id,
            chance: wp.chance,
            questions: wp.questions,
            weight: wp.weight as WeightType,
            status: wp.status as StatusType,
          })) || [],
      });
    }
  }, [gameData]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;

      if (!target.closest('.weight-dropdown')) {
        setEditingWeightId(null);
      }
    };

    if (editingWeightId) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [editingWeightId]);

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

  const handleToggleStatus = (id: string) => {
    setFormData((prev) => ({
      ...prev,
      weightProbabilities: prev.weightProbabilities.map((prob) =>
        prob.id === id
          ? {
              ...prob,
              status: (prob.status === 'ACTIVE'
                ? 'INACTIVE'
                : 'ACTIVE') as StatusType,
            }
          : prob,
      ),
    }));
  };

  const handleDeleteProbability = (id: string) => {
    setFormData((prev) => ({
      ...prev,
      weightProbabilities: prev.weightProbabilities.filter(
        (prob) => prob.id !== id,
      ),
    }));
  };

  const handleAddProbability = () => {
    const newProb = {
      id: `new-${Date.now()}`,
      weight: 'FIVE' as WeightType,
      chance: 0,
      questions: 1,
      status: 'ACTIVE' as StatusType,
    };
    setFormData((prev) => ({
      ...prev,
      weightProbabilities: [...prev.weightProbabilities, newProb],
    }));
  };

  const handleWeightChange = (id: string, newWeight: WeightType) => {
    setFormData((prev) => ({
      ...prev,
      weightProbabilities: prev.weightProbabilities.map((prob) =>
        prob.id === id ? { ...prob, weight: newWeight } : prob,
      ),
    }));
    setEditingWeightId(null);
  };

  const handleProbabilityFieldChange = (
    id: string,
    field: 'chance' | 'questions',
    value: string,
  ) => {
    const numValue =
      field === 'questions' ? parseInt(value) || 0 : parseFloat(value) || 0;

    setFormData((prev) => ({
      ...prev,
      weightProbabilities: prev.weightProbabilities.map((prob) =>
        prob.id === id ? { ...prob, [field]: numValue } : prob,
      ),
    }));

    const errorKey = `weightProbabilities.${formData.weightProbabilities.findIndex(
      (p) => p.id === id,
    )}.${field}`;
    if (errors[errorKey]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[errorKey];
        return newErrors;
      });
    }
  };

  const handleSubmit = async () => {
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

    const validation = validateGameConfig(validatedFormData);

    if (!validation.isValid) {
      setErrors(validation.errors);
      toast.error('Please fix the validation errors');
      return;
    }

    setIsSubmitting(true);
    setSubmitStatus('idle');

    try {
      const payload: UpdatePerfectScoreGamePayload = {
        ...validatedFormData,
        type: 'PerfectScoreConfigRequest',
        gameId: gameData?.gameId || '',
        weightProbabilities: validatedFormData.weightProbabilities.map(
          (wp) => ({
            ...wp,
            chance: Number(wp.chance),
            questions: Number(wp.questions),
          }),
        ),
      };

      await GameApi.updatePerfectScoreGame(payload);
      await refetch();

      setSubmitStatus('success');
      toast.success('Configuration saved successfully!');

      setTimeout(() => {
        router.back();
      }, 1500);
    } catch (error) {
      setSubmitStatus('error');
      toast.error('Failed to save configuration. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          <p className="text-sm text-gray-600">Loading configuration...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-4">
          <AlertCircle className="h-8 w-8 text-red-600" />
          <p className="text-sm text-gray-600">Failed to load configuration</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl">
        {/* Stake Settings */}
        <div className="mb-6 rounded-lg bg-white p-4 shadow-sm sm:mb-8 sm:p-6">
          <h2 className="mb-4 text-xl font-bold text-gray-900 sm:mb-6 sm:text-2xl">
            Stake Settings
          </h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3">
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-900">
                Minimum Stake
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-medium text-gray-600 sm:left-4 sm:text-base">
                  ₦
                </span>
                <input
                  type="number"
                  value={formData.minimumStake}
                  onChange={(e) =>
                    handleInputChange('minimumStake', e.target.value)
                  }
                  disabled={isSubmitting}
                  className={`w-full rounded-lg border py-2 pl-8 pr-3 text-sm font-medium text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 sm:py-3 sm:pl-10 sm:pr-4 sm:text-base ${
                    errors.minimumStake
                      ? 'border-red-500 bg-red-50'
                      : 'border-gray-300 bg-gray-100'
                  }`}
                />
              </div>
              {errors.minimumStake && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.minimumStake}
                </p>
              )}
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-900">
                Maximum Stake
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-base font-medium text-gray-600">
                  ₦
                </span>
                <input
                  type="number"
                  value={formData.maximumStake}
                  onChange={(e) =>
                    handleInputChange('maximumStake', e.target.value)
                  }
                  disabled={isSubmitting}
                  className={`w-full rounded-lg border py-3 pl-10 pr-4 text-base font-medium text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 ${
                    errors.maximumStake
                      ? 'border-red-500 bg-red-50'
                      : 'border-gray-300 bg-gray-100'
                  }`}
                />
              </div>
              {errors.maximumStake && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.maximumStake}
                </p>
              )}
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-900">
                Stake Multiplier
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="0.1"
                  value={formData.stakeMultiplier}
                  onChange={(e) =>
                    handleInputChange('stakeMultiplier', e.target.value)
                  }
                  disabled={isSubmitting}
                  className={`w-full rounded-lg border px-3 py-2 text-sm font-medium text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 sm:px-4 sm:py-3 sm:text-base ${
                    errors.stakeMultiplier
                      ? 'border-red-500 bg-red-50'
                      : 'border-gray-300 bg-gray-100'
                  }`}
                />
              </div>
              {errors.stakeMultiplier && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.stakeMultiplier}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Spin Settings */}
        <div className="mb-6 rounded-lg bg-white p-4 shadow-sm sm:mb-8 sm:p-6">
          <h2 className="mb-4 text-xl font-bold text-gray-900 sm:mb-6 sm:text-2xl">
            Spin Settings
          </h2>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:gap-6">
            <div className="min-w-0 flex-1">
              <label className="mb-2 block text-sm font-medium text-gray-900">
                Default Spins
              </label>
              <input
                type="number"
                value={formData.defaultSpin}
                onChange={(e) =>
                  handleInputChange('defaultSpin', e.target.value)
                }
                disabled={isSubmitting}
                className={`w-full rounded-lg border px-4 py-3 text-base font-medium text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 ${
                  errors.defaultSpin
                    ? 'border-red-500 bg-red-50'
                    : 'border-gray-300 bg-gray-100'
                }`}
              />
              {errors.defaultSpin && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.defaultSpin}
                </p>
              )}
            </div>

            <div className="flex-1">
              <label className="mb-2 block text-sm font-medium text-gray-900">
                Max Respin
              </label>
              <input
                type="number"
                value={formData.maxRespin}
                onChange={(e) => handleInputChange('maxRespin', e.target.value)}
                disabled={isSubmitting}
                className={`w-full rounded-lg border px-4 py-3 text-base font-medium text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 ${
                  errors.maxRespin
                    ? 'border-red-500 bg-red-50'
                    : 'border-gray-300 bg-gray-100'
                }`}
              />
              {errors.maxRespin && (
                <p className="mt-1 text-sm text-red-600">{errors.maxRespin}</p>
              )}
            </div>

            <div className="flex-1">
              <label className="mb-2 block text-sm font-medium text-gray-900">
                Spin Amount
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-medium text-gray-600 sm:left-4 sm:text-base">
                  ₦
                </span>
                <input
                  type="number"
                  value={formData.spinAmount}
                  onChange={(e) =>
                    handleInputChange('spinAmount', e.target.value)
                  }
                  disabled={isSubmitting}
                  className={`w-full rounded-lg border py-2 pl-8 pr-3 text-sm font-medium text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 sm:py-3 sm:pl-10 sm:pr-4 sm:text-base ${
                    errors.spinAmount
                      ? 'border-red-500 bg-red-50'
                      : 'border-gray-300 bg-gray-100'
                  }`}
                />
              </div>
              {errors.spinAmount && (
                <p className="mt-1 text-sm text-red-600">{errors.spinAmount}</p>
              )}
            </div>

            <div className="flex items-center gap-3 pt-2 sm:pb-3 sm:pt-0">
              <button
                onClick={() =>
                  handleInputChange('enableSpin', !formData.enableSpin)
                }
                disabled={isSubmitting}
                className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors disabled:opacity-50 ${
                  formData.enableSpin ? 'bg-green-600' : 'bg-gray-300'
                }`}
              >
                <span
                  className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${
                    formData.enableSpin ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
              <span className="text-sm font-medium text-gray-900">
                Enable Spin
              </span>
            </div>
          </div>
        </div>

        {/* Weight Probabilities */}
        <div className="mb-6 overflow-hidden rounded-lg bg-white p-4 shadow-sm sm:mb-8 sm:p-6">
          <h2 className="mb-4 text-xl font-bold text-gray-900 sm:mb-6 sm:text-2xl">
            Weight Probabilities
          </h2>

          <div className="overflow-x-auto">
            <div className="min-w-[800px]">
              {/* Table Header */}
              <div className="mb-4 grid grid-cols-[2fr_1fr_1fr_1fr_1fr] gap-4 border-b border-gray-200 px-4 pb-4 text-base">
                <div className="text-sm font-medium text-gray-600">Weight</div>
                <div className="text-sm font-medium text-gray-600">
                  Chance (P)
                </div>
                <div className="text-sm font-medium text-gray-600">
                  Question
                </div>
                <div className="text-sm font-medium text-gray-600">Status</div>
                <div className="text-sm font-medium text-gray-600">Actions</div>
              </div>

              {/* Table Rows */}
              <div className="space-y-3">
                {formData.weightProbabilities.map((prob, index) => {
                  const chanceError =
                    errors[`weightProbabilities.${index}.chance`];
                  const questionsError =
                    errors[`weightProbabilities.${index}.questions`];

                  return (
                    <div key={prob.id} className="space-y-2">
                      <div className="grid grid-cols-[2fr_1fr_1fr_1fr_1fr] gap-4 rounded-lg bg-gray-50 p-4 shadow-sm">
                        {/* Weight Dropdown */}
                        <div className="weight-dropdown relative">
                          <button
                            onClick={() =>
                              setEditingWeightId(
                                editingWeightId === prob.id ? null : prob.id,
                              )
                            }
                            disabled={isSubmitting}
                            className="flex w-full items-center justify-between rounded-lg border border-[#D9D9D9] bg-white px-3 py-2 text-left text-sm font-medium text-gray-900 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 sm:px-4 sm:py-3 sm:text-base"
                          >
                            {prob.weight}
                            <ChevronDown
                              className={`h-4 w-4 text-[#1B212D] transition-transform sm:h-5 sm:w-5 ${
                                editingWeightId === prob.id ? 'rotate-180' : ''
                              }`}
                            />
                          </button>

                          {editingWeightId === prob.id && (
                            <div className="absolute left-0 z-10 mt-2 w-full rounded-md border border-[#D9D9D9] bg-white shadow-lg">
                              <ul className="py-1">
                                {weightOptions.map((weight) => (
                                  <li key={weight}>
                                    <button
                                      className={`w-full px-4 py-2 text-left text-sm hover:bg-gray-100 ${
                                        prob.weight === weight
                                          ? 'bg-gray-100 font-semibold'
                                          : ''
                                      }`}
                                      onClick={() =>
                                        handleWeightChange(prob.id, weight)
                                      }
                                      disabled={isSubmitting}
                                    >
                                      {weight}
                                    </button>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>

                        {/* Chance  */}
                        <div className="flex flex-col">
                          <input
                            type="number"
                            step="0.01"
                            min="0"
                            max="1"
                            value={prob.chance}
                            onChange={(e) =>
                              handleProbabilityFieldChange(
                                prob.id,
                                'chance',
                                e.target.value,
                              )
                            }
                            disabled={isSubmitting}
                            className={`rounded-lg border px-3 py-2 text-base font-medium text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 ${
                              chanceError
                                ? 'border-red-500 bg-red-50'
                                : 'border-gray-300 bg-white'
                            }`}
                          />
                        </div>

                        {/* Questions  */}
                        <div className="flex flex-col">
                          <input
                            type="number"
                            step="1"
                            min="1"
                            value={prob.questions}
                            onChange={(e) =>
                              handleProbabilityFieldChange(
                                prob.id,
                                'questions',
                                e.target.value,
                              )
                            }
                            disabled={isSubmitting}
                            className={`rounded-lg border px-3 py-2 text-base font-medium text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 ${
                              questionsError
                                ? 'border-red-500 bg-red-50'
                                : 'border-gray-300 bg-white'
                            }`}
                          />
                        </div>

                        {/* Status */}
                        <div className="flex items-center justify-start gap-2">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleToggleStatus(prob.id)}
                              disabled={isSubmitting}
                              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors disabled:opacity-50 sm:h-7 sm:w-12 ${
                                prob.status === 'ACTIVE'
                                  ? 'bg-green-600'
                                  : 'bg-gray-300'
                              }`}
                            >
                              <span
                                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform sm:h-5 sm:w-5 ${
                                  prob.status === 'ACTIVE'
                                    ? 'translate-x-5 sm:translate-x-6'
                                    : 'translate-x-1'
                                }`}
                              />
                            </button>
                            <span
                              className={`rounded-full px-3 py-1 text-xs font-semibold ${
                                prob.status === 'ACTIVE'
                                  ? 'bg-green-100 text-green-800'
                                  : 'bg-gray-200 text-gray-600'
                              }`}
                            >
                              {prob.status}
                            </span>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-2 sm:justify-end">
                          <button
                            onClick={() => handleDeleteProbability(prob.id)}
                            disabled={
                              isSubmitting ||
                              formData.weightProbabilities.length <= 1
                            }
                            className="rounded-lg p-2 text-red-600 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            <Trash2 className="h-5 w-5" />
                          </button>
                        </div>
                      </div>

                      {/* Error messages */}
                      {(chanceError || questionsError) && (
                        <div className="ml-4 space-y-1">
                          {chanceError && (
                            <p className="text-sm text-red-600">
                              {chanceError}
                            </p>
                          )}
                          {questionsError && (
                            <p className="text-sm text-red-600">
                              {questionsError}
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <button
            onClick={handleAddProbability}
            disabled={isSubmitting}
            className="mt-4 w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-900 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
          >
            + Add Probability
          </button>
        </div>

        <div className="mt-6 flex items-center justify-center sm:justify-start sm:gap-4">
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-6 py-3 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto sm:px-8 sm:text-base"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                <span>Saving...</span>
              </>
            ) : submitStatus === 'success' ? (
              <>
                <CheckCircle className="h-5 w-5" />
                <span>Saved!</span>
              </>
            ) : submitStatus === 'error' ? (
              <>
                <AlertCircle className="h-5 w-5" />
                <span>Try Again</span>
              </>
            ) : (
              <span>Save Configuration</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
