'use client';

import { use } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import {
  ArrowLeft,
  CheckCircle2,
  XCircle,
  Clock,
  Clock3,
  Calendar,
  Gamepad2,
  Coins,
} from 'lucide-react';
import { api } from '@/app/lib/api-client';
import { formatDate, formatNaira, formatDateTime } from '@/app/lib/utils';
import { ROUTES } from '@/app/lib/routes';

// ── Types ─────────────────────────────────────────────────────────────────────
interface GameAnswer {
  id: string;
  question_order: number;
  question_text: string;
  selected_option: string;
  is_correct: boolean;
  was_auto_corrected: boolean;
  response_time_ms: number;
  points_earned: number;
  correct_option?: string;
  eraser_used?: boolean;
}

interface GameHistoryDetail {
  id: string;
  game_id: string;
  title: string;
  status: string;
  played_at: string;
  scheduled_start_time: string;
  score: number;
  rank: number | null;
  total_time_ms: number;
  prize_type: 'ngn' | 'qmcoin' | null;
  prize_amount: number;
  prize_won: number | null;
  qm_coins_won: number | null;
  status_label: string;
  answers: GameAnswer[];
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function formatTime(ms: number): string {
  if (!ms) return '00:00';
  const totalSecs = Math.floor(ms / 1000);
  const m = Math.floor(totalSecs / 60);
  const s = totalSecs % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

function formatResponseTime(ms: number): string {
  if (!ms) return '00:01:50';
  const totalSecs = Math.floor(ms / 1000);
  const m = Math.floor(totalSecs / 60);
  const s = totalSecs % 60;
  return `00:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

// ── Data fetching ─────────────────────────────────────────────────────────────
function useGameHistory(playerId: string, gameId: string) {
  return useQuery({
    queryKey: ['player-game-history', playerId, gameId],
    queryFn: async (): Promise<GameHistoryDetail> => {
      const res = await api.get(
        `/api/admin/players/${playerId}/games/${gameId}`,
      );
      return res.data.data;
    },
    enabled: !!playerId && !!gameId,
  });
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function PlayerGameHistoryPage() {
  const router = useRouter();
  const params = useParams();
  const playerId = params.id as string;
  const gameId = params.game_id as string;

  const { data: game, isLoading, isError } = useGameHistory(playerId, gameId);

  if (isLoading)
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="border-primary-800 h-8 w-8 animate-spin rounded-full border-4 border-t-transparent" />
      </div>
    );

  if (isError || !game)
    return (
      <div className="p-6 text-center text-neutral-400">
        Game history not found
      </div>
    );

  const answers = game.answers ?? [];
  const correct = answers.filter((a) => a.is_correct);
  const missed = answers.filter((a) => !a.is_correct);
  const total = answers.length || 10;
  const score = correct.length || game.score || 0;
  const pct = total > 0 ? Math.round((score / total) * 100) : 0;
  const isWon = game.status_label === 'won' || game.prize_won != null;

  return (
    <div className="space-y-5 p-6">
      {/* ── Top bar ─────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-1.5 text-sm text-neutral-500 transition-colors hover:text-neutral-800"
        >
          <ArrowLeft className="h-4 w-4" /> Go Back
        </button>
      </div>

      {/* ── Game History Card ────────────────────────────────────────────── */}
      <div className="rounded-2xl border border-neutral-100 bg-white shadow-sm">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-neutral-100 px-6 py-4">
          <h2 className="font-heading text-lg font-semibold text-neutral-800">
            Game History
          </h2>
          <div className="flex items-center gap-2">
            <span className="text-sm text-neutral-500">Game Status:</span>
            <span
              className={`rounded-full px-3 py-1 text-xs font-bold ${
                isWon
                  ? 'bg-positive-100 text-positive-700'
                  : 'bg-error-100 text-error-600'
              }`}
            >
              {isWon ? 'Won' : 'Loss'}
            </span>
          </div>
        </div>

        {/* ── Stat tiles row ──────────────────────────────────────────────── */}
        <div className="grid grid-cols-4 gap-4 border-b border-neutral-100 px-6 py-5">
          {[
            {
              icon: <Gamepad2 size={22} className="text-primary-800" />,
              label: 'Game ID',
              value: (game.game_id ?? game.id ?? '—')
                .replace(/-/g, '')
                .slice(0, 7)
                .toUpperCase(),
              sub: formatDate(game.played_at ?? game.scheduled_start_time),
            },
            {
              icon: <Calendar size={22} className="text-primary-800" />,
              label: 'Date',
              value: formatDate(game.played_at ?? game.scheduled_start_time),
              sub: formatDateTime(game.played_at ?? game.scheduled_start_time)
                .split(' ')
                .slice(-1)[0],
            },
            {
              icon: <Clock3 size={22} className="text-primary-800" />,
              label: 'Play Time',
              value: formatTime(game.total_time_ms),
              sub: '',
            },
            {
              icon: <Coins size={22} className="text-warning-500" />,
              label: 'Total Earned',
              value: game.prize_won
                ? formatNaira(game.prize_won)
                : game.qm_coins_won
                ? `${game.qm_coins_won.toLocaleString()} QMC`
                : '₦0',
              sub: '',
            },
          ].map(({ icon, label, value, sub }) => (
            <div
              key={label}
              className="flex flex-col items-center justify-center gap-1 rounded-xl bg-neutral-50 px-4 py-4 text-center"
            >
              <div className="mb-1">{icon}</div>
              <p className="text-sm font-bold text-neutral-800">{value}</p>
              {sub && <p className="text-xs text-neutral-400">{sub}</p>}
              <p className="text-xs text-neutral-500">{label}</p>
            </div>
          ))}
        </div>

        <div className="space-y-6 px-6 py-5">
          {/* ── Score ring + correct/missed bubbles ─────────────────────── */}
          <div className="flex items-start gap-8">
            {/* Donut ring */}
            <div className="relative h-20 w-20 shrink-0">
              <svg viewBox="0 0 36 36" className="h-20 w-20 -rotate-90">
                <circle
                  cx="18"
                  cy="18"
                  r="15.9"
                  fill="none"
                  stroke="#e5e7eb"
                  strokeWidth="3"
                />
                <circle
                  cx="18"
                  cy="18"
                  r="15.9"
                  fill="none"
                  stroke="#22c55e"
                  strokeWidth="3"
                  strokeDasharray={`${pct} ${100 - pct}`}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-sm font-bold text-neutral-700">
                  {score}/{total}
                </span>
              </div>
            </div>

            <div className="flex-1 space-y-4">
              {/* Correct answers */}
              <div>
                <p className="mb-2 flex items-center gap-1.5 text-sm font-medium text-neutral-600">
                  <CheckCircle2 size={14} className="text-positive-600" />
                  Correct Answers
                </p>
                <div className="flex flex-wrap gap-2">
                  {correct.length > 0 ? (
                    correct.map((a, i) => (
                      <span
                        key={i}
                        className="bg-positive-100 text-positive-700 border-positive-200 flex h-8 w-8 items-center justify-center rounded-full border text-sm font-bold"
                      >
                        {a.question_order ?? i + 1}
                      </span>
                    ))
                  ) : (
                    <span className="text-sm text-neutral-400">None</span>
                  )}
                </div>
              </div>

              {/* Missed questions */}
              {missed.length > 0 && (
                <div>
                  <p className="mb-2 flex items-center gap-1.5 text-sm font-medium text-neutral-600">
                    <XCircle size={14} className="text-error-500" />
                    Missed Questions
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {missed.map((a, i) => (
                      <span
                        key={i}
                        className="bg-error-100 text-error-600 border-error-200 flex h-8 w-8 items-center justify-center rounded-full border text-sm font-bold"
                      >
                        {a.question_order ?? i + 1}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* ── Per-question breakdown ───────────────────────────────────── */}
          {answers.length > 0 && (
            <div className="space-y-3">
              {answers.map((a, i) => (
                <div
                  key={i}
                  className="rounded-xl border border-neutral-100 bg-neutral-50/50 p-4"
                >
                  <div className="flex items-start justify-between gap-4">
                    {/* Left: question */}
                    <div className="flex min-w-0 flex-1 items-start gap-2">
                      {a.is_correct ? (
                        <CheckCircle2
                          size={16}
                          className="text-positive-600 mt-0.5 shrink-0"
                        />
                      ) : (
                        <XCircle
                          size={16}
                          className="text-error-500 mt-0.5 shrink-0"
                        />
                      )}
                      <div className="min-w-0">
                        <div className="mb-1 flex flex-wrap items-center gap-2">
                          <span className="text-sm font-semibold text-neutral-800">
                            Question {a.question_order ?? i + 1}
                          </span>
                          {a.eraser_used && (
                            <span className="bg-warning-100 text-warning-700 rounded-full px-2 py-0.5 text-xs font-medium">
                              Eraser used 🧹
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-neutral-700">
                          {a.question_text}
                        </p>
                        {!a.is_correct && (
                          <div className="mt-1.5 space-y-0.5 text-xs">
                            <p className="text-error-500">
                              Your answer: {a.selected_option}
                            </p>
                            {a.correct_option && (
                              <p className="text-positive-600">
                                Correct Answer: {a.correct_option}
                              </p>
                            )}
                          </div>
                        )}
                        {a.is_correct && (
                          <p className="text-positive-600 mt-1 text-xs">
                            Correct Answer:{' '}
                            {a.correct_option ?? a.selected_option}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Right: timing */}
                    <div className="shrink-0 space-y-1 text-right">
                      <div>
                        <p className="text-xs text-neutral-400">
                          Answered Time
                        </p>
                        <p className="text-primary-800 flex items-center justify-end gap-1 text-xs font-medium">
                          <Clock size={11} />
                          {formatResponseTime(a.response_time_ms)}
                          <span className="text-neutral-400">sec</span>
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-neutral-400">
                          Database Time
                        </p>
                        <p className="text-positive-600 flex items-center justify-end gap-1 text-xs font-medium">
                          <Clock size={11} />
                          {formatDate(game.played_at)}{' '}
                          {
                            formatDateTime(game.played_at)
                              .split(' ')
                              .slice(-1)[0]
                          }
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Empty state when no answers available */}
          {answers.length === 0 && (
            <div className="py-12 text-center">
              <Gamepad2 size={40} className="mx-auto mb-3 text-neutral-200" />
              <p className="text-sm text-neutral-400">
                No question data available for this game
              </p>
              <p className="mt-1 text-xs text-neutral-300">
                Answer details are recorded during live games
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
