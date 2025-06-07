import React from 'react';
import PlayerInfoSection from './PlayerInfoSection';
import PlayerGameHistorySection from './PlayerGameHistorySection';

const PlayerProfile = () => {
  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
      <PlayerInfoSection />

      <PlayerGameHistorySection />
    </div>
  );
};

export default PlayerProfile;
