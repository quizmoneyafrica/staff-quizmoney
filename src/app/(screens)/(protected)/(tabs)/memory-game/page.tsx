'use client';

import React, { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import type { UpdateMemoryGamePayload, MemoryGame } from '@/app/api/game';
import MemoryGameStatCard from '../../../../components/memory-game/MemoryGameStatCard';
import GameConfiguration from '../../../../components/memory-game/GameConfiguration';
import RecentGamesTable from '../../../../components/memory-game/RecentGamesTable';
import GameConfigModal from '../../../../components/memory-game/GameConfigModal';
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

const formatDuration = (seconds: number) => {
  if (isNaN(seconds) || seconds < 0) {
    return '00:00:00';
  }
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  return `${minutes.toString().padStart(2, '0')}:${remainingSeconds
    .toString()
    .padStart(2, '0')}`;
};

function MemoryGamePage() {
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

  const defaultConfig: MemoryGame = {
    gameId: '',
    name: 'Memory Game',
    description: 'Memory Game',
    type: 'MEMORY_GAME',
    config: {
      minimumStake: 100,
      maximumStake: 10000,
      baseMoves: 6,
      maxMovePurchase: 2,
      costPerExtraMove: 1000,
      stakeMultiplier: 3,
      numberOfCards: 12,
    },
  };

  const { data: gameConfig, isLoading: isLoadingConfig } = useQuery<
    MemoryGame,
    Error
  >({
    queryKey: ['memoryGame'],
    queryFn: async () => {
      try {
        const response = await GameApi.getGame<MemoryGame>('MEMORY_GAME');
        if (response.data?.success && response.data?.data) {
          return response.data.data;
        }
        return defaultConfig;
      } catch (error) {
        console.error('Failed to fetch game config:', error);
        return defaultConfig;
      }
    },
    initialData: defaultConfig,
  });

  const { data: statsData, isLoading: isLoadingStats } = useQuery({
    queryKey: ['memoryGameStats'],
    queryFn: () =>
      GameApi.getGameSessions({
        gameType: 'MEMORY_GAME',
        page: 0,
        size: 10,
      }),
    select: (response) => {
      const sessions = response.data.data?.content || [];
      const totalEntries = sessions.length;
      const wonSessions = sessions.filter(
        (session) => session.result === 'WON',
      );
      const totalWon = wonSessions.reduce(
        (sum, session) => sum + (session.totalWinnings || 0),
        0,
      );
      const estimatedRevenue = sessions.reduce(
        (sum, session) => sum + (session.stake || 0),
        0,
      );
      const estimatedExtraMoves = sessions.reduce(
        (sum, session) =>
          sum +
          (session.extraMoves || 0) *
            (gameConfig?.config?.costPerExtraMove || 1000),
        0,
      );
      const totalDuration = sessions.reduce(
        (sum, session) => sum + (session.duration || 0),
        0,
      );
      const averageDuration =
        totalEntries > 0 ? totalDuration / totalEntries : 0;

      return {
        totalEntries,
        totalRevenue: estimatedRevenue,
        extraMovesBought: estimatedExtraMoves,
        totalAmountWon: totalWon,
        averageDuration,
      };
    },
  });

  const handleViewConfiguration = () => {
    setConfigMode('view');
    setShowConfigModal(true);
  };

  const handleConfigSubmit = async (data: {
    baseMoves: number;
    maxMovePurchase: number;
    costPerExtraMove: number;
    stakeMultiplier: number;
    numberOfCards: number;
  }) => {
    try {
      if (!gameConfig?.gameId) {
        throw new Error('Game configuration not loaded');
      }

      const updatePayload: UpdateMemoryGamePayload = {
        type: 'memoryGame',
        gameId: gameConfig.gameId,
        minimumStake: gameConfig.config?.minimumStake || 0,
        maximumStake: gameConfig.config?.maximumStake || 0,
        baseMoves: data.baseMoves,
        maxMovePurchase: data.maxMovePurchase,
        costPerExtraMove: data.costPerExtraMove,
        stakeMultiplier: data.stakeMultiplier,
        numberOfCards: data.numberOfCards,
      };

      await GameApi.updateMemoryGame(updatePayload);
      await queryClient.invalidateQueries({ queryKey: ['memoryGame'] });
      setShowConfigModal(false);
    } catch (error) {
      console.error('Failed to update game configuration:', error);
      throw error;
    }
  };

  const statsValues = statsData || {
    totalEntries: 0,
    totalRevenue: 0,
    extraMovesBought: 0,
    totalAmountWon: 0,
    averageDuration: 0,
  };

  const configData = gameConfig
    ? {
        baseMoves: gameConfig.config?.baseMoves || 6,
        maxMovePurchase: gameConfig.config?.maxMovePurchase || 2,
        costPerExtraMove: gameConfig.config?.costPerExtraMove || 1000,
        stakeMultiplier: gameConfig.config?.stakeMultiplier || 3,
        numberOfCards: gameConfig.config?.numberOfCards || 12,
        minimumStake: gameConfig.config?.minimumStake || 0,
        maximumStake: gameConfig.config?.maximumStake || 0,
      }
    : {
        baseMoves: 6,
        maxMovePurchase: 2,
        costPerExtraMove: 1000,
        stakeMultiplier: 3,
        numberOfCards: 12,
        minimumStake: 0,
        maximumStake: 0,
      };

  const memoryGameStats = [
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
      title: 'Extra Moves bought',
      value: isLoadingStats ? '...' : formatNaira(statsValues.extraMovesBought),
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
              {formatDuration(statsValues.averageDuration)} sec
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
        {memoryGameStats.map((stat) => (
          <MemoryGameStatCard key={stat.title} {...stat} />
        ))}
      </div>

      <GameConfiguration onViewConfiguration={handleViewConfiguration} />

      <RecentGamesTable />

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

export default MemoryGamePage;
