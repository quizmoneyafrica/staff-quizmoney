import axios, { AxiosResponse } from 'axios';
import { BASE_URL, getSessionTokenHeaders } from './userApi';
import { PageResponse, LeaderboardResponse } from './dashboardApi';

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
    return axios.get(`${BASE_URL}/games/leaderboard`, {
      headers: getSessionTokenHeaders(),
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
    return axios.post(
      `${BASE_URL}/getLastGameLeaderboardAdmin`,
      { page, limit, search },
      { headers: getSessionTokenHeaders() },
    );
  },

  getAllTimeLeaderboardAdmin(
    page: number,
    limit: number,
    search: string,
  ): Promise<AxiosResponse<{ result: GetAllTimeLeaderboardAdminResponse }>> {
    return axios.post(
      `${BASE_URL}/getAllTimeLeaderboardAdmin`,
      { page, limit, search },
      { headers: getSessionTokenHeaders() },
    );
  },
};

export default LeaderboardAPI;
