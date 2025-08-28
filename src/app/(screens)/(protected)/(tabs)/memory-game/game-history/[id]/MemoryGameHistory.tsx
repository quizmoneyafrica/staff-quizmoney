'use client';

import type { ReactElement } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  ArrowLeft,
  Calendar,
  Clock,
  DollarSign,
  Hash,
  User,
  Wallet,
  Loader2,
} from 'lucide-react';
import { VerifiedIcon } from '@/app/icons/icons';
import GameApi from '@/app/api/game';
import { formatDateTime, formatNaira } from '@/app/utils/utils';

interface GameAttempt {
  attemptNumber: number;
  firstCard: string;
  secondCard: string;
  isMatch: boolean;
  timeTaken: string;
}

interface GameSessionData {
  id: string;
  gameId: string;
  playerName: string;
  status: string;
  startTime: string;
  endTime?: string;
  duration: number;
  stake: number;
  totalWinnings: number;
  matchedPairs: number;
  totalPairs: number;
  attempts: GameAttempt[];
  extraMoves: number;
  result?: string;
}

interface ApiResponse<T> {
  data: {
    data: T;
  };
  [key: string]: unknown;
}

type GameSessionResponse = ApiResponse<GameSessionData>;

export interface MemoryGameHistoryProps {
  params: {
    id: string;
  };
  searchParams: {
    gameId: string;
    status: string;
  };
}

