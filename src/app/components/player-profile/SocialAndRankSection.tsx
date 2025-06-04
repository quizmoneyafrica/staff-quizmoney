import React from 'react';
import PlayerSocialLinks from './PlayerSocialLinks';
import PlayerRank from './PlayerRank';

const SocialAndRankSection = () => {
  return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
     <PlayerSocialLinks/>
      <PlayerRank/>
      </div>
  );
};

export default SocialAndRankSection;