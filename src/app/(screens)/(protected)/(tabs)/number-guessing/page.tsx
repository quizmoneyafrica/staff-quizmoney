'use client';

import React, { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import type {
  UpdateNumberGuessingGamePayload,
  NumberGuessingGame,
} from '@/app/api/game';
import NumberGuessingStatCard from '@/app/components/number-guessing/NumberGuessingStatCard';
import GameConfiguration from '@/app/components/number-guessing/GameConfiguration';
import RecentGamesTable from '@/app/components/number-guessing/RecentGamesTable';
import GameConfigModal from '@/app/components/number-guessing/GameConfigModal';
import TimeRangeDropdown from '@/app/components/common/TimeRangeDropdown';

import GameApi from '@/app/api/game';
import {
  WalletIconBig,
  WalletIconBigGreen,
  WalletIconBigLightCyan,
  WalletCardIconLightBlue,
  WalletCardIconLightCyan,
  WalletCardIconLightGreen,
  SmallRedWallet,
  WalletIconBigRedError,
} from '@/app/icons/icons';

const formatNumber = (num: number) => {
  return num.toLocaleString();
};

const formatNaira = (amount: number) => {
  return `₦${amount.toLocaleString()}.00`;
};

function NumberGuessingPage() {
  const queryClient = useQueryClient();

  const [showTotalEntries, setShowTotalEntries] = useState(false);

  const timeRangeOptions = ['All Time', 'This week', 'Last 30 days', 'Custom'];
  const [selected, setSelected] = useState('All Time');
  const [customDateRange, setCustomDateRange] = useState<{
    startDate: Date;
    endDate: Date;
  } | null>(null);

  const handleTimeRangeSelect = (option: string) => {
    setSelected(option);
    if (option !== 'Custom') setCustomDateRange(null);
  };

  const handleCustomDateChange = (
    dateRange: { startDate: Date; endDate: Date } | null,
  ) => {
    setCustomDateRange(dateRange);
  };

  const [showConfigModal, setShowConfigModal] = useState(false);
  const [configMode, setConfigMode] = useState<'view' | 'edit'>('view');

  const defaultConfig: NumberGuessingGame = {
    gameId: '',
    name: 'Number Guessing',
    description: 'Number Guessing Game',
    type: 'NUMBER_GUESSER',
    config: {
      minimumStake: 100,
      maximumStake: 10000,
    },
  };

  const { data: gameConfig, isLoading: isLoadingConfig } = useQuery<
    NumberGuessingGame,
    Error
  >({
    queryKey: ['numberGuessingGame'],
    queryFn: async (): Promise<NumberGuessingGame> => {
      try {
        const response = await GameApi.getNumberGuessingGame('NUMBER_GUESSER');

        if (response.data?.success && response.data?.data) {
          return response.data.data as NumberGuessingGame;
        }

        return response.data?.data || defaultConfig;
      } catch (error) {
        console.error('Failed to fetch game config:', error);
        return defaultConfig;
      }
    },
    initialData: defaultConfig,
  });

  const { data: statsData, isLoading: isLoadingStats } = useQuery({
    queryKey: ['numberGuessingStats'],
    queryFn: () =>
      GameApi.getGameStats({
        gameType: 'NUMBER_GUESSER',
      }),
    select: (response) => {
      return {
        totalEntries: response?.data?.data?.totalEntry,
        totalRevenue: response?.data?.data?.totalRevenue,
        extraTrialsBought: response?.data?.data?.trialPurchased,
        totalAmountWon: response?.data?.data?.totalAmountWon,
      };
    },
  });

  const handleViewConfiguration = () => {
    setConfigMode('view');
    setShowConfigModal(true);
  };

  const handleConfigSubmit = async (data: {
    costPerTrial: number;
    numberRange: {
      lowerBound: number;
      upperBound: number;
      range: number;
    };
    baseTrial: number;
    maxTrialPurchase: number;
    stakeMultiplier: number;
  }) => {
    try {
      if (!gameConfig?.gameId) {
        throw new Error('Game configuration not loaded');
      }

      const updatePayload: UpdateNumberGuessingGamePayload = {
        type: 'numberGuesser',
        gameId: gameConfig.gameId,
        minimumStake: gameConfig.config?.minimumStake || 0,
        maximumStake: gameConfig.config?.maximumStake || 0,
        upperBound: data.numberRange.upperBound,
        lowerBound: data.numberRange.lowerBound,
        range: data.numberRange.range,
        stakeMultiplier: data.stakeMultiplier,
        numberOfAttempts: data.baseTrial,
        costPerTrial: data.costPerTrial,
        maxTrials: data.maxTrialPurchase,
      };

      await GameApi.updateNumberGuessingGame(updatePayload);
      await queryClient.invalidateQueries({ queryKey: ['numberGuessingGame'] });
      setShowConfigModal(false);
    } catch (error) {
      console.error('Failed to update game configuration:', error);
      throw error;
    }
  };

  const statsValues = statsData || {
    totalEntries: 0,
    totalRevenue: 0,
    extraTrialsBought: 0,
    totalAmountWon: 0,
  };

  const configData = gameConfig
    ? {
        costPerTrial: 100,
        lowerBound: 0,
        upperBound: 5000,
        baseTrial: 3,
        maxTrialPurchase: 2,
        stakeMultiplier: 3,
        minimumStake: gameConfig.config?.minimumStake || 0,
        maximumStake: gameConfig.config?.maximumStake || 0,
      }
    : {
        costPerTrial: 100,
        lowerBound: 0,
        upperBound: 5000,
        baseTrial: 3,
        maxTrialPurchase: 2,
        stakeMultiplier: 3,
        minimumStake: 0,
        maximumStake: 0,
      };

  const numberGuessingStats = [
    {
      title: 'Total entries',
      value: isLoadingStats ? '...' : formatNumber(statsValues.totalEntries),
      bgColor: 'lightBlue',
      icon: <WalletCardIconLightBlue />,
      bgImage: <WalletIconBig />,
      showEye: true,
      isValueVisible: showTotalEntries,
      onEyeToggle: () => setShowTotalEntries(!showTotalEntries),
    },
    {
      title: 'Total Revenue',
      value: isLoadingStats ? '...' : formatNaira(statsValues.totalRevenue),
      bgColor: 'lightCyan',
      icon: <WalletCardIconLightCyan />,
      bgImage: <WalletIconBigLightCyan />,
    },
    {
      title: 'Extra trials bought',
      value: isLoadingStats
        ? '...'
        : formatNaira(statsValues.extraTrialsBought),
      bgColor: 'redError',
      icon: <SmallRedWallet />,
      bgImage: <WalletIconBigRedError />,
    },
    {
      title: 'Total Amount won',
      value: isLoadingStats ? '...' : formatNaira(statsValues.totalAmountWon),
      bgColor: 'lightGreen',
      icon: <WalletCardIconLightGreen />,
      bgImage: <WalletIconBigGreen />,
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold"></h1>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <div className="mb-0.5 text-xs text-gray-500">
              Average time taken
            </div>
            <div className="text-start text-sm font-medium text-blue-600">
              01:01:50 sec
            </div>
          </div>
          <TimeRangeDropdown
            options={timeRangeOptions}
            selected={selected}
            onSelect={handleTimeRangeSelect}
            customDateRange={customDateRange}
            onCustomDateChange={handleCustomDateChange}
          />
        </div>
      </div>
      <div className="grid w-full grid-cols-1 gap-4 md:grid-cols-4 md:gap-6">
        {numberGuessingStats.map((stat) => (
          <NumberGuessingStatCard key={stat.title} {...stat} />
        ))}
      </div>

      <GameConfiguration onViewConfiguration={handleViewConfiguration} />

      <RecentGamesTable />

      {/* Game Configuration Modal */}
      <GameConfigModal
        isOpen={showConfigModal}
        onClose={() => setShowConfigModal(false)}
        onSubmit={handleConfigSubmit}
        mode={configMode}
        initialData={configData}
        loading={isLoadingConfig}
      />
    </div>
  );
}

export default NumberGuessingPage;
