'use client';

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import GameApi, { GameSession } from '@/app/api/game';

// import GameHistoryDetails from '@/app/components/perfect-score/PerfectScoreGameHistoryDetails';

export default function PerfectScoreGameHistoryPage() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const sessionId = params.id as string;
  const gameId = searchParams.get('gameId');
  const status = searchParams.get('status');

  const { data: session, isLoading } = useQuery({
    queryKey: ['perfectScoreGameSession', sessionId],
    queryFn: async (): Promise<GameSession | null> => {
      if (!sessionId) return null;
      try {
        const response = await GameApi.getGameSessionById(
          sessionId,
          'PERFECT_SCORE',
        );
        return response.data.data;
      } catch (error) {
        console.error('Failed to fetch game session:', error);
        return null;
      }
    },
    enabled: !!sessionId,
  });

  return (
    <div className="p-6">
      <header className="mb-6 flex items-center gap-4">
        <button
          onClick={() => router.back()}
          className="text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft size={24} />
        </button>
        <div>
          <h1 className="text-2xl font-bold">Game History</h1>
          <p className="text-sm text-gray-500">
            {gameId} -{' '}
            <span
              className={`font-semibold ${
                status === 'WON' ? 'text-green-600' : 'text-red-600'
              }`}
            >
              {status}
            </span>
          </p>
        </div>
      </header>

      {/* {isLoading ? (
        <div className="py-10 text-center">Loading...</div>
      ) : (
        <GameHistoryDetails session={session || null} isLoading={isLoading} />
      )} */}
    </div>
  );
}
