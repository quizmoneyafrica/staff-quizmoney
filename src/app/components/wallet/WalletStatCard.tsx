'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { EyeOff } from 'lucide-react';
import CustomImage from '../CustomImage';

interface WalletStatCardProps {
  title: string;
  value: string;
  color: 'blue' | 'green' | 'default';
  showEye?: boolean;
}

const cardColors = {
  default: {
    bg: 'bg-[#DFF9FF]',
    iconBg: 'bg-[#AFF0FF]',
    text: 'text-[#006E7D]',
    value: 'text-[#006E7D]',
    icon: '/icons/w1.svg',
    imgd: '/icons/wa1.svg',
  },
  blue: {
    bg: 'bg-[#E4F1FA]',
    iconBg: 'bg-[#BCDDF4]',
    text: 'text-[#17478B]',
    value: 'text-[#17478B]',
    icon: '/icons/w2.svg',
    imgd: '/icons/wa2.svg',
  },
  green: {
    bg: 'bg-[#E7FEED]',
    iconBg: 'bg-[#C4FBD2]',
    text: 'text-[#009028]',
    value: 'text-[#009028]',
    icon: '/icons/w3.svg',
    imgd: '/icons/wa3.svg',
  },
};

const WalletStatCard: React.FC<WalletStatCardProps> = ({
  title,
  value,
  color,
  showEye,
}) => {
  const colors = cardColors[color] || cardColors.default;

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className={`flex min-w-[260px] flex-col gap-3 rounded-2xl px-4 py-8 sm:gap-4 sm:px-6 sm:py-14 ${colors.bg} relative overflow-hidden`}
    >
      <div className="flex items-center gap-2 sm:gap-3">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.2 }}
          className={`rounded-xl p-2 sm:p-3 ${colors.iconBg}`}
        >
          <CustomImage
            src={colors.icon}
            alt=""
            className="h-6 w-6 sm:h-8 sm:w-8"
          />
        </motion.div>
        <div className="flex flex-col gap-1 sm:gap-2">
          <motion.span
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.3, delay: 0.3 }}
            className={`text-base font-semibold sm:text-lg ${colors.text}`}
          >
            {title}
          </motion.span>
          <motion.div
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.3, delay: 0.4 }}
            className="flex items-center gap-1 sm:gap-2"
          >
            <span className={`text-2xl font-bold sm:text-3xl ${colors.value}`}>
              {value}
            </span>
            {showEye && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.2, delay: 0.5 }}
              >
                <EyeOff className="h-4 w-4 text-[#17478B] opacity-60 sm:h-5 sm:w-5" />
              </motion.div>
            )}
          </motion.div>
        </div>
      </div>

      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 0.1 }}
        transition={{ duration: 0.5, delay: 0.6 }}
      >
        <CustomImage
          src={colors.imgd}
          alt=""
          className=" pointer-events-none absolute right-0"
        />
      </motion.div>
    </motion.div>
  );
};

export default WalletStatCard;
