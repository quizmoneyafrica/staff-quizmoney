import axios, { AxiosResponse } from 'axios';
import { BASE_URL, getSessionTokenHeaders } from './userApi';
import { ApiResponse } from './interface';

interface ViewPlayerProfileRequest {
  userId: string;
  gameHistoryPage: number;
  gameHistoryLimit: number;
  transactionPage: number;
  transactionLimit: number;
  transactionType?: string;
  transactionStatus?: string;
  transactionDateRange?: {
    start: string;
    end: string;
  };
}

interface GameHistoryItem {
  gameId?: string;
  gameName?: string;
  date?: string;
  score?: number;
  status?: string;
  earnings?: number;
  extraData?: Record<string, unknown>;
}

interface TransactionItem {
  transactionId?: string;
  type?: string;
  amount?: number;
  status?: string;
  date?: string;
  description?: string;
  extraData?: Record<string, unknown>;
}

interface PlayerProfileData {
  userDetails: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    dateOfBirth?: string;
    gender?: string;
    country?: string;
    countryFlag?: string;
    referredBy?: string;
    avatar?: string;
  };
  gameHistory: {
    data: GameHistoryItem[];
    pagination: {
      currentPage: number;
      totalPages: number;
      totalCount: number;
      hasNext: boolean;
      hasPrev: boolean;
    };
  };
  transactions: {
    data: TransactionItem[];
    pagination: {
      currentPage: number;
      totalPages: number;
      totalCount: number;
      hasNext: boolean;
      hasPrev: boolean;
    };
  };
  gameStats: {
    totalGamesPlayed: number;
    gamesWon: number;
    totalRewards: number;
    winRate: string;
  };
  socials: {
    twitter?: string;
    facebook?: string;
    instagram?: string;
  };
  message: string;
}

const PlayerApi = {
  viewPlayerProfile(
    data: ViewPlayerProfileRequest,
  ): Promise<AxiosResponse<{ result: PlayerProfileData }>> {
    return axios.post(`${BASE_URL}/viewPlayerProfile`, data, {
      headers: getSessionTokenHeaders(),
    });
  },
};

export default PlayerApi;
export type {
  ViewPlayerProfileRequest,
  PlayerProfileData,
  GameHistoryItem,
  TransactionItem,
};
