'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import {
  PerfectScoreGame,
  UpdatePerfectScoreGamePayload,
  GameType,
  ApiSuccessResponse,
} from '@/app/api/game';
import PerfectScoreGameConfiguration from '@/app/components/perfect-score/PerfectScoreGameConfiguration';
import PerfectScoreRecentGamesTable from '@/app/components/perfect-score/PerfectScoreRecentGamesTable';
import PerfectScoreGameConfigModal from '@/app/components/perfect-score/PerfectScoreGameConfigModal';
import PerfectScoreStatCard from '@/app/components/perfect-score/PerfectScoreStatCard';
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

const defaultConfig: PerfectScoreGame = {
  gameId: '',
  name: 'Perfect Score',
  description: 'Perfect Score Game',
  type: 'PERFECT_SCORE' as GameType,
  config: {
    subType: 'PERFECT_SCORE',
    minimumStake: 1000,
    maximumStake: 1000000,
    maxRespin: 3,
    defaultSpin: 0,
    enableSpin: false,
    spinAmount: 1000,
    stakeMultiplier: 3,
    weightProbabilities: [],
  },
};

interface StatsData {
  totalEntries: number;
  totalRevenue: number;
  extraTrialsBought: number;
  spinsPurchased: number;
  totalAmountWon: number;
  averageDuration: number;
}

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

const timeRangeOptions = ['24h', '7days', '30days', 'custom'];

