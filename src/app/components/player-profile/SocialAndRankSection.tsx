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
    isLoading: isProfileLoading,
    error: profileError,
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
    enabled: !!userId && !socialData,
  });

  const {
    data: gameStatsData,
    isLoading: isStatsLoading,
    error: statsError,
  } = useQuery({
    queryKey: ['playerGameStats', userId],
    queryFn: async () => {
      const response = await PlayerApi.getPlayerGameStats({
        userId,
        page: 1,
        limit: 10,
      });
      return response.data.result;
    },
    enabled: !!userId && !gameStats,
  });

  const socials = socialData || playerProfileData?.socials;
  const stats = gameStats || gameStatsData?.gameStats;
  const userDetails = playerProfileData?.userDetails;

  const isLoading = isProfileLoading || isStatsLoading;
  const error = profileError || statsError;

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
        playerRank={1} // will determine this leaderboard logic
      />
    </div>
  );
};

export default SocialAndRankSection;
