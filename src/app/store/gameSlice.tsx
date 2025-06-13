/* eslint-disable @typescript-eslint/no-explicit-any */
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface StartDate {
  iso: string;
}

export interface Game {
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
  music: {
    name: string;
    url: string;
  };
  createdAt: string;
  updatedAt: string;
  questions: QuestionState[] | [];
  gameDescription?: string;
}

export interface QuestionState {
  number: string;
  question: string;
  options: string[];
  correctAnswer: string;
}
interface GameState {
  currentGame: Game | null;
  adminGames: Game[];
  createGame: Game;
}
export const initialGame: Game = {
  objectId: '',
  name: '',
  startDate: { iso: '' },
  completed: false,
  entryFee: '200',
  gamePrize: 1000000,
  numOfShare: 20,
  winners: [],
  users: [],
  userTimes: [],
  videoAds: { name: '', url: '' },
  music: { name: '', url: '' },
  createdAt: '',
  updatedAt: '',
  questions: [],
};

const initialState: GameState = {
  currentGame: null,
  adminGames: [],
  createGame: initialGame,
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
    setAdminGames: (state, action: PayloadAction<Game[]>) => {
      state.adminGames = action.payload;
    },
    clearAdminGames: (state) => {
      state.adminGames = [];
    },
    setCreateGame: (state, action: PayloadAction<Game>) => {
      state.createGame = action.payload;
    },
    setCreateGameField: (
      state,
      action: PayloadAction<{ field: keyof Game; value: any }>,
    ) => {
      const { field, value } = action.payload;
      state.createGame = {
        ...state.createGame,
        [field]: value,
      };
    },
    addCreatedGame: (state, action: PayloadAction<Game>) => {
      state.adminGames.unshift(action.payload);
    },
    clearCreateGame: (state) => {
      state.createGame = initialGame;
    },
  },
});

export const {
  setCurrentGame,
  clearCurrentGame,
  setAdminGames,
  clearAdminGames,
  setCreateGame,
  setCreateGameField,
  addCreatedGame,
  clearCreateGame,
} = gameSlice.actions;

export default gameSlice.reducer;
