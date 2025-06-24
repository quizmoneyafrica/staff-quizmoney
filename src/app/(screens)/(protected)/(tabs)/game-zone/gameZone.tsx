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

function GameZone() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { adminGames } = useAppSelector((state) => state.game);
  const [searchQuery, setSearchQuery] = React.useState<string>('');
  const [fetchingData, setFetchingData] = React.useState(false);

  const fetchGames = useCallback(async () => {
    try {
      setFetchingData(true);
      const res = await GameApi.getAllGames();
      console.log('API result:', res);

      const games = Array.isArray(res.data.result?.data)
        ? res.data.result.data
        : [];

      dispatch(setAdminGames(games));
    } catch (error) {
      toast.error('An error occurred loading games, please refresh.');
    } finally {
      setFetchingData(false);
    }
  }, [dispatch]);

  React.useEffect(() => {
    fetchGames();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const deleteGame = async (objectId: string) => {
    setFetchingData(true);
    try {
      await GameApi.deleteGame(objectId);

      const updatedGames = Array.isArray(adminGames)
        ? adminGames.filter((game) => game.objectId !== objectId)
        : [];

      dispatch(setAdminGames(updatedGames));
      toast.success('Game deleted successfully');
    } catch (error: any) {
      console.error('Error deleting game:', error);
      toast.error('Error deleting game. Please try again.');
    } finally {
      setFetchingData(false);
    }
  };

  const filteredGames = Array.isArray(adminGames)
    ? adminGames.filter(
        (game) =>
          typeof game.name === 'string' &&
          game.name.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    : [];

  return (
    <>
      <div className="space-y-4">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between md:gap-0">
          <div className="lg:w-[80%]">
            <h2 className="font-black">All Available Game</h2>
          </div>
          <div className="flex flex-wrap justify-end gap-2">
            <CustomTextField
              name="search"
              type="text"
              placeholder="Search games..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <CustomButton
              size="md"
              onClick={() => router.push('/game-zone/add-new-game')}
            >
              Create Game
            </CustomButton>
          </div>
        </div>

        {fetchingData ? (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, index) => (
              <div
                key={index}
                className="h-[299px] w-full animate-pulse rounded-lg bg-neutral-300 p-4"
              ></div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredGames.length === 0 ? (
              <p className="col-span-full text-gray-500">No games found.</p>
            ) : (
              filteredGames.map((game, index) => (
                <GameBoxTemplate
                  key={index}
                  game={game}
                  deleteGame={deleteGame}
                />
              ))
            )}
          </div>
        )}
      </div>
    </>
  );
}

export default GameZone;
