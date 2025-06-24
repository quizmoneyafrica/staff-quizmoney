'use client';
import React from 'react';
import { motion } from 'framer-motion';
import CustomImage from '../CustomImage';

interface SocialData {
  twitter?: string;
  facebook?: string;
  instagram?: string;
}

interface PlayerSocialLinksProps {
  socialData?: SocialData;
  userName?: string;
}

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

export default function PlayerSocialLinks({
  socialData,
  userName = 'Player',
}: PlayerSocialLinksProps) {
  const socials = [
    {
      label: 'Facebook',
      icon: '/icons/face.svg',
      handle: socialData?.facebook || 'Not connected',
      connected: !!socialData?.facebook,
    },
    {
      label: 'Instagram',
      icon: '/icons/insta.svg',
      handle: socialData?.instagram || 'Not connected',
      connected: !!socialData?.instagram,
    },
    {
      label: 'Twitter',
      icon: '/icons/x.svg',
      handle: socialData?.twitter || 'Not connected',
      connected: !!socialData?.twitter,
    },
  ];

  return (
    <motion.div
      className="w-full rounded-xl bg-white p-4 sm:p-6"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      <motion.h2
        className="mb-3 text-base font-semibold text-black sm:mb-4 sm:text-lg"
        variants={itemVariants}
      >
        Socials
      </motion.h2>

      <div className="space-y-3 sm:space-y-4">
        {socials.map((social) => {
          return (
            <motion.div
              key={social.label}
              className="flex flex-wrap items-center justify-between gap-2"
              variants={itemVariants}
            >
              <div className="flex items-center gap-2 text-black sm:gap-3">
                <CustomImage
                  alt={social.label}
                  src={social.icon}
                  className="h-4 w-4 sm:h-5 sm:w-5"
                />
                <span className="text-xs font-medium sm:text-sm">
                  {social.label}
                </span>
              </div>
              <span
                className={`text-xs sm:text-sm ${
                  social.connected ? 'text-gray-700' : 'italic text-gray-400'
                }`}
              >
                {social.handle}
              </span>
            </motion.div>
          );
        })}
      </div>

      {!socialData?.facebook &&
        !socialData?.instagram &&
        !socialData?.twitter && (
          <motion.div
            className="mt-4 text-center text-xs text-gray-500 sm:text-sm"
            variants={itemVariants}
          >
            No social media accounts connected
          </motion.div>
        )}
    </motion.div>
  );
}
