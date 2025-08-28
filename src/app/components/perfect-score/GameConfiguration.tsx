'use client';

import React from 'react';

import { Button } from '../ui/button';

interface GameConfigurationProps {
  onConfigure: () => void;
}

const GameConfiguration: React.FC<GameConfigurationProps> = ({
  onConfigure,
}) => {
  return (
    <div className="flex items-center justify-between rounded-2xl bg-white p-6">
      <div>
        <h2 className="text-lg font-bold text-gray-900">Spin Configuration</h2>
        <p className="text-sm text-gray-500">
          Setup game preferences settings & rewards
        </p>
      </div>
      <Button
        onClick={onConfigure}
        className="rounded-lg bg-blue-600 px-6 py-3 text-sm font-semibold text-white hover:bg-blue-700"
      >
        Configure game
      </Button>
    </div>
  );
};

export default GameConfiguration;
