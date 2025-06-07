import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from './store';

export interface Player {
  objectId: string;
  firstName: string;
  email: string;
  accountType: 'user' | 'admin';
  createdAt: {
    __type: 'Date';
    iso: string;
  };
  status: string;
}
type PlayerData = {
  totalNoOfUsers: number;
  totalActiveUsers: number;
  totalInactiveUsers: number;
  data: Player[];
};
interface PlayersState {
  playersData: PlayerData | null;
  isLoading: boolean;
}
const initialState: PlayersState = {
  playersData: null,
  isLoading: false,
};

const playersSlice = createSlice({
  name: 'playersSlice',
  initialState,
  reducers: {
    setPlayersData(state, action: PayloadAction<PlayerData>) {
      state.playersData = action.payload;
    },
    setLoadingPlayers(state, action: PayloadAction<boolean>) {
      state.isLoading = action.payload;
    },
  },
});

export const { setLoadingPlayers, setPlayersData } = playersSlice.actions;

export default playersSlice.reducer;
export const selectPlayers = (state: RootState) => state.players;
