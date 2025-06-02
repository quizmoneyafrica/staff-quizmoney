/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { liveQueryClient } from "@/app/api/parse/parseClient";
import { useAppDispatch } from "@/app/hooks/useAuth";
import Parse from "parse";
import { useCallback, useEffect } from "react";
import LeaderboardAPI from "../leaderboardApi";
import {
  setAllTimeLeaderboard,
  setLastGameLeaderboard,
} from "@/app/store/leaderboardSlice";

function LeaderboardQueries() {
  const dispatch = useAppDispatch();

  const getLastGameLeaderboard = useCallback(async () => {
    const res = await LeaderboardAPI.getLastGameLeaderboard();
    const rankings = res.data.result.rankings.map((data: any) => ({
      position: data.position,
      prize: data.prize,
      totalCorrect: data?.totalCorrect,
      totalTime: data?.totalTime,
      ...data.user,
    }));
    const payload = { leaderboard: rankings };
    dispatch(setLastGameLeaderboard(payload));
  }, [dispatch]);
  const getAllTimeLeaderboard = useCallback(async () => {
    const res = await LeaderboardAPI.getAllTimeLeaderboard(1);
    dispatch(
      setAllTimeLeaderboard({
        page: 1,
        data: res.data.result,
      })
    );
  }, [dispatch]);

  useEffect(() => {
    let leaderboardSubscription: any;

    const leaderboardLiveQuery = async () => {
      const query = new Parse.Query("Leaderboard");
      leaderboardSubscription = await liveQueryClient.subscribe(query);

      leaderboardSubscription?.on("create", () => {
        getLastGameLeaderboard();
        getAllTimeLeaderboard();
      });
      leaderboardSubscription?.on("update", () => {
        getLastGameLeaderboard();
        getAllTimeLeaderboard();
      });
    };

    leaderboardLiveQuery();
    return () => {
      if (leaderboardSubscription) leaderboardSubscription.unsubscribe();
    };
  }, [dispatch, getAllTimeLeaderboard, getLastGameLeaderboard]);
  return null;
}

export default LeaderboardQueries;
