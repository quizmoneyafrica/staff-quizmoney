/* eslint-disable @typescript-eslint/no-explicit-any */

'use client';

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import CustomImage from '../CustomImage';
import * as Dialog from '@radix-ui/react-dialog';
import GameHistoryModal from './GameHistoryModal';
import PlayerApi from '@/app/api/PlayerProfileApi';

type GameHistoryItem = {
  gameId?: string;
  gameName?: string;
  date?: string | { iso: string } | Date;
  score?: number;
  status?: string;
  reward?: number;
  earnings?: number;
  position?: number;
  id?: string;
  [key: string]: string | number | boolean | Date | { iso: string } | undefined;
};

type TransformedGameHistoryItem = {
  id: string;
  date: string | { iso: string };
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
  gameId?: string;
  score?: number;
  earnings?: number;
  position?: number;
};

interface PlayerGameHistorySectionProps {
  userId: string;
}

const ITEMS_PER_PAGE = 5;

export default function PlayerGameHistorySection({
  userId,
}: PlayerGameHistorySectionProps) {
  const [currentPage, setCurrentPage] = useState(1);

  const {
    data: gameStatsData,
    isLoading,
    error,
    isError,
  } = useQuery({
    queryKey: ['playerGameStats', userId, currentPage],
    queryFn: () =>
      PlayerApi.getPlayerGameStats({
        userId,
        page: currentPage,
        limit: ITEMS_PER_PAGE,
      }),
    enabled: !!userId,
  });

  const gameHistoryData = gameStatsData?.data?.result?.gameHistory?.data || [];
  const pagination = gameStatsData?.data?.result?.gameHistory?.pagination;

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

  const formatDateForDisplay = (
    dateValue: string | { iso: string } | Date | undefined,
  ): string => {
    if (!dateValue) return 'N/A';

    try {
      let dateObj: Date;

      if (typeof dateValue === 'string') {
        dateObj = new Date(dateValue);
      } else if (typeof dateValue === 'object' && 'iso' in dateValue) {
        dateObj = new Date(dateValue.iso);
      } else if (dateValue instanceof Date) {
        dateObj = dateValue;
      } else {
        return 'N/A';
      }

      if (isNaN(dateObj.getTime())) {
        return 'N/A';
      }

      return dateObj.toLocaleDateString();
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'N/A';
    }
  };

  const transformGameData = (game: any): TransformedGameHistoryItem => {
    const safeToString = (
      value: string | number | boolean | Date | { iso: string } | undefined,
    ): string => {
      if (value === null || value === undefined) return 'N/A';
      if (typeof value === 'string') return value;
      if (typeof value === 'number') return value.toString();
      if (typeof value === 'boolean') return value.toString();
      if (typeof value === 'object') {
        if (value && 'iso' in value && typeof value.iso === 'string') {
          return new Date(value.iso).toLocaleDateString();
        }
        if (value instanceof Date) {
          return value.toLocaleDateString();
        }
        return JSON.stringify(value);
      }
      return String(value);
    };

    const rewardAmount = game.reward || game.earnings || 0;

    return {
      id: safeToString(game.gameId || game.id || 'N/A'),
      date: game.date || 'N/A',
      reward: {
        type: 'money',
        value: `₦${Number(rewardAmount).toLocaleString()}`,
      },
      correctScore: Number(game.score) || 0,
      incorrectScore: 0,
      totalTime: '00:00 minutes',
      status: safeToString(game.status || 'Unknown'),
      gameName: safeToString(game.gameName || 'Unknown Game'),
      gameId: game.gameId,
      score: game.score,
      earnings: game.earnings,
      position: game.position,
    };
  };

  if (isLoading) {
    return (
      <div
        className="rounded-xl bg-white p-6"
        data-aos="fade-left"
        data-aos-duration="800"
      >
        <h2 className="mb-6 text-2xl font-semibold text-gray-900">
          Game History
        </h2>
        <div className="flex items-center justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></div>
          <span className="ml-2 text-gray-600">Loading game history...</span>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div
        className="rounded-xl bg-white p-6"
        data-aos="fade-left"
        data-aos-duration="800"
      >
        <h2 className="mb-6 text-2xl font-semibold text-gray-900">
          Game History
        </h2>
        <div className="rounded-lg bg-red-50 p-4 text-center">
          <p className="text-red-600">
            Error loading game history: {error?.message}
          </p>
          <button
            onClick={() => window.location.reload()}
            className="mt-2 text-sm text-red-800 underline hover:no-underline"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  if (!gameHistoryData.length) {
    return (
      <div
        className="rounded-xl bg-white p-6"
        data-aos="fade-left"
        data-aos-duration="800"
      >
        <h2 className="mb-6 text-2xl font-semibold text-gray-900">
          Game History
        </h2>
        <div className="rounded-lg bg-gray-50 p-8 text-center">
          <p className="text-gray-600">No game history found.</p>
        </div>
      </div>
    );
  }

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
                        <div className="text-sm font-medium text-gray-900">
                          {transformedGame.id}
                        </div>
                        <div className="text-sm text-gray-500">
                          {formatDateForDisplay(transformedGame.date)}
                        </div>
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
                        <span
                          className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${
                            transformedGame.status === 'Won' ||
                            transformedGame.status === 'won'
                              ? 'bg-green-100 text-green-800'
                              : transformedGame.status === 'Loss' ||
                                transformedGame.status === 'lost'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {transformedGame.status}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm font-medium">
                        <Dialog.Root>
                          <Dialog.Trigger asChild>
                            <button className="text-primary-900 cursor-pointer">
                              View
                            </button>
                          </Dialog.Trigger>
                          <GameHistoryModal game={transformedGame as any} />
                        </Dialog.Root>
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
        <>
          <div className="mt-6 flex items-center justify-center">
            <nav
              className="flex items-center space-x-2"
              aria-label="Pagination"
            >
              <button
                onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className={`flex h-10 w-10 items-center justify-center rounded-lg border text-sm font-medium transition-colors ${
                  currentPage === 1
                    ? 'cursor-not-allowed border-gray-200 text-gray-400'
                    : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
              >
                &#8249;
              </button>

              {generatePageNumbers().map((pageNumber) => (
                <button
                  key={pageNumber}
                  onClick={() => handlePageChange(pageNumber)}
                  className={`flex h-10 w-10 items-center justify-center rounded-lg text-sm font-medium transition-colors ${
                    currentPage === pageNumber
                      ? 'bg-blue-900 text-white'
                      : 'border border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {pageNumber}
                </button>
              ))}

              <button
                onClick={() =>
                  handlePageChange(
                    Math.min(pagination.totalPages, currentPage + 1),
                  )
                }
                disabled={currentPage === pagination.totalPages}
                className={`flex h-10 w-10 items-center justify-center rounded-lg border text-sm font-medium transition-colors ${
                  currentPage === pagination.totalPages
                    ? 'cursor-not-allowed border-gray-200 text-gray-400'
                    : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
              >
                &#8250;
              </button>
            </nav>
          </div>

          {/* <div className="mt-4 text-center text-sm text-gray-500">
            Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1} to{' '}
            {Math.min(currentPage * ITEMS_PER_PAGE, pagination.totalCount || 0)}{' '}
            of {pagination.totalCount || 0} entries
          </div> */}
        </>
      )}
    </div>
  );
}
