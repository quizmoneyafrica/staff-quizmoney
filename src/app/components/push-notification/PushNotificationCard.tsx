'use client';
import React from 'react';
import { motion } from 'framer-motion';
import CustomImage from '../CustomImage';
import { Skeleton } from '@radix-ui/themes';

interface Stat {
  title: string;
  value: string;
  icon: React.ReactNode;
  iconBg: string;
}

interface StatCardProps {
  stat: Stat;
}

const LoadingStatCard: React.FC = () => {
  const cardVariants = {
    hidden: {
      opacity: 0,
      y: 20,
      scale: 0.95,
    },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.5,
        ease: [0.4, 0, 0.2, 1],
      },
    },
  };

  return (
    <motion.div
      className="relative w-full overflow-hidden rounded-xl bg-[#E4F1FA] px-6 py-14 md:w-1/2"
      variants={cardVariants}
      initial="hidden"
      animate="visible"
    >
      <div className="relative z-10 flex items-start justify-between">
        <div className="flex flex-1 items-center gap-5">
          <Skeleton className="h-12 w-12 rounded-lg" />
          <div className="flex flex-col gap-3">
            <Skeleton className="h-6 w-32 rounded" />
            <Skeleton className="h-8 w-24 rounded" />
          </div>
        </div>
      </div>
    </motion.div>
  );
};

const PushNotificationCard: React.FC = () => {
  // Static notification count - replace with actual API call when available
  const totalNotifications = 24;
  const isLoading = false;

  const stat: Stat = {
    title: 'Total No Notification',
    value: `${totalNotifications}`,
    icon: (
      <CustomImage
        src={'/icons/useruser.svg'}
        className="h-6 w-6"
        alt="user profile"
      />
    ),
    iconBg: 'bg-[#BCDDF4]',
  };

  if (isLoading) {
    return (
      <div className="w-full">
        <LoadingStatCard />
      </div>
    );
  }

  return (
    <div className="w-full">
      <StatCard stat={stat} />
    </div>
  );
};

const StatCard: React.FC<StatCardProps> = ({ stat }) => {
  const cardVariants = {
    hidden: {
      opacity: 0,
      y: 20,
      scale: 0.95,
    },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.5,
        ease: [0.4, 0, 0.2, 1],
      },
    },
    hover: {
      scale: 1.02,
      transition: {
        duration: 0.2,
        ease: 'easeOut',
      },
    },
  };

  const iconVariants = {
    hidden: { scale: 0.8, opacity: 0 },
    visible: {
      scale: 1,
      opacity: 1,
      transition: {
        delay: 0.2,
        duration: 0.3,
      },
    },
  };

  return (
    <motion.div
      className="relative w-full overflow-hidden rounded-xl bg-[#E4F1FA] px-6 py-14 md:w-1/2"
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      whileHover="hover"
    >
      <div className="relative z-10 flex items-start justify-between">
        <div className="flex flex-1 items-center gap-5">
          <motion.div
            className={`${stat.iconBg} flex h-12 w-12 items-center justify-center rounded-lg`}
            variants={iconVariants}
          >
            {stat.icon}
          </motion.div>
          <motion.div
            className="flex flex-col gap-3"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            <h3 className="text-primary-900 text-lg font-medium leading-tight md:text-xl">
              {stat.title}
            </h3>
            <p className="text-primary-900 text-3xl font-bold">{stat.value}</p>
          </motion.div>
        </div>
      </div>

      <motion.div
        className="absolute bottom-0 right-0 mr-8"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.4 }}
      >
        <CustomImage src={'/icons/fillpolo.svg'} alt="" />
      </motion.div>
    </motion.div>
  );
};

export default PushNotificationCard;
