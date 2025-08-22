import axios, { AxiosResponse } from 'axios';
import { BASE_URL, getSessionTokenHeaders } from './userApi';

interface DashboardSummary {
  totalUsers: number;
  lastGamePlayers: number;
  availableWalletBalance: number;
}

interface DashboardSummaryApiResponse {
  success: boolean;
  code: string;
  message: string;
  data: DashboardSummary;
}

export interface LeaderboardResponse {
  rank: number;
  lastGameDate: string;
  playerName: string;
  gamesPlayed: number;
  prizeWon: number;
}

export interface PageResponse<T> {
  content: T[];
}

export interface GameResponse {
  gameId: string;
  status: string;
  fee: number;
  duration: number;
  startTime: string;
  endTime: string;
  description: string;
  prize: number;
  name: string;
  questionCount: number;
}

export interface NextGameApiResponse {
  success: boolean;
  code: string;
  message: string;
  data: GameResponse;
}

const DashboardApi = {
  fetchDashboardSummary(): Promise<DashboardSummary> {
    return axios
      .get<DashboardSummaryApiResponse>(`${BASE_URL}/dashboard/summary`, {
        headers: getSessionTokenHeaders(),
      })
      .then((res) => res.data.data);
  },

  getLastGameWinners(
    page: number,
    size: number,
  ): Promise<AxiosResponse<PageResponse<LeaderboardResponse>>> {
    return axios.get(`${BASE_URL}/games/winners`, {
      headers: getSessionTokenHeaders(),
      params: { page, size },
    });
  },

  getLeaderboard(
    page: number,
    size: number,
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
      params: { page, size },
    });
  },

  getNextLiveGame(): Promise<AxiosResponse<NextGameApiResponse>> {
    return axios.get(`${BASE_URL}/games/next`, {
      headers: getSessionTokenHeaders(),
    });
  },
};

export default DashboardApi;
