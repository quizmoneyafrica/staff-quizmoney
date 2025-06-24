/* eslint-disable @typescript-eslint/no-explicit-any */

'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import BackButton from '@/app/icons/BackButton';
import PlayerProfile from '@/app/components/player-profile/PlayerProfile';
import SocialAndRankSection from '@/app/components/player-profile/SocialAndRankSection';
import PlayerTransactionHistory from '@/app/components/player-profile/PlayerTransactionHistory';
import { usePlayerProfile } from '@/app/hooks/usePlayerProfile';

export default function Page() {
  const params = useParams();
  const userId = params.userId as string;

  const {
    data: playerData,
    isLoading,
    error,
    isError,
    status,
    failureReason,
  } = usePlayerProfile(userId);

  if (isLoading) {
    return (
      <div className="flex w-full max-w-full flex-col gap-6 overflow-x-hidden py-6">
        <BackButton />
        <div className="flex items-center justify-center py-12">
          <p className="text-gray-500">Loading player data...</p>
        </div>
      </div>
    );
  }

  if (isError || !playerData) {
    return (
      <div className="flex w-full max-w-full flex-col gap-6 overflow-x-hidden py-6">
        <BackButton />
        <div className="flex items-center justify-center py-12">
          <p className="text-red-600">Failed to load player data.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex w-full max-w-full flex-col gap-6 overflow-x-hidden py-6">
      <BackButton />

      <PlayerProfile playerData={playerData} userId={userId} />

      <SocialAndRankSection
        userId={userId} // ✅ FIXED: Pass userId as required
        socialData={playerData.socials}
        gameStats={playerData.gameStats}
      />

      <PlayerTransactionHistory
        transactionData={playerData.transactions as any}
        userId={userId}
      />
    </div>
  );
}
