'use client';
import React from 'react';
import CustomImage from '../CustomImage';
import { motion } from 'framer-motion';
import { VerifiedIcon } from '@/app/icons/icons';
import { Flag } from 'lucide-react';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
    },
  },
};

interface ProfileData {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  dateOfBirth?: UnknownObject;
  gender?: string;
  country?: string;
  countryFlag?: string;
  referredBy?: string;
  avatar?: string;
  kycVerified?: boolean;
  blacklisted?: boolean;
}

interface PlayerInfoSectionProps {
  profileData: ProfileData;
}

export default function PlayerInfoSection({
  profileData,
}: PlayerInfoSectionProps) {
  const profileDetails = [
    { label: 'First name', value: profileData.firstName || 'N/A' },
    { label: 'Last name', value: profileData.lastName || 'N/A' },
    {
      label: 'Email Address',
      value: profileData.email || 'N/A',
      breakAll: true,
    },
    {
      label: 'Date of Birth',
      value: profileData.dateOfBirth
        ? new Date(profileData.dateOfBirth?.iso).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })
        : 'N/A',
    },
    { label: 'Gender', value: profileData.gender || 'N/A' },
    {
      label: 'Country',
      value: profileData.country || 'Nigeria',
      // icon: profileData.countryFlag || '🌍',
      hasIcon: true,
    },
    { label: 'Referred By', value: profileData.referredBy || 'N/A' },
  ];

  const avatarUrl = profileData.avatar || 'https://github.com/shadcn.png';

  return (
    <motion.div
      className="rounded-xl bg-white"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      <div className="overflow-hidden rounded-xl bg-white">
        <motion.div
          className="relative flex items-center justify-between rounded-t-xl bg-[#E4F1FA] px-8 pb-16 pt-8"
          variants={itemVariants}
        >
          <h2 className="text-2xl font-bold text-black">Profile Details</h2>
          <div className="text-right">
            <div className="text-base font-medium text-gray-800">User ID</div>
            <div className="text-lg font-bold text-gray-900">
              {profileData.id}
            </div>
          </div>

          {/* Avatar */}
          <motion.div
            className="absolute -bottom-12 left-6"
            variants={itemVariants}
          >
            <div className="size-24 relative rounded-full bg-[#BCDDF4] p-6">
              <CustomImage
                src={avatarUrl}
                className="rounded-full"
                alt={`${profileData.firstName} ${profileData.lastName}`}
              />
              {profileData.kycVerified && (
                <div className="absolute -right-3 top-0 rounded-full p-1">
                  <VerifiedIcon />
                </div>
              )}
              {profileData.blacklisted && (
                <div className="absolute -right-3 bottom-0 rounded-full bg-red-500 p-1">
                  <Flag className="h-3 w-3 text-white" fill="currentColor" />
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>

        <div className="h-20" />
      </div>

      <motion.div
        className="w-full space-y-4 px-4 pb-6 sm:space-y-6 sm:px-8"
        variants={containerVariants}
      >
        {profileDetails.map((detail) => (
          <motion.div
            key={detail.label}
            variants={itemVariants}
            className="grid grid-cols-1 gap-2 sm:grid-cols-2 sm:gap-4"
          >
            <div className="font-semibold text-black">{detail.label}</div>
            <div
              className={`text-sm text-gray-900 sm:text-base ${
                detail.breakAll ? 'break-all' : ''
              } items-center gap-2 sm:flex sm:justify-end`}
            >
              {/* {detail.hasIcon && (
                <span className="text-lg sm:text-xl">{detail.icon}</span>
              )} */}
              {detail.value}
            </div>
          </motion.div>
        ))}
      </motion.div>
    </motion.div>
  );
}
