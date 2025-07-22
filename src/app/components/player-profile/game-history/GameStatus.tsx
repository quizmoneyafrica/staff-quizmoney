import React from 'react';

interface GameStatusProps {
  status: string;
  statusColor?: string;
}

const GameStatus: React.FC<GameStatusProps> = ({
  status,
  statusColor = '#009028',
}) => {
  const bgColor =
    status.toLowerCase() === 'won'
      ? '#E7FEED'
      : status.toLowerCase() === 'lost'
      ? '#FFE7E7'
      : '#E7FEED';

  return (
    <div className="flex items-center space-x-1">
      <span className="text-sm font-medium leading-5 text-black">
        Game Status:
      </span>
      <span
        className="flex h-[28px] w-[68px] items-center justify-center rounded-[24px] px-[18px] py-[8px] text-sm font-medium leading-5"
        style={{ backgroundColor: bgColor, color: statusColor }}
      >
        {status}
      </span>
    </div>
  );
};

export default GameStatus;
