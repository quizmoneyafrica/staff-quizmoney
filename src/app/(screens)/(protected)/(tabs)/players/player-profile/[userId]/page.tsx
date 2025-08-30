'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import BackButton from '@/app/icons/BackButton';
import PlayerProfile from '@/app/components/player-profile/PlayerProfile';
import SocialSection from '@/app/components/player-profile/SocialSection';
import RankSection from '@/app/components/player-profile/RankSection';
import PlayerTransactionHistory from '@/app/components/player-profile/PlayerTransactionHistory';
import { usePlayerProfile } from '@/app/hooks/usePlayerProfile';
import BankSection from '@/app/components/player-profile/BankSection';
import KYCDocumentSection from '@/app/components/player-profile/KYCDocumentSection';
import ActionButtons from '@/app/components/player-profile/ActionButtons';
import VerifyUserToggle from '@/app/components/player-profile/VerifyUserToggle';
import FlagUserModal from '@/app/components/player-profile/FlagUserModal';
import PlayerApi from '@/app/api/PlayerProfileApi';
import { toast } from 'sonner';
import GameHistoryPage from '@/app/(screens)/(protected)/(tabs)/players/player-profile/[userId]/game-history/[game-id]/page';

export default function Page() {
  const params = useParams();
  const userId = params.userId as string;

  const {
    data: playerData,
    isLoading,
    isError,
    refetch,
  } = usePlayerProfile(userId);

  const [kycVerified, setKycVerified] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  const [isBlacklisted, setIsBlacklisted] = useState(false);
  const [isFlagModalOpen, setIsFlagModalOpen] = useState(false);

  const handleOpenFlagModal = () => setIsFlagModalOpen(true);
  const handleCloseFlagModal = () => setIsFlagModalOpen(false);

  useEffect(() => {
    if (playerData?.userDetails) {
      setKycVerified(playerData.userDetails.kycVerified || false);
      setIsBlacklisted(playerData.userDetails.blacklisted || false);
    }
  }, [playerData]);

  const handleToggleVerification = async (newStatus: boolean) => {
    setIsUpdating(true);
    try {
      await PlayerApi.updatePlayerVerification({
        userId,
        kycVerified: newStatus,
      });
      setKycVerified(newStatus);
      toast.success(
        `User has been ${newStatus ? 'KYC verified' : 'KYC unverified'}`,
      );

      refetch();
    } catch (err) {
      console.error(err);
      toast.error('Failed to update KYC verification status.');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleFlagUser = async () => {
    try {
      const newFlagStatus = !isBlacklisted;
      await PlayerApi.flagPlayer({
        userId,
        flag: newFlagStatus,
      });
      setIsBlacklisted(newFlagStatus);
      toast.success(`User has been ${newFlagStatus ? 'flagged' : 'unflagged'}`);

      refetch();
    } catch (err) {
      console.error(err);
      toast.error('Failed to update flag status.');
      throw err;
    }
  };

  if (isLoading) {
    return (
      <div className="flex w-full flex-col gap-6 py-6">
        <div className="flex items-center justify-between">
          <BackButton />
        </div>
        <div className="flex items-center justify-center py-12">
          <p className="text-gray-500">Loading player data...</p>
        </div>
      </div>
    );
  }

  if (isError || !playerData) {
    return (
      <div className="flex w-full flex-col gap-6 py-6">
        <div className="flex items-center justify-between">
          <BackButton />
        </div>
        <div className="flex items-center justify-center py-12">
          <p className="text-red-600">Failed to load player data.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex w-full flex-col gap-6 py-6">
      <div className="flex items-center justify-between">
        <BackButton />
        <VerifyUserToggle
          isEnabled={kycVerified}
          onToggle={handleToggleVerification}
          isUpdating={isUpdating}
        />
      </div>

      <PlayerProfile
        playerData={{
          ...playerData,
          userDetails: {
            ...playerData.userDetails,
            kycVerified,
            blacklisted: isBlacklisted,
          },
        }}
        userId={userId}
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="space-y-6">
          <SocialSection userId={userId} socialData={playerData.socials} />
          <BankSection bankDetails={playerData?.bankAccounts} />
        </div>
        <div className="space-y-6">
          <KYCDocumentSection />
          <RankSection userId={userId} gameStats={playerData.gameStats} />

          <ActionButtons
            onFlagClick={handleOpenFlagModal}
            isBlacklisted={isBlacklisted}
            userId={userId}
          />
        </div>
      </div>

      <PlayerTransactionHistory
        transactionData={playerData.transactions}
        userId={userId}
      />
      <GameHistoryPage />

      {isFlagModalOpen && (
        <FlagUserModal
          onClose={handleCloseFlagModal}
          onFlag={handleFlagUser}
          isBlacklisted={isBlacklisted}
        />
      )}
    </div>
  );
}
