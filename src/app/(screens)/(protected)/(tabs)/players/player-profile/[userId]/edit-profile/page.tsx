'use client';

import React, { useMemo, useEffect } from 'react';
import BackButton from '@/app/icons/BackButton';
import CustomTextField from '@/app/utils/CustomTextField';
import CustomButton from '@/app/utils/CustomBtn';
import CustomSelect from '@/app/utils/CustomSelect';
import Joi from 'joi';
import { joiResolver } from '@hookform/resolvers/joi';
import { useForm, Controller } from 'react-hook-form';
import { DatePicker } from '@/app/components/ui/date-picker';
import { ArrowDownIcon } from '@/app/icons/icons';
import { User } from 'lucide-react';
import {
  useGetBanks,
  useVerifyAccount,
  useUpdatePlayer,
} from '@/app/api/wallet';
import { Combobox } from '@/app/components/ui/combobox';
import { useParams } from 'next/navigation';
import { usePlayerProfile } from '@/app/hooks/usePlayerProfile';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import PlayerApi, {
  UpdateCustomerProfileRequest,
} from '@/app/api/PlayerProfileApi';

export default function EditProfile() {
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();

  const userId = params.userId as string;

  const { data: playerData, isLoading, isError } = usePlayerProfile(userId);

  const { data } = useGetBanks();
  const { mutateAsync: verifyAccount } = useVerifyAccount();
  const { mutateAsync: updatePlayer, isPending } = useUpdatePlayer();

  const banks = useMemo(() => {
    if (data?.result?.data) {
      return data?.result?.data?.map((bank) => ({
        label: bank.name,
        value: JSON.stringify({ name: bank.name, code: bank.code }),
      }));
    }
    return [];
  }, [data]);

  const SCHEMA = Joi.object({
    firstName: Joi.string().required().messages({
      'string.empty': 'First name is required',
    }),
    lastName: Joi.string().required().messages({
      'string.empty': 'Last name is required',
    }),
    email: Joi.string().required().messages({
      'string.empty': 'Email is required',
    }),
    country: Joi.string().required().messages({
      'string.empty': 'Country is required',
    }),
    gender: Joi.string().required().messages({
      'string.empty': 'Gender is required',
    }),
    dob: Joi.date().required().messages({
      'date.base': 'Date of birth must be a valid date',
      'any.required': 'Date of birth is required',
    }),
    kycVerified: Joi.boolean().default(false),
    facebook: Joi.string().allow(''),
    twitter: Joi.string().allow(''),
    instagram: Joi.string().allow(''),
    tiktok: Joi.string().allow(''),
    bankDetails: Joi.object({
      accountNumber: Joi.string().allow(''),
      bankName: Joi.string().allow(''),
      accountName: Joi.string().allow(''),
      bankCode: Joi.string().allow(''),
    }),
  });

  const INITIAL_VALUES = {
    firstName: '',
    lastName: '',
    email: '',
    country: 'Nigeria',
    gender: '',
    dob: new Date(),
    kycVerified: false,
    facebook: '',
    twitter: '',
    instagram: '',
    tiktok: '',
    whatsapp: '',
    bankDetails: {
      accountNumber: '',
      bankName: '',
      accountName: '',
    },
  };

  type FormValues = typeof INITIAL_VALUES;

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: joiResolver(SCHEMA),
    defaultValues: INITIAL_VALUES,
  });

  useEffect(() => {
    if (playerData) {
      const data = playerData.data || playerData;

      const firstName = data.firstName || data.userDetails?.firstName || '';
      const lastName = data.lastName || data.userDetails?.lastName || '';
      const email = data.email || data.userDetails?.email || '';
      const country = data.country || data.userDetails?.country || 'Nigeria';
      const gender = data.gender || data.userDetails?.gender || '';
      const dob = data.dob || data.userDetails?.dateOfBirth?.iso || '';

      setValue('firstName', firstName);
      setValue('lastName', lastName);
      setValue('email', email);
      setValue('country', country);
      setValue('gender', gender);
      setValue('dob', dob ? new Date(dob) : new Date());

      const socials = {
        facebook: data.facebookHandle || data.facebook || '',
        twitter: data.twitterHandle || data.twitter || '',
        instagram: data.instagramHandle || data.instagram || '',
        tiktok: data.tiktokHandle || data.tiktok || '',
        whatsapp: data.whatsappContact || data.whatsapp || '',
      };

      setValue('facebook', socials.facebook);
      setValue('twitter', socials.twitter);
      setValue('instagram', socials.instagram);
      setValue('tiktok', socials.tiktok);
      setValue('whatsapp', socials.whatsapp);

      const kycVerified =
        data.kycVerified || data.userDetails?.kycVerified || false;
      setValue('kycVerified', kycVerified);

      if (playerData?.bankAccounts?.[0]) {
        if (!playerData.bankAccounts[0].bankCode) {
          const bank = banks.find(
            (b) => b.label === playerData.bankAccounts[0].bankName,
          );
          if (bank) {
            setValue(
              'bankDetails.bankName',
              JSON.stringify({
                name: bank.label,
                code: JSON.parse(bank.value).code,
              }),
            );
          }
        } else {
          setValue(
            'bankDetails.bankName',
            JSON.stringify({
              name: playerData.bankAccounts[0].bankName,
              code: playerData.bankAccounts[0].bankCode,
            }),
          );
        }
        setValue(
          'bankDetails.accountNumber',
          playerData.bankAccounts[0].accountNumber || '',
        );
        setValue(
          'bankDetails.accountName',
          playerData.bankAccounts[0].accountName || '',
        );
      }
    }
  }, [playerData, banks]);

  const bank_name = watch('bankDetails.bankName');

  const onSubmit = async (data: FormValues) => {
    try {
      const formatDate = (date: Date) => {
        return date.toISOString().split('T')[0];
      };

      const payload: UpdateCustomerProfileRequest = {
        firstName: data.firstName.trim(),
        lastName: data.lastName.trim(),
        dob: formatDate(data.dob),
        country: data.country || 'Nigeria',
        gender: data.gender || 'MALE',
        avatarUrl: playerData?.data?.avatarUrl || '',
        promotions: false,
        facebook: data.facebook?.trim() || '',
        twitter: data.twitter?.trim() || '',
        instagram: data.instagram?.trim() || '',
        whatsapp: data.whatsapp?.trim() || '',
        tiktok: data.tiktok?.trim() || '',
      };

      const response = await PlayerApi.updateCustomerProfile(userId, payload);

      if (response?.data?.success) {
        toast.success('Profile updated successfully');
        // Refresh the data after successful update
        await queryClient.invalidateQueries({
          queryKey: ['playerProfile', userId],
        });
        router.back();
      } else {
        const errorMessage =
          response?.data?.message || 'Failed to update profile';
        console.error('Update failed:', errorMessage);
        toast.error(errorMessage);
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      let errorMessage = 'An error occurred while updating profile';

      if (error.response) {
        console.error('Error response data:', error.response.data);
        errorMessage = error.response.data?.message || errorMessage;
      } else if (error.request) {
        console.error('No response received:', error.request);
        errorMessage = 'No response from server. Please check your connection.';
      } else {
        console.error('Error message:', error.message);
        errorMessage = error.message || errorMessage;
      }

      toast.error(errorMessage);
    }
  };

  const handleCheckBankAccount = async (
    email: string,
    account_number: string,
    bank_code: string,
  ) => {
    try {
      const response = await verifyAccount({
        email,
        accountNumber: account_number,
        bankCode: bank_code,
      });

      if (response?.result?.status === 'success') {
        setValue(
          'bankDetails.accountName',
          response?.result?.data?.account_name,
        );
      } else {
        setValue('bankDetails.accountName', '');
        toast.error(response?.result?.message || 'Failed to verify account');
      }
    } catch (error) {
      toast.error(error?.result?.message || 'Failed to verify account');
      setValue('bankDetails.accountName', '');
    }
  };

  if (isLoading) {
    return (
      <div className="flex w-full flex-col gap-6 py-6">
        <div className="flex items-center justify-between">
          <BackButton />
        </div>
        <div className="flex items-center justify-center py-12">
          <p className="text-gray-500">Loading player data...</p>
        </div>
      </div>
    );
  }

  if (isError || !playerData) {
    return (
      <div className="flex w-full flex-col gap-6 py-6">
        <div className="flex items-center justify-between">
          <BackButton />
        </div>
        <div className="flex items-center justify-center py-12">
          <p className="text-red-600">Failed to load player data.</p>
        </div>
      </div>
    );
  }

  const testSubmit = () => {
    const testData = {
      firstName: 'Test',
      lastName: 'User',
      dob: new Date(),
      country: 'Nigeria',
      gender: 'MALE',
      facebook: 'test',
      twitter: 'test',
      instagram: 'test',
      tiktok: 'test',
      whatsapp: 'test',
      bankDetails: {
        accountNumber: '',
        bankName: '',
        accountName: '',
      },
      kycVerified: false,
      email: 'test@example.com',
    };
    onSubmit(testData);
  };

  return (
    <div className="flex w-full flex-col gap-6 py-6">
      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={() => router.back()}
          className="flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-gray-700"
        >
          <BackButton /> Back to Profile
        </button>
      </div>

      <form
        className="rounded-lg bg-white p-6"
        onSubmit={handleSubmit(onSubmit)}
      >
        <p className="font-heading text-2xl font-bold">Personal Information</p>

        <div className="my-4">
          <div className="flex w-full flex-col items-center gap-4 md:flex-row">
            <Controller
              name="firstName"
              control={control}
              render={({ field }) => (
                <div className="w-full">
                  <CustomTextField label="First Name" {...field} />
                  <p className="mt-1 min-h-[1.25rem] text-xs leading-tight text-red-500">
                    {errors.firstName?.message || '\u00A0'}
                  </p>
                </div>
              )}
            />
            <Controller
              name="lastName"
              control={control}
              render={({ field }) => (
                <div className="w-full">
                  <CustomTextField label="Last Name" {...field} />
                  <p className="mt-1 min-h-[1.25rem] text-xs leading-tight text-red-500">
                    {errors.lastName?.message || '\u00A0'}
                  </p>
                </div>
              )}
            />
          </div>
          <div className="flex w-full flex-col items-center gap-4 md:flex-row">
            <Controller
              name="email"
              control={control}
              render={({ field }) => (
                <div className="w-full">
                  <CustomTextField label="Email" disabled {...field} />
                  <p className="mt-1 min-h-[1.25rem] text-xs leading-tight text-red-500">
                    {errors.email?.message || '\u00A0'}
                  </p>
                </div>
              )}
            />

            <Controller
              name="dob"
              control={control}
              render={({ field }) => (
                <div className="w-full">
                  <DatePicker label="Date of Birth" {...field} />
                  <p className="mt-1 min-h-[1.25rem] text-xs leading-tight text-red-500">
                    {errors.dob?.message || '\u00A0'}
                  </p>
                </div>
              )}
            />
          </div>
          <div className="flex w-full flex-col items-center gap-4 md:flex-row">
            <Controller
              name="gender"
              control={control}
              render={({ field }) => (
                <div className="w-full">
                  <CustomSelect
                    label="Gender"
                    options={[
                      { label: 'Male', value: 'male' },
                      { label: 'Female', value: 'female' },
                    ]}
                    disabledOption="Select your gender"
                    icon={<ArrowDownIcon className="text-[#A6ABC4]" />}
                    {...field}
                  />
                  <p className="mt-1 min-h-[1.25rem] text-xs leading-tight text-red-500">
                    {errors.gender?.message || '\u00A0'}
                  </p>
                </div>
              )}
            />

            <Controller
              name="country"
              control={control}
              render={({ field }) => (
                <div className="w-full">
                  <CustomSelect
                    label="Country"
                    options={[{ label: 'Nigeria', value: 'Nigeria' }]}
                    disabledOption="Select your country"
                    disabled
                    icon={<ArrowDownIcon className="text-[#A6ABC4]" />}
                    {...field}
                  />
                  <p className="mt-1 min-h-[1.25rem] text-xs leading-tight text-red-500">
                    {errors.country?.message || '\u00A0'}
                  </p>
                </div>
              )}
            />
          </div>
          <div className="max-w-max rounded-lg border border-blue-200 bg-blue-50 p-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <User className="h-5 w-5 text-gray-700" />
                <span className="mr-2 text-sm font-medium text-gray-900">
                  KYC Verify User
                </span>
              </div>
              <Controller
                name="kycVerified"
                control={control}
                render={({ field }) => (
                  <button
                    type="button"
                    onClick={() => field.onChange(!field.value)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none disabled:cursor-not-allowed disabled:opacity-50 ${
                      field?.value ? 'bg-green-500' : 'bg-gray-300'
                    }`}
                    role="switch"
                    aria-checked={field?.value}
                    aria-label="Toggle user KYC verification"
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        field?.value ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                )}
              />
            </div>
          </div>
        </div>

        <p className="font-heading text-2xl font-bold">Socials</p>

        <div className="my-4">
          <div className="flex w-full flex-col items-center gap-4 md:flex-row">
            <Controller
              name="facebook"
              control={control}
              render={({ field }) => (
                <div className="w-full">
                  <CustomTextField
                    label="Facebook"
                    placeholder="@username"
                    {...field}
                  />
                  <p className="mt-1 min-h-[1.25rem] text-xs leading-tight text-red-500">
                    {errors.facebook?.message || '\u00A0'}
                  </p>
                </div>
              )}
            />
            <Controller
              name="instagram"
              control={control}
              render={({ field }) => (
                <div className="w-full">
                  <CustomTextField
                    label="Instagram"
                    placeholder="@username"
                    {...field}
                  />
                  <p className="mt-1 min-h-[1.25rem] text-xs leading-tight text-red-500">
                    {errors.instagram?.message || '\u00A0'}
                  </p>
                </div>
              )}
            />
          </div>
          <div className="flex w-full flex-col items-center gap-4 md:flex-row">
            <Controller
              name="twitter"
              control={control}
              render={({ field }) => (
                <div className="w-full">
                  <CustomTextField
                    label="X Formerly Twitter"
                    placeholder="@username"
                    {...field}
                  />
                  <p className="mt-1 min-h-[1.25rem] text-xs leading-tight text-red-500">
                    {errors.twitter?.message || '\u00A0'}
                  </p>
                </div>
              )}
            />
            <Controller
              name="tiktok"
              control={control}
              render={({ field }) => (
                <div className="w-full">
                  <CustomTextField
                    label="Tiktok"
                    placeholder="@username"
                    {...field}
                  />
                  <p className="mt-1 min-h-[1.25rem] text-xs leading-tight text-red-500">
                    {errors.tiktok?.message || '\u00A0'}
                  </p>
                </div>
              )}
            />
          </div>
        </div>

        {/* <p className="font-heading text-2xl font-bold">Bank</p>

        <div className="my-4">
          <div className="flex w-full flex-col items-center gap-4 md:flex-row">
            <Controller
              name="bankDetails.bankName"
              control={control}
              render={({ field }) => (
                <div className="w-full">
                  <Combobox
                    label="Bank Name"
                    placeholder="Enter bank name"
                    {...field}
                    options={banks}
                  />
                  <p className="mt-1 min-h-[1.25rem] text-xs leading-tight text-red-500">
                    {errors.bankDetails?.bankName?.message || '\u00A0'}
                  </p>
                </div>
              )}
            />
            <Controller
              name="bankDetails.accountNumber"
              control={control}
              render={({ field }) => (
                <div className="w-full">
                  <CustomTextField
                    label="Account Number"
                    placeholder="Enter account number"
                    {...field}
                    onChange={(e) => {
                      field.onChange(e.target.value);
                      if (e.target.value.length === 10) {
                        handleCheckBankAccount(
                          playerData?.userDetails?.email,
                          e.target.value,
                          JSON.parse(bank_name)?.code,
                        );
                      }
                    }}
                  />
                  <p className="mt-1 min-h-[1.25rem] text-xs leading-tight text-red-500">
                    {errors.bankDetails?.accountNumber?.message || '\u00A0'}
                  </p>
                </div>
              )}
            />
          </div>
          <div className="flex w-full flex-col items-center gap-4 md:flex-row">
            <Controller
              name="bankDetails.accountName"
              control={control}
              render={({ field }) => (
                <div className="w-full">
                  <CustomTextField
                    label="Account Name"
                    placeholder="Enter account name"
                    disabled
                    {...field}
                  />
                  <p className="mt-1 min-h-[1.25rem] text-xs leading-tight text-red-500">
                    {errors.bankDetails?.accountName?.message || '\u00A0'}
                  </p>
                </div>
              )}
            />
          </div>
        </div> */}

        <div className="flex gap-3">
          <CustomButton
            type="button"
            width="full"
            variant="outline"
            onClick={() => {
              router.back();
            }}
            disabled={isPending}
          >
            Cancel
          </CustomButton>
          <CustomButton
            type="button"
            width="full"
            onClick={testSubmit}
            disabled={isPending}
            loader={isPending}
          >
            Update Profile
          </CustomButton>
        </div>
      </form>
    </div>
  );
}
