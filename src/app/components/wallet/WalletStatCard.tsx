'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { EyeOff } from 'lucide-react'; 
import CustomImage from '../CustomImage';

interface WalletStatCardProps {
  title: string;
  value: string;
  color: 'blue' | 'green'|'default';
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

const WalletStatCard: React.FC<WalletStatCardProps> = ({ title, value, color, showEye }) => {
  const colors = cardColors[color] || cardColors.default;

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className={`rounded-2xl py-8 sm:py-14 px-4 sm:px-6 flex flex-col gap-3 sm:gap-4 min-w-[260px] ${colors.bg} relative overflow-hidden`}
    >
      <div className="flex items-center gap-2 sm:gap-3">
        <motion.div 
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.2 }}
          className={`rounded-xl p-2 sm:p-3 ${colors.iconBg}`}
        >
          <CustomImage src={colors.icon} alt="" className="w-6 h-6 sm:w-8 sm:h-8" />
        </motion.div>
        <div className='flex-col flex gap-1 sm:gap-2'>
          <motion.span 
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.3, delay: 0.3 }}
            className={`font-semibold text-base sm:text-lg ${colors.text}`}
          >
            {title}
          </motion.span>
          <motion.div 
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.3, delay: 0.4 }}
            className="flex items-center gap-1 sm:gap-2"
          >
            <span className={`text-2xl sm:text-3xl font-bold ${colors.value}`}>{value}</span>
            {showEye && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.2, delay: 0.5 }}
              >
                <EyeOff className="w-4 h-4 sm:w-5 sm:h-5 text-[#17478B] opacity-60" />
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
          className=" absolute right-0 pointer-events-none"
        />
      </motion.div>
    </motion.div>
  );
};

export default WalletStatCard;
