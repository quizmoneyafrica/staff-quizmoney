'use client';
import { UpdateUserForm } from '@/app/api/interface';
import userApi, {
  getAuthUser,
  AdminResponse,
  // AvatarProjection,
} from '@/app/api/userApi';
import { useAppSelector, useAuth } from '@/app/hooks/useAuth';
import { MailIcon, PersonIcon } from '@/app/icons/icons';
import CustomButton from '@/app/utils/CustomBtn';
// import CustomSelect from '@/app/utils/CustomSelect';
import CustomTextField from '@/app/utils/CustomTextField';
import { formatDateTime } from '@/app/utils/utils';
import {
  // CalendarIcon, GlobeIcon,
  Pencil1Icon,
} from '@radix-ui/react-icons';
import { Flex, Grid } from '@radix-ui/themes';

import { motion } from 'framer-motion';
import Image from 'next/image';
import React, { useState } from 'react';
import { toast } from 'sonner';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { KeyRound } from 'lucide-react';
import { useRouter } from 'next/navigation';

const initialForm = {
  firstName: '',
  lastName: '',
  email: '',
  dob: '',
  gender: '',
  country: 'nigeria',
  facebook: '',
  instagram: '',
  twitter: '',
  whatsapp: '',
};

const ChangePasswordButton = () => {
  const router = useRouter();

  const handleNavigateToChangePassword = () => {
    router.push('/settings/change-password');
  };

  return (
    <div className="flex justify-end">
      <button
        onClick={handleNavigateToChangePassword}
        className="text-primary-500 hover:text-primary-600 flex cursor-pointer items-center text-xs underline transition-colors duration-200 sm:text-sm"
      >
        Change Password
        <KeyRound className="ml-1 h-4 w-4" />
      </button>
    </div>
  );
};

