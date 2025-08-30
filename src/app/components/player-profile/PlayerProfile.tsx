import React from 'react';
import PlayerInfoSection from './PlayerInfoSection';
import PlayerGameHistorySection from './PlayerGameHistorySection';

interface PlayerProfileProps {
  playerData: UnknownObject;
  userId: string;
}

const PlayerProfile: React.FC<PlayerProfileProps> = ({
  playerData,
  userId,
}) => {
  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
      <PlayerInfoSection profileData={playerData} />
      <PlayerGameHistorySection userId={userId} />
    </div>
  );
};

export default PlayerProfile;
