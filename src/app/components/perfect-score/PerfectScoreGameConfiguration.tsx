'use client';

import React from 'react';

import { Button } from '../ui/button';

interface GameConfigurationProps {
  onConfigure: () => void;
}

const PerfectScoreGameConfiguration: React.FC<GameConfigurationProps> = ({
  onConfigure,
}) => {
  return (
    <div
      className="border-1 flex transform items-center justify-between rounded-2xl border-[#17478B] bg-white px-8 py-10 shadow-lg transition-all duration-300 hover:scale-[1.01] hover:shadow-2xl"
      style={{
        boxShadow:
          '0 4px 6px -1px rgba(59, 130, 246, 0.1), 0 2px 4px -1px rgba(59, 130, 246, 0.06)',
      }}
    >
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Spin Configuration</h1>
        <p className="text-sm text-gray-500">
          Setup game preferences settings & rewards
        </p>
      </div>
      <Button
        onClick={onConfigure}
        className="bg-primary-800 rounded-sm px-6 py-3 text-sm font-semibold text-white hover:bg-blue-700"
      >
        Configure game
      </Button>
    </div>
  );
};

export default PerfectScoreGameConfiguration;
