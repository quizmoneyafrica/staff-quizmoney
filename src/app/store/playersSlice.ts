import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from './store';
import { serializeDateRange, isValidDateRange } from '@/app/utils/dateUtils';

export interface Player {
  objectId: string;
  firstName: string;
  lastName?: string;
  email: string;
  accountType: 'user' | 'admin';
  createdAt: {
    __type: 'Date';
    iso: string;
  };
  avatar?: string;
  status: string;
}

type PlayerData = {
  totalNoOfUsers: number;
  totalActiveUsers: number;
  totalInactiveUsers: number;
  data: Player[];
  pagination: {
    currentPage: number;
    limit: number;
    totalPages: number;
    totalItems: number;
  };
};

type StatsData = {
  totalNoOfUsers: number;
  totalActiveUsers: number;
  totalInactiveUsers: number;
};

interface PlayersState {
  playersData: PlayerData | null;
  statsData: StatsData | null;
  isLoading: boolean;
  isStatsLoading: boolean;
  isExporting: boolean;
  currentPage: number;
  itemsPerPage: number;
  searchQuery: string;
  selectedAccountType: string | null;
  dateRange: {
    start: string;
    end: string;
  } | null;
  selectedTimeRange: string;
  customDateRange: {
    start: string;
    end: string;
  } | null;
}

const initialState: PlayersState = {
  playersData: null,
  statsData: null,
  isLoading: false,
  isStatsLoading: false,
  isExporting: false,
  currentPage: 1,
  itemsPerPage: 10,
  searchQuery: '',
  selectedAccountType: null,
  dateRange: null,
  selectedTimeRange: 'All Time',
  customDateRange: null,
};

const playersSlice = createSlice({
  name: 'playersSlice',
  initialState,
  reducers: {
    setPlayersData(state, action: PayloadAction<PlayerData>) {
      state.playersData = action.payload;
      state.currentPage = action.payload.pagination.currentPage;
      state.statsData = {
        totalNoOfUsers: action.payload.totalNoOfUsers,
        totalActiveUsers: action.payload.totalActiveUsers,
        totalInactiveUsers: action.payload.totalInactiveUsers,
      };
    },

    setTableData(state, action: PayloadAction<Player[]>) {
      if (state.playersData) {
        state.playersData.data = action.payload;
      }
    },

    setStatsData(state, action: PayloadAction<StatsData>) {
      state.statsData = action.payload;
    },

    setLoadingPlayers(state, action: PayloadAction<boolean>) {
      state.isLoading = action.payload;
    },

    setStatsLoading(state, action: PayloadAction<boolean>) {
      state.isStatsLoading = action.payload;
    },

    setExportLoading(state, action: PayloadAction<boolean>) {
      state.isExporting = action.payload;
    },

    setCurrentPage(state, action: PayloadAction<number>) {
      state.currentPage = action.payload;
    },

    setSearchQuery(state, action: PayloadAction<string>) {
      state.searchQuery = action.payload;
      state.currentPage = 1;
    },

    setSelectedAccountType(state, action: PayloadAction<string | null>) {
      state.selectedAccountType = action.payload;
      state.currentPage = 1;
    },

    setDateRange(
      state,
      action: PayloadAction<{ start: string; end: string } | null>,
    ) {
      state.dateRange = serializeDateRange(action.payload);
      state.currentPage = 1;
    },

    setSelectedTimeRange(state, action: PayloadAction<string>) {
      state.selectedTimeRange = action.payload;
      state.currentPage = 1;
    },

    setCustomDateRange(
      state,
      action: PayloadAction<{ start: string; end: string } | null>,
    ) {
      if (isValidDateRange(action.payload)) {
        state.customDateRange = serializeDateRange(action.payload);
      } else {
        state.customDateRange = null;
      }
      state.currentPage = 1;
    },

    resetFilters(state) {
      state.searchQuery = '';
      state.selectedAccountType = null;
      state.dateRange = null;
      state.selectedTimeRange = 'All Time';
      state.customDateRange = null;
      state.currentPage = 1;
    },
  },
});

export const {
  setLoadingPlayers,
  setStatsLoading,
  setExportLoading,
  setPlayersData,
  setTableData,
  setStatsData,
  setCurrentPage,
  setSearchQuery,
  setSelectedAccountType,
  setDateRange,
  setSelectedTimeRange,
  setCustomDateRange,
  resetFilters,
} = playersSlice.actions;

export default playersSlice.reducer;
export const selectPlayers = (state: RootState) => state.players;
