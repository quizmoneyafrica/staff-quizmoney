'use client';
import { User } from '@/app/api/interface';
import userApi, { getAuthUser } from '@/app/api/userApi';
import { useAppSelector, useAuth } from '@/app/hooks/useAuth';
import { ArrowDownIcon, MailIcon, PersonIcon } from '@/app/icons/icons';
import { decryptData, encryptData } from '@/app/utils/crypto';
import CustomButton from '@/app/utils/CustomBtn';
import CustomSelect from '@/app/utils/CustomSelect';
import CustomTextField from '@/app/utils/CustomTextField';
import { formatDateTime } from '@/app/utils/utils';
import { CalendarIcon, GlobeIcon, Pencil1Icon } from '@radix-ui/react-icons';
import { Flex, Grid } from '@radix-ui/themes';
import { AxiosError } from 'axios';
import { motion } from 'framer-motion';
import Image from 'next/image';
import React, { useState } from 'react';
import { toast } from 'sonner';

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

const Page = () => {
  const encrypted = useAppSelector((s) => s.auth.userEncryptedData);
  const user = encrypted;
  // ? decryptData(encrypted) : null;
  const formattedDOB = new Date(user?.dob?.iso ?? '')
    .toISOString()
    .split('T')[0];
  const [formData, setFormData] = useState({
    ...initialForm,
    ...user?.user,
    dob: formattedDOB,
  });
  const authUser = getAuthUser();
  const { fullDate } = formatDateTime(
    authUser.createdAt ?? new Date().toISOString(),
  );

  const [isEditing, setIsEditing] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  const { loginUser } = useAuth();

  const onChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const target = e.target as HTMLInputElement | HTMLSelectElement;
    const { name, value } = target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const updateUser = async () => {
    setIsUpdating(true);

    await userApi
      .updateUser({
        firstName: formData.firstName,
        lastName: formData.lastName,
        dob: formData.dob,
        gender: formData.gender,
        country: formData.country,
        facebook: formData.facebook ?? '',
        instagram: formData.instagram ?? '',
        twitter: formData.twitter ?? '',
        whatsapp: formData.whatsapp ?? '',
        avatar: user?.avatar ?? '',
        promotionalMails: user?.promotionalMails ?? false,
      })
      .then((res) => {
        if (res.status === 200) {
          setIsEditing(false);
          toast.success('Profile updated successfully', {
            position: 'top-center',
          });

          const userData = res.data.result.updatedUser;
          // const encryptedUser = encryptData(userData);

          // ✅ Dispatch to Redux
          loginUser(userData);
        }
      })
      .catch((err: AxiosError) => {
        toast.error(
          (err.response?.data as unknown as { error: string }).error ||
            'Failed to update profile. Please try again later.',
          {
            position: 'top-center',
          },
        );
      })
      .finally(() => {
        setIsUpdating(false);
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
              <div
                // onClick={() => setIsImageModalOpen(true)}
                className="border-primary-400 z-10 h-[80px] w-[80px] cursor-pointer rounded-full  border-2 bg-white/50  backdrop-blur-sm sm:h-[100px] sm:w-[100px]"
              >
                <div className="relative flex h-full w-full items-center justify-center">
                  <Image
                    src={user?.avatar ?? '/assets/images/profile.png'}
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
              </div>

              <Flex justify="between" className="mt-4 w-full">
                <div className="flex flex-col gap-2">
                  <p
                    // onClick={() => setIsImageModalOpen(true)}
                    className=" text-primary-500 cursor-pointer font-medium"
                  >
                    Change Image
                  </p>
                  <p className=" font-semibold capitalize">
                    {user?.firstName} {user?.lastName}
                  </p>
                  <p className=" font-light">{user?.email}</p>
                  <p className=" block text-xs font-light sm:hidden">
                    Joined {user?.createdAt ? fullDate : 'N/A'}
                  </p>
                </div>

                <div className="flex flex-col items-end justify-between">
                  {!isEditing && (
                    <div
                      onClick={() => setIsEditing(!isEditing)}
                      className=" text-primary-500 flex cursor-pointer items-center text-xs underline sm:text-sm "
                    >
                      Edit Profile
                      <Pencil1Icon className="h-4 w-4" />
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
                <CustomSelect
                  label="Gender"
                  name="gender"
                  value={formData.gender}
                  options={genders}
                  onChange={onChange}
                  disabledOption="Select your gender"
                  icon={<ArrowDownIcon className="text-[#A6ABC4]" />}
                  disabled={!isEditing}
                />
                <CustomTextField
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
                />

                <CustomSelect
                  label="Country"
                  name="gender"
                  value={formData.gender}
                  options={[{ label: 'Nigeria', value: 'nigeria' }]}
                  onChange={onChange}
                  disabled={!isEditing}
                  disabledOption="Select your country"
                  icon={<GlobeIcon className="h-6 w-6 text-[#A6ABC4]" />}
                />
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
