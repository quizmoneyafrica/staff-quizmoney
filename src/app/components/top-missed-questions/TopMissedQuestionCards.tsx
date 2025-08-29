'use client';
import React, { useEffect, useState } from 'react';
import { motion, Variants } from 'framer-motion';
import { Skeleton } from '@radix-ui/themes';
import { QuestionRateIcon, TotalMissesIcon } from '@/app/icons/icons';

interface Stat {
  title: string;
  value: string;
  icon: React.ReactNode;
  iconBg?: string;
  cardBg: string;
}

interface StatCardProps {
  stat: Stat;
}

interface TopMissedQuestionCardsProps {
  refreshTrigger?: number;
}

const LoadingStatCard: React.FC<{ cardBg: string }> = ({ cardBg }) => {
  const cardVariants: Variants = {
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
        ease: [0.4, 0, 0.2, 1] as const,
      },
    },
  };

  return (
    <motion.div
      className={`relative w-full overflow-hidden rounded-xl ${cardBg} px-6 py-14 md:w-1/2`}
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

const TopMissedQuestionCards: React.FC<TopMissedQuestionCardsProps> = ({
  refreshTrigger = 0,
}) => {
  const [totalMisses, setTotalMisses] = useState<number>(1253);
  const [missedRate, setMissedRate] = useState<number>(42.3);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchMissedQuestionsData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      await new Promise((resolve) => setTimeout(resolve, 1000));
      setTotalMisses(1253);
      setMissedRate(42.3);
    } catch (err) {
      setError('Failed to fetch missed questions data');
      console.error('Error fetching missed questions:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMissedQuestionsData();
  }, []);

  useEffect(() => {
    if (refreshTrigger > 0) {
      fetchMissedQuestionsData();
    }
  }, [refreshTrigger]);

  const stats: Stat[] = [
    {
      title: 'Total Misses',
      value: error ? '0' : `${totalMisses}`,
      icon: <TotalMissesIcon className="h-6 w-6" />,
      iconBg: 'bg-[#AFF0FF]',
      cardBg: 'bg-[#DFF9FF]',
    },
    {
      title: 'Missed questions rate',
      value: error ? '0%' : `${missedRate}%`,
      icon: <QuestionRateIcon className="h-6 w-6" />,
      iconBg: 'bg-[#BCDDF4]',
      cardBg: 'bg-[#E4F1FA]',
    },
  ];

  if (isLoading) {
    return (
      <div className="flex w-full flex-col gap-4 md:flex-row md:gap-6">
        <LoadingStatCard cardBg="bg-[#DFF9FF]" />
        <LoadingStatCard cardBg="bg-[#E4F1FA]" />
      </div>
    );
  }

  return (
    <div className="flex w-full flex-col gap-4 md:flex-row md:gap-6">
      {stats.map((stat, index) => (
        <StatCard key={index} stat={stat} />
      ))}
    </div>
  );
};

const StatCard: React.FC<StatCardProps> = ({ stat }) => {
  const cardVariants: Variants = {
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
        ease: [0.4, 0, 0.2, 1] as const,
      },
    },
    hover: {
      scale: 1.02,
      transition: {
        duration: 0.2,
        ease: [0.4, 0, 0.2, 1] as const,
      },
    },
  };

  const iconVariants: Variants = {
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
      className={`relative w-full overflow-hidden rounded-xl ${stat.cardBg} px-6 py-14 md:w-1/2`}
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
    </motion.div>
  );
};

export default TopMissedQuestionCards;
