import { AxiosResponse } from 'axios';
import { SECRET_KEY } from './userApi';
import { ApiResponse } from './interface';
import CryptoJS from 'crypto-js';
import { request } from '@/app/api/config';

export interface CreateGamePayload {
  name: string;
  prize: number;
  coinPrize: number;
  fee: number;
  startTime: string;
  questionLimit: number;
  description?: string;
  duration?: number;
  prizeBetween?: number;
  coinPrizeBetween?: number;
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
    prizeBetween?: number;
    coinPrizeBetween?: number;
  };
}

export interface GameQuestionOption {
  optionId: string;
  option: string;
  answer: boolean;
}

export interface GameQuestion {
  questionId?: string;
  order: number;
  question: string;
  options?: GameQuestionOption[];
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
  coinPrize: number;
  prizeBetween?: number;
  coinPrizeBetween?: number;
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
  coinPrize: number;
  name: string;
  questionLimit: number;
  prizeBetween: number;
  coinPrizeBetween: number;
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

export type GameType = 'NUMBER_GUESSER' | 'MEMORY_GAME' | 'PERFECT_SCORE';
export type GameResult = 'WON' | 'LOSS' | 'IN_PROGRESS';

export interface MemoryGame {
  gameId: string;
  name: string;
  description: string;
  type: GameType;
  config: {
    minimumStake: number;
    maximumStake: number;
    baseMoves: number;
    maxMovePurchase: number;
    costPerExtraMove: number;
    stakeMultiplier: number;
    numberOfCards: number;
  };
}

export interface PerfectScoreGame {
  gameId: string;
  name: string;
  description: string;
  type: GameType;
  config: {
    costPerSpin: number;
    maximumSpinPerUser: number;
    respinFeatureEnabled: boolean;
  };
}

export interface NumberGuessingGame {
  gameId: string;
  name: string;
  description: string;
  type: GameType;
  config: {
    minimumStake: number;
    maximumStake: number;
  };
}

export interface GameSession {
  id: string;
  gameId?: string;
  playerId?: string;
  playerName?: string;
  playerEmail?: string;
  stake?: number;
  result?: GameResult;
  startTime?: string;
  endTime?: string;
  duration?: number;
  attempts?: GameAttempt[];
  totalWinnings?: number;
  extraTrials?: number;
  extraMoves?: number;
  matchedPairs?: number;
  hiddenNumber?: number;
  initialQuestions?: number;
  respinQuestions?: number;
  finalQuestions?: number;
  questions?: PerfectScoreAttempt[];
  moves?: PerfectScoreAttempt[];
}

export interface GameAttempt {
  attemptNumber: number;
  guess: number;
  result: string;
  timeTaken: string;
  isCorrect: boolean;
}

export interface PerfectScoreAttempt {
  question: string;
  answer: string;
  isCorrect: boolean;
  score: number;
  timestamp: string;
}

export interface GameSessionsResponse {
  content: GameSession[];
  pageNo: number;
  pageSize: number;
  totalElements: number;
  totalPages: number;
  last: boolean;
  data?: {
    content: GameSession[];
    pageNo: number;
    pageSize: number;
    totalElements: number;
    totalPages: number;
    last: boolean;
  };
}

export interface GetGameSessionsParams {
  gameType: GameType;
  page?: number;
  size?: number;
  search?: string;
  result?: GameResult | '--';
}

export interface UpdateMemoryGamePayload {
  type: string;
  gameId: string;
  minimumStake: number;
  maximumStake: number;
  baseMoves: number;
  maxMovePurchase: number;
  costPerExtraMove: number;
  stakeMultiplier: number;
  numberOfCards: number;
}

export interface UpdatePerfectScoreGamePayload {
  type: string;
  gameId: string;
  costPerSpin: number;
  maximumSpinPerUser: number;
  respinFeatureEnabled: boolean;
}

export interface UpdateNumberGuessingGamePayload {
  type: string;
  gameId: string;
  minimumStake: number;
  maximumStake: number;
  range: number;
  upperBound: number;
  lowerBound: number;
  stakeMultiplier: number;
  numberOfAttempts: number;
  costPerTrial: number;
  maxTrials: number;
}

export interface ApiSuccessResponse<T> {
  success: boolean;
  code: string;
  message: string;
  data: T;
}

export interface GenericApiResponse {
  success?: boolean;
  code?: string;
  message?: string;
  data?: unknown;
  [key: string]: unknown;
}

export interface GameDetailsResponse {
  gameId: string;
  name: string;
  description: string;
  status: string;
  fee: number;
  duration: number;
  startTime: string;
  endTime?: string;
  prize: number;
  coinPrize: number;
  questionCount?: number;
  prizeBetween: number;
  coinPrizeBetween: number;
  questions?: GameQuestion[];
  [key: string]: unknown;
}

const GameApi = {
  createGame(
    payload: CreateGamePayload,
  ): Promise<AxiosResponse<CreateGameResponse>> {
    return request.post(`/games`, payload);
  },

  updateGame(payload: UpdateGamePayload): Promise<AxiosResponse<ApiResponse>> {
    return request.post(`/updateGame`, payload);
  },

  updateGameV2(
    gameId: string,
    payload: UpdateGamePayloadV2,
  ): Promise<AxiosResponse<ApiResponse>> {
    return request.patch(`/games/${gameId}`, payload);
  },

  fetchNextGame(): Promise<AxiosResponse<ApiResponse>> {
    return request.post(`/errorLoad`);
  },

  getGamesWithQuery(
    queryParams: string,
  ): Promise<AxiosResponse<{ success: boolean; data: ApiGameResponse }>> {
    return request.get(`/games?${queryParams}`);
  },

  getAllGamesOld(): Promise<AxiosResponse<ApiResponse>> {
    return request.post(`/getAllGames`);
  },

  deleteGame(objectId: string): Promise<AxiosResponse<ApiResponse>> {
    return request.post(`/deleteGame`, { gameId: objectId });
  },

  deleteGameV2(gameId: string): Promise<AxiosResponse<ApiResponse>> {
    return request.delete(`/games/${gameId}`);
  },

  getGameById(objectId: string): Promise<AxiosResponse<ApiResponse>> {
    return request.post(`/getGameById`, { objectId });
  },

  getGameByIdV2(
    gameId: string,
  ): Promise<AxiosResponse<ApiSuccessResponse<GameDetailsResponse>>> {
    return request.get(`/games/${gameId}/details`);
  },

  getGameDetailsV2(
    gameId: string,
  ): Promise<AxiosResponse<ApiSuccessResponse<GameDetailsResponse>>> {
    return request.get(`/games/${gameId}/details`);
  },

  registerForGame(gameId: string): Promise<AxiosResponse<ApiResponse>> {
    return request.post(`/registerForGame`, { gameId });
  },

  removeUserFromGame(gameId: string): Promise<AxiosResponse<ApiResponse>> {
    return request.post(`/removeUserFromGame`, { gameId });
  },

  deactivateSession(gameId: string) {
    return request.post(`/deactivateSession`, { gameId });
  },

  getLoggedinUserGameResults(
    gameId: string,
  ): Promise<AxiosResponse<ApiResponse>> {
    return request.post(`/getLoggedinUserGameResults`, { gameId });
  },

  updateErasers(erasersUsed: number) {
    return request.post(`/updateErasers`, { erasersUsed });
  },

  recordGameAnswer(
    gameId: string,
    questionNumber: string,
    answer: string,
    totalTime?: string,
  ) {
    return request.post(`/recordGameAnswer`, {
      gameId,
      questionNumber,
      answer,
      ...(totalTime && { totalTime }),
    });
  },

  getGame<T extends NumberGuessingGame | MemoryGame | PerfectScoreGame>(
    gameType: GameType,
  ): Promise<AxiosResponse<ApiSuccessResponse<T>>> {
    return request.get(`/qm-games/game`, {
      params: {
        'game-type': gameType,
      },
    });
  },

  getNumberGuessingGame(
    gameType: GameType,
  ): Promise<AxiosResponse<ApiSuccessResponse<NumberGuessingGame>>> {
    return request.get(`/qm-games/game`, {
      params: {
        'game-type': gameType,
      },
    });
  },

  updateMemoryGame(
    payload: UpdateMemoryGamePayload,
  ): Promise<AxiosResponse<ApiSuccessResponse<GenericApiResponse>>> {
    return request.patch(`/memory-game`, payload);
  },

  updatePerfectScoreGame(
    payload: UpdatePerfectScoreGamePayload,
  ): Promise<AxiosResponse<ApiSuccessResponse<GenericApiResponse>>> {
    return request.patch(`/perfect-score`, payload);
  },

  updateNumberGuessingGame(
    payload: UpdateNumberGuessingGamePayload,
  ): Promise<AxiosResponse<ApiSuccessResponse<GenericApiResponse>>> {
    return request.patch(`/number-guesser`, payload);
  },

  getGameSessions(
    params: GetGameSessionsParams,
  ): Promise<AxiosResponse<ApiSuccessResponse<GameSessionsResponse>>> {
    const { gameType, page = 0, size = 10, search, result } = params;

    const queryParams = new URLSearchParams({
      'game-type': gameType,
      page: page.toString(),
      size: size.toString(),
      ...(search && { search }),
      ...(result && result !== '--' && { result }),
    });

    return request.get(`/qm-games/game-sessions?${queryParams.toString()}`);
  },
  getGameStats(
    params: GetGameSessionsParams,
  ): Promise<AxiosResponse<ApiSuccessResponse<UnknownObject>>> {
    const { gameType } = params;

    const queryParams = new URLSearchParams({
      'game-type': gameType,
    });

    return request.get(`/qm-games/stats?${queryParams.toString()}`);
  },

  getGameSessionById(
    id: string,
    gameType: GameType,
  ): Promise<AxiosResponse<ApiSuccessResponse<GameSession>>> {
    return request.get(`/qm-games/game-sessions/${id}`, {
      params: {
        'game-type': gameType,
      },
    });
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
