import axios, { AxiosResponse } from 'axios';
import {
  appHeaders,
  BASE_URL,
  getSessionTokenHeaders,
  SECRET_KEY,
} from './userApi';
import { ApiResponse } from './interface';
import CryptoJS from 'crypto-js';

import { Game } from '@/app/store/gameSlice';

export interface CreateGamePayload {
  name: string;
  prize: number;
  fee: number;
  startTime: string;
  questionLimit: number;
  description?: string;
  duration?: number;
}

export interface CreateGameResponse {
  success: boolean;
  message: string;
  data?: {
    id: string;
    name: string;
    prize: number;
    fee: number;
    startTime: string;
    questionLimit: number;
    description?: string;
    duration?: number;
  };
}

export interface GameQuestionOption {
  optionId: string;
  option: string;
  answer: boolean;
}

export interface GameQuestion {
  questionId: string;
  order: number;
  question: string;
  options: GameQuestionOption[];
}

export interface GameQuestionResponse {
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
  questions: GameQuestion[];
}

export interface UpdateGamePayload {
  objectId: string;
  name?: string;
  description?: string;
  questions?: Array<{
    number: number;
    question: string;
    options: string[];
    correctAnswer: string;
  }>;
  gamePrize?: number;
  numOfShare?: number;
  entryFee?: string | number;
  startDate?: string;
}

export interface UpdateGamePayloadV2 {
  fee: number;
  duration: number;
  startTime: string;
  description: string;
  prize: number;
  name: string;
  questionLimit: number;
  questions: GameQuestion[];
}

export interface GetAllGamesPayload {
  page: number;
  limit: number;
  search: string;
  dateRange: {
    start: string;
    end: string;
  };
}

export interface PageResponse<T> {
  data: T[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

interface ApiGame {
  gameId: string;
  status: string;
  fee: number;
  duration: number;
  startTime: string;
  description: string;
  prize: number;
  name: string;
}

interface ApiGameResponse {
  content: ApiGame[];
  pageNo: number;
  pageSize: number;
  totalElements: number;
  totalPages: number;
  last: boolean;
}

const GameApi = {
  createGame(
    payload: CreateGamePayload,
  ): Promise<AxiosResponse<CreateGameResponse>> {
    return axios.post(`${BASE_URL}/games`, payload, {
      headers: getSessionTokenHeaders(),
    });
  },

  updateGame(payload: UpdateGamePayload): Promise<AxiosResponse<ApiResponse>> {
    return axios.post(`${BASE_URL}/updateGame`, payload, {
      headers: getSessionTokenHeaders(),
    });
  },

  updateGameV2(
    gameId: string,
    payload: UpdateGamePayloadV2,
  ): Promise<AxiosResponse<ApiResponse>> {
    return axios.patch(`${BASE_URL}/games/${gameId}`, payload, {
      headers: getSessionTokenHeaders(),
    });
  },

  fetchNextGame(): Promise<AxiosResponse<ApiResponse>> {
    return axios.post(`${BASE_URL}/errorLoad`, {}, { headers: appHeaders });
  },

  getGamesWithQuery(
    queryParams: string,
  ): Promise<AxiosResponse<{ success: boolean; data: ApiGameResponse }>> {
    return axios.get(`${BASE_URL}/games?${queryParams}`, {
      headers: getSessionTokenHeaders(),
    });
  },

  getAllGamesOld(): Promise<AxiosResponse<ApiResponse>> {
    return axios.post(
      `${BASE_URL}/getAllGames`,
      {},
      { headers: getSessionTokenHeaders() },
    );
  },

  deleteGame(objectId: string): Promise<AxiosResponse<ApiResponse>> {
    return axios.post(
      `${BASE_URL}/deleteGame`,
      { gameId: objectId },
      { headers: getSessionTokenHeaders() },
    );
  },

  deleteGameV2(gameId: string): Promise<AxiosResponse<ApiResponse>> {
    return axios.delete(`${BASE_URL}/games/${gameId}`, {
      headers: getSessionTokenHeaders(),
    });
  },

  getGameById(objectId: string): Promise<AxiosResponse<ApiResponse>> {
    return axios.post(
      `${BASE_URL}/getGameById`,
      { objectId },
      { headers: getSessionTokenHeaders() },
    );
  },

  getGameByIdV2(gameId: string): Promise<AxiosResponse<GameQuestionResponse>> {
    return axios.get(`${BASE_URL}/games/${gameId}`, {
      headers: getSessionTokenHeaders(),
    });
  },

  registerForGame(gameId: string): Promise<AxiosResponse<ApiResponse>> {
    return axios.post(
      `${BASE_URL}/registerForGame`,
      { gameId },
      { headers: getSessionTokenHeaders() },
    );
  },

  removeUserFromGame(gameId: string): Promise<AxiosResponse<ApiResponse>> {
    return axios.post(
      `${BASE_URL}/removeUserFromGame`,
      { gameId },
      { headers: getSessionTokenHeaders() },
    );
  },

  deactivateSession(gameId: string) {
    return axios.post(
      `${BASE_URL}/deactivateSession`,
      { gameId },
      { headers: getSessionTokenHeaders() },
    );
  },

  getLoggedinUserGameResults(
    gameId: string,
  ): Promise<AxiosResponse<ApiResponse>> {
    return axios.post(
      `${BASE_URL}/getLoggedinUserGameResults`,
      { gameId },
      { headers: getSessionTokenHeaders() },
    );
  },

  updateErasers(erasersUsed: number) {
    return axios.post(
      `${BASE_URL}/updateErasers`,
      { erasersUsed },
      { headers: getSessionTokenHeaders() },
    );
  },

  recordGameAnswer(
    gameId: string,
    questionNumber: string,
    answer: string,
    totalTime?: string,
  ) {
    return axios.post(
      `${BASE_URL}/recordGameAnswer`,
      {
        gameId,
        questionNumber,
        answer,
        ...(totalTime && { totalTime }),
      },
      { headers: getSessionTokenHeaders() },
    );
  },
};

export default GameApi;

export function decryptGameData(encrypted: string) {
  const bytes = CryptoJS.AES.decrypt(encrypted, SECRET_KEY);
  const decrypted = bytes.toString(CryptoJS.enc.Utf8);
  return JSON.parse(decrypted);
}

export function encryptGameData(data: object): string {
  const stringified = JSON.stringify(data);
  const encrypted = CryptoJS.AES.encrypt(stringified, SECRET_KEY).toString();
  return encrypted;
}
