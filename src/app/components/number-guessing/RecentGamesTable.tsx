'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, keepPreviousData } from '@tanstack/react-query';
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

  const [selected, setSelected] = useState('All Time');
  const [customDateRange, setCustomDateRange] = useState(null);

  const debouncedSearchTerm = useDebounce(searchTerm);
  const itemsPerPage = 10;

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: [
      'numberGuessingGameSessions',
      currentPage,
      debouncedSearchTerm,
      resultFilter,
      selected,
      customDateRange,
      itemsPerPage,
    ],
    queryFn: async () => {
      const response = await GameApi.getGameSessions({
        gameType: 'NUMBER_GUESSER',
        page: currentPage - 1,
        size: itemsPerPage,
        ...(debouncedSearchTerm && { search: debouncedSearchTerm }),
        ...(resultFilter !== 'All' && { result: resultFilter }),
      });
      return response.data.data;
    },
    placeholderData: keepPreviousData,
  });

  const games = (data?.content || []) as NumberGuessingGameSession[];
  const pagination = data;
  const totalCount = pagination?.totalElements || 0;
  const totalPages = pagination?.totalPages || 1;

  const handleFilterSelect = (result: 'All' | GameResult) => {
    setResultFilter(result);
    setIsFilterOpen(false);
    setCurrentPage(1);
  };

  interface NumberGuessingGameSession {
    id: string;
    name: string;
    email: string;
    hiddenNo: number;
    extraTrials: number;
    result: string;
    customerId: string;
    amountWon: number;
    startTime?: string;
    endTime?: string;
  }

  const handleViewDetailsClick = (game: NumberGuessingGameSession) => {
    router.push(
      `/number-guessing/game-history/${game.id}?gameId=${game.id}&status=${game.result}`,
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
        return 'bg-[#FFF8DB] text-[#A16207]';
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

  const handleViewProfile = (customerId: string) => {
    if (customerId) {
      router.push(`/players/player-profile/${customerId}`);
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
    <div className="overflow-x-auto">
      <div className="mb-4 flex flex-col items-start justify-between gap-4 rounded-md bg-white px-5 py-5 md:flex-row md:items-center">
        <div className="flex items-center gap-4">
          <h2 className="text-lg font-semibold text-gray-900">Recent Games</h2>
        </div>
        <div className="flex w-full flex-col gap-4 md:w-auto md:flex-row md:items-center">
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 transform text-gray-400" />
            <input
              type="text"
              placeholder="Search"
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
        <div className="rounded-md bg-white">
          <Table.Root
            variant="ghost"
            className="min-h-[600px] min-w-full text-sm"
          >
            <Table.Header className="bg-primary-50">
              <Table.Row>
                <Table.Cell className="px-4 py-2 text-left">Game ID</Table.Cell>
                <Table.Cell className="px-4 py-2 text-left">Users</Table.Cell>
                <Table.Cell className="px-4 py-2 text-left">
                  Hidden No
                </Table.Cell>
                <Table.Cell className="px-4 py-2 text-left">
                  Extra Trials
                </Table.Cell>
                <Table.Cell className="px-4 py-2 text-left">Result</Table.Cell>
                <Table.Cell className="px-4 py-2 text-left">
                  Amount won
                </Table.Cell>
                <Table.Cell className="px-4 py-2 text-left">Action</Table.Cell>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {games.length > 0 ? (
                games.map((game: NumberGuessingGameSession) => {
                  const { time, fullDate } = formatDateTime(
                    game.startTime || new Date().toISOString(),
                  );
                  return (
                    <Table.Row
                      key={game.id}
                      className="cursor-pointer transition-colors hover:bg-gray-50"
                    >
                      <Table.Cell className="whitespace-nowrap px-4 py-4">
                        <div className="flex items-center gap-2">
                          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-neutral-50">
                            <Gamepad2 className="h-6 w-6 text-gray-500" />
                          </div>
                          <div>
                            <p className="font-bold uppercase text-neutral-800">
                              {game.id}
                            </p>
                            <p className="text-xs text-neutral-500">
                              {fullDate} • {time}
                            </p>
                          </div>
                        </div>
                      </Table.Cell>

                      <Table.Cell className="px-4 py-4">
                        <div
                          className="flex cursor-pointer items-center gap-2"
                          onClick={() => handleViewProfile(game?.customerId)}
                        >
                          <div className="relative">
                            <Avatar
                              src={''}
                              fallback={game.name?.[0] || 'U'}
                              size="3"
                              radius="full"
                            />
                            {/* <div className="absolute -bottom-1 -right-1">
                              <VerifiedIcon />
                            </div> */}
                          </div>
                          <div>
                            <p className="font-medium capitalize">
                              {game.name || 'Anonymous'}
                            </p>
                            <p className="text-xs text-gray-500">
                              {game.email || ''}
                            </p>
                          </div>
                        </div>
                      </Table.Cell>

                      <Table.Cell className="px-4 py-4 font-semibold">
                        {game.hiddenNo}
                      </Table.Cell>

                      <Table.Cell className="px-4 py-4 font-semibold">
                        {game.extraTrials}
                      </Table.Cell>

                      <Table.Cell className="px-4 py-4">
                        <p
                          className={`font-heading w-fit rounded-full px-4 py-2 text-center capitalize ${getResultClass(
                            game.result || '',
                          )}`}
                        >
                          {formatResultDisplay(game.result || '')}
                        </p>
                      </Table.Cell>

                      <Table.Cell className="px-4 py-4 font-semibold">
                        {game.amountWon ? formatNaira(game.amountWon) : '₦0'}
                      </Table.Cell>

                      <Table.Cell className="px-4 py-4">
                        <button
                          onClick={() => handleViewDetailsClick(game)}
                          className="hover:bg-primary-50 text-primary-900 border-primary-200 cursor-pointer rounded border px-3 py-2 text-sm font-medium transition-colors"
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
                    className="py-12 text-center font-bold"
                  >
                    No game sessions found
                  </Table.Cell>
                </Table.Row>
              )}
            </Table.Body>
          </Table.Root>
        </div>
      )}

      {pagination && totalCount > 0 && (
        <div className="mt-4 flex flex-col items-center gap-4 p-4 md:flex-row md:justify-between">
          <div className="text-sm text-gray-500">
            Showing data {(currentPage - 1) * itemsPerPage + 1} to{' '}
            {Math.min(currentPage * itemsPerPage, totalCount)} of{' '}
            {totalCount.toLocaleString()} entries
          </div>
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        </div>
      )}
    </div>
  );
};

export default RecentGamesTable;