const Page = () => {
  const router = useRouter();
  const encrypted = useAppSelector((s) => s.auth.userEncryptedData);
  const user = encrypted;
  // ? decryptData(encrypted) : null;
  const formattedDOB = user?.dob?.iso
    ? (() => {
        try {
          return new Date(user.dob.iso).toISOString().split('T')[0];
        } catch (error) {
          console.error('Invalid date format for DOB:', error);
          return '';
        }
      })()
    : '';
  const [formData, setFormData] = useState({
    ...initialForm,
    ...user?.user,
    dob: user?.dob?.iso
      ? (() => {
          try {
            return new Date(user.dob.iso).toISOString().split('T')[0];
          } catch (error) {
            console.error('Invalid date format for DOB in formData:', error);
            return '';
          }
        })()
      : '',
  });

  const authUser = getAuthUser();
  const { fullDate } = formatDateTime(
    authUser?.createdAt
      ? (() => {
          try {
            return new Date(authUser.createdAt).toISOString();
          } catch (error) {
            console.error('Invalid date format for createdAt:', error);
            return new Date().toISOString();
          }
        })()
      : new Date().toISOString(),
  );

  const [isEditing, setIsEditing] = useState(false);
  const [, setIsUpdating] = useState(false);

  const { loginUser } = useAuth();
  const queryClient = useQueryClient();

  // Get admin profile data
  const {
    data: adminData,
    isLoading: adminLoading,
    error: adminError,
  } = useQuery<{
    success: boolean;
    code: string;
    message: string;
    data: AdminResponse;
  }>({
    queryKey: ['adminProfile', user?.objectId],
    queryFn: async () => {
      const response = await userApi.getAdminProfile(user?.objectId || '');
      return response.data;
    },
    enabled: !!user?.objectId,
  });

  // const { data: avatarsData, isLoading: avatarsLoading } = useQuery<{
  //   success: boolean;
  //   code: string;
  //   message: string;
  //   data: AvatarProjection[];
  // }>({
  //   queryKey: ['avatars'],
  //   queryFn: async () => {
  //     const response = await userApi.getAvatarsList();
  //     return response.data;
  //   },
  // });

  const { mutateAsync: updateAdmin, isPending: isUpdating } = useMutation({
    mutationFn: (formData: UpdateUserForm) => userApi.updateAdmin(formData),
    onSuccess: (res) => {
      if (res.status === 200) {
        setIsEditing(false);
        toast.success('Profile updated successfully', {
          position: 'top-center',
        });

        const userData = res.data.data;

        const userPlayload: UnknownObject = {
          user: {
            email: userData?.emailAddress,
            firstName: userData?.firstName,
            lastName: userData?.lastName,
          },
        };
        loginUser(userPlayload);

        // queryClient.invalidateQueries({ queryKey: ['adminProfile'] });
      }
    },
    onError: (error: unknown) => {
      const errorMessage =
        error &&
        typeof error === 'object' &&
        'response' in error &&
        error.response &&
        typeof error.response === 'object' &&
        'data' in error.response &&
        error.response.data &&
        typeof error.response.data === 'object' &&
        'error' in error.response.data
          ? (error.response.data as { error: string }).error
          : 'Failed to update profile. Please try again later.';

      toast.error(errorMessage, {
        position: 'top-center',
      });
    },
  });

  const onChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const target = e.target as HTMLInputElement | HTMLSelectElement;
    const { name, value } = target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const updateUser = async () => {
    updateAdmin({
      firstName: formData?.firstName,
      lastName: formData?.lastName,
      gender: 'MALE',
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.25, ease: 'easeInOut' }}
    >
      <div className="w-full overflow-hidden rounded-lg bg-white pb-12">
        <div className="bg-primary-800 h-[120px] w-full overflow-hidden rounded-br-[60px] md:h-[160px]">
          <Image
            src="/assets/images/background-desktop.png"
            alt="background"
            width={500}
            height={500}
            className="h-full w-full scale-125 object-cover brightness-75"
          />
        </div>
        <div className="h-full w-full px-4 lg:px-20">
          <div className="  relative min-h-[80vh] w-full ">
            <div className=" h-fit w-full -translate-y-12 border-b border-gray-200 pb-10">
              {/* profile pic */}
              {/* <div
                onClick={() => setIsImageModalOpen(true)}
                className="border-primary-400 z-10 h-[80px] w-[80px] cursor-pointer rounded-full  border-2 bg-white/50  backdrop-blur-sm sm:h-[100px] sm:w-[100px]"
              >
                <div className="relative flex h-full w-full items-center justify-center">
                  <Image
                    src={
                      adminData?.data?.avatarUrl ||
                      user?.avatar ||
                      '/icons/user-cirlce-add.svg'
                    }
                    alt="profile"
                    width={100}
                    height={100}
                    className="h-full w-full rounded-full object-cover"
                  />
                  <Image
                    src={'/icons/camera.svg'}
                    alt="profile"
                    width={100}
                    height={100}
                    className="absolute bottom-0 right-0 z-40 h-6 w-6 bg-white fill-black text-black"
                  />
                </div>
              </div> */}

              <Flex justify="between" className="mt-4 w-full">
                <div className="flex flex-col gap-2">
                  {/* <p
                    // onClick={() => setIsImageModalOpen(true)}
                    className=" text-primary-500 cursor-pointer font-medium"
                  >
                    Change Image
                  </p> */}
                  <p className=" font-semibold capitalize">
                    {adminData?.data?.firstName || user?.firstName}{' '}
                    {adminData?.data?.lastName || user?.lastName}
                  </p>
                  <p className=" font-light">
                    {adminData?.data?.emailAddress || user?.email}
                  </p>
                  <p className=" block text-xs font-light sm:hidden">
                    Joined{' '}
                    {adminData?.data?.dateJoined || user?.createdAt
                      ? (() => {
                          try {
                            return formatDateTime(
                              adminData?.data?.dateJoined || user?.createdAt,
                            ).fullDate;
                          } catch (error) {
                            console.error(
                              'Invalid date format for join date:',
                              error,
                            );
                            return 'N/A';
                          }
                        })()
                      : 'N/A'}
                  </p>
                </div>

                <div className="mt-10 flex flex-col items-end justify-between">
                  {!isEditing && (
                    <div className="space-y-2">
                      <div
                        onClick={() => setIsEditing(!isEditing)}
                        className=" text-primary-500 flex cursor-pointer items-center text-xs underline sm:text-sm "
                      >
                        Edit Profile
                        <Pencil1Icon className="h-4 w-4" />
                      </div>
                      <div
                        onClick={() => router.push('/settings/change-password')}
                        className="text-primary-500 hover:text-primary-600 flex cursor-pointer items-center text-xs underline transition-colors duration-200 sm:text-sm"
                      >
                        Change Password
                        <KeyRound className="ml-1 h-4 w-4" />
                      </div>
                    </div>
                  )}
                  {/* <p className="font-light text-xs sm:block hidden">
                    Joined {user?.createdAt ? fullDate : "N/A"}
                  </p> */}
                </div>
              </Flex>
            </div>

            <div className=" space-y-10">
              <Grid
                columns={{ initial: '1', md: '2' }}
                gap={{ initial: '5', md: '40px' }}
              >
                <CustomTextField
                  label="First Name"
                  name="firstName"
                  value={formData.firstName}
                  type="text"
                  autoComplete="first-name"
                  placeholder="Enter your first name"
                  onChange={onChange}
                  disabled={!isEditing}
                  icon={<PersonIcon className="text-[#A6ABC4]" />}
                  required
                  className="capitalize"
                />
                <CustomTextField
                  label="Last Name"
                  name="lastName"
                  value={formData.lastName}
                  type="text"
                  autoComplete="family-name"
                  placeholder="Enter your last name"
                  onChange={onChange}
                  disabled={!isEditing}
                  icon={<PersonIcon className="text-[#A6ABC4]" />}
                  required
                  className="capitalize"
                />
                <CustomTextField
                  label="Email"
                  name="email"
                  value={formData.email}
                  type="email"
                  autoComplete="email"
                  placeholder="Enter your email address"
                  onChange={onChange}
                  disabled={true}
                  icon={<MailIcon className="text-[#A6ABC4]" />}
                  required
                />
                {/* <CustomSelect
                  label="Gender"
                  name="gender"
                  value={formData.gender}
                  options={genders}
                  onChange={onChange}
                  disabledOption="Select your gender"
                  icon={<ArrowDownIcon className="text-[#A6ABC4]" />}
                  disabled={!isEditing}
                /> */}
                {/* <CustomTextField
                  label="Date of Birth"
                  name="dob"
                  value={formData.dob}
                  type="date"
                  autoComplete="bday"
                  // onChange={onChange}
                  disabled={!isEditing}
                  icon={<CalendarIcon className="h-6 w-6 text-[#A6ABC4]" />}
                  required
                  // className="min-0 !w-full"
                /> */}

                {/* <CustomSelect
                  label="Country"
                  name="country"
                  value={formData.country}
                  options={[{ label: 'Nigeria', value: 'nigeria' }]}
                  onChange={onChange}
                  disabled={!isEditing}
                  disabledOption="Select your country"
                  icon={<GlobeIcon className="h-6 w-6 text-[#A6ABC4]" />}
                /> */}
              </Grid>

              {isEditing && (
                <div className="flex flex-col-reverse items-center gap-3 sm:flex-row">
                  <CustomButton
                    onClick={updateUser}
                    loader={isUpdating}
                    disabled={isUpdating}
                    className=" w-full rounded-lg px-4 sm:w-fit"
                  >
                    Update Profile
                  </CustomButton>
                  <CustomButton
                    className=" w-full rounded-lg bg-red-500 px-4 text-white sm:w-fit"
                    onClick={() => setIsEditing(false)}
                  >
                    Cancel
                  </CustomButton>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default Page;

const genders = [
  { label: 'Male', value: 'male' },
  { label: 'Female', value: 'female' },
];