const MemoryGameHistory: React.FC<MemoryGameHistoryProps> = ({
  params,
  searchParams,
}): ReactElement => {
  const gameId = searchParams.gameId || params.id;

  const {
    data: gameSessionData,
    isLoading,
    error,
  } = useQuery<GameSessionData, Error>({
    queryKey: ['gameSessionDetails', params.id],
    queryFn: async (): Promise<GameSessionData> => {
      const response = (await GameApi.getGameSessionById(
        params.id,
        'MEMORY_GAME',
      )) as unknown as GameSessionResponse;

      if (!response?.data?.data) {
        throw new Error('Invalid response format from server');
      }

      return response.data.data;
    },
    enabled: !!params.id,
  });

  const gameSession: GameSessionData =
    isLoading || error
      ? {
          id: params.id,
          gameId: gameId,
          playerName: '',
          status: 'loading',
          startTime: new Date().toISOString(),
          duration: 0,
          stake: 0,
          totalWinnings: 0,
          matchedPairs: 0,
          totalPairs: 0,
          attempts: [],
          extraMoves: 0,
          result: '',
        }
      : (gameSessionData as GameSessionData);

  const handleBackClick = () => {
    window.history.back();
  };

  const getStatusColor = (
    status: string | undefined,
  ): { bg: string; text: string } => {
    switch (status?.toLowerCase()) {
      case 'won':
        return { bg: '#E7FEED', text: '#009028' };
      case 'lost':
      case 'loss':
        return { bg: '#FFE7E7', text: '#E02424' };
      case 'in_progress':
        return { bg: '#FFF6C5', text: '#ED7B2B' };
      default:
        return { bg: '#E7FEED', text: '#009028' };
    }
  };

  const formatResultDisplay = (result: string): string => {
    switch (result) {
      case 'IN_PROGRESS':
        return 'In Progress';
      case 'WON':
        return 'Won';
      case 'LOSS':
        return 'Lost';
      default:
        return result;
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (error instanceof Error) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <p className="mb-4 text-red-600">
            Failed to load game details. Please try again.
          </p>
          <button
            onClick={handleBackClick}
            className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
          >
            Back to Games
          </button>
        </div>
      </div>
    );
  }

  if (!gameSession) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <p className="mb-4">Game session not found</p>
          <button
            onClick={handleBackClick}
            className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
          >
            Back to Games
          </button>
        </div>
      </div>
    );
  }

  const statusColors = getStatusColor(gameSession?.result || status || '');

  const gameDate = gameSession?.startTime
    ? formatDateTime(gameSession.startTime)
    : { time: '', fullDate: '' };

  const duration = gameSession?.duration
    ? `${Math.floor(gameSession.duration / 60)}:${(gameSession.duration % 60)
        .toString()
        .padStart(2, '0')}`
    : '00:00';

  // Safely access properties with optional chaining and nullish coalescing
  const safeGameSession = gameSession || ({} as GameSessionData);

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6 lg:p-8">
      <div className="mb-6">
        <button
          onClick={handleBackClick}
          className="flex items-center gap-2 text-gray-600 transition-colors hover:text-gray-800"
        >
          <ArrowLeft className="h-5 w-5" />
          <span className="text-sm font-medium">Back to Games</span>
        </button>
      </div>

      <div className="mx-auto max-w-6xl">
        <div className="mb-6 rounded-2xl border bg-white p-6 shadow-sm">
          <div className="mb-6 flex flex-col lg:flex-row lg:items-center lg:justify-between">
            <h1 className="mb-4 text-2xl font-bold text-gray-900 lg:mb-0">
              Memory Game History
            </h1>
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-700">
                Game Status:
              </span>
              <span
                className="rounded-full px-4 py-2 text-sm font-medium capitalize"
                style={{
                  backgroundColor: statusColors.bg,
                  color: statusColors.text,
                }}
              >
                {formatResultDisplay(gameSession?.result || status || '')}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
            <div className="flex flex-col items-center text-center">
              <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
                <User className="h-6 w-6 text-blue-600" />
              </div>
              <div className="mb-1 flex items-center gap-1">
                <span className="font-bold text-blue-700">
                  {gameSession?.playerName || 'N/A'}
                </span>
                <VerifiedIcon size={14} className="ml-0.5 text-blue-600" />
              </div>
              <p className="text-sm text-gray-500">
                {gameSession?.attempts?.length || 'N/A'} Attempts
              </p>
            </div>

            <div className="flex flex-col items-center text-center">
              <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
                <Hash className="h-6 w-6 text-blue-600" />
              </div>
              <span className="font-bold text-blue-700">
                {gameSession?.gameId || gameSession?.id || 'N/A'}
              </span>
              <span className="text-sm text-gray-500">Game ID</span>
            </div>

            <div className="flex flex-col items-center text-center">
              <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
                <Calendar className="h-6 w-6 text-blue-600" />
              </div>
              <span className="font-bold text-blue-700">
                {gameDate.fullDate || 'N/A'}
              </span>
              <span className="text-sm text-gray-500">
                {gameDate.time || 'N/A'}
              </span>
            </div>

            <div className="flex flex-col items-center text-center">
              <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
                <DollarSign className="h-6 w-6 text-blue-600" />
              </div>
              <span className="font-bold text-blue-700">
                {gameSession?.stake ? formatNaira(gameSession.stake) : 'N/A'}
              </span>
              <span className="text-sm text-gray-500">Entry Fee</span>
            </div>

            <div className="flex flex-col items-center text-center">
              <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-blue-50">
                <Wallet className="h-6 w-6 text-blue-600" />
              </div>
              <span className="font-bold text-blue-700">
                {formatNaira(gameSession?.totalWinnings || 0)}
              </span>
              <span className="text-sm text-gray-500">Total Earned</span>
            </div>
          </div>
        </div>

        <div className="mb-6 rounded-2xl border bg-white p-6 shadow-sm">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900">Game Details</h2>
            <div className="flex items-center gap-2 text-blue-600">
              <Clock className="h-5 w-5" />
              <span className="font-medium">Time Taken: {duration}</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
            <div className="text-center">
              <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-blue-100">
                <span className="text-xl font-bold text-blue-600">
                  {gameSession?.matchedPairs
                    ? gameSession.matchedPairs * 2
                    : 'N/A'}
                </span>
              </div>
              <p className="text-sm text-gray-500">
                {gameSession?.matchedPairs
                  ? gameSession.matchedPairs * 2
                  : 'N/A'}{' '}
                Cards
              </p>
              <span className="text-sm font-medium text-gray-700">
                Number of Cards
              </span>
            </div>

            {/* Moves */}
            <div className="text-center">
              <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
                <span className="text-xl font-bold text-green-600">
                  {gameSession?.attempts?.length || 'N/A'}
                </span>
              </div>
              <p className="text-sm text-gray-500">
                {gameSession?.attempts?.length || 'N/A'} Moves
              </p>
              <span className="text-sm font-medium text-gray-700">
                Total Moves
              </span>
            </div>

            <div className="text-center">
              <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-yellow-100">
                <span className="text-xl font-bold text-yellow-600">
                  {gameSession?.extraMoves || 0}
                </span>
              </div>
              <p className="text-sm text-gray-500">
                {gameSession?.extraMoves
                  ? 'With Extra Moves'
                  : 'No Extra Moves'}
              </p>
              <span className="text-sm font-medium text-gray-700">
                Extra Moves
              </span>
            </div>

            <div className="text-center">
              <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-purple-100">
                <span className="text-xl font-bold text-purple-600">
                  {gameSession?.totalWinnings ? '₦' : 'N/A'}
                </span>
              </div>
              <p className="text-sm text-gray-500">
                {gameSession?.totalWinnings
                  ? formatNaira(gameSession.totalWinnings)
                  : 'N/A'}
              </p>
              <span className="text-sm font-medium text-gray-700">
                Total Winnings
              </span>
            </div>
          </div>

          <div className="mt-8 rounded-2xl border bg-white p-6 shadow-sm">
            <h2 className="mb-6 text-xl font-bold text-gray-900">
              Move History
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="px-4 py-3 text-left font-medium text-gray-600">
                      Move #
                    </th>
                    <th className="px-4 py-3 text-left font-medium text-gray-600">
                      Cards Flipped
                    </th>
                    <th className="px-4 py-3 text-left font-medium text-gray-600">
                      Result
                    </th>
                    <th className="px-4 py-3 text-left font-medium text-gray-600">
                      Time
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td
                      colSpan={4}
                      className="px-4 py-8 text-center text-gray-500"
                    >
                      Move history data is not available yet.
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MemoryGameHistory;
