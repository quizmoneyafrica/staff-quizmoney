'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import {
  Trophy,
  Medal,
  Crown,
  Users,
  Coins,
  TrendingUp,
  Search,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Calendar,
  Gamepad2,
  BadgeCheck,
  Filter,
} from 'lucide-react';
import { api } from '@/app/lib/api-client';
import { formatNaira, formatDateTime } from '@/app/lib/utils';
import { ROUTES } from '@/app/lib/routes';
import { QmCoinIcon } from '@/app/icons/icons';

// ── Types ─────────────────────────────────────────────────────────────────────
interface LeaderboardEntry {
  rank: number;
  player_id: string;
  username: string;
  avatar_url?: string | null;
  is_verified?: boolean;
  score: number;
  correct_answers: number;
  total_questions: number;
  total_time_ms: number;
  prize_type: 'ngn' | 'qmcoin' | null;
  prize_amount: number;
}

interface GameSummary {
  id: string;
  title?: string | null;
  status: string;
  scheduled_start_time: string;
  actual_start_time?: string | null;
  actual_end_time?: string | null;
  total_players: number;
  entry_fee_kobo: number;
  prize_percent: number;
  prize_pool_final_kobo?: number | null;
  qmcoin_prize_total: number;
  is_sponsored?: boolean;
  sponsor_name?: string | null;
}

interface LeaderboardData {
  game: GameSummary;
  leaderboard: LeaderboardEntry[];
  total: number;
}

// ── API hooks ─────────────────────────────────────────────────────────────────
function useLeaderboard(gameId: string | null, page: number) {
  return useQuery({
    queryKey: ['leaderboard', gameId, page],
    queryFn: async (): Promise<LeaderboardData> => {
      const endpoint = gameId
        ? `/api/admin/leaderboard/${gameId}`
        : `/api/admin/leaderboard/last-game`;
      const res = await api.get(endpoint, { params: { page, limit: 20 } });
      return res.data.data;
    },
    staleTime: 2 * 60_000,
  });
}