function PerfectScorePage() {
  const queryClient = useQueryClient();
  const router = useRouter();
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [configMode, setConfigMode] = useState<'view' | 'edit'>('view');
  const [selected, setSelected] = useState('7days');
  const [customDateRange, setCustomDateRange] = useState<{
    startDate: Date | null;
    endDate: Date | null;
  }>({ startDate: null, endDate: null });

  const [showTotalEntries, setShowTotalEntries] = useState(true);
  const [configData, setConfigData] = useState<{
    minimumStake: number;
    maximumStake: number;
    maxRespin: number;
    defaultSpin: number;
    enableSpin: boolean;
    spinAmount: number;
    stakeMultiplier: number;
    gameId: string;
    weightProbabilities: Array<{
      id: string;
      chance: number;
      questions: number;
      weight:
        | 'FIVE'
        | 'TEN'
        | 'TWENTY'
        | 'FIFTY'
        | 'HUNDRED'
        | 'RESPIN'
        | 'SEVEN';
      status: 'ACTIVE' | 'INACTIVE';
    }>;
  }>({
    minimumStake: 1000,
    maximumStake: 1000000,
    maxRespin: 3,
    defaultSpin: 0,
    enableSpin: false,
    spinAmount: 1000,
    stakeMultiplier: 3,
    gameId: 'default',
    weightProbabilities: [
      {
        id: '1',
        chance: 10,
        questions: 5,
        weight: 'FIVE',
        status: 'ACTIVE',
      },
    ],
  });

  const {
    data: gameData,
    isLoading: isLoadingConfig,
    error,
    refetch,
  } = useQuery<PerfectScoreGame>({
    queryKey: ['perfectScoreGame'],
    queryFn: async () => {
      const response = await GameApi.getGame<PerfectScoreGame>('PERFECT_SCORE');
      const data = response.data.data;

      if (data) {
        setConfigData({
          minimumStake: data.config?.minimumStake || 1000,
          maximumStake: data.config?.maximumStake || 1000000,
          maxRespin: data.config?.maxRespin || 3,
          defaultSpin: data.config?.defaultSpin || 0,
          enableSpin: data.config?.enableSpin || false,
          spinAmount: data.config?.spinAmount || 1000,
          stakeMultiplier: data.config?.stakeMultiplier || 3,
          gameId: data.gameId || 'default',
          weightProbabilities: data.config?.weightProbabilities?.map((wp) => ({
            ...wp,
            weight: wp.weight as
              | 'FIVE'
              | 'TEN'
              | 'TWENTY'
              | 'FIFTY'
              | 'HUNDRED',
            status: wp.status as 'ACTIVE' | 'INACTIVE',
          })) || [
            {
              id: '1',
              chance: 10,
              questions: 5,
              weight: 'FIVE',
              status: 'ACTIVE' as const,
            },
          ],
        });
      }

      return data;
    },
  });

  const fetchGameData = useCallback(async () => {
    await refetch();
  }, [refetch]);

  const handleUpdateConfig = async (
    data: Omit<UpdatePerfectScoreGamePayload, 'gameId' | 'type'>,
  ) => {
    try {
      const payload: UpdatePerfectScoreGamePayload = {
        ...data,
        type: 'PerfectScoreConfigRequest',
        gameId: configData.gameId || '',
        weightProbabilities: data.weightProbabilities.map((wp) => ({
          ...wp,
          weight: wp.weight as
            | 'FIVE'
            | 'TEN'
            | 'TWENTY'
            | 'FIFTY'
            | 'HUNDRED'
            | 'RESPIN'
            | 'SEVEN',
          status: wp.status as 'ACTIVE' | 'INACTIVE',
          chance: Number(wp.chance),
          questions: Number(wp.questions),
        })),
      };

      const response = await GameApi.updatePerfectScoreGame(payload);

      if (response.data?.success) {
        await refetch();

        setShowConfigModal(false);
      }
    } catch (error) {}
  };
  const handleViewConfiguration = () => {
    router.push('/perfect-score/stake-settings');
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

  const handleTimeRangeSelect = (range: string) => {
    setSelected(range);
  };

  const handleConfigSubmit = async (
    formData: Omit<UpdatePerfectScoreGamePayload, 'gameId' | 'type'>,
  ) => {
    try {
      const payload: UpdatePerfectScoreGamePayload = {
        ...formData,
        type: 'PerfectScoreConfigRequest' as const,
        gameId: gameData?.gameId || '',
        minimumStake: Number(formData.minimumStake),
        maximumStake: Number(formData.maximumStake),
        maxRespin: Number(formData.maxRespin),
        defaultSpin: Number(formData.defaultSpin),
        spinAmount: Number(formData.spinAmount),
        stakeMultiplier: Number(formData.stakeMultiplier),
        weightProbabilities: formData.weightProbabilities.map((wp) => ({
          ...wp,
          chance: Number(wp.chance),
          questions: Number(wp.questions),
          weight: wp.weight as
            | 'FIVE'
            | 'TEN'
            | 'TWENTY'
            | 'FIFTY'
            | 'HUNDRED'
            | 'RESPIN'
            | 'SEVEN',
          status: wp.status as 'ACTIVE' | 'INACTIVE',
        })),
      };

      await handleUpdateConfig(payload);
    } catch (error) {}
  };

  const { data: statsData, isLoading: isLoadingStats } = useQuery({
    queryKey: ['perfectScoreStats'],
    queryFn: () =>
      GameApi.getGameStats({
        gameType: 'PERFECT_SCORE',
      }),
    select: (response) => {
      if (response.data?.success) {
        return {
          totalEntries: response.data.data?.totalEntry || 0,
          totalRevenue: response.data.data?.totalRevenue || 0,

          spinsPurchased: response.data.data?.trialPurchased || 0,
          totalAmountWon: response.data.data?.totalAmountWon || 0,
          averageDuration: 0,
        };
      }
      return {
        totalEntries: 0,
        totalRevenue: 0,
        spinsPurchased: 0,
        totalAmountWon: 0,
        averageDuration: 0,
      };
    },
  });

  const statsValues = statsData || {
    totalEntries: 0,
    totalRevenue: 0,
    extraTrialsBought: 0,
    spinsPurchased: 0,
    totalAmountWon: 0,
    averageDuration: 0,
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
      bgColor: 'redError' as const,
      icon: <SmallRedWallet />,
      bgImage: <WalletIconBigRedError />,
      format: formatNumber,
      isLoading: isLoadingStats,
    },
    {
      title: 'Total Amount Won',
      value: statsValues.totalAmountWon,
      bgColor: 'lightGreen' as const,
      icon: <WalletCardIconLightGreen />,
      bgImage: <WalletIconBigGreen />,
      format: formatNaira,
      isLoading: isLoadingStats,
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Perfect Score</h1>
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

      <PerfectScoreGameConfiguration onConfigure={handleViewConfiguration} />

      <PerfectScoreRecentGamesTable />

      <PerfectScoreGameConfigModal
        isOpen={showConfigModal}
        onClose={() => setShowConfigModal(false)}
        mode={configMode}
        onSubmit={handleConfigSubmit}
        initialData={configData}
        gameData={gameData}
        fetchGameData={fetchGameData}
        loading={isLoadingConfig}
      />
    </div>
  );
}

export default PerfectScorePage;
