'use client';

import React from 'react';
import {
  Calendar,
  Clock,
  DollarSign,
  Hash,
  Target,
  User,
  Wallet,
  Loader2,
} from 'lucide-react';
import { VerifiedIcon } from '@/app/icons/icons';
import { GameSession, PerfectScoreAttempt } from '@/app/api/game';
import { formatDateTime, formatNaira } from '@/app/utils/utils';

interface GameHistoryDetailsProps {
  session: GameSession | null;
  isLoading: boolean;
}

const GameHistoryDetails: React.FC<GameHistoryDetailsProps> = ({
  session,
  isLoading,
}) => {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center rounded-lg bg-white p-8 shadow-md">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!session) {
    return (
      <div className="rounded-lg bg-white p-8 text-center shadow-md">
        <p className="text-lg font-semibold text-gray-700">
          Game session not found.
        </p>
        <p className="text-gray-500">
          The session may have been deleted or the ID is incorrect.
        </p>
      </div>
    );
  }

  const { time, fullDate } = formatDateTime(
    session.startTime || session.endTime || '',
  );
  const perfectScoreAttempts = (session.moves as PerfectScoreAttempt[]) || [];

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
      <div className="lg:col-span-1">
        <div className="rounded-lg bg-white p-6 shadow-md">
          <h3 className="mb-4 text-lg font-bold text-gray-900">Game Details</h3>
          <div className="space-y-4">
            <InfoItem
              icon={<Hash />}
              label="Game ID"
              value={session.gameId || session.id}
            />
            <InfoItem
              icon={<User />}
              label="Player"
              value={session.playerName || 'N/A'}
              email={session.playerEmail}
            />
            <InfoItem
              icon={<Calendar />}
              label="Date"
              value={`${fullDate} at ${time}`}
            />
            <InfoItem
              icon={<Clock />}
              label="Duration"
              value={`${session.duration || 0} seconds`}
            />
            <InfoItem
              icon={<Target />}
              label="Result"
              value={session.result}
              result={session.result}
            />
            <InfoItem
              icon={<Wallet />}
              label="Stake"
              value={formatNaira(session.stake || 0)}
            />
            <InfoItem
              icon={<DollarSign />}
              label="Winnings"
              value={formatNaira(session.totalWinnings || 0)}
            />
          </div>
        </div>
      </div>
      <div className="lg:col-span-2">
        <div className="rounded-lg bg-white p-6 shadow-md">
          <h3 className="mb-4 text-lg font-bold text-gray-900">Attempts</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Attempt
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Score
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Timestamp
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {perfectScoreAttempts.length > 0 ? (
                  perfectScoreAttempts.map((attempt, index) => (
                    <tr key={attempt.timestamp}>
                      <td className="whitespace-nowrap px-6 py-4">
                        {index + 1}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4">
                        {attempt.score}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4">
                        {new Date(attempt.timestamp).toLocaleTimeString()}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={3} className="py-8 text-center text-gray-500">
                      No attempts recorded for this session.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

interface IconProps {
  size?: number;
  className?: string;
  // [key: string]: any;
}

interface InfoItemProps {
  icon: React.ReactElement<IconProps>;
  label: string;
  value: string | number;
  email?: string;
  result?: 'WON' | 'LOSS' | string;
}

const InfoItem = ({ icon, label, value, email, result }: InfoItemProps) => {
  const getResultClass = (res: string) => {
    if (res === 'WON') return 'text-green-600';
    if (res === 'LOSS') return 'text-red-600';
    return 'text-gray-800';
  };

  return (
    <div className="flex items-start">
      <div className="mr-3 flex-shrink-0 text-gray-400">
        {React.cloneElement(icon, { size: 20 })}
      </div>
      <div>
        <p className="text-sm font-medium text-gray-500">{label}</p>
        {label === 'Player' ? (
          <div>
            <div className="flex items-center">
              <p className="font-semibold text-gray-800">{value}</p>
              <VerifiedIcon size={14} className="ml-1" />
            </div>
            {email && <p className="text-sm text-gray-500">{email}</p>}
          </div>
        ) : (
          <p
            className={`font-semibold ${
              result ? getResultClass(result) : 'text-gray-800'
            }`}
          >
            {value}
          </p>
        )}
      </div>
    </div>
  );
};

export default GameHistoryDetails;
