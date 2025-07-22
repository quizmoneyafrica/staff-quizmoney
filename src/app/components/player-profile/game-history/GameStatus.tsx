import React from 'react';

interface GameStatusProps {
  status: string;
  statusColor?: string;
}

const GameStatus: React.FC<GameStatusProps> = ({
  status,
  statusColor = '#009028',
}) => {
  let bgColor = '#E7FEED';
  let textColor = statusColor;
  switch (status.toLowerCase()) {
    case 'won':
      bgColor = '#E7FEED';
      textColor = '#009028';
      break;
    case 'lost':
    case 'loss':
      bgColor = '#FFE7E7';
      textColor = '#E02424';
      break;
    case 'pending':
      bgColor = '#FFF6C5';
      textColor = '#ED7B2B';
      break;
    default:
      bgColor = '#E7FEED';
      textColor = statusColor;
  }

  return (
    <div className="flex items-center space-x-1">
      <span className="text-sm font-medium leading-5 text-black">
        Game Status:
      </span>
      <span
        className="flex h-[28px] min-w-[68px] items-center justify-center rounded-[24px] px-[18px] py-[8px] text-sm font-medium capitalize leading-5"
        style={{ backgroundColor: bgColor, color: textColor }}
      >
        {status}
      </span>
    </div>
  );
};

export default GameStatus;
