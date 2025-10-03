import React from 'react';

import InfoCard from './InfoCard';
import { GameInfo } from './types';
import { GraphBar, DateIcon, ClockIcon, PlayerWallet } from '@/app/icons/icons';
import { Wallet } from 'lucide-react';
import { formatNairaValue } from '@/app/utils/utils';

interface GameInfoSectionProps {
  gameInfo: GameInfo;
}

const GameInfoSection: React.FC<GameInfoSectionProps> = ({ gameInfo }) => {
  return (
    <div className="border-primary-400 mb-8 rounded-[10px] border bg-white p-6">
      <div className="grid grid-cols-2 gap-6 lg:grid-cols-4">
        <div className="">
          <InfoCard
            icon={<GraphBar className="h-5 w-5" />}
            value="Game ID"
            label={gameInfo.id}
            iconBg="#E4F1FA"
          />
        </div>
        <InfoCard
          icon={<DateIcon className="h-5 w-5" />}
          value={gameInfo.date}
          label={gameInfo.time}
        />
        <InfoCard
          icon={<ClockIcon className="h-5 w-5" />}
          value={gameInfo.playTime}
          label="Play Time"
        />
        <InfoCard
          icon={<Wallet className="text-primary-900 h-5 w-5" />}
          value={formatNairaValue(gameInfo.totalEarned)}
          label="Total Earned"
        />
      </div>
    </div>
  );
};

export default GameInfoSection;
