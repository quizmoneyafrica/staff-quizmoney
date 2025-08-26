'use client';

import GameApi from '@/app/api/game';
import GameBoxTemplate from '@/app/components/screens/game-zone/GameBoxTemplate';
import { useAppDispatch, useAppSelector } from '@/app/hooks/useAuth';
import { setAdminGames, Game } from '@/app/store/gameSlice';
import CustomButton from '@/app/utils/CustomBtn';
import CustomTextField from '@/app/utils/CustomTextField';
import { useRouter } from 'next/navigation';
import React, { useCallback, useMemo } from 'react';
import { toast } from 'sonner';
import Pagination from '@/app/components/leaderboard/Pagination';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useDebounce } from '@/app/hooks/useDebounce';
import { AxiosResponse } from 'axios';
import { ApiResponse } from '@/app/api/interface';

interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

interface PageResponse<T> {
  data: T[];
  pagination: PaginationInfo;
}

interface ApiGame {
  gameId: string;
  status: string;
  fee: number;
  duration: number;
  startTime: string;
  description: string;
  prize: number;
  name: string;
}

function GameZone() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { adminGames } = useAppSelector((state) => state.game);

  const [searchQuery, setSearchQuery] = React.useState<string>('');
  const [currentPage, setCurrentPage] = React.useState(1);

  const GAMES_PER_PAGE = 9;

  const debouncedSearchQuery = useDebounce(searchQuery, 500);

  const transformApiGameToGame = (apiGame: ApiGame): Game => {
    return {
      objectId: apiGame.gameId,
      name: apiGame.name,
      startDate: {
        iso: apiGame.startTime,
      },
      completed: false,
      entryFee: apiGame.fee.toString(),
      gamePrize: apiGame.prize,
      numOfShare: 0,
      winners: [],
      users: [],
      userTimes: [],
      videoAds: { name: '', url: '' },
      music: { name: '', url: '' },
      createdAt: '',
      updatedAt: '',
      questions: [],
      gameDescription: apiGame.description || '',
    };
  };

  const fetchGamesFromAPI = async (
    page: number,
    search: string,
  ): Promise<PageResponse<Game>> => {
    const params = new URLSearchParams();
    params.append('page', (page - 1).toString());
    params.append('size', GAMES_PER_PAGE.toString());
    if (search) {
      params.append('search', search);
    }

    const response = await GameApi.getGamesWithQuery(params.toString());

    const apiData = response.data.data;

    const transformedGames = (apiData.content || []).map(
      transformApiGameToGame,
    );

    return {
      data: transformedGames,
      pagination: {
        currentPage: (apiData.pageNo || 0) + 1,
        totalPages: apiData.totalPages || 1,
        totalItems: apiData.totalElements || 0,
        hasNextPage: !apiData.last,
        hasPrevPage: (apiData.pageNo || 0) > 0,
      },
    };
  };

  const gamesQueryKey = (page: number, search: string) => [
    'games',
    { page, search },
  ];

  const {
    data: gamesData,
    isLoading: fetchingData,
    isError,
    error,
  } = useQuery<PageResponse<Game>, Error>({
    queryKey: gamesQueryKey(currentPage, debouncedSearchQuery),
    queryFn: () => fetchGamesFromAPI(currentPage, debouncedSearchQuery),
  });

  React.useEffect(() => {
    if (gamesData?.data) {
      dispatch(setAdminGames(gamesData.data));
    }
  }, [gamesData?.data, dispatch]);

  const paginationInfo = useMemo(() => {
    return (
      gamesData?.pagination || {
        currentPage: 1,
        totalPages: 1,
        totalItems: 0,
        hasNextPage: false,
        hasPrevPage: false,
      }
    );
  }, [gamesData?.pagination]);

  const deleteGameMutation = useMutation<
    AxiosResponse<ApiResponse>,
    Error,
    string
  >({
    mutationFn: (objectId: string) => GameApi.deleteGameV2(objectId),
    onSuccess: (_, deletedGameId) => {
      queryClient.setQueryData(
        gamesQueryKey(currentPage, debouncedSearchQuery),
        (oldData: PageResponse<Game> | undefined) => {
          if (!oldData) return oldData;

          return {
            ...oldData,
            data: oldData.data.filter(
              (game) => game.objectId !== deletedGameId,
            ),
            pagination: {
              ...oldData.pagination,
              totalItems: oldData.pagination.totalItems - 1,
            },
          };
        },
      );

      const updatedGames = adminGames.filter(
        (game) => game.objectId !== deletedGameId,
      );
      dispatch(setAdminGames(updatedGames));

      toast.success('Game deleted successfully');
    },
    onError: (error: Error) => {
      console.error('Error deleting game:', error);
      toast.error('Error deleting game. Please try again.');
    },
  });

  const deleteGame = async (objectId: string) => {
    deleteGameMutation.mutate(objectId);
  };

  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);
    setCurrentPage(1);
  }, []);

  const handlePageChange = useCallback(
    (page: number) => {
      if (
        page !== currentPage &&
        page >= 1 &&
        page <= paginationInfo.totalPages
      ) {
        setCurrentPage(page);
      }
    },
    [currentPage, paginationInfo.totalPages],
  );

  if (isError) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col items-center justify-center py-12">
          <p className="text-lg text-red-600">Failed to load games</p>
          <p className="mt-2 text-sm text-gray-500">
            {error instanceof Error
              ? error.message
              : 'An unexpected error occurred'}
          </p>
          <button
            onClick={() =>
              queryClient.invalidateQueries({ queryKey: ['games'] })
            }
            className="mt-4 rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

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
              onChange={(e) => handleSearch(e.target.value)}
              className="w-full"
            />
          </div>

          <div className="flex flex-col items-start gap-3 lg:flex-row lg:items-center lg:gap-6">
            <div className="text-center lg:text-right">
              <h2 className="font-black text-gray-900">All Available Games</h2>
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
              />
            ))}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              {!gamesData?.data?.length ? (
                <div className="col-span-full py-12 text-center">
                  <p className="text-lg text-gray-500">
                    {debouncedSearchQuery
                      ? `No games found for &quot;${debouncedSearchQuery}&quot;`
                      : 'No games found.'}
                  </p>
                  {debouncedSearchQuery && (
                    <p className="mt-2 text-sm text-gray-400">
                      Try adjusting your search terms
                    </p>
                  )}
                </div>
              ) : (
                gamesData.data.map((game, index) => (
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
                Showing {gamesData?.data?.length || 0} of{' '}
                {paginationInfo.totalItems} games
                {debouncedSearchQuery && (
                  <span className="ml-1 font-medium">
                    for &quot;{debouncedSearchQuery}&quot;
                  </span>
                )}
              </div>

              <Pagination
                currentPage={paginationInfo.currentPage}
                totalPages={paginationInfo.totalPages}
                onPageChange={handlePageChange}
              />
            </div>
          </>
        )}
      </div>
    </>
  );
}

export default GameZone;
