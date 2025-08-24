import { AxiosResponse } from 'axios';
import { request } from '@/app/api/config';

export interface QmCoinStats {
  totalEarned: number;
  totalRedeemed: number;
  totalBalance: number;
  totalTransactions: number;
  totalUsers: number;
}

export interface QmCoinStatsResponse {
  result: {
    message: string;
    stats: QmCoinStats;
  };
}

export interface QmCoinUser {
  user: {
    userId: string;
    firstName: string;
    lastName: string;
    email: string;
    avatar?: string | null;
    kycVerified: boolean;
    blacklisted: boolean;
    createdAt: { __type: string; iso: string };
  };
  coinBalance: number;
  totalEarned: number;
  lastTransactionDate: { __type: string; iso: string };
}

export interface QmCoinUsersResponse {
  result: {
    message: string;
    data: QmCoinUser[];
    pagination: {
      currentPage: number;
      limit: number;
      totalPages: number;
      totalItems: number;
    };
  };
}

export interface QmCoinRedemption {
  user: QmCoinUser['user'];
  objectId: string;
  points: number;
  reward: {
    erasers: number;
    freeGames: number;
  };
  createdAt: { __type: string; iso: string };
}

export interface QmCoinRedemptionResponse {
  result: {
    message: string;
    data: QmCoinRedemption[];
    pagination: {
      currentPage: number;
      limit: number;
      totalPages: number;
      totalItems: number;
    };
  };
}

export interface QmCoinExportResponse {
  result: {
    message: string;
    totalUsers: number;
    fileName: string;
    sentTo: string;
  };
}

const QmCoinsApi = {
  getCoinStatsAdmin(): Promise<AxiosResponse<QmCoinStatsResponse>> {
    return request.post(`/getCoinStatsAdmin`);
  },

  getUsersWithCoinsAdmin(params: {
    page: number;
    limit: number;
    search?: string;
  }): Promise<AxiosResponse<QmCoinUsersResponse>> {
    return request.post(`/getUsersWithCoinsAdmin`, params);
  },

  getRedemptionHistoryAdmin(params: {
    page: number;
    limit: number;
    search?: string;
    dateRange?: { start: string; end: string };
  }): Promise<AxiosResponse<QmCoinRedemptionResponse>> {
    return request.post(`/getRedemptionHistoryAdmin`, params);
  },

  exportUsersWithCoinsAdmin(params: {
    dateRange?: { start: string; end: string };
  }): Promise<AxiosResponse<QmCoinExportResponse>> {
    return request.post(`/exportUsersWithCoinsAdmin`, params);
  },

  exportRedemptionHistoryAdmin(params: {
    dateRange: { start: string; end: string };
  }): Promise<AxiosResponse<QmCoinExportResponse>> {
    return request.post(`/exportRedemptionHistoryAdmin`, params);
  },
};

export default QmCoinsApi;
