/* eslint-disable @typescript-eslint/no-explicit-any */

'use client';

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import CustomImage from '../CustomImage';
import * as Dialog from '@radix-ui/react-dialog';

import PlayerApi, {
  GameApi,
  type GameZoneHistoryItem,
} from '@/app/api/PlayerProfileApi';
import { formatNaira } from '@/app/utils/utils';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import GameHistoryHeader from './GameHistoryHeader';

type GameHistoryItem = {
  gameId: string;
  status: string;
  fee: number;
  duration: number;
  startTime: string;
  endTime: string;
  description: string;
  prize: number;
  coinPrize: number;
  name: string;
  numberOfQuestions: number;
  currentQuestionOrder: number;
  prizeBetween: number;
  coinPrizeBetween: number;
  customerId: string;
  gameType: string;
  reward: number;
  rewardType: string;
  gameResultStatus: 'WON' | 'LOSS' | 'DRAW' | 'PENDING';
  customerGameLobbyStatus: string;
};

type TransformedGameHistoryItem = {
  id: string;
  date: string;
  reward: {
    type: 'money' | 'item';
    value: string;
    itemCount?: number;
  };
  correctScore: number;
  incorrectScore: number;
  totalTime: string;
  status: string;
  gameName: string;
  gameId: string;
  score: number;
  earnings: number;
  position: number;
  gameResultStatus: string;
  gameType: string;
  displayGameType: string;
};

interface PlayerGameHistorySectionProps {
  userId: string;
}

const ITEMS_PER_PAGE = 10;

