import { AxiosResponse } from 'axios';
import { request } from '@/app/api/config';

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
  gameId: string;
  status: string;
  fee: number;
  duration: number;
  startTime: string;
  endTime: string;
  description: string;
  prize: number;
  coinPrize: number;
  name: string;
  numberOfQuestions: number;
  currentQuestionOrder: number;
  prizeBetween: number;
  coinPrizeBetween: number;
  customerId: string;
  gameType: string;
  reward: number;
  rewardType: string;
  gameResultStatus: string;
  customerGameLobbyStatus: string;
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

interface PlayerDashboardStatsResponse {
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

interface UpdateCustomerProfileRequest {
  firstName?: string;
  lastName?: string;
  dob?: string;
  country?: string;
  gender?: string;
  avatarUrl?: string;
  promotions?: boolean;
  facebook?: string;
  twitter?: string;
  instagram?: string;
  whatsapp?: string;
  tiktok?: string;
}

interface UpdateCustomerProfileResponse {
  success: boolean;
  code: string;
  message: string;
  data: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    dob: string;
    country: string;
    gender: string;
    avatarUrl: string;
    promotions: boolean;
    facebookHandle: string;
    twitterHandle: string;
    instagramHandle: string;
    whatsappContact: string;
    tiktokHandle: string;
  };
}

export interface GameStatsResponse {
  success: boolean;
  code: string;
  message: string;
  data: {
    gameId: string;
    score: number;
    rank: number;
    firstName: string;
    avatarUrl: string;
    questionsAnswered: Array<{
      questionText: string;
      questionOptions: Array<{
        optionId: string;
        option: string;
        answer: boolean;
      }>;
      customerAnswer: string;
      isCorrect: boolean;
      eraserUsed: boolean;
    }>;
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
  ): Promise<AxiosResponse<PlayerDashboardStatsResponse>> {
    return request.post(`/getPlayerGameStats`, data, {});
  },

  getPlayerGameHistory(
    customerId: string,
    page: number = 0,
    size: number = 10,
    result?: 'WON' | 'LOSS' | 'DRAW' | 'PENDING' | '',
  ): Promise<
    AxiosResponse<{
      success: boolean;
      code: string;
      message: string;
      data: {
        content: GameHistoryItem[];
        pageNo: number;
        pageSize: number;
        totalElements: number;
        totalPages: number;
        last: boolean;
      };
    }>
  > {
    let url = `/games/history?customerId=${customerId}&page=${page}&size=${size}`;
    if (result) {
      url += `&result=${result}`;
    }
    return request.get(url);
  },

  getGameStats(
    gameId: string,
    customerId: string,
  ): Promise<AxiosResponse<GameStatsResponse>> {
    return request.get(`/games/${gameId}/stats`, {
      params: { customerId },
    });
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

  async updateCustomerProfile(
    customerId: string,
    data: UpdateCustomerProfileRequest,
  ): Promise<AxiosResponse<UpdateCustomerProfileResponse>> {
    return request.patch(`/api/v1/customers/${customerId}`, data, {});
  },

  getWalletTransactions(
    customerId: string,
    params: {
      page?: number;
      size?: number;
      status?: 'PENDING' | 'SUCCESSFUL' | 'FAILED';
      type?: 'FUNDING' | 'WITHDRAWAL' | 'REVERSAL';
      search?: string;
      'start-date'?: string;
      'end-date'?: string;
    } = {},
  ): Promise<
    AxiosResponse<{
      success: boolean;
      code: string;
      message: string;
      data: {
        content: Array<{
          id: string;
          transactionDate: string;
          transactionStatus: string;
          transactionType: string;
          narration: string;
          firstName: string;
          lastName: string;
          amount: number;
          direction: 'DEBIT' | 'CREDIT';
          currency: string;
        }>;
        pageNo: number;
        pageSize: number;
        totalElements: number;
        totalPages: number;
        last: boolean;
      };
    }>
  > {
    return request.get(`/wallet-transactions`, {
      params: {
        customerId,
        ...params,
      },
    });
  },

  getPlayerBalances(customerId: string): Promise<
    AxiosResponse<{
      eraserBalance: number;
      walletBalance: number;
      coinBalance: number;
    }>
  > {
    return request.get(`/customers/${customerId}/balances`);
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

export interface GameZoneHistoryItem {
  id: string;
  subType: 'NUMBER_GUESSER' | 'MEMORY_GAME' | 'PERFECT_SCORE';
  name?: string;
  email?: string;
  result?: 'WON' | 'LOSS' | 'IN_PROGRESS';
  amountWon?: number;
  customerId?: string;
  createdAt?: string;
  gameId?: string;
  entryFee?: number;
  gameTime?: string;
}

export interface GameZoneHistoryResponse {
  success: boolean;
  code: string;
  message: string;
  data: {
    content: GameZoneHistoryItem[];
    pageNo: number;
    pageSize: number;
    totalElements: number;
    totalPages: number;
    last: boolean;
  };
}

const GameApi = {
  getGameZoneHistory: (
    gameType: 'NUMBER_GUESSER' | 'MEMORY_GAME' | 'PERFECT_SCORE' | 'ALL',
    customerId: string,
    page: number = 0,
    size: number = 10,
    result?: 'WON' | 'LOSS' | 'IN_PROGRESS',
    search?: string,
  ): Promise<AxiosResponse<GameZoneHistoryResponse>> => {
    const params = new URLSearchParams({
      'game-type': gameType,
      'customer-id': customerId,
      page: page.toString(),
      size: size.toString(),
      ...(result && { result }),
      ...(search && { search }),
    });

    const url = `/qm-games/game-sessions?${params.toString()}`;

    return request.get(url);
  },
};

export { GameApi };

export default PlayerApi;
export type {
  ViewPlayerProfileRequest,
  GetPlayerGameStatsRequest,
  GetPlayerTransactionsRequest,
  PlayerProfileData,
  GameHistoryItem,
  // TransactionItem,
  PlayerDashboardStatsResponse,
  PlayerTransactionsResponse,
  UpdatePlayerPayload,
  UpdatePlayerVerificationRequest,
  UpdatePlayerVerificationResponse,
  UpdateCustomerProfileRequest,
  UpdateCustomerProfileResponse,
  FlagPlayerRequest,
  FlagPlayerResponse,
};
