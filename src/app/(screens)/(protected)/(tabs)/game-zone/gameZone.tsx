/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import GameApi from '@/app/api/game';
import GameBoxTemplate from '@/app/components/screens/game-zone/GameBoxTemplate';
import { useAppDispatch, useAppSelector } from '@/app/hooks/useAuth';
import { setAdminGames } from '@/app/store/gameSlice';
import CustomButton from '@/app/utils/CustomBtn';
import CustomTextField from '@/app/utils/CustomTextField';
import { useRouter } from 'next/navigation';
import React, { useCallback } from 'react';
import { toast } from 'sonner';
import Pagination from '@/app/components/leaderboard/Pagination';

interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

function GameZone() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { adminGames } = useAppSelector((state) => state.game);
  const [searchQuery, setSearchQuery] = React.useState<string>('');
  const [fetchingData, setFetchingData] = React.useState(false);
  const [currentPage, setCurrentPage] = React.useState(1);
  const [paginationInfo, setPaginationInfo] = React.useState<PaginationInfo>({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    hasNextPage: false,
    hasPrevPage: false,
  });

  const GAMES_PER_PAGE = 9;

  const fetchGames = useCallback(
    async (page = 1, search = '') => {
      try {
        setFetchingData(true);

        const requestBody = {
          page,
          limit: GAMES_PER_PAGE,
          search,
          dateRange: {
            start: '2024-01-01',
            end: new Date().toISOString().split('T')[0],
          },
        };

        const res = await GameApi.getAllGames(requestBody);
        console.log('API result:', res);

        const games = Array.isArray(res.data.result?.data)
          ? res.data.result.data
          : [];

        const pagination = res.data.result?.pagination || {};
        setPaginationInfo({
          currentPage: pagination.currentPage || page,
          totalPages: pagination.totalPages || 1,
          totalItems: pagination.totalItems || games.length,
          hasNextPage: pagination.hasNextPage || false,
          hasPrevPage: pagination.hasPrevPage || false,
        });

        dispatch(setAdminGames(games));
        setCurrentPage(page);
      } catch (error) {
        toast.error('An error occurred loading games, please refresh.');
      } finally {
        setFetchingData(false);
      }
    },
    [dispatch],
  );

  React.useEffect(() => {
    fetchGames(1, '');
  }, [fetchGames]);

  const deleteGame = async (objectId: string) => {
    try {
      await GameApi.deleteGame(objectId);

      const updatedGames = adminGames.filter(
        (game) => game.objectId !== objectId,
      );
      dispatch(setAdminGames(updatedGames));

      setPaginationInfo((prev) => ({
        ...prev,
        totalItems: prev.totalItems - 1,
      }));

      toast.success('Game deleted successfully');
    } catch (error: any) {
      console.error('Error deleting game:', error);
      toast.error('Error deleting game. Please try again.');

      fetchGames(currentPage, searchQuery);
    }
  };

  const handleSearch = useCallback(
    (query: string) => {
      setSearchQuery(query);
      setCurrentPage(1);
      fetchGames(1, query);
    },
    [fetchGames],
  );

  const handlePageChange = useCallback(
    (page: number) => {
      if (
        page !== currentPage &&
        page >= 1 &&
        page <= paginationInfo.totalPages
      ) {
        fetchGames(page, searchQuery);
      }
    },
    [currentPage, paginationInfo.totalPages, searchQuery, fetchGames],
  );

  React.useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchQuery !== '') {
        handleSearch(searchQuery);
      } else if (searchQuery === '') {
        fetchGames(1, '');
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  return (
    <>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex-shrink-0 lg:w-80">
            <CustomTextField
              name="search"
              type="text"
              placeholder="Search games by name, description..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full"
            />
          </div>

          <div className="flex flex-col items-start gap-3 lg:flex-row lg:items-center lg:gap-6">
            <div className="text-center lg:text-right">
              <h2 className=" font-black text-gray-900">All Available Games</h2>
            </div>
            <CustomButton
              size="md"
              onClick={() => router.push('/game-zone/add-new-game')}
              className="whitespace-nowrap px-6 py-2.5 font-semibold shadow-sm transition-all duration-200 hover:shadow-md"
            >
              Create Game
            </CustomButton>
          </div>
        </div>

        {/* Games Grid */}
        {fetchingData ? (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[...Array(9)].map((_, index) => (
              <div
                key={index}
                className="h-[299px] w-full animate-pulse rounded-lg bg-neutral-300 p-4"
              ></div>
            ))}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              {adminGames.length === 0 ? (
                <div className="col-span-full py-12 text-center">
                  <p className="text-lg text-gray-500">
                    {searchQuery
                      ? `No games found for &quot;${searchQuery}&quot;`
                      : 'No games found.'}
                  </p>
                  {searchQuery && (
                    <p className="mt-2 text-sm text-gray-400">
                      Try adjusting your search terms
                    </p>
                  )}
                </div>
              ) : (
                adminGames.map((game, index) => (
                  <GameBoxTemplate
                    key={game.objectId || index}
                    game={game}
                    deleteGame={deleteGame}
                  />
                ))
              )}
            </div>

            <div className="flex flex-col items-start justify-between gap-4 pt-6 lg:flex-row lg:items-center">
              <div className="text-sm text-gray-600">
                Showing {adminGames.length} of {paginationInfo.totalItems} games
                {searchQuery && (
                  <span className="ml-1 font-medium">
                    for &quot;{searchQuery}&quot;
                  </span>
                )}
              </div>

              {/* Pagination Component */}
              {paginationInfo.totalPages > 1 && (
                <Pagination
                  currentPage={paginationInfo.currentPage}
                  totalPages={paginationInfo.totalPages}
                  onPageChange={handlePageChange}
                />
              )}
            </div>
          </>
        )}
      </div>
    </>
  );
}

export default GameZone;
