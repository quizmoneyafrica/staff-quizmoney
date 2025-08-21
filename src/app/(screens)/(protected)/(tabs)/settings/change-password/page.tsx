'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { joiResolver } from '@hookform/resolvers/joi';
import Joi from 'joi';
import { ArrowLeft, Eye, EyeOff, Check } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import userApi, { ChangePasswordRequest } from '@/app/api/userApi';

const changePasswordSchema = Joi.object({
  currentPassword: Joi.string().required().messages({
    'any.required': 'Current password is required',
  }),
  newPassword: Joi.string()
    .min(8)
    .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .required()
    .messages({
      'string.min': 'Password must be at least 8 characters long',
      'string.pattern.base':
        'Password must contain uppercase, lowercase, number and special character',
      'any.required': 'New password is required',
    }),
  confirmPassword: Joi.string()
    .valid(Joi.ref('newPassword'))
    .required()
    .messages({
      'any.only': 'Passwords do not match',
      'any.required': 'Please confirm your password',
    }),
});

interface FormData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

const ChangePasswordPage = () => {
  const router = useRouter();
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isValid },
    reset,
  } = useForm<FormData>({
    resolver: joiResolver(changePasswordSchema),
    mode: 'onChange',
  });

  const newPassword = watch('newPassword', '');

  const passwordChecks = [
    { label: '8 Characters', test: newPassword.length >= 8 },
    {
      label: 'Special characters',
      test: /[!@#$%^&*(),.?":{}|<>]/.test(newPassword),
    },
  ];
  // Change password mutation
  const changePasswordMutation = useMutation({
    mutationFn: (data: ChangePasswordRequest) => userApi.changePassword(data),
    onSuccess: (response) => {
      if (response.status === 200) {
        setShowSuccessModal(true);
        reset();
        toast.success('Password changed successfully', {
          position: 'top-center',
        });
      }
    },
    onError: (error: unknown) => {
      let errorMessage = 'Failed to change password. Please try again.';

      if (error && typeof error === 'object') {
        const axiosError = error as {
          response?: {
            data?: {
              error?: string;
            };
          };
          message?: string;
        };

        errorMessage =
          axiosError.response?.data?.error ||
          axiosError.message ||
          'Failed to change password. Please try again.';
      }

      toast.error(errorMessage, {
        position: 'top-center',
      });
    },
  });

  const onSubmit = async (data: FormData) => {
    const changePasswordData: ChangePasswordRequest = {
      currentPassword: data.currentPassword,
      newPassword: data.newPassword,
    };

    changePasswordMutation.mutate(changePasswordData);
  };

  const handleSuccessModalClose = () => {
    setShowSuccessModal(false);
    router.push('/settings');
  };

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-8">
      <div className="mx-auto max-w-md">
        <div className="mb-8 flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="rounded-full p-2 transition-colors hover:bg-gray-200"
          >
            <ArrowLeft className="h-6 w-6 text-gray-600" />
          </button>
          <h1 className="text-2xl font-bold text-gray-900">Change Password</h1>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Current Password
            </label>
            <div className="relative">
              <input
                type={showCurrentPassword ? 'text' : 'password'}
                {...register('currentPassword')}
                placeholder="Enter your current password"
                className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none transition-all focus:border-transparent focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="button"
                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 transform text-gray-400 hover:text-gray-600"
              >
                {showCurrentPassword ? (
                  <EyeOff className="h-5 w-5" />
                ) : (
                  <Eye className="h-5 w-5" />
                )}
              </button>
            </div>
            {errors.currentPassword && (
              <p className="mt-2 text-sm text-red-600">
                {errors.currentPassword.message}
              </p>
            )}
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              New Password
            </label>
            <div className="relative">
              <input
                type={showNewPassword ? 'text' : 'password'}
                {...register('newPassword')}
                placeholder="Enter your new password"
                className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none transition-all focus:border-transparent focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 transform text-gray-400 hover:text-gray-600"
              >
                {showNewPassword ? (
                  <EyeOff className="h-5 w-5" />
                ) : (
                  <Eye className="h-5 w-5" />
                )}
              </button>
            </div>

            {newPassword && (
              <div className="mt-3 space-y-2">
                {passwordChecks.map((check, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <div
                      className={`flex h-4 w-4 items-center justify-center rounded-full ${
                        check.test ? 'bg-green-500' : 'bg-gray-200'
                      }`}
                    >
                      {check.test && <Check className="h-3 w-3 text-white" />}
                    </div>
                    <span
                      className={`text-sm ${
                        check.test ? 'text-green-600' : 'text-gray-500'
                      }`}
                    >
                      {check.label}
                    </span>
                  </div>
                ))}
              </div>
            )}

            {errors.newPassword && (
              <p className="mt-2 text-sm text-red-600">
                {errors.newPassword.message}
              </p>
            )}
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Confirm New Password
            </label>
            <div className="relative">
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                {...register('confirmPassword')}
                placeholder="Confirm your new password"
                className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none transition-all focus:border-transparent focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 transform text-gray-400 hover:text-gray-600"
              >
                {showConfirmPassword ? (
                  <EyeOff className="h-5 w-5" />
                ) : (
                  <Eye className="h-5 w-5" />
                )}
              </button>
            </div>

            {watch('confirmPassword') && (
              <div className="mt-3 flex items-center gap-2">
                <div
                  className={`flex h-4 w-4 items-center justify-center rounded-full ${
                    watch('confirmPassword') === newPassword && newPassword
                      ? 'bg-green-500'
                      : 'bg-gray-200'
                  }`}
                >
                  {watch('confirmPassword') === newPassword && newPassword && (
                    <Check className="h-3 w-3 text-white" />
                  )}
                </div>
                <span
                  className={`text-sm ${
                    watch('confirmPassword') === newPassword && newPassword
                      ? 'text-green-600'
                      : 'text-gray-500'
                  }`}
                >
                  Passwords match
                </span>
              </div>
            )}

            {errors.confirmPassword && (
              <p className="mt-2 text-sm text-red-600">
                {errors.confirmPassword.message}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={!isValid || changePasswordMutation.isPending}
            className="mt-8 w-full rounded-lg bg-blue-600 px-4 py-3 font-medium text-white transition-colors duration-200 hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-gray-300"
          >
            {changePasswordMutation.isPending ? (
              <div className="flex items-center justify-center gap-2">
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                Changing Password...
              </div>
            ) : (
              'Change Password'
            )}
          </button>
        </form>
      </div>

      <AnimatePresence>
        {showSuccessModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-sm rounded-2xl bg-white p-8 text-center"
            >
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-100">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-600">
                  <Check className="h-6 w-6 text-white" />
                </div>
              </div>

              <h2 className="mb-2 text-xl font-semibold text-gray-900">
                Password Changed!
              </h2>
              <p className="mb-6 text-gray-600">
                Your password has been successfully changed
              </p>

              <button
                onClick={handleSuccessModalClose}
                className="w-full rounded-xl bg-blue-600 px-4 py-3 font-medium text-white transition-colors duration-200 hover:bg-blue-700"
              >
                Go back to settings
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ChangePasswordPage;
