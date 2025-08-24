import { AxiosResponse } from 'axios';
import { request } from '@/app/api/config';

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
    return request
      .get<DashboardSummaryApiResponse>(`/dashboard/summary`, {})
      .then((res) => res.data.data);
  },

  getLastGameWinners(
    page: number,
    size: number,
  ): Promise<AxiosResponse<PageResponse<LeaderboardResponse>>> {
    return request.get(`/games/winners`, {
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
    return request.get(`/games/leaderboard`, {
      params: { page, size },
    });
  },

  getNextLiveGame(): Promise<AxiosResponse<NextGameApiResponse>> {
    return request.get(`/games/next`, {});
  },
};

export default DashboardApi;
