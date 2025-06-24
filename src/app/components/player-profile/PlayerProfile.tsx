import React from 'react';
import PlayerInfoSection from './PlayerInfoSection';
import PlayerGameHistorySection from './PlayerGameHistorySection';
import { PlayerProfileData } from '@/app/api/PlayerProfileApi';

interface PlayerProfileProps {
  playerData: PlayerProfileData;
  userId: string;
}

const PlayerProfile: React.FC<PlayerProfileProps> = ({
  playerData,
  userId,
}) => {
  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
      <PlayerInfoSection profileData={playerData.userDetails} />
      <PlayerGameHistorySection userId={userId} />
    </div>
  );
};

export default PlayerProfile;
