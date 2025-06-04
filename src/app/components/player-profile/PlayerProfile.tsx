import React from 'react';
import PlayerInfoSection from './PlayerInfoSection';
import PlayerGameHistorySection from './PlayerGameHistorySection';

const PlayerProfile = () => {
  return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
     <PlayerInfoSection/>

      <PlayerGameHistorySection/>
    </div>
  );
};

export default PlayerProfile;