import React from 'react';
import GameStatus from './GameStatus';

interface GameHeaderProps {
  title?: string;
  status: string;
  statusColor?: string;
}

const GameHeader: React.FC<GameHeaderProps> = ({
  title = 'Game History',
  status,
  statusColor,
}) => {
  return (
    <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between">
      <h1 className="mb-4 text-2xl font-bold leading-5 text-black sm:mb-0">
        {title}
      </h1>
      <GameStatus status={status} statusColor={statusColor} />
    </div>
  );
};

export default GameHeader;
