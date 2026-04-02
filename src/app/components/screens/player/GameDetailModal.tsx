/* eslint-disable @typescript-eslint/no-explicit-any */

import { formatDate, formatNaira } from '@/app/lib/utils';
import { CheckCircle2, Clock, X, XCircle } from 'lucide-react';

// ─── Game Detail Modal ─────────────────────────────────────────────────────────
export function GameDetailModal({
  game,
  onClose,
}: {
  game: any;
  onClose: () => void;
}) {
  const answers = game.answers ?? [];
  const correct = answers.filter((a: any) => a.is_correct);
  const missed = answers.filter((a: any) => !a.is_correct);
  const total = answers.length || game.total_questions || 10;
  const score = correct.length || game.final_score || 0;
  const pct = total > 0 ? Math.round((score / total) * 100) : 0;
  const isWon = game.status === 'won';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/40 p-4">
      <div className="my-8 w-full max-w-2xl rounded-2xl bg-white shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b px-6 py-4">
          <h3 className="font-semibold text-gray-900">Game History</h3>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500">Game Status:</span>
            <span
              className={`rounded-full px-3 py-1 text-xs font-bold ${
                isWon
                  ? 'bg-green-100 text-green-700'
                  : 'bg-red-100 text-red-600'
              }`}
            >
              {isWon ? 'Won' : 'Loss'}
            </span>
            <button onClick={onClose} className="ml-1">
              <X className="h-5 w-5 text-gray-400" />
            </button>
          </div>
        </div>

        <div className="space-y-5 p-6">
          {/* 4 stat tiles */}
          <div className="grid grid-cols-4 gap-3">
            {[
              {
                icon: '📊',
                label: 'Game ID',
                value: (game.game_id ?? game.id ?? '—').slice(0, 8),
              },
              {
                icon: '📅',
                label: 'Date',
                value: formatDate(game.played_at ?? game.created_at),
              },
              {
                icon: '⏱️',
                label: 'Play Time',
                value: game.total_time_ms ?? '—',
              },
              {
                icon: '💰',
                label: 'Total Earned',
                value: game.prize_won ? formatNaira(game.prize_won) : '—',
              },
            ].map(({ icon, label, value }) => (
              <div
                key={label}
                className="rounded-xl bg-gray-50 p-3 text-center"
              >
                <div className="mb-1 text-xl">{icon}</div>
                <p className="truncate text-sm font-bold text-gray-800">
                  {value}
                </p>
                <p className="mt-0.5 text-xs text-gray-400">{label}</p>
              </div>
            ))}
          </div>

          {/* Score ring + answer bubbles */}
          <div className="flex items-start gap-6">
            {/* Donut */}
            <div className="relative h-16 w-16 shrink-0">
              <svg viewBox="0 0 36 36" className="h-16 w-16 -rotate-90">
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
                <span className="text-xs font-bold text-gray-700">
                  {score}/{total}
                </span>
              </div>
            </div>

            <div className="flex-1 space-y-3">
              <div>
                <p className="mb-1.5 flex items-center gap-1.5 text-xs font-medium text-gray-500">
                  <span className="inline-block h-2 w-2 rounded-full bg-green-500" />{' '}
                  Correct Answers
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {correct.map((a: any, i: number) => (
                    <span
                      key={i}
                      className="flex h-7 w-7 items-center justify-center rounded-full bg-green-100 text-xs font-bold text-green-700"
                    >
                      {a.question_order ?? i + 1}
                    </span>
                  ))}
                </div>
              </div>
              {missed.length > 0 && (
                <div>
                  <p className="mb-1.5 flex items-center gap-1.5 text-xs font-medium text-gray-500">
                    <span className="inline-block h-2 w-2 rounded-full bg-red-500" />{' '}
                    Missed Questions
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {missed.map((a: any, i: number) => (
                      <span
                        key={i}
                        className="flex h-7 w-7 items-center justify-center rounded-full bg-red-100 text-xs font-bold text-red-600"
                      >
                        {a.question_order ?? i + 1}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Per-question breakdown */}
          {answers.length > 0 && (
            <div className="max-h-72 space-y-2 overflow-y-auto pr-1">
              {answers.map((a: any, i: number) => (
                <div key={i} className="rounded-xl border border-gray-100 p-3">
                  <div className="flex items-start gap-2">
                    {a.is_correct ? (
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-green-500" />
                    ) : (
                      <XCircle className="mt-0.5 h-4 w-4   shrink-0 text-red-500" />
                    )}
                    <div className="min-w-0 flex-1">
                      <div className="mb-0.5 flex flex-wrap items-center gap-2">
                        <span className="text-sm font-semibold text-gray-800">
                          Question {i + 1}
                        </span>
                        {a.eraser_used && (
                          <span className="rounded-full bg-orange-100 px-2 py-0.5 text-xs text-orange-600">
                            Eraser used 🧹
                          </span>
                        )}
                        <div className="ml-auto flex shrink-0 items-center gap-1 text-xs text-gray-400">
                          <Clock className="h-3 w-3" />
                          Answered Time &nbsp;
                          <span className="font-medium text-gray-700">
                            {String(
                              Math.floor((a.answered_in_sec ?? 0) / 60),
                            ).padStart(2, '0')}
                            :
                            {String((a.answered_in_sec ?? 0) % 60).padStart(
                              2,
                              '0',
                            )}
                            s
                          </span>
                        </div>
                      </div>
                      <p className="text-sm text-gray-600">{a.question_text}</p>
                      {!a.is_correct && (
                        <div className="mt-1 space-y-0.5 text-xs">
                          <p className="text-red-500">
                            Your answer: {a.player_answer}
                          </p>
                          <p className="text-green-600">
                            Correct Answer: {a.correct_answer}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
