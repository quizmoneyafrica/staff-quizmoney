'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

import {
  useQuery,
  keepPreviousData,
  useQueryClient,
} from '@tanstack/react-query';
import { Avatar, Table } from '@radix-ui/themes';
import { Search, ListFilter, Loader2, Gamepad2 } from 'lucide-react';

import Pagination from '../leaderboard/Pagination';
import GameApi, { GameResult } from '@/app/api/game';

import TimeRangeDropdown from '@/app/components/common/TimeRangeDropdown';
import { formatDateTime, formatNaira } from '@/app/utils/utils';
import { useDebounce } from '@/app/hooks/useDebounce';
import { VerifiedIcon } from '@/app/icons/icons';

const RecentGamesTable: React.FC = () => {
  const router = useRouter();
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [resultFilter, setResultFilter] = useState<'All' | GameResult>('All');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const queryClient = useQueryClient();

  const [selected, setSelected] = useState('All Time');
  const [customDateRange, setCustomDateRange] = useState(null);

  const debouncedSearchTerm = useDebounce(searchTerm);
  const itemsPerPage = 10;

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: [
      'memoryGameSessions',
      currentPage,
      debouncedSearchTerm,
      resultFilter,
      selected,
      customDateRange,
      itemsPerPage,
    ],
    queryFn: async () => {
      const response = await GameApi.getGameSessions({
        gameType: 'MEMORY_GAME',
        page: currentPage - 1,
        size: itemsPerPage,
        search: debouncedSearchTerm || undefined,
        result: resultFilter === 'All' ? '--' : resultFilter,
      });
      return response.data;
    },
    placeholderData: keepPreviousData,
  });

  const games = data?.data?.content || [];
  const pagination = data?.data;
  const totalCount = pagination?.totalElements || 0;
  const totalPages = pagination?.totalPages || 1;

  const handleFilterSelect = (result: 'All' | GameResult) => {
    setResultFilter(result);
    setIsFilterOpen(false);
    setCurrentPage(1);
  };

  interface GameSession {
    id: string;
    gameId?: string;
    result?: string;
    startTime?: string;
    endTime?: string;
    playerName?: string;
    playerEmail?: string;
    movesUsed?: number;
    extraMovesBought?: number;
    totalWinnings?: number;
  }

  const handleViewDetailsClick = (game: GameSession) => {
    router.push(
      `/memory-game/game-history/${game.id}?gameId=${
        game.gameId || game.id
      }&status=${game.result}`,
    );
  };

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) setCurrentPage(page);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const handleTimeRangeSelect = (option: string) => {
    setSelected(option);
    if (option !== 'Custom') setCustomDateRange(null);
  };

  const getResultClass = (result: string) => {
    switch (result?.toLowerCase()) {
      case 'won':
        return 'bg-[#D4F9E4] text-[#006E2D]';
      case 'loss':
        return 'bg-[#FFEDED] text-[#E11C25]';
      case 'in_progress':
        return 'bg-[#FFF6C5] text-[#ED7B2B]';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatResultDisplay = (result: string) => {
    switch (result) {
      case 'IN_PROGRESS':
        return 'In Progress';
      case 'WON':
        return 'Won';
      case 'LOSS':
        return 'Loss';
      default:
        return result;
    }
  };

  if (error) {
    return (
      <div className="py-12 text-center">
        <p className="mb-4 text-red-600">Failed to load games</p>
        <button
          onClick={() => refetch()}
          className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <>
      <div className="overflow-x-auto">
        <div className="mb-4 flex flex-col items-start justify-between gap-4 rounded-md bg-white px-5 py-5 md:flex-row md:items-center">
          <h3 className="text-lg font-semibold text-gray-900">Recent Games</h3>

          <div className="flex w-full items-center gap-4 md:w-auto">
            <div className="relative flex-1 md:w-80">
              <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 transform text-gray-400" />
              <input
                type="text"
                placeholder="Search by player name, email, or game ID"
                value={searchTerm}
                onChange={handleSearchChange}
                className="focus:ring-primary-900 w-full rounded-md border border-[#D9D9D9] py-2 pl-10 pr-4 outline-none focus:ring-0"
              />
            </div>

            <div className="relative">
              <button
                className="flex cursor-pointer items-center gap-1 rounded-md border border-[#D9D9D9] px-4 py-2 outline-none"
                onClick={() => setIsFilterOpen(!isFilterOpen)}
              >
                <ListFilter className="size-5 text-[#1B212D]" />
                <span className="hidden md:block">Filter by</span>
              </button>
              {isFilterOpen && (
                <div className="absolute right-0 z-10 mt-2 w-48 rounded-md border bg-white shadow-lg">
                  <div className="py-1">
                    <div className="px-4 py-2 text-xs font-semibold uppercase text-gray-500">
                      Result
                    </div>
                    {['All', 'WON', 'LOSS', 'IN_PROGRESS'].map((result) => (
                      <button
                        key={result}
                        onClick={() =>
                          handleFilterSelect(result as 'All' | GameResult)
                        }
                        className={`w-full px-4 py-2 text-left text-sm hover:bg-gray-100 ${
                          resultFilter === result ? 'bg-gray-50' : ''
                        }`}
                      >
                        {result === 'All' ? 'All' : formatResultDisplay(result)}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {isLoading && !data ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          </div>
        ) : (
          <Table.Root
            variant="ghost"
            className="min-h-[600px] min-w-full text-sm"
          >
            <Table.Header className="">
              <Table.Row>
                <Table.Cell className="px-4 py-2 text-left font-medium text-gray-600">
                  Game ID
                </Table.Cell>
                <Table.Cell className="px-4 py-2 text-left font-medium text-gray-600">
                  Users
                </Table.Cell>
                <Table.Cell className="px-4 py-2 text-left font-medium text-gray-600">
                  Moves Used
                </Table.Cell>
                <Table.Cell className="px-4 py-2 text-left font-medium text-gray-600">
                  Extra Moves
                </Table.Cell>
                <Table.Cell className="px-4 py-2 text-left font-medium text-gray-600">
                  Result
                </Table.Cell>
                <Table.Cell className="px-4 py-2 text-left font-medium text-gray-600">
                  Amount won
                </Table.Cell>
                <Table.Cell className="px-4 py-2 text-left font-medium text-gray-600">
                  Action
                </Table.Cell>
              </Table.Row>
            </Table.Header>
            <Table.Body className="bg-white">
              {games.length > 0 ? (
                games.map((game: GameSession) => {
                  const gameDate =
                    game.startTime || game.endTime || new Date().toISOString();
                  const { time, fullDate } = formatDateTime(gameDate);
                  const fullName = `${game.playerName || 'Unknown'}`.trim();
                  const gameDisplayId = game.gameId || game.id;

                  return (
                    <Table.Row
                      key={game.id}
                      className="cursor-pointer transition-colors hover:bg-gray-50"
                      onClick={() => handleViewDetailsClick(game)}
                    >
                      <Table.Cell className="whitespace-nowrap px-4 py-4">
                        <div className="flex items-center gap-2">
                          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-neutral-50">
                            <Gamepad2 className="h-6 w-6 text-gray-500" />
                          </div>
                          <div>
                            <p className="font-bold uppercase text-neutral-800">
                              {gameDisplayId}
                            </p>
                            <p className="text-xs text-neutral-500">
                              {fullDate} • {time}
                            </p>
                          </div>
                        </div>
                      </Table.Cell>

                      <Table.Cell className="px-4 py-4">
                        <div className="flex items-center gap-2">
                          <div className="relative">
                            <Avatar
                              fallback={fullName.charAt(0).toUpperCase() || 'U'}
                              radius="full"
                              size="3"
                            />
                          </div>
                          <div>
                            <div className="flex items-center">
                              <p className="font-medium">{fullName}</p>

                              <VerifiedIcon size={14} className="ml-0.5" />
                            </div>
                            <p className="text-xs text-gray-500">
                              {game.playerEmail || 'No email'}
                            </p>
                          </div>
                        </div>
                      </Table.Cell>

                      <Table.Cell className="px-4 py-4 font-medium">
                        {game.movesUsed || '-'}
                      </Table.Cell>

                      <Table.Cell className="px-4 py-4">
                        {game.extraMovesBought || 0}
                      </Table.Cell>

                      <Table.Cell className="px-4 py-4">
                        <span
                          className={`font-heading w-fit rounded-full px-4 py-2 text-center text-sm font-medium ${getResultClass(
                            game.result,
                          )}`}
                        >
                          {formatResultDisplay(game.result)}
                        </span>
                      </Table.Cell>

                      <Table.Cell className="px-4 py-4 font-semibold">
                        {formatNaira(game.totalWinnings || 0)}
                      </Table.Cell>

                      <Table.Cell className="px-4 py-4">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleViewDetailsClick(game);
                          }}
                          className="text-sm font-medium text-blue-600 transition-colors hover:text-blue-800"
                        >
                          View Details
                        </button>
                      </Table.Cell>
                    </Table.Row>
                  );
                })
              ) : (
                <Table.Row>
                  <Table.Cell
                    colSpan={7}
                    className="py-12 text-center font-bold text-gray-500"
                  >
                    No Games Found
                  </Table.Cell>
                </Table.Row>
              )}
            </Table.Body>
          </Table.Root>
        )}
      </div>

      {pagination && totalCount > 0 && (
        <div className="mt-4 w-full border-t border-gray-200 px-4 py-4 sm:px-6">
          <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
            <div className="text-sm text-gray-500">
              Showing data {(currentPage - 1) * itemsPerPage + 1} to{' '}
              {Math.min(currentPage * itemsPerPage, totalCount)} of{' '}
              {totalCount.toLocaleString()} entries
            </div>
            <div className="w-full md:w-auto">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default RecentGamesTable;
