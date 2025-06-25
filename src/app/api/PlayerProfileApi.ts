import axios, { AxiosResponse } from 'axios';
import { BASE_URL, getSessionTokenHeaders } from './userApi';

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

interface GetPlayerGameStatsRequest {
  userId: string;
  page: number;
  limit: number;
}

interface GetPlayerTransactionsRequest {
  userId: string;
  page: number;
  limit: number;
  type?: string;
  status?: string;
  dateRange?: {
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
    balance?: string;
    emailVerified?: boolean;
    createdAt?: {
      __type: string;
      iso: string;
    };
  };
  gameHistory?: {
    data: GameHistoryItem[];
    pagination: {
      currentPage: number;
      totalPages: number;
      totalCount: number;
      hasNext: boolean;
      hasPrev: boolean;
    };
  };
  transactions?: {
    data: TransactionItem[];
    pagination: {
      currentPage: number;
      totalPages: number;
      totalCount: number;
      hasNext: boolean;
      hasPrev: boolean;
    };
  };
  gameStats?: {
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

interface GameStatsResponse {
  result: {
    message: string;
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
    gameStats: {
      totalGamesPlayed: number;
      gamesWon: number;
      totalRewards: number;
      winRate: string;
    };
  };
}

interface PlayerTransactionsResponse {
  result: {
    message: string;
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
  };
}

const PlayerApi = {
  viewPlayerProfile(
    data: ViewPlayerProfileRequest,
  ): Promise<AxiosResponse<{ result: PlayerProfileData }>> {
    return axios.post(`${BASE_URL}/getPlayerProfileDetails`, data, {
      headers: getSessionTokenHeaders(),
    });
  },

  getPlayerGameStats(
    data: GetPlayerGameStatsRequest,
  ): Promise<AxiosResponse<GameStatsResponse>> {
    return axios.post(`${BASE_URL}/getPlayerGameStats`, data, {
      headers: getSessionTokenHeaders(),
    });
  },

  getPlayerTransactions(
    data: GetPlayerTransactionsRequest,
  ): Promise<AxiosResponse<PlayerTransactionsResponse>> {
    return axios.post(`${BASE_URL}/getPlayerTransactions`, data, {
      headers: getSessionTokenHeaders(),
    });
  },
};

export default PlayerApi;
export type {
  ViewPlayerProfileRequest,
  GetPlayerGameStatsRequest,
  GetPlayerTransactionsRequest,
  PlayerProfileData,
  GameHistoryItem,
  TransactionItem,
  GameStatsResponse,
  PlayerTransactionsResponse,
};
