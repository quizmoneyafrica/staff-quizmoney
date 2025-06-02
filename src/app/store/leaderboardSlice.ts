import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface User {
  userId: string;
  firstName: string;
  lastName: string;
  avatar: string;
  facebook: null | string;
  twitter: null | string;
  instagram: null | string;
  noOfGamesPlayed: number;
}

interface LeaderBoardInterface {
  position: number;
  prize: number;
  totalTime: string;
  totalCorrect: number;
  user: User;
}

interface LeaderBoardState {
  lastGame: LeaderBoardInterface[];
  allTime: LeaderBoardInterface[];
}

const initialState: LeaderBoardState = {
  lastGame: [],
  allTime: [],
};

const leaderboardSlice = createSlice({
  name: "leaderboard",
  initialState,
  reducers: {
    setLastGameLeaderboard: (
      state,
      action: PayloadAction<LeaderBoardInterface[]>
    ) => {
      state.lastGame = action.payload;
    },
    setAllTimeLeaderboard: (
      state,
      action: PayloadAction<LeaderBoardInterface[]>
    ) => {
      state.allTime = action.payload;
    },
    clearLeaderboards: (state) => {
      state.lastGame = [];
      state.allTime = [];
    },
  },
});

export const {
  setLastGameLeaderboard,
  setAllTimeLeaderboard,
  clearLeaderboards,
} = leaderboardSlice.actions;

export default leaderboardSlice.reducer;
