'use client';
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import PlayerSocialLinks from './PlayerSocialLinks';
import PlayerApi from '@/app/api/PlayerProfileApi';

interface SocialSectionProps {
  userId: string;
  socialData?: {
    twitter?: string;
    facebook?: string;
    instagram?: string;
  };
}

const SocialSection = ({ userId, socialData }: SocialSectionProps) => {
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

  const socials = socialData || playerProfileData?.socials;
  const userDetails = playerProfileData?.userDetails;

  if (isProfileLoading) {
    return (
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
    );
  }

  if (profileError) {
    return (
      <div className="flex w-full items-center justify-center rounded-xl bg-white p-4 sm:p-6">
        <div className="text-sm text-red-500">Error loading social links</div>
      </div>
    );
  }

  return (
    <PlayerSocialLinks
      socialData={socials}
      userName={userDetails?.firstName || 'Player'}
    />
  );
};

export default SocialSection;
