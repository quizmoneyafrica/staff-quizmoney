'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { joiResolver } from '@hookform/resolvers/joi';
import Joi from 'joi';
import { ArrowLeft, Eye, EyeOff, Check } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';

interface ChangePasswordFormData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

const changePasswordSchema = Joi.object<ChangePasswordFormData>({
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
  newPassword: string;
  confirmPassword: string;
}

const ChangePasswordPage = () => {
  const router = useRouter();
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isValid },
  } = useForm<ChangePasswordFormData>({
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

  const onSubmit = async (data: FormData) => {
    setIsLoading(true);

    try {
      await new Promise((resolve) => setTimeout(resolve, 2000));

      setShowSuccessModal(true);
    } catch (error) {
      console.error('Error changing password:', error);
    } finally {
      setIsLoading(false);
    }
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

        <div className="space-y-6">
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              New Password
            </label>
            <div className="relative">
              <input
                type={showNewPassword ? 'text' : 'password'}
                {...register('newPassword')}
                placeholder="Enter your password"
                className="focus:ring-primary-800 w-full rounded-lg border border-gray-300 px-4 py-3 outline-none transition-all focus:border-transparent focus:ring-2"
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
                placeholder="Confirm your password"
                className="focus:ring-primary-800 w-full rounded-lg border border-gray-300 px-4 py-3 outline-none transition-all focus:border-transparent focus:ring-2"
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
                  8 Characters
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
            type="button"
            onClick={handleSubmit(onSubmit)}
            disabled={!isValid || isLoading}
            className="hover:bg-primary-800 mt-8 w-full rounded-lg bg-blue-600 px-4 py-3 font-medium text-white transition-colors duration-200 disabled:cursor-not-allowed disabled:bg-gray-300"
          >
            {isLoading ? (
              <div className="flex items-center justify-center gap-2">
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                Changing Password...
              </div>
            ) : (
              'Change Password'
            )}
          </button>
        </div>
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
                Good job!
              </h2>
              <p className="mb-6 text-gray-600">
                You have successfully changed your password
              </p>

              <button
                onClick={handleSuccessModalClose}
                className="hover:bg-primary-800 w-full rounded-xl bg-blue-600 px-4 py-3 font-medium text-white transition-colors duration-200"
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
