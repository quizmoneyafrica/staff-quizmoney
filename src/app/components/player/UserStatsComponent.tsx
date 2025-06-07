'use client';
import React from 'react';
import { motion } from 'framer-motion';
import CustomImage from '../CustomImage';
import { useSelector } from 'react-redux';
import { selectPlayers } from '@/app/store/playersSlice';
import { Skeleton } from '@radix-ui/themes';

interface Stat {
  title: string;
  value: string;
  icon: React.ReactNode;
  iconBg: string;
}

interface StatCardProps {
  stat: Stat;
  index: number;
}

const LoadingStatCard: React.FC<{ index: number }> = ({ index }) => {
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
        delay: index * 0.1,
      },
    },
  };

  return (
    <motion.div
      className="relative overflow-hidden rounded-xl bg-[#E4F1FA] px-6 py-14"
      variants={cardVariants}
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

const UserStatsComponent: React.FC = () => {
  const { playersData, isLoading: isStatLoading } = useSelector(selectPlayers);
  const { totalActiveUsers, totalInactiveUsers, totalNoOfUsers } =
    playersData ?? {};
  const stats: Stat[] = [
    {
      title: 'Total No of Users',
      value: `${totalNoOfUsers ?? 0}`,
      icon: (
        <CustomImage
          src={'/icons/useruser.svg'}
          className="h-6 w-6"
          alt="user profile"
        />
      ),
      iconBg: 'bg-[#BCDDF4]',
    },
    {
      title: 'Total active Users',
      value: `${totalActiveUsers ?? 0}`,
      icon: (
        <CustomImage
          src={'/icons/useruser.svg'}
          className="h-6 w-6"
          alt="user profile"
        />
      ),

      iconBg: 'bg-[#BCDDF4]',
    },
    {
      title: 'Total No of inactive Users',
      value: `${totalInactiveUsers ?? 0}`,
      icon: (
        <CustomImage
          src={'/icons/useruser.svg'}
          className="h-6 w-6"
          alt="user profile"
        />
      ),

      iconBg: 'bg-[#BCDDF4]',
    },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.1,
      },
    },
  };

  if (isStatLoading) {
    return (
      <motion.div
        className="w-full"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <motion.div
          className="hidden gap-6 md:grid md:grid-cols-3"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {[0, 1, 2].map((index) => (
            <LoadingStatCard key={index} index={index} />
          ))}
        </motion.div>

        <motion.div
          className="space-y-4 md:hidden"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {[0, 1, 2].map((index) => (
            <LoadingStatCard key={index} index={index} />
          ))}
        </motion.div>
      </motion.div>
    );
  }

  return (
    <motion.div
      className="w-full"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <motion.div
        className="hidden gap-6 md:grid md:grid-cols-3"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {stats.map((stat: Stat, index: number) => (
          <StatCard key={index} stat={stat} index={index} />
        ))}
      </motion.div>

      <motion.div
        className="space-y-4 md:hidden"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {stats.map((stat: Stat, index: number) => (
          <StatCard key={index} stat={stat} index={index} />
        ))}
      </motion.div>
    </motion.div>
  );
};

const StatCard: React.FC<StatCardProps> = ({ stat, index }) => {
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
        delay: index * 0.1,
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
        delay: 0.2 + index * 0.1,
        duration: 0.3,
      },
    },
  };

  return (
    <motion.div
      className={`relative overflow-hidden rounded-xl bg-[#E4F1FA] px-6 py-14`}
      variants={cardVariants}
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
            transition={{ delay: 0.3 + index * 0.1 }}
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
        transition={{ delay: 0.4 + index * 0.1 }}
      >
        <CustomImage src={'/icons/fillpolo.svg'} alt="" />
      </motion.div>
    </motion.div>
  );
};

export default UserStatsComponent;
