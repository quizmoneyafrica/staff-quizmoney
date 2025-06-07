'use client';
import React from 'react';
import CustomImage from '../CustomImage';
import { motion } from 'framer-motion';

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

const profileDetails = [
  { label: 'First name', value: 'Joseph' },
  { label: 'Last name', value: 'Micheal' },
  { label: 'Email Address', value: 'Sample@gmail.com', breakAll: true },
  { label: 'Date of Birth', value: '01 January 2000' },
  { label: 'Gender', value: 'Male' },
  {
    label: 'Country',
    value: 'Nigeria',
    icon: '🇳🇬',
    hasIcon: true,
  },
  { label: 'Referred By', value: 'Null' },
];

export default function PlayerInfoSection() {
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
          <div className="text-right ">
            <div className="text-base font-medium text-gray-800">User ID</div>
            <div className="text-lg font-bold text-gray-900">ID1234567</div>
          </div>

          {/* Avatar */}
          <motion.div
            className="absolute -bottom-12 left-6"
            variants={itemVariants}
          >
            <div className="size-24 rounded-full bg-[#BCDDF4] p-6">
              <CustomImage
                src={'https://github.com/shadcn.png'}
                className="rounded-full"
                alt=""
              />
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
            <div className=" font-semibold text-black">{detail.label}</div>
            <div
              className={`text-sm text-gray-900 sm:text-base ${
                detail.breakAll ? 'break-all' : ''
              } items-center gap-2 sm:flex sm:justify-end`}
            >
              {detail.hasIcon && (
                <span className="text-lg sm:text-xl">{detail.icon}</span>
              )}
              {detail.value}
            </div>
          </motion.div>
        ))}
      </motion.div>
    </motion.div>
  );
}
