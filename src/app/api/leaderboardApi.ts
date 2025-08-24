import { AxiosResponse } from 'axios';
import { LeaderboardResponse } from './dashboardApi';
import { request } from '@/app/api/config';

interface LeaderboardUser {
  userId: string;
  firstName: string;
  lastName: string;
  avatar: string | null;
  kycVerified: boolean;
  blacklisted: boolean;
}

export interface LastGameAdminRanking {
  position: number;
  prize: number;
  coins: number;
  noOfGamesPlayed: number;
  user: LeaderboardUser;
}

export interface GetLastGameLeaderboardAdminResponse {
  msg: string;
  gameId: string;
  data: LastGameAdminRanking[];
  pagination: {
    currentPage: number;
    limit: number;
    totalPages: number;
    totalItems: number;
  };
}

export interface AllTimeAdminRanking {
  overallRank: number;
  amountWon: number;
  noOfGamesPlayed: number;
  coins?: number;
  user: LeaderboardUser;
}

export interface GetAllTimeLeaderboardAdminResponse {
  msg: string;
  data: AllTimeAdminRanking[];
  pagination: {
    currentPage: number;
    limit: number;
    totalPages: number;
    totalItems: number;
  };
}

const LeaderboardAPI = {
  getLeaderboard(
    page: number,
    size: number,
    search: string,
  ): Promise<
    AxiosResponse<{
      success: boolean;
      code: string;
      message: string;
      data: {
        content: LeaderboardResponse[];
        pageNo: number;
        pageSize: number;
        totalElements: number;
        totalPages: number;
        last: boolean;
      };
    }>
  > {
    return request.get(`/games/leaderboard`, {
      params: {
        search: search || undefined,
        page: Math.max(0, page - 1),
        size,
      },
    });
  },

  getLastGameLeaderboardAdmin(
    page: number,
    limit: number,
    search: string,
  ): Promise<AxiosResponse<{ result: GetLastGameLeaderboardAdminResponse }>> {
    return request.post(`/getLastGameLeaderboardAdmin`, {
      page,
      limit,
      search,
    });
  },

  getAllTimeLeaderboardAdmin(
    page: number,
    limit: number,
    search: string,
  ): Promise<AxiosResponse<{ result: GetAllTimeLeaderboardAdminResponse }>> {
    return request.post(`/getAllTimeLeaderboardAdmin`, {
      page,
      limit,
      search,
    });
  },
};

export default LeaderboardAPI;
