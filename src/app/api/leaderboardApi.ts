import axios, { AxiosResponse } from 'axios';
import { BASE_URL, getAuthUser, getSessionTokenHeaders } from './userApi';
import { ApiResponse } from './interface';

interface LastGameRankingUser {
  userId: string;
  firstName: string;
  lastName: string;
  avatar: string | null;
  noOfGamesPlayed: number;
}

export interface LastGameRanking {
  position: number;
  prize: number;
  coins: number;
  user: LastGameRankingUser;
}

export interface GetLastGameLeaderboardResponse {
  msg: string;
  rankings: LastGameRanking[];
  createdAt: {
    __type: string;
    iso: string;
  };
}

const user = getAuthUser();
const LeaderboardAPI = {
  getAllTimeLeaderboard(page?: number): Promise<AxiosResponse<ApiResponse>> {
    return axios.post(
      `${BASE_URL}/getAllTimeLeaderboard`,
      { page: page ?? 1 },
      { headers: getSessionTokenHeaders() },
    );
  },

  getLastGameLeaderboard(): Promise<
    AxiosResponse<{ result: GetLastGameLeaderboardResponse }>
  > {
    return axios.post(
      `${BASE_URL}/getLastGameLeaderboard`,
      { userId: user?.objectId },
      { headers: getSessionTokenHeaders() },
    );
  },
};

export default LeaderboardAPI;
