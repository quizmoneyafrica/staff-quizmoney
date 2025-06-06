/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import GameApi from "@/app/api/game";
import GameBoxTemplate from "@/app/components/screens/game-zone/GameBoxTemplate";
import { useAppDispatch, useAppSelector } from "@/app/hooks/useAuth";
import { setAdminGames } from "@/app/store/gameSlice";
import CustomButton from "@/app/utils/CustomBtn";
import CustomTextField from "@/app/utils/CustomTextField";
import { useRouter } from "next/navigation";
import React, { useCallback } from "react";
import { toast } from "sonner";

function GameZone() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { adminGames } = useAppSelector((state) => state.game);
  const [searchQuery, setSearchQuery] = React.useState<string>("");
  const [fetchingData, setFetchingData] = React.useState(false);

  const fetchGames = useCallback(async () => {
    try {
      const res = await GameApi.getAllGames();
      console.log(res.data.result);
      dispatch(setAdminGames(res.data.result));
      setFetchingData(false);
    } catch (error: any) {
      console.log(error);
      toast.error("An error occurred loading games, please refresh.");
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
      console.error("Error deleting game:", error);
      toast.error("Error deleting game");
      setFetchingData(false);
    }
  };

  if (fetchingData) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[...Array(6)].map((item, index) => (
          <div
            key={index}
            className={`w-full h-[299px] bg-neutral-300 rounded-lg p-4 animate-pulse`}
          ></div>
        ))}
      </div>
    );
  }
  console.log("Admin Games", adminGames);

  const filteredGames = adminGames.filter((game) =>
    game.name.toLowerCase().includes(searchQuery.toLowerCase())
  );
  return (
    <>
      <div className="space-y-4">
        <div className="flex flex-col gap-3 md:gap-0 md:flex-row md:items-center md:justify-between">
          <div className="lg:w-[80%]">
            <h2 className="font-black">All Available Game</h2>
          </div>
          <div className="flex gap-2 flex-wrap justify-end">
            <CustomTextField
              name="search"
              type="text"
              placeholder="Search games..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <CustomButton
              size="md"
              onClick={() => router.push("/game-zone/add-new-game")}
            >
              Create Game
            </CustomButton>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