export default function PlayerGameHistorySection({
  userId,
}: PlayerGameHistorySectionProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [activeTab, setActiveTab] = useState<'live' | 'zone'>('live');
  const [gameZoneFilter, setGameZoneFilter] = useState<string>('');

  const router = useRouter();

  const handleViewHistory = (
    gameId: string,
    customerId: string,
    gameType?: string,
    status?: string,
  ) => {
    if (!gameId) {
      console.error('Game ID is required to view history');
      return;
    }

    const params = new URLSearchParams();
    if (status) params.append('status', status);
    params.append('customerId', customerId);

    let basePath = '';
    const normalizedGameType = gameType?.toUpperCase();

    switch (normalizedGameType) {
      case 'NUMBER_GUESSER':
        basePath = '/number-guessing/game-history';
        break;
      case 'MEMORY_GAME':
        basePath = '/memory-game/game-history';
        break;
      case 'PERFECT_SCORE':
        basePath = '/perfect-score/game-history';
        break;
      default:
        console.warn(
          `Unknown game type: ${gameType}, defaulting to number-guessing`,
        );
        basePath = '/number-guessing/game-history';
    }

    router.push(`${basePath}/${gameId}?${params.toString()}`);
  };

  const {
    data: gameHistoryResponse,
    isLoading: isLoadingLiveGames,
    error: liveGamesError,
    isError: isLiveGamesError,
  } = useQuery({
    queryKey: ['playerGameHistory', userId, currentPage],
    queryFn: () =>
      PlayerApi.getPlayerGameHistory(userId, currentPage - 1, ITEMS_PER_PAGE),
    enabled: !!userId && activeTab === 'live',
  });

  const {
    data: gameZoneHistoryResponse,
    isLoading: isLoadingZoneGames,
    error: zoneGamesError,
    isError: isZoneGamesError,
  } = useQuery({
    queryKey: ['playerGameZoneHistory', userId, currentPage, gameZoneFilter],
    queryFn: async () => {
      const gameTypes = [
        'NUMBER_GUESSER',
        'MEMORY_GAME',
        'PERFECT_SCORE',
      ] as const;

      const responses = await Promise.all(
        gameTypes.map((gameType) =>
          GameApi.getGameZoneHistory(
            gameType,
            userId,
            currentPage - 1,
            ITEMS_PER_PAGE,
            gameZoneFilter as 'WON' | 'LOSS' | 'IN_PROGRESS' | undefined,
          ).catch((err) => {
            console.error(`Error fetching ${gameType} history:`, err);
            return { data: { data: { content: [] } } };
          }),
        ),
      );

      const combinedContent = responses.flatMap(
        (response) => response.data?.data?.content || [],
      );

      combinedContent.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      );

      const combinedResponse = {
        data: {
          content: combinedContent,
          pageNo: currentPage - 1,
          pageSize: ITEMS_PER_PAGE,
          totalElements: combinedContent.length,
          totalPages: Math.ceil(combinedContent.length / ITEMS_PER_PAGE),
          last: true,
        },
      };

      console.log('Combined game zone history response:', combinedResponse);
      return combinedResponse;
    },
    enabled: !!userId && activeTab === 'zone',
  });

  React.useEffect(() => {
    if (gameZoneHistoryResponse?.data?.content) {
      console.log('Filtered game zone history:', {
        totalItems: gameZoneHistoryResponse.data.content.length,
        customerId: userId,
        items: gameZoneHistoryResponse.data.content.map((g) => ({
          id: g.id,
          customerId: g.customerId,
          result: g.result,
          amountWon: g.amountWon,
          createdAt: g.createdAt,
        })),
      });
    }
  }, [gameZoneHistoryResponse, userId]);

  const isLoading =
    activeTab === 'live' ? isLoadingLiveGames : isLoadingZoneGames;
  const error = activeTab === 'live' ? liveGamesError : zoneGamesError;
  const isError = activeTab === 'live' ? isLiveGamesError : isZoneGamesError;

  const liveGameHistoryData =
    gameHistoryResponse?.data?.data?.content?.map((game: any) => ({
      ...game,
      status: game.gameResultStatus || 'COMPLETED',
      fee: 0,
      duration: 0,
      startTime: game.startTime || new Date().toISOString(),
      endTime: game.endTime || new Date().toISOString(),
      description: '',
      prize: 0,
      coinPrize: 0,
      name: 'Game',
      numberOfQuestions: 0,
      currentQuestionOrder: 0,
      prizeBetween: 0,
      coinPrizeBetween: 0,
      gameType: 'LIVE',
      reward: 0,
      rewardType: 'NONE',
      customerGameLobbyStatus: 'COMPLETED',
    })) || [];

  const gameZoneHistoryData =
    gameZoneHistoryResponse?.data?.content
      ?.filter((game: GameZoneHistoryItem) => {
        // Client-side filter for the current user
        const isForCurrentUser = !game.customerId || game.customerId === userId;
        if (!isForCurrentUser) {
          console.warn('Filtered out game not belonging to current user:', {
            gameId: game.id,
            gameCustomerId: game.customerId,
            currentUserId: userId,
          });
        }
        return isForCurrentUser;
      })
      .map((game: GameZoneHistoryItem) => {
        const gameType = 'NUMBER_GUESSER';
        const gameName = gameType ? gameType.replace(/_/g, ' ') : 'Game';

        return {
          gameId: game.id || '',
          status: game.result || 'COMPLETED',
          fee: 0,
          duration: 0,
          startTime: game.createdAt || new Date().toISOString(),
          endTime: game.createdAt || new Date().toISOString(),
          description: '',
          prize: game.amountWon || 0,
          coinPrize: 0,
          name: gameName,
          numberOfQuestions: 0,
          currentQuestionOrder: 0,
          prizeBetween: 0,
          coinPrizeBetween: 0,
          customerId: game.customerId || '',
          gameType: 'ZONE',
          reward: game.amountWon || 0,
          rewardType: game.amountWon ? 'MONEY' : 'NONE',
          gameResultStatus: game.result || 'COMPLETED',
          customerGameLobbyStatus: 'COMPLETED',
          zoneGameType: gameName,
        };
      }) || [];

  // Mock data
  // const mockZoneGameTypes = [
  //   'Memory Game',
  //   'Perfect Scores',
  //   'Number Guessing',
  // ];
  // const mockZoneGames = mockZoneGameTypes.map((zoneType, i) => ({
  //   gameId: `zone-${i + 1}-${Math.random().toString(36).substring(7)}`,
  //   customerId: userId,
  //   status: ['WON', 'LOSS', 'DRAW'][i % 3],
  //   gameResultStatus: ['WON', 'LOSS', 'DRAW'][i % 3],
  //   fee: 0,
  //   duration: 0,
  //   startTime: new Date(
  //     Date.now() - (i + 1) * 5 * 24 * 60 * 60 * 1000,
  //   ).toISOString(),
  //   endTime: new Date().toISOString(),
  //   description: '',
  //   prize: i === 0 ? 2500 : 0,
  //   coinPrize: 0,
  //   name: 'Zone Game',
  //   numberOfQuestions: 0,
  //   currentQuestionOrder: 0,
  //   prizeBetween: 0,
  //   coinPrizeBetween: 0,
  //   gameType: 'ZONE',
  //   zoneGameType: zoneType,
  //   reward: 0,
  //   rewardType: 'NONE',
  //   customerGameLobbyStatus: 'COMPLETED',
  // }));

  const gameHistoryData =
    activeTab === 'live' ? liveGameHistoryData : gameZoneHistoryData;

  const pagination = {
    totalPages:
      activeTab === 'live'
        ? gameHistoryResponse?.data?.data?.totalPages || 0
        : gameZoneHistoryResponse?.data?.totalPages || 0,
    totalCount:
      activeTab === 'live'
        ? gameHistoryResponse?.data?.data?.totalElements || 0
        : gameZoneHistoryResponse?.data?.totalElements || 0,
    currentPage: currentPage,
    hasNext:
      activeTab === 'live'
        ? !gameHistoryResponse?.data?.data?.last
        : !gameZoneHistoryResponse?.data?.last,
    hasPrev: currentPage > 1,
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const generatePageNumbers = () => {
    if (!pagination) return [];
    const pages = [];
    for (let i = 1; i <= pagination.totalPages; i++) {
      pages.push(i);
    }
    return pages;
  };

  const formatDateForDisplay = (dateValue: string | Date): string => {
    if (!dateValue) return 'N/A';

    try {
      const date =
        typeof dateValue === 'string' ? new Date(dateValue) : dateValue;

      if (isNaN(date.getTime())) {
        return 'N/A';
      }

      return format(date, 'MMM d, yyyy h:mm a');
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'N/A';
    }
  };

  const formatDuration = (seconds: number): string => {
    if (!seconds) return '00:00';
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds
      .toString()
      .padStart(2, '0')}`;
  };

  const transformGameData = (
    game: GameHistoryItem & { zoneGameType?: string },
  ): TransformedGameHistoryItem => {
    const gameName = 'Game ' + (game.gameId || '').substring(0, 6);
    const startDate = game.startTime ? new Date(game.startTime) : new Date();
    const endDate = game.endTime ? new Date(game.endTime) : new Date();
    const durationInSeconds = Math.floor(
      (endDate.getTime() - startDate.getTime()) / 1000,
    );

    let status = 'Completed';
    let earnings = 0;

    if (game.gameResultStatus === 'WON') {
      status = 'Won';
      earnings = game.prize || 0;
    } else if (game.gameResultStatus === 'LOSS') {
      status = 'Lost';
      earnings = 0;
    } else if (game.gameResultStatus === 'DRAW') {
      status = 'Draw';
      earnings = 0;
    } else if (game.gameResultStatus === 'PENDING') {
      status = 'In Progress';
      earnings = 0;
    }

    const isLiveGame = game.gameType === 'LIVE' || game.gameType === 'QUIZ';
    const displayGameType = isLiveGame
      ? 'Live Game'
      : game.zoneGameType || 'Memory Game';

    return {
      id: game.gameId,
      date: startDate.toISOString(),
      reward: {
        type: 'money',
        value: formatNaira(earnings, true),
      },
      correctScore: 0,
      incorrectScore: 0,
      totalTime: formatDuration(durationInSeconds),
      status: status,
      gameName: gameName,
      gameId: game.gameId,
      score: 0,
      earnings: earnings,
      position: 0,
      gameResultStatus: game.gameResultStatus || 'UNKNOWN',
      gameType: game.gameType,
      displayGameType: displayGameType,
    };
  };

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex flex-col items-center justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></div>
          <span className="mt-2 text-gray-600">Loading game history...</span>
        </div>
      );
    }

    if (isError) {
      return (
        <div className="rounded-lg bg-red-50 p-4 text-center">
          <p className="text-red-600">
            Error loading game history:{' '}
            {error instanceof Error
              ? error.message
              : 'An unknown error occurred'}
          </p>
          <button
            onClick={() => window.location.reload()}
            className="mt-2 text-sm text-red-800 underline hover:no-underline"
          >
            Try again
          </button>
        </div>
      );
    }

    if (!gameHistoryData.length) {
      return (
        <div className="rounded-lg bg-gray-50 p-8 text-center">
          <p className="text-gray-600">No game history found.</p>
        </div>
      );
    }

    return (
      <div className="relative w-full overflow-x-auto rounded-lg">
        <div className="inline-block min-w-full align-middle">
          <div className="overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Game ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Game Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Rewards
                  </th>
                  <th className="whitespace-nowrap px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Game Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {gameHistoryData.map((game, index) => (
                  <tr key={`${game.gameId}-${index}`}>
                    <td className="whitespace-nowrap px-6 py-4">
                      <div className="text-sm text-gray-900">{game.gameId}</div>
                      <div className="text-sm text-gray-500">
                        {new Date(game.startTime).toLocaleString()}
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4">
                      <span className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800">
                        {game.zoneGameType || game.gameType}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                      {game.rewardType === 'MONEY' ? (
                        <span className="font-medium text-green-600">
                          {formatNaira(game.reward || 0)}
                        </span>
                      ) : (
                        <span className="text-gray-500">No reward</span>
                      )}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4">
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          game.gameResultStatus === 'WON'
                            ? 'bg-green-100 text-green-800'
                            : game.gameResultStatus === 'LOSS'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}
                      >
                        {game.gameResultStatus || 'UNKNOWN'}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium">
                      <button
                        onClick={() =>
                          handleViewHistory(
                            game.gameId,
                            game.customerId,
                            game.zoneGameType
                              ?.replace(/\s+/g, '_')
                              .toUpperCase(),
                            game.status,
                          )
                        }
                        className="text-blue-600 hover:text-blue-900"
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div
      className="rounded-xl bg-white p-6"
      data-aos="fade-left"
      data-aos-duration="800"
    >
      <h2
        className="mb-6 text-2xl font-semibold text-gray-900"
        data-aos="fade-up"
        data-aos-delay="100"
      >
        Game History
      </h2>

      <GameHistoryHeader
        activeTab={activeTab}
        onTabChange={(tab) => {
          setActiveTab(tab);

          setCurrentPage(1);
        }}
      />

      <div className="relative w-full overflow-x-auto rounded-lg">
        <div className="inline-block min-w-full align-middle">
          <div className="overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
                    data-aos="fade-up"
                    data-aos-delay="200"
                  >
                    Game ID
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
                    data-aos="fade-up"
                    data-aos-delay="300"
                  >
                    Game Type
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
                    data-aos="fade-up"
                    data-aos-delay="400"
                  >
                    Rewards
                  </th>
                  <th
                    scope="col"
                    className="whitespace-nowrap px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
                    data-aos="fade-up"
                    data-aos-delay="500"
                  >
                    Game Status
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
                    data-aos="fade-up"
                    data-aos-delay="600"
                  >
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white">
                {gameHistoryData.map((game: any, index: number) => {
                  const transformedGame = transformGameData(game);
                  return (
                    <tr
                      key={`${transformedGame.id}-${index}`}
                      data-aos="fade-up"
                      data-aos-delay={700 + index * 100}
                    >
                      <td className="whitespace-nowrap px-6 py-4">
                        <div>
                          <h3 className="text-sm font-medium text-gray-900">
                            {game.gameId}
                          </h3>
                          <p className="text-sm text-gray-500">
                            {formatDateForDisplay(game.startTime)}
                          </p>
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4">
                        <span className="inline-flex rounded-sm bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700">
                          {transformedGame.displayGameType}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4">
                        <span className="text-primary-900 inline-flex rounded-full bg-blue-100 px-2 text-xs font-semibold leading-5">
                          {transformedGame.reward.type === 'money' ? (
                            transformedGame.reward.value
                          ) : (
                            <>
                              <CustomImage
                                src={`/icons/${transformedGame.reward.value}.svg`}
                                alt=""
                              />{' '}
                              x{transformedGame.reward.itemCount}
                            </>
                          )}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4">
                        <div className="flex justify-center">
                          <span
                            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                              transformedGame.gameResultStatus === 'WON'
                                ? 'bg-green-100 text-green-800'
                                : transformedGame.gameResultStatus === 'LOSS'
                                ? 'bg-red-100 text-red-800'
                                : 'bg-yellow-100 text-yellow-800'
                            }`}
                          >
                            {transformedGame.status}
                          </span>
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm font-medium">
                        <button
                          className="bg-primary-900 hover:bg-primary-500 mt-2 w-full cursor-pointer rounded-3xl px-4 py-2 text-sm text-white md:mt-0 md:w-auto"
                          onClick={() =>
                            handleViewHistory(
                              game.gameId,
                              game.customerId,
                              game.zoneGameType
                                ?.replace(/ /g, '_')
                                .toUpperCase(),
                              game.status,
                            )
                          }
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {pagination && pagination.totalPages > 1 && (
        <div className="mt-6 flex flex-col items-center justify-between space-y-4 sm:flex-row sm:space-y-0">
          <div className="flex flex-1 justify-between sm:hidden">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="relative inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
            >
              Previous
            </button>
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === pagination.totalPages}
              className="relative ml-3 inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
            >
              Next
            </button>
          </div>

          <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700">
                Showing{' '}
                <span className="font-medium">
                  {pagination.totalCount === 0
                    ? 0
                    : (currentPage - 1) * ITEMS_PER_PAGE + 1}
                </span>{' '}
                to{' '}
                <span className="font-medium">
                  {Math.min(
                    currentPage * ITEMS_PER_PAGE,
                    pagination.totalCount,
                  )}
                </span>{' '}
                of <span className="font-medium">{pagination.totalCount}</span>{' '}
                results
              </p>
            </div>

            <div>
              <nav
                className="isolate inline-flex -space-x-px rounded-md shadow-sm"
                aria-label="Pagination"
              >
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50"
                >
                  <span className="sr-only">Previous</span>
                  <ChevronLeft />
                </button>

                {Array.from(
                  { length: Math.min(5, pagination.totalPages) },
                  (_, i) => {
                    if (pagination.totalPages <= 5) {
                      const pageNum = i + 1;
                      return (
                        <button
                          key={pageNum}
                          onClick={() => handlePageChange(pageNum)}
                          className={`relative inline-flex items-center px-4 py-2 text-sm font-semibold ${
                            currentPage === pageNum
                              ? 'z-10 bg-blue-600 text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600'
                              : 'text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:outline-offset-0'
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    }

                    if (i === 0) {
                      return (
                        <button
                          key={1}
                          onClick={() => handlePageChange(1)}
                          className={`relative inline-flex items-center px-4 py-2 text-sm font-semibold ${
                            currentPage === 1
                              ? 'z-10 bg-blue-600 text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600'
                              : 'text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:outline-offset-0'
                          }`}
                        >
                          1
                        </button>
                      );
                    }

                    if (i === 4) {
                      return (
                        <button
                          key={pagination.totalPages}
                          onClick={() =>
                            handlePageChange(pagination.totalPages)
                          }
                          className={`relative inline-flex items-center px-4 py-2 text-sm font-semibold ${
                            currentPage === pagination.totalPages
                              ? 'z-10 bg-blue-600 text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600'
                              : 'text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:outline-offset-0'
                          }`}
                        >
                          {pagination.totalPages}
                        </button>
                      );
                    }

                    if (i === 1 && currentPage > 3) {
                      return (
                        <span
                          key="start-ellipsis"
                          className="relative inline-flex items-center px-4 py-2 text-sm font-semibold text-gray-700 ring-1 ring-inset ring-gray-300"
                        >
                          ...
                        </span>
                      );
                    }

                    if (i === 3 && currentPage < pagination.totalPages - 2) {
                      return (
                        <span
                          key="end-ellipsis"
                          className="relative inline-flex items-center px-4 py-2 text-sm font-semibold text-gray-700 ring-1 ring-inset ring-gray-300"
                        >
                          ...
                        </span>
                      );
                    }

                    let pageNum;
                    if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= pagination.totalPages - 2) {
                      pageNum = pagination.totalPages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }

                    return (
                      <button
                        key={pageNum}
                        onClick={() => handlePageChange(pageNum)}
                        className={`relative inline-flex items-center px-4 py-2 text-sm font-semibold ${
                          currentPage === pageNum
                            ? 'z-10 bg-blue-600 text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600'
                            : 'text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:outline-offset-0'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  },
                )}

                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === pagination.totalPages}
                  className="relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50"
                >
                  <span className="sr-only">Next</span>
                  <ChevronRight />
                </button>
              </nav>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
