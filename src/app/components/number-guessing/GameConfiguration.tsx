import React from 'react';
import { Clock } from 'lucide-react';

interface GameConfigurationProps {
  onViewConfiguration?: () => void;
  averageTime?: string;
}

const GameConfiguration: React.FunctionComponent<GameConfigurationProps> = ({
  onViewConfiguration,
  averageTime = '01:01:50',
}) => {
  return (
    <div className="w-full rounded-lg border border-gray-200 bg-white p-6">
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-2">
          <h3 className="text-xl font-semibold text-gray-900">
            Game Configuration
          </h3>
          <div className="flex w-full items-center justify-between">
            <div></div>
            <p className="text-center text-gray-600">
              Setup game preferences settings & rewards
            </p>
            <div className="ml-40 text-right">
              <div className="mb-0.5 text-xs text-gray-500">
                Average time taken
              </div>
              <div className="text-start text-sm font-medium text-blue-600">
                {averageTime} sec
              </div>
            </div>
          </div>
        </div>
        <button
          onClick={onViewConfiguration}
          className="rounded-lg bg-blue-900 px-6 py-3 font-medium text-white transition-colors hover:bg-blue-700"
        >
          View game Configuration
        </button>
      </div>
    </div>
  );
};

export default GameConfiguration;
