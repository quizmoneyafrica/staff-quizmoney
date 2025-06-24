// SocialAndRankSection.tsx
'use client';
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import PlayerSocialLinks from './PlayerSocialLinks';
import PlayerRank from './PlayerRank';

import PlayerApi from '@/app/api/PlayerProfileApi';

interface SocialAndRankSectionProps {
  userId: string;
  socialData?: {
    twitter?: string;
    facebook?: string;
    instagram?: string;
  };
  gameStats?: {
    totalGamesPlayed: number;
    gamesWon: number;
    totalRewards: number;
    winRate: string;
  };
}

const SocialAndRankSection = ({
  userId,
  socialData,
  gameStats,
}: SocialAndRankSectionProps) => {
  const {
    data: playerProfileData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['playerProfile', userId],
    queryFn: async () => {
      const response = await PlayerApi.viewPlayerProfile({
        userId,
        gameHistoryPage: 1,
        gameHistoryLimit: 10,
        transactionPage: 1,
        transactionLimit: 10,
      });
      return response.data.result;
    },
    enabled: !!userId && (!socialData || !gameStats),
  });

  const socials = socialData || playerProfileData?.socials;
  const stats = gameStats || playerProfileData?.gameStats;
  const userDetails = playerProfileData?.userDetails;

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        <div className="w-full rounded-xl bg-white p-4 sm:p-6">
          <div className="animate-pulse">
            <div className="mb-4 h-6 rounded bg-gray-200"></div>
            <div className="space-y-3">
              <div className="h-4 rounded bg-gray-200"></div>
              <div className="h-4 rounded bg-gray-200"></div>
              <div className="h-4 rounded bg-gray-200"></div>
            </div>
          </div>
        </div>
        <div className="w-full rounded-xl bg-white p-4 sm:p-6">
          <div className="animate-pulse">
            <div className="mb-4 h-6 rounded bg-gray-200"></div>
            <div className="space-y-3">
              <div className="h-4 rounded bg-gray-200"></div>
              <div className="h-4 rounded bg-gray-200"></div>
              <div className="h-4 rounded bg-gray-200"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        <div className="flex w-full items-center justify-center rounded-xl bg-white p-4 sm:p-6">
          <div className="text-sm text-red-500">Error loading social links</div>
        </div>
        <div className="flex w-full items-center justify-center rounded-xl bg-white p-4 sm:p-6">
          <div className="text-sm text-red-500">Error loading rank data</div>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
      <PlayerSocialLinks
        socialData={socials}
        userName={userDetails?.firstName || 'Player'}
      />
      <PlayerRank
        gameStats={stats}
        userName={userDetails?.firstName || 'Player'}
      />
    </div>
  );
};

export default SocialAndRankSection;
