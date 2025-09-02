'use client';

import React, { useState, useEffect } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import {
  X,
  Loader2,
  CheckCircle,
  AlertCircle,
  ChevronDown,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  validateReferralSettings,
  prepareReferralSettingsData,
  type ReferralSettingsFormData,
} from '@/app/components/referral-management/ReferralSettingsModal.shema';

import { Switch } from '../ui/switch';

interface UpdateReferralSettingsPayload {
  rewardPerReferral: number;
  monthlyLeaderboardRewards: number;
  referralExpiryPolicy: string;
  enableReferrals: boolean;
}

interface ReferralSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: UpdateReferralSettingsPayload) => void;
  loading?: boolean;
  mode: 'view' | 'edit';
  initialData?: {
    rewardPerReferral?: number;
    monthlyLeaderboardRewards?: number;
    referralExpiryPolicy?: string;
    enableReferrals?: boolean;
  };
}

interface FormErrors {
  rewardPerReferral?: string;
  monthlyLeaderboardRewards?: string;
  referralExpiryPolicy?: string;
  enableReferrals?: string;
}

const ReferralSettingsModal: React.FC<ReferralSettingsModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  loading = false,
  mode,
  initialData,
}) => {
  const [formData, setFormData] = useState<ReferralSettingsFormData>({
    rewardPerReferral: '',
    monthlyLeaderboardRewards: '',
    referralExpiryPolicy: '30 days',
    enableReferrals: false,
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<
    'idle' | 'success' | 'error'
  >('idle');
  const [currentMode, setCurrentMode] = useState(mode);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const expiryOptions = [
    '15 days',
    '30 days',
    '60 days',
    '90 days',
    'No expiry',
  ];

  useEffect(() => {
    if (isOpen && initialData) {
      setFormData({
        rewardPerReferral: initialData.rewardPerReferral?.toString() || '',
        monthlyLeaderboardRewards:
          initialData.monthlyLeaderboardRewards?.toString() || '',
        referralExpiryPolicy: initialData.referralExpiryPolicy || '30 days',
        enableReferrals: initialData.enableReferrals || false,
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
      rewardPerReferral: '',
      monthlyLeaderboardRewards: '',
      referralExpiryPolicy: '30 days',
      enableReferrals: false,
    });
    setErrors({});
    setSubmitStatus('idle');
    setIsSubmitting(false);
    setCurrentMode(mode);
    setIsDropdownOpen(false);
  };

  const validateForm = (): boolean => {
    const { isValid, errors: validationErrors } =
      validateReferralSettings(formData);
    setErrors(validationErrors);
    return isValid;
  };

  const handleInputChange = (
    field: keyof Omit<ReferralSettingsFormData, 'enableReferrals'>,
    value: string,
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const handleSwitchChange = (checked: boolean) => {
    setFormData((prev) => ({ ...prev, enableReferrals: checked }));
  };

  const handleDropdownSelect = (value: string) => {
    setFormData((prev) => ({ ...prev, referralExpiryPolicy: value }));
    setIsDropdownOpen(false);
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsSubmitting(true);
    setSubmitStatus('idle');

    try {
      const submitData = prepareReferralSettingsData(formData);
      await onSubmit(submitData);
      setSubmitStatus('success');
      setTimeout(() => {
        handleClose();
      }, 1000);
    } catch (error) {
      console.error('Error updating referral settings:', error);
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
    formData.rewardPerReferral.trim() &&
    formData.monthlyLeaderboardRewards.trim() &&
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
                  {isViewMode ? 'Referral Settings' : 'Edit Referral Settings'}
                </Dialog.Title>
                <motion.div
                  className="flex flex-col gap-6"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.2 }}
                >
                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700">
                      Reward per Referral
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        min="0"
                        value={formData.rewardPerReferral}
                        onChange={(e) =>
                          handleInputChange('rewardPerReferral', e.target.value)
                        }
                        placeholder="6"
                        disabled={isViewMode || loading || isSubmitting}
                        className={`w-full rounded-md border px-4 py-3 pr-20 text-sm focus:outline-none focus:ring-2 focus:ring-[#17478B] disabled:bg-gray-50 disabled:text-gray-600 ${
                          errors.rewardPerReferral
                            ? 'border-red-500'
                            : 'border-gray-300'
                        }`}
                      />
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-gray-500">
                        QM coins
                      </span>
                    </div>
                    {errors.rewardPerReferral && (
                      <p className="mt-1 text-sm text-red-600">
                        {errors.rewardPerReferral}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700">
                      Monthly Leaderboard rewards
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        min="0"
                        value={formData.monthlyLeaderboardRewards}
                        onChange={(e) =>
                          handleInputChange(
                            'monthlyLeaderboardRewards',
                            e.target.value,
                          )
                        }
                        placeholder="2"
                        disabled={isViewMode || loading || isSubmitting}
                        className={`w-full rounded-md border px-4 py-3 pr-20 text-sm focus:outline-none focus:ring-2 focus:ring-[#17478B] disabled:bg-gray-50 disabled:text-gray-600 ${
                          errors.monthlyLeaderboardRewards
                            ? 'border-red-500'
                            : 'border-gray-300'
                        }`}
                      />
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-gray-500">
                        QM coins
                      </span>
                    </div>
                    {errors.monthlyLeaderboardRewards && (
                      <p className="mt-1 text-sm text-red-600">
                        {errors.monthlyLeaderboardRewards}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700">
                      Referral Expiry policy
                    </label>
                    <div className="relative">
                      <button
                        type="button"
                        onClick={() =>
                          !isViewMode &&
                          !loading &&
                          !isSubmitting &&
                          setIsDropdownOpen(!isDropdownOpen)
                        }
                        disabled={isViewMode || loading || isSubmitting}
                        className={`w-full rounded-md border px-4 py-3 text-left text-sm focus:outline-none focus:ring-2 focus:ring-[#17478B] disabled:bg-gray-50 disabled:text-gray-600 ${
                          errors.referralExpiryPolicy
                            ? 'border-red-500'
                            : 'border-gray-300'
                        }`}
                      >
                        <span className="text-gray-900">
                          {formData.referralExpiryPolicy}
                        </span>
                        <ChevronDown
                          className={`absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500 transition-transform ${
                            isDropdownOpen ? 'rotate-180' : ''
                          } ${isViewMode ? 'opacity-50' : ''}`}
                        />
                      </button>

                      {isDropdownOpen && !isViewMode && (
                        <div className="absolute z-10 mt-1 w-full rounded-md border border-gray-300 bg-white shadow-lg">
                          {expiryOptions.map((option) => (
                            <button
                              key={option}
                              type="button"
                              onClick={() => handleDropdownSelect(option)}
                              className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 focus:bg-gray-50 focus:outline-none"
                            >
                              {option}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                    {errors.referralExpiryPolicy && (
                      <p className="mt-1 text-sm text-red-600">
                        {errors.referralExpiryPolicy}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center justify-between py-2">
                    <div>
                      <h4 className="font-medium text-gray-800">
                        Enable Referrals
                      </h4>
                    </div>
                    <Switch
                      id="enable-referrals"
                      checked={formData.enableReferrals}
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
                      <span>Edit settings</span>
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

export default ReferralSettingsModal;