function useRecentGames() {
  return useQuery({
    queryKey: ['leaderboard-games'],
    queryFn: async () => {
      const res = await api.get('/api/admin/games', {
        params: { status: 'finished', limit: 10 },
      });
      return res.data.data.games as GameSummary[];
    },
    staleTime: 5 * 60_000,
  });
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function formatTime(ms: number): string {
  if (!ms) return '—';
  const secs = Math.floor(ms / 1000);
  const m = Math.floor(secs / 60);
  const s = secs % 60;
  return m > 0 ? `${m}m ${s}s` : `${s}s`;
}

function getInitials(username: string) {
  return username?.slice(0, 2).toUpperCase() ?? '??';
}

// ── Sub-components ────────────────────────────────────────────────────────────
function RankDisplay({ rank }: { rank: number }) {
  if (rank === 1)
    return (
      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-100">
        <Crown size={16} className="text-amber-600" />
      </div>
    );
  if (rank === 2)
    return (
      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100">
        <Medal size={16} className="text-gray-500" />
      </div>
    );
  if (rank === 3)
    return (
      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-orange-100">
        <Medal size={16} className="text-orange-600" />
      </div>
    );
  return (
    <div className="flex h-8 w-8 items-center justify-center">
      <span className="text-sm font-bold text-neutral-500">#{rank}</span>
    </div>
  );
}

function Avatar({
  username,
  avatarUrl,
  size = 'md',
}: {
  username: string;
  avatarUrl?: string | null;
  size?: 'sm' | 'md';
}) {
  const cls = size === 'sm' ? 'w-7 h-7 text-xs' : 'w-9 h-9 text-sm';
  return (
    <div
      className={`${cls} flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-blue-400 to-blue-700 font-bold text-white`}
    >
      {avatarUrl ? (
        <img
          src={avatarUrl}
          alt=""
          className="h-full w-full object-cover"
          onError={(e) => {
            (e.target as HTMLImageElement).style.display = 'none';
          }}
        />
      ) : (
        getInitials(username)
      )}
    </div>
  );
}

function Podium({ entries }: { entries: LeaderboardEntry[] }) {
  // Visual order: 2nd left, 1st centre, 3rd right
  const ordered = [entries[1], entries[0], entries[2]].filter(
    Boolean,
  ) as LeaderboardEntry[];
  const heights: Record<number, string> = { 1: 'h-24', 2: 'h-16', 3: 'h-12' };
  const colors: Record<number, string> = {
    1: 'bg-amber-400 border-amber-300',
    2: 'bg-gray-300 border-gray-200',
    3: 'bg-orange-400 border-orange-300',
  };

  return (
    <div className="flex items-end justify-center gap-3 py-6">
      {ordered.map((entry) => (
        <div key={entry.player_id} className="flex flex-col items-center gap-2">
          {entry.rank === 1 ? (
            <Crown size={20} className="text-amber-500" />
          ) : (
            <div className="h-5" />
          )}
          <Avatar username={entry.username} avatarUrl={entry.avatar_url} />
          <div className="text-center">
            <p className="max-w-[70px] truncate text-xs font-semibold text-neutral-800">
              {entry.username}
            </p>
            <p className="text-xs text-neutral-500">{entry.score} pts</p>
          </div>
          <div
            className={`w-20 ${heights[entry.rank] ?? 'h-12'} rounded-t-xl ${
              colors[entry.rank]
            } flex items-center justify-center border-2`}
          >
            <span className="text-lg font-black text-white">#{entry.rank}</span>
          </div>
          <div className="text-center">
            {entry.prize_type === 'ngn' && entry.prize_amount > 0 && (
              <p className="text-xs font-semibold text-green-700">
                {formatNaira(entry.prize_amount)}
              </p>
            )}
            {entry.prize_type === 'qmcoin' && entry.prize_amount > 0 && (
              <p className="text-xs font-semibold text-yellow-600">
                {entry.prize_amount.toLocaleString()} QMC
              </p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

function StatTile({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-lg bg-neutral-50 p-3">
      <div className="mb-1 flex items-center gap-1.5 text-neutral-500">
        {icon}
        <span className="text-xs">{label}</span>
      </div>
      <p className="text-sm font-bold text-neutral-800">{value}</p>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function LeaderboardPage() {
  const router = useRouter();
  const [selectedGameId, setSelectedGameId] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [showGamePicker, setShowGamePicker] = useState(false);

  const { data, isLoading, isError } = useLeaderboard(selectedGameId, page);
  const { data: recentGames } = useRecentGames();

  const game = data?.game;
  const entries = (data?.leaderboard ?? []).filter(
    (e) => !search || e.username.toLowerCase().includes(search.toLowerCase()),
  );
  const total = data?.total ?? 0;
  const totalPages = Math.ceil(total / 20);

  const ngnWinners =
    data?.leaderboard.filter((e) => e.prize_type === 'ngn') ?? [];
  const qmcWinners =
    data?.leaderboard.filter((e) => e.prize_type === 'qmcoin') ?? [];
  const totalNgnOut = ngnWinners.reduce((s, e) => s + e.prize_amount, 0);
  const totalQmcOut = qmcWinners.reduce((s, e) => s + e.prize_amount, 0);

  return (
    <div className="space-y-5 p-6">
      {/* ── Header ───────────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-xl font-bold text-neutral-800">
            Leaderboard
          </h1>
          <p className="mt-0.5 text-sm text-neutral-500">
            {game
              ? `Showing: ${game.title ?? 'Untitled Game'}`
              : 'Most recent finished game'}
          </p>
        </div>

        {/* Game picker dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowGamePicker((s) => !s)}
            className="flex items-center gap-2 rounded-xl border border-neutral-200 bg-white px-4 py-2.5 text-sm font-medium text-neutral-700 shadow-sm hover:bg-neutral-50"
          >
            <Gamepad2 size={15} className="text-neutral-400" />
            {selectedGameId
              ? recentGames?.find((g) => g.id === selectedGameId)?.title ??
                'Selected game'
              : 'Latest game'}
            <Filter size={13} className="text-neutral-400" />
          </button>

          {showGamePicker && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => setShowGamePicker(false)}
              />
              <div className="absolute right-0 top-full z-20 mt-2 w-72 overflow-hidden rounded-xl border border-neutral-100 bg-white shadow-xl">
                <div className="border-b border-neutral-100 px-3 py-2.5">
                  <p className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
                    Recent Finished Games
                  </p>
                </div>
                <div className="max-h-64 overflow-y-auto">
                  <button
                    onClick={() => {
                      setSelectedGameId(null);
                      setPage(1);
                      setShowGamePicker(false);
                    }}
                    className={`w-full px-4 py-3 text-left text-sm hover:bg-neutral-50 ${
                      !selectedGameId
                        ? 'bg-blue-50 font-medium text-blue-700'
                        : 'text-neutral-700'
                    }`}
                  >
                    Latest game
                  </button>
                  {recentGames?.map((g) => (
                    <button
                      key={g.id}
                      onClick={() => {
                        setSelectedGameId(g.id);
                        setPage(1);
                        setShowGamePicker(false);
                      }}
                      className={`w-full px-4 py-3 text-left hover:bg-neutral-50 ${
                        selectedGameId === g.id ? 'bg-blue-50' : ''
                      }`}
                    >
                      <p
                        className={`text-sm font-medium ${
                          selectedGameId === g.id
                            ? 'text-blue-700'
                            : 'text-neutral-800'
                        }`}
                      >
                        {g.title ?? 'Untitled Game'}
                      </p>
                      <p className="mt-0.5 text-xs text-neutral-400">
                        {formatDateTime(g.scheduled_start_time)} ·{' '}
                        {g.total_players.toLocaleString()} players
                      </p>
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* ── Loading ───────────────────────────────────────────────────────────── */}
      {isLoading && (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-16 animate-pulse rounded-xl bg-neutral-100"
            />
          ))}
        </div>
      )}

      {/* ── Error ─────────────────────────────────────────────────────────────── */}
      {isError && (
        <div className="rounded-xl border border-red-100 bg-red-50 p-6 text-center">
          <p className="text-sm text-red-600">
            Failed to load leaderboard. No finished games may exist yet.
          </p>
        </div>
      )}

      {/* ── Main content ──────────────────────────────────────────────────────── */}
      {!isLoading && !isError && game && (
        <>
          {/* Game info card */}
          <div className="overflow-hidden rounded-xl border border-neutral-100 bg-white shadow-sm">
            {game.is_sponsored && (
              <div className="flex items-center gap-2 border-b border-amber-100 bg-amber-50 px-5 py-2">
                <Trophy size={14} className="text-amber-600" />
                <p className="text-xs font-medium text-amber-700">
                  Sponsored by{' '}
                  <span className="font-semibold">{game.sponsor_name}</span>
                </p>
              </div>
            )}
            <div className="p-5">
              <div className="mb-4 flex items-start justify-between">
                <div>
                  <h2 className="font-heading text-lg font-bold text-neutral-800">
                    {game.title ?? 'Exclusive Trivia'}
                  </h2>
                  <p className="mt-0.5 flex items-center gap-1 text-xs text-neutral-500">
                    <Calendar size={11} />
                    {formatDateTime(game.scheduled_start_time)}
                  </p>
                </div>
                <button
                  onClick={() => router.push(ROUTES.GAME_ZONE_VIEW(game.id))}
                  className="flex items-center gap-1.5 text-xs font-medium text-blue-600 hover:underline"
                >
                  <ExternalLink size={13} /> View Game
                </button>
              </div>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                <StatTile
                  icon={<Users size={15} className="text-blue-500" />}
                  label="Total Players"
                  value={game.total_players.toLocaleString()}
                />
                <StatTile
                  icon={
                    <span className="text-sm font-bold text-neutral-500">
                      ₦
                    </span>
                  }
                  label="Entry Fee"
                  value={formatNaira(game.entry_fee_kobo)}
                />
                <StatTile
                  icon={<TrendingUp size={15} className="text-green-500" />}
                  label="NGN Paid Out"
                  value={
                    totalNgnOut > 0
                      ? formatNaira(totalNgnOut)
                      : game.prize_pool_final_kobo
                      ? formatNaira(game.prize_pool_final_kobo)
                      : '—'
                  }
                />
                <StatTile
                  icon={<QmCoinIcon />}
                  label="QMC Paid Out"
                  value={
                    totalQmcOut > 0
                      ? `${totalQmcOut.toLocaleString()} QMC`
                      : `${game.qmcoin_prize_total.toLocaleString()} QMC`
                  }
                />
              </div>
            </div>
          </div>

          {/* Podium */}
          {data.leaderboard.length >= 3 && (
            <div className="rounded-xl border border-neutral-100 bg-white shadow-sm">
              <div className="flex items-center gap-2 px-5 pb-1 pt-5">
                <Trophy size={16} className="text-amber-500" />
                <p className="font-heading font-semibold text-neutral-800">
                  Top Winners
                </p>
              </div>
              <Podium entries={data.leaderboard.slice(0, 3)} />
            </div>
          )}

          {/* Full rankings table */}
          <div className="rounded-xl border border-neutral-100 bg-white shadow-sm">
            <div className="flex items-center justify-between border-b border-neutral-100 px-5 py-4">
              <div className="flex items-center gap-2">
                <p className="font-heading font-semibold text-neutral-800">
                  Full Rankings
                </p>
                <span className="rounded-full bg-neutral-100 px-2 py-0.5 text-xs text-neutral-500">
                  {total.toLocaleString()} players
                </span>
              </div>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-neutral-400" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search username"
                  className="w-44 rounded-lg border border-neutral-200 py-2 pl-8 pr-3 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-neutral-50 text-xs uppercase tracking-wide text-neutral-500">
                    <th className="px-5 py-3 text-left font-medium">Rank</th>
                    <th className="px-5 py-3 text-left font-medium">Player</th>
                    <th className="px-5 py-3 text-left font-medium">Score</th>
                    <th className="px-5 py-3 text-left font-medium">
                      Accuracy
                    </th>
                    <th className="px-5 py-3 text-left font-medium">Time</th>
                    <th className="px-5 py-3 text-left font-medium">Prize</th>
                    <th className="px-5 py-3 text-left font-medium"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-50">
                  {entries.length === 0 ? (
                    <tr>
                      <td
                        colSpan={7}
                        className="py-12 text-center text-sm text-neutral-400"
                      >
                        No results found
                      </td>
                    </tr>
                  ) : (
                    entries.map((entry) => {
                      const accuracy =
                        entry.total_questions > 0
                          ? Math.round(
                              (entry.correct_answers / entry.total_questions) *
                                100,
                            )
                          : 0;
                      const isWinner =
                        entry.prize_type !== null && entry.prize_amount > 0;

                      return (
                        <tr
                          key={entry.player_id}
                          className={`transition-colors hover:bg-neutral-50 ${
                            entry.rank <= 3 ? 'bg-amber-50/30' : ''
                          }`}
                        >
                          <td className="px-5 py-3.5">
                            <RankDisplay rank={entry.rank} />
                          </td>

                          <td className="px-5 py-3.5">
                            <div className="flex items-center gap-2.5">
                              <Avatar
                                username={entry.username}
                                avatarUrl={entry.avatar_url}
                                size="sm"
                              />
                              <div className="flex items-center gap-1">
                                <span className="text-sm font-medium text-neutral-800">
                                  {entry.username}
                                </span>
                                {entry.is_verified && (
                                  <BadgeCheck
                                    size={13}
                                    className="text-blue-500"
                                  />
                                )}
                              </div>
                            </div>
                          </td>

                          <td className="px-5 py-3.5">
                            <span className="text-sm font-bold text-neutral-800">
                              {entry.score.toLocaleString()}
                            </span>
                          </td>

                          <td className="px-5 py-3.5">
                            <div className="flex items-center gap-2">
                              <div className="h-1.5 w-16 overflow-hidden rounded-full bg-neutral-100">
                                <div
                                  className={`h-full rounded-full ${
                                    accuracy >= 80
                                      ? 'bg-green-500'
                                      : accuracy >= 50
                                      ? 'bg-yellow-500'
                                      : 'bg-red-400'
                                  }`}
                                  style={{ width: `${accuracy}%` }}
                                />
                              </div>
                              <span className="text-xs text-neutral-500">
                                {accuracy}%
                              </span>
                            </div>
                            <p className="mt-0.5 text-xs text-neutral-400">
                              {entry.correct_answers}/{entry.total_questions}{' '}
                              correct
                            </p>
                          </td>

                          <td className="px-5 py-3.5">
                            <span className="text-xs text-neutral-600">
                              {formatTime(entry.total_time_ms)}
                            </span>
                          </td>

                          <td className="px-5 py-3.5">
                            {isWinner ? (
                              entry.prize_type === 'ngn' ? (
                                <span className="inline-flex items-center gap-1 rounded-full bg-green-50 px-2 py-1 text-xs font-semibold text-green-700">
                                  ₦{' '}
                                  {formatNaira(entry.prize_amount).replace(
                                    '₦',
                                    '',
                                  )}
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 rounded-full bg-yellow-50 px-2 py-1 text-xs font-semibold text-yellow-700">
                                  <Coins size={11} />{' '}
                                  {entry.prize_amount.toLocaleString()} QMC
                                </span>
                              )
                            ) : (
                              <span className="text-xs text-neutral-400">
                                —
                              </span>
                            )}
                          </td>

                          <td className="px-5 py-3.5">
                            <button
                              onClick={() =>
                                router.push(
                                  ROUTES.PLAYER_PROFILE(entry.player_id),
                                )
                              }
                              className="text-xs font-medium text-blue-600 hover:underline"
                            >
                              Profile
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {totalPages > 1 && (
              <div className="flex items-center justify-between border-t border-neutral-100 px-5 py-3">
                <p className="text-xs text-neutral-500">
                  Page {page} of {totalPages} · {total.toLocaleString()} total
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="flex items-center gap-1 rounded-lg border border-neutral-200 px-3 py-1.5 text-xs font-medium text-neutral-600 hover:bg-neutral-50 disabled:opacity-40"
                  >
                    <ChevronLeft size={13} /> Prev
                  </button>
                  <button
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    className="flex items-center gap-1 rounded-lg border border-neutral-200 px-3 py-1.5 text-xs font-medium text-neutral-600 hover:bg-neutral-50 disabled:opacity-40"
                  >
                    Next <ChevronRight size={13} />
                  </button>
                </div>
              </div>
            )}
          </div>
        </>
      )}

      {/* Empty state */}
      {!isLoading && !isError && !game && (
        <div className="rounded-xl border border-neutral-100 bg-white p-16 text-center shadow-sm">
          <Trophy size={48} className="mx-auto mb-4 text-neutral-200" />
          <p className="mb-1 font-semibold text-neutral-700">
            No finished games yet
          </p>
          <p className="text-sm text-neutral-500">
            Leaderboard data will appear after the first game completes.
          </p>
        </div>
      )}
    </div>
  );
}
