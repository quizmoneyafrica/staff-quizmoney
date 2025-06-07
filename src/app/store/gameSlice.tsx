/* eslint-disable @typescript-eslint/no-explicit-any */
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface Game {
  objectId: string;
  name: string;
  startDate: StartDate;
  completed: boolean;
  entryFee: string;
  gamePrize: number;
  numOfShare: number;
  winners: string[];
  users: string[];
  userTimes: any[];
  videoAds: {
    name: string;
    url: string;
  };
  createdAt: string;
  updatedAt: string;
}
interface StartDate {
  iso: string;
}
interface GameState {
  currentGame: Game | null;
}

const initialState: GameState = {
  currentGame: null,
};

const gameSlice = createSlice({
  name: 'game',
  initialState,
  reducers: {
    setCurrentGame: (state, action: PayloadAction<Game>) => {
      state.currentGame = action.payload;
    },
    clearCurrentGame: (state) => {
      state.currentGame = null;
    },
  },
});

export const { setCurrentGame, clearCurrentGame } = gameSlice.actions;

export default gameSlice.reducer;
