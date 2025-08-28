import React from 'react';

interface GameConfigurationProps {
  onViewConfiguration?: () => void;
}

const GameConfiguration: React.FunctionComponent<GameConfigurationProps> = ({
  onViewConfiguration,
}) => {
  return (
    <div className="w-full rounded-lg border border-gray-200 bg-white p-6">
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-2">
          <h3 className="text-xl font-semibold text-gray-900">
            Game Configuration
          </h3>
          <p className="text-gray-600">
            Setup game preferences settings & rewards
          </p>
        </div>
        <button
          onClick={onViewConfiguration}
          className="rounded-lg bg-blue-900 px-6 py-3 font-medium text-white transition-colors hover:bg-blue-700"
        >
          Configure game
        </button>
      </div>
    </div>
  );
};

export default GameConfiguration;
