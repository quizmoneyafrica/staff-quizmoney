import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface DashboardDetailsInterface {
  message: string;
  noOfUsers: number;
  lastGamePlayers: number;
  availableWalletBalance: number;
}

const initialState: DashboardDetailsInterface = {
  message: "",
  noOfUsers: 0,
  lastGamePlayers: 0,
  availableWalletBalance: 0,
};

const dashboardSlice = createSlice({
  name: "dashboard",
  initialState,
  reducers: {
    setDashboardDetails: (
      state,
      action: PayloadAction<DashboardDetailsInterface>
    ) => {
      state.message = action.payload.message;
      state.noOfUsers = action.payload.noOfUsers;
      state.lastGamePlayers = action.payload.lastGamePlayers;
      state.availableWalletBalance = action.payload.availableWalletBalance;
    },
    updateWalletBalance: (state, action: PayloadAction<number>) => {
      state.availableWalletBalance = action.payload;
    },
    updateLastGamePlayers: (state, action: PayloadAction<number>) => {
      state.lastGamePlayers = action.payload;
    },
    updateUserCount: (state, action: PayloadAction<number>) => {
      state.noOfUsers = action.payload;
    },
    clearDashboardDetails: (state) => {
      state.message = "";
      state.noOfUsers = 0;
      state.lastGamePlayers = 0;
      state.availableWalletBalance = 0;
    },
  },
});

export const {
  setDashboardDetails,
  updateWalletBalance,
  updateLastGamePlayers,
  updateUserCount,
  clearDashboardDetails,
} = dashboardSlice.actions;

export default dashboardSlice.reducer;
