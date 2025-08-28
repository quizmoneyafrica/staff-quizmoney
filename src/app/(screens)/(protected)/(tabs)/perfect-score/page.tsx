'use client';

import React, { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import type {
  UpdatePerfectScoreGamePayload,
  PerfectScoreGame,
  GameSession,
} from '@/app/api/game';
import TimeRangeDropdown from '@/app/components/common/TimeRangeDropdown';
import GameApi from '@/app/api/game';
import {
  WalletIconBig,
  WalletIconBigGreen,
  WalletIconBigLightCyan,
  WalletCardIconLightBlue,
  WalletCardIconLightCyan,
  WalletCardIconLightGreen,
  WalletIconBigRedError,
  SmallRedWallet,
} from '@/app/icons/icons';

import PerfectScoreStatCard from '@/app/components/perfect-score/PerfectScoreStatCard';
import GameConfiguration from '@/app/components/perfect-score/GameConfiguration';
import RecentGamesTable from '@/app/components/perfect-score/RecentGamesTable';
import GameConfigModal from '@/app/components/perfect-score/GameConfigModal';

const formatNumber = (num: number) => {
  return num.toLocaleString();
};

const formatNaira = (amount: number) => {
  return `₦${amount.toLocaleString()}.00`;
};

const formatDuration = (seconds: number) => {
  if (isNaN(seconds) || seconds < 0) {
    return '00:00';
  }
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  return `${minutes.toString().padStart(2, '0')}:${remainingSeconds
    .toString()
    .padStart(2, '0')}`;
};

function PerfectScorePage() {
  const queryClient = useQueryClient();

  const [showTotalEntries, setShowTotalEntries] = useState(false);
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [configMode, setConfigMode] = useState<'view' | 'edit'>('view');

  const timeRangeOptions = ['All Time', 'This week', 'Last 30 days', 'Custom'];
  const [selected, setSelected] = useState('All Time');
  const [customDateRange, setCustomDateRange] = useState<{
    startDate: Date;
    endDate: Date;
  } | null>(null);

  const defaultConfig: PerfectScoreGame = {
    gameId: '',
    name: 'Perfect Score',
    description: 'Perfect Score Game',
    type: 'PERFECT_SCORE',
    config: {
      costPerSpin: 100,
      maximumSpinPerUser: 10,
      respinFeatureEnabled: true,
    },
  };

  const { data: gameConfig, isLoading: isLoadingConfig } = useQuery<
    PerfectScoreGame,
    Error
  >({
    queryKey: ['perfectScoreGame'],
    queryFn: async () => {
      try {
        const response = await GameApi.getGame<PerfectScoreGame>(
          'PERFECT_SCORE',
        );
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
    queryKey: ['perfectScoreStats', selected, customDateRange],
    queryFn: () =>
      GameApi.getGameSessions({
        gameType: 'PERFECT_SCORE',
        page: 0,
        size: 10,
      }),
    select: (response) => {
      const sessions = response.data.data.content;
      const totalEntries = sessions.length;
      const wonSessions = sessions.filter(
        (session) => session.result === 'WON',
      );
      const totalWon = wonSessions.reduce(
        (sum, session) => sum + (session.totalWinnings || 0),
        0,
      );
      const totalRevenue = sessions.reduce(
        (sum, session) => sum + (session.stake || 0),
        0,
      );
      const totalSpins = sessions.reduce(
        (sum, session) => sum + (session.finalQuestions || 0),
        0,
      ); // Assuming finalQuestions represents spins
      const totalDuration = sessions.reduce(
        (sum, session) => sum + (session.duration || 0),
        0,
      );
      const averageDuration =
        totalEntries > 0 ? totalDuration / totalEntries : 0;

      return {
        totalEntries,
        totalRevenue,
        spinsPurchased: totalSpins,
        totalAmountWon: totalWon,
        averageDuration,
      };
    },
  });

  const handleViewConfiguration = () => {
    setConfigMode('view');
    setShowConfigModal(true);
  };

  const handleConfigSubmit = async (
    data: Omit<UpdatePerfectScoreGamePayload, 'gameId' | 'type'>,
  ) => {
    if (!gameConfig?.gameId) return;

    const payload: UpdatePerfectScoreGamePayload = {
      gameId: gameConfig.gameId,
      type: 'PERFECT_SCORE',
      ...data,
    };

    try {
      await GameApi.updatePerfectScoreGame(payload);
      queryClient.invalidateQueries({ queryKey: ['perfectScoreGame'] });
      setShowConfigModal(false);
    } catch (error) {
      console.error('Failed to update game configuration:', error);
    }
  };

  const handleTimeRangeSelect = (range: string) => {
    setSelected(range);
    if (range !== 'Custom') {
      setCustomDateRange(null);
    }
  };

  const handleCustomDateChange = (dateRange: {
    startDate: Date;
    endDate: Date;
  }) => {
    setCustomDateRange({
      startDate: dateRange.startDate,
      endDate: dateRange.endDate,
    });
  };

  const statsValues = statsData || {
    totalEntries: 0,
    totalRevenue: 0,
    spinsPurchased: 0,
    totalAmountWon: 0,
    averageDuration: 0,
  };

  const configData = gameConfig
    ? {
        costPerSpin: gameConfig.config?.costPerSpin || 100,
        maximumSpinPerUser: gameConfig.config?.maximumSpinPerUser || 10,
        respinFeatureEnabled: gameConfig.config?.respinFeatureEnabled || false,
      }
    : {
        costPerSpin: 100,
        maximumSpinPerUser: 10,
        respinFeatureEnabled: false,
      };

  const perfectScoreStats = [
    {
      title: 'Total entries',
      value: statsValues.totalEntries,
      bgColor: 'lightBlue' as const,
      icon: <WalletCardIconLightBlue />,
      bgImage: <WalletIconBig />,
      isVisible: showTotalEntries,
      onToggleVisibility: () => setShowTotalEntries(!showTotalEntries),
      format: formatNumber,
      isLoading: isLoadingStats,
    },
    {
      title: 'Total Revenue',
      value: statsValues.totalRevenue,
      bgColor: 'lightCyan' as const,
      icon: <WalletCardIconLightCyan />,
      bgImage: <WalletIconBigLightCyan />,
      format: formatNaira,
      isLoading: isLoadingStats,
    },
    {
      title: 'Spins Purchased',
      value: statsValues.spinsPurchased,
      bgColor: 'lightGreen' as const,
      icon: <WalletCardIconLightGreen />,
      bgImage: <WalletIconBigGreen />,
      format: formatNaira,
      isLoading: isLoadingStats,
    },
    {
      title: 'Total Amount won',
      value: statsValues.totalAmountWon,
      bgColor: 'redError' as const,
      icon: <SmallRedWallet />,
      // bgImage: <WalletIconBigGreen />,
      bgImage: <WalletIconBigRedError />,
      format: formatNaira,
      isLoading: isLoadingStats,
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
        {perfectScoreStats.map((stat) => (
          <PerfectScoreStatCard key={stat.title} {...stat} />
        ))}
      </div>

      <GameConfiguration onConfigure={handleViewConfiguration} />

      <RecentGamesTable />

      <GameConfigModal
        isOpen={showConfigModal}
        onClose={() => setShowConfigModal(false)}
        mode={configMode}
        onSubmit={handleConfigSubmit}
        initialData={configData}
        loading={isLoadingConfig}
      />
    </div>
  );
}

export default PerfectScorePage;
