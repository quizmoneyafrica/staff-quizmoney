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
      const res = await GameApi.getAllGames();
      dispatch(setAdminGames(res.data.result));
      setFetchingData(false);
    } catch (error) {
      toast.error('An error occurred loading games, please refresh.');
      setFetchingData(false);
    }
  }, [dispatch]);

  React.useEffect(() => {
    if (adminGames.length > 0) return;
    fetchGames();
  }, [adminGames.length, fetchGames]);

  const deleteGame = async (objectId: string) => {
    setFetchingData(true);
    try {
      GameApi.deleteGame(objectId);
      fetchGames();
      setFetchingData(false);
    } catch (error: any) {
      console.error('Error deleting game:', error);
      toast.error('Error deleting game');
      setFetchingData(false);
    }
  };

  if (fetchingData) {
    return (
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {[...Array(6)].map((item, index) => (
          <div
            key={index}
            className={`h-[299px] w-full animate-pulse rounded-lg bg-neutral-300 p-4`}
          ></div>
        ))}
      </div>
    );
  }

  const filteredGames = adminGames.filter((game) =>
    game.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );
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
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredGames.map((game, index) => {
            return (
              <GameBoxTemplate
                key={index}
                game={game}
                deleteGame={deleteGame}
              />
            );
          })}
        </div>
      </div>
    </>
  );
}

export default GameZone;
