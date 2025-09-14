import { AxiosResponse } from 'axios';
import { request } from '@/app/api/config';
import { UnknownAction } from '@reduxjs/toolkit';

export interface PlayerGameQuestion {
  questionNumber: string;
  question: string;
  correctAnswer: string;
  userAnswer: string;
  timeTaken: string;
  createdAt: { iso: string };
  usedEraser?: boolean;
}

export interface PlayerGameDetails {
  gameId: string;
  startDate: { iso: string };
  totalQuestions: number;
  status?: string;
  totalEarned?: number | string;
  totalTimeTaken?: string;
  correctQuestionNumbers?: (number | string)[];
  incorrectQuestionNumbers?: (number | string)[];
  questions?: PlayerGameQuestion[];
}

export interface GetPlayerGameDetailsResult {
  gameDetails: PlayerGameDetails;
  totalEarned?: number | string;
  totalTimeTaken?: string;
  correctQuestionNumbers?: (number | string)[];
  incorrectQuestionNumbers?: (number | string)[];
  questions?: PlayerGameQuestion[];
}

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
  search?: string;
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

export interface TransactionItem {
  id: string;
  type: string;
  amount: number;
  status: string;
  createdAt: {
    __type: string;
    iso: string;
  };
  description: string;

  transactionId?: string;
  transactionType?: string;
  dateTime?: string;
  date?: string;
  [key: string]: unknown;
}

interface PlayerProfileData {
  bankAccounts?: UnknownObject[];
  userDetails: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    dateOfBirth?: UnknownObject;
    gender?: string;
    country?: string;
    countryFlag?: string;
    referredBy?: string;
    avatar?: string;
    balance?: string;
    coinBalance?: number;
    emailVerified?: boolean;
    kycVerified?: boolean;
    blacklisted?: boolean;
    eraser?: number;
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
    tiktok?: string;
  };
  // bankAccounts?: any[];
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

interface FlagPlayerRequest {
  userId: string;
  flag: boolean;
}

interface FlagPlayerResponse {
  result: {
    message: string;
    success: boolean;
  };
}

interface UpdatePlayerPayload {
  userId: string;
  firstName?: string;
  lastName?: string;
  country?: string;
  gender?: string;
  dob?: string;
  influencer?: boolean;
  avatar?: string;
  promotionalMails?: boolean;
  kycVerified?: boolean;
  facebook?: string;
  instagram?: string;
  twitter?: string;
  tiktok?: string;
  bankDetails?: {
    accountNumber?: string;
    bankName?: string;
    accountName?: string;
  };
}

interface UpdatePlayerVerificationRequest {
  userId: string;
  kycVerified: boolean;
}

interface UpdatePlayerVerificationResponse {
  result: {
    message: string;
    success: boolean;
  };
}

const PlayerApi = {
  viewPlayerProfile(
    data: ViewPlayerProfileRequest,
  ): Promise<AxiosResponse<UnknownObject>> {
    return request.get(`/customers/profile/${data?.userId}`, {
      params: {},
    });
  },
  getPlayerGameDetails(data: {
    userId: string;
    gameId: string;
  }): Promise<AxiosResponse<{ result: GetPlayerGameDetailsResult }>> {
    return request.post(`/getPlayerGameDetails/`, data, {});
  },

  getPlayerGameStats(
    data: GetPlayerGameStatsRequest,
  ): Promise<AxiosResponse<GameStatsResponse>> {
    return request.post(`/getPlayerGameStats`, data, {});
  },

  getPlayerTransactions(
    data: GetPlayerTransactionsRequest,
  ): Promise<AxiosResponse<PlayerTransactionsResponse>> {
    return request.post(`/getPlayerTransactions`, data, {});
  },

  updatePlayerVerification(
    data: UpdatePlayerVerificationRequest,
  ): Promise<AxiosResponse<UpdatePlayerVerificationResponse>> {
    return request.post(`/updatePlayer`, data, {});
  },

  flagPlayer(
    data: FlagPlayerRequest,
  ): Promise<AxiosResponse<FlagPlayerResponse>> {
    return request.patch(
      `/customers/flag/${data?.userId}`,
      { flag: data?.flag },
      {},
    );
  },
};

export default PlayerApi;
export type {
  ViewPlayerProfileRequest,
  GetPlayerGameStatsRequest,
  GetPlayerTransactionsRequest,
  PlayerProfileData,
  GameHistoryItem,
  // TransactionItem,
  GameStatsResponse,
  PlayerTransactionsResponse,
  UpdatePlayerPayload,
  UpdatePlayerVerificationRequest,
  UpdatePlayerVerificationResponse,
  FlagPlayerRequest,
  FlagPlayerResponse,
};
