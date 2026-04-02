'use client';

import { use, useRef, useState } from 'react';
import { useGame, useUploadQuestions, useCancelGame } from '@/app/lib/queries';
import {
  formatDateTime,
  formatNaira,
  GAME_STATUS_COLORS,
  GAME_STATUS_LABELS,
} from '@/app/lib/utils';
import { useRouter } from 'next/navigation';
import { ROUTES } from '@/app/lib/routes';
import { useAuthStore } from '@/app/lib/auth-store';
import { hasPermission } from '@/app/lib/permissions';
import {
  Upload,
  FileText,
  ChevronDown,
  ChevronUp,
  CheckCircle,
  XCircle,
  Coins,
  Calendar,
  Users,
  Percent,
  Music,
  Video,
  Building2,
  ExternalLink,
} from 'lucide-react';
import * as Dialog from '@radix-ui/react-dialog';
import type { Question } from '@/app/lib/types';

export default function ViewGamePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const canWrite = user ? hasPermission(user.role, 'games.write') : false;

  const { data: game, isLoading } = useGame(id);
  const { mutate: uploadQuestions, isPending: uploading } =
    useUploadQuestions();
  const { mutate: cancelGame, isPending: cancelling } = useCancelGame();

  const fileRef = useRef<HTMLInputElement>(null);
  const [expandedQ, setExpandedQ] = useState<number | null>(null);
  const [showCancel, setShowCancel] = useState(false);
  const [cancelReason, setCancelReason] = useState('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    uploadQuestions({ gameId: id, file });
    e.target.value = '';
  };

  const handleCancel = () => {
    if (!cancelReason.trim()) return;
    cancelGame(
      { gameId: id, reason: cancelReason },
      {
        onSuccess: () => {
          setShowCancel(false);
          router.push(ROUTES.GAME_ZONE);
        },
      },
    );
  };

  if (isLoading)
    return <div className="h-96 animate-pulse rounded-xl bg-neutral-200" />;
  if (!game) return <p className="text-neutral-500">Game not found</p>;

  const isScheduled = game.status === 'scheduled';
  const prizeKobo = game.is_sponsored
    ? game.sponsor_prize_boost_kobo ?? 0
    : Math.floor(
        (game.entry_fee_kobo * (game.total_players || 0) * game.prize_percent) /
          100,
      );

  const questionList: Question[] = game?.questions ?? [];

  return (
    <>
      <div className="space-y-6">
        {/* ── Sponsored banner ────────────────────────────────── */}
        {game.is_sponsored && (
          <div className="flex items-center gap-3 rounded-xl border border-amber-200 bg-amber-50 px-5 py-3">
            {game.sponsor_logo_url && (
              <img
                src={game.sponsor_logo_url}
                alt=""
                className="h-8 w-8 rounded-lg border border-amber-100 bg-white object-contain p-0.5"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
            )}
            <Building2 size={16} className="shrink-0 text-amber-600" />
            <p className="text-sm font-medium text-amber-800">
              <span className="font-semibold">Sponsored Game</span>
              {game.sponsor_name && (
                <>
                  {' '}
                  — presented by{' '}
                  <span className="font-semibold">{game.sponsor_name}</span>
                </>
              )}
            </p>
          </div>
        )}

        {/* ── Game Details Card ────────────────────────────────── */}
        <div className="rounded-xl bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-start justify-between">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="font-heading text-xl font-bold text-neutral-800">
                  {game.title ?? 'Exclusive Trivia'}
                </h2>
                <span
                  className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                    GAME_STATUS_COLORS[game.status]
                  }`}
                >
                  {GAME_STATUS_LABELS[game.status]}
                </span>
                {game.is_sponsored && (
                  <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-semibold text-amber-700">
                    Sponsored
                  </span>
                )}
              </div>
              <p className="mt-1 text-sm text-neutral-500">
                {game.description}
              </p>
            </div>

            {canWrite && isScheduled && (
              <div className="flex gap-2">
                <button
                  onClick={() => router.push(ROUTES.GAME_ZONE_EDIT(id))}
                  className="bg-primary-800 hover:bg-primary-700 rounded-full px-4 py-2 text-xs font-semibold text-white transition"
                >
                  Edit Game
                </button>
                <button
                  onClick={() => setShowCancel(true)}
                  className="bg-error-500 hover:bg-error-600 rounded-full px-4 py-2 text-xs font-semibold text-white transition"
                >
                  Cancel Game
                </button>
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <InfoTile
              icon={<Calendar size={16} />}
              label="Scheduled"
              value={formatDateTime(game.scheduled_start_time)}
            />
            <InfoTile
              icon={<span className="text-sm font-bold">₦</span>}
              label="Entry Fee"
              value={formatNaira(game.entry_fee_kobo)}
            />
            <InfoTile
              icon={<span className="text-sm font-bold">₦</span>}
              label={game.is_sponsored ? 'Sponsor Prize Pool' : 'Prize Pool'}
              value={formatNaira(prizeKobo)}
            />
            <InfoTile
              icon={<Coins size={16} className="text-warning-500" />}
              label="QM Coins"
              value={`${game.qmcoin_prize_total.toLocaleString()} QMC`}
            />
            <InfoTile
              icon={<Users size={16} />}
              label="Players"
              value={game.total_players.toLocaleString()}
            />
            <InfoTile
              icon={<Percent size={16} />}
              label={game.is_sponsored ? 'Platform keeps' : 'Prize %'}
              value={
                game.is_sponsored ? '100% of entries' : `${game.prize_percent}%`
              }
            />
            <InfoTile
              icon={<Percent size={16} />}
              label="Winner %"
              value={`${game.ngn_winner_percent}%`}
            />
            <InfoTile
              icon={<FileText size={16} />}
              label="Questions"
              value={`${game.question_count} loaded`}
            />
          </div>
        </div>

        {/* ── Media & Sponsorship Card ─────────────────────────── */}
        {(game.music_url ||
          game.sponsor_video_url ||
          game.sponsor_logo_url) && (
          <div className="rounded-xl bg-white shadow-sm">
            <div className="flex items-center gap-2 border-b border-neutral-100 px-6 py-4">
              <Music size={16} className="text-neutral-500" />
              <p className="font-heading font-semibold text-neutral-800">
                Media & Sponsorship
              </p>
            </div>

            <div className="divide-y divide-neutral-50">
              {/* Background music */}
              {game.music_url && (
                <div className="px-6 py-4">
                  <div className="mb-3 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="bg-primary-50 flex h-8 w-8 items-center justify-center rounded-lg">
                        <Music size={14} className="text-primary-600" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-neutral-800">
                          Background Music
                        </p>
                        <p className="text-xs text-neutral-500">
                          {game.music_artist_name && game.music_track_title
                            ? `${game.music_track_title} — ${game.music_artist_name}`
                            : game.music_artist_name ||
                              game.music_track_title ||
                              'Track attached'}
                          {game.music_platform && (
                            <span className="ml-2 rounded bg-neutral-100 px-1.5 py-0.5 text-xs capitalize text-neutral-500">
                              {game.music_platform}
                            </span>
                          )}
                        </p>
                      </div>
                    </div>
                    <a
                      href={game.music_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary-600 flex items-center gap-1 text-xs hover:underline"
                    >
                      <ExternalLink size={12} /> Open
                    </a>
                  </div>

                  {/* Embed preview */}
                  {game.music_platform === 'soundcloud' && (
                    <iframe
                      width="100%"
                      height="80"
                      scrolling="no"
                      frameBorder="no"
                      allow="autoplay"
                      src={`https://w.soundcloud.com/player/?url=${encodeURIComponent(
                        game.music_url,
                      )}&color=%231a3a6b&auto_play=false&hide_related=true&show_comments=false&show_user=true&show_reposts=false`}
                      className="block rounded-lg"
                    />
                  )}
                  {game.music_platform === 'spotify' && (
                    <iframe
                      src={game.music_url.replace(
                        'open.spotify.com/',
                        'open.spotify.com/embed/',
                      )}
                      width="100%"
                      height="80"
                      frameBorder="0"
                      allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                      className="block rounded-lg"
                    />
                  )}
                  {game.music_platform === 'direct' && (
                    <audio controls className="mt-1 w-full">
                      <source src={game.music_url} />
                    </audio>
                  )}
                </div>
              )}

              {/* Post-game ad video */}
              {game.sponsor_video_url && (
                <div className="px-6 py-4">
                  <div className="mb-3 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-50">
                        <Video size={14} className="text-amber-600" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-neutral-800">
                          Post-Game Ad Video
                        </p>
                        <p className="text-xs text-neutral-500">
                          Plays before leaderboard reveal · max 30s
                        </p>
                      </div>
                    </div>
                    <a
                      href={game.sponsor_video_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-xs text-amber-600 hover:underline"
                    >
                      <ExternalLink size={12} /> Open
                    </a>
                  </div>
                  <video
                    src={game.sponsor_video_url}
                    controls
                    className="max-h-48 w-full rounded-lg bg-neutral-900 object-contain"
                    preload="metadata"
                  />
                </div>
              )}

              {/* Sponsor logo (if no video but logo exists and is sponsored) */}
              {game.is_sponsored &&
                game.sponsor_logo_url &&
                !game.sponsor_video_url && (
                  <div className="flex items-center gap-3 px-6 py-4">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-50">
                      <Building2 size={14} className="text-amber-600" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-neutral-800">
                        Sponsor Logo
                      </p>
                      <p className="text-xs text-neutral-500">
                        Displayed in lobby and loading screens
                      </p>
                    </div>
                    <img
                      src={game.sponsor_logo_url}
                      alt="Sponsor logo"
                      className="ml-auto h-12 w-12 rounded-lg border border-neutral-100 bg-neutral-50 object-contain p-1"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                    />
                  </div>
                )}
            </div>
          </div>
        )}

        {/* ── Questions Section ────────────────────────────────── */}
        <div className="rounded-xl bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-neutral-100 p-6">
            <div>
              <p className="font-heading font-semibold text-neutral-800">
                Questions
              </p>
              <p className="mt-0.5 text-sm text-neutral-500">
                Upload a CSV file to load questions for this game
              </p>
            </div>
            {canWrite && isScheduled && (
              <>
                <input
                  ref={fileRef}
                  type="file"
                  accept=".csv"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <button
                  onClick={() => fileRef.current?.click()}
                  disabled={uploading}
                  className="bg-primary-800 hover:bg-primary-700 flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold text-white transition disabled:opacity-50"
                >
                  <Upload size={15} />
                  {uploading ? 'Uploading…' : 'Upload CSV'}
                </button>
              </>
            )}
          </div>

          {canWrite && isScheduled && (
            <div className="border-b border-dashed border-neutral-100 bg-neutral-50 px-6 py-3">
              <p className="text-xs text-neutral-500">
                CSV format:{' '}
                <code className="rounded bg-neutral-200 px-1 py-0.5 text-xs">
                  question_text, option_a, option_b, option_c, option_d,
                  correct_option
                </code>{' '}
                where correct_option is a, b, c, or d
              </p>
            </div>
          )}

          <div className="divide-y divide-neutral-50">
            {isLoading ? (
              <div className="space-y-3 p-6">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div
                    key={i}
                    className="h-10 animate-pulse rounded-lg bg-neutral-100"
                  />
                ))}
              </div>
            ) : questionList.length === 0 ? (
              <div className="flex flex-col items-center justify-center gap-3 py-16 text-neutral-400">
                <FileText size={40} className="opacity-30" />
                <p className="text-sm">No Questions added yet</p>
                {canWrite && isScheduled && (
                  <p className="text-xs">Upload a CSV file to add questions</p>
                )}
              </div>
            ) : (
              questionList.map((q, index) => (
                <QuestionRow
                  key={q.id}
                  question={q}
                  index={index}
                  expanded={expandedQ === index}
                  onToggle={() =>
                    setExpandedQ(expandedQ === index ? null : index)
                  }
                />
              ))
            )}
          </div>

          {questionList.length > 0 && (
            <div className="border-t border-neutral-100 px-6 py-3">
              <p className="text-xs text-neutral-400">
                {questionList.length} question
                {questionList.length !== 1 ? 's' : ''} loaded
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Cancel Dialog */}
      <Dialog.Root open={showCancel} onOpenChange={setShowCancel}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm" />
          <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-2xl bg-white p-6 shadow-2xl">
            <Dialog.Title className="font-heading mb-1 text-lg font-semibold text-neutral-800">
              Cancel Game
            </Dialog.Title>
            <p className="mb-4 text-sm text-neutral-500">
              Players will be refunded their entry fees. This cannot be undone.
            </p>
            <textarea
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              placeholder="Reason for cancellation (required)"
              rows={3}
              className="focus:border-error-400 w-full resize-none rounded-xl border border-neutral-200 px-4 py-3 text-sm outline-none placeholder:text-neutral-400"
            />
            <div className="mt-4 flex gap-3">
              <button
                onClick={() => setShowCancel(false)}
                className="flex-1 rounded-full border border-neutral-200 py-2.5 text-sm font-medium text-neutral-600 transition hover:bg-neutral-50"
              >
                Keep Game
              </button>
              <button
                onClick={handleCancel}
                disabled={!cancelReason.trim() || cancelling}
                className="bg-error-600 hover:bg-error-700 flex-1 rounded-full py-2.5 text-sm font-semibold text-white transition disabled:opacity-50"
              >
                {cancelling ? 'Cancelling…' : 'Yes, Cancel Game'}
              </button>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </>
  );
}

// ─── Question Row ─────────────────────────────────────────────────────────────
const OPTION_KEYS = ['a', 'b', 'c', 'd'] as const;
const OPTION_LABELS = {
  a: 'Option A',
  b: 'Option B',
  c: 'Option C',
  d: 'Option D',
};

function QuestionRow({
  question,
  index,
  expanded,
  onToggle,
}: {
  question: Question;
  index: number;
  expanded: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="px-6 py-4">
      <button
        onClick={onToggle}
        className="flex w-full items-center justify-between text-left"
      >
        <p className="pr-4 text-sm font-medium text-neutral-800">
          <span className="mr-2 text-neutral-400">Q{index + 1}:</span>
          {question.question_text}
        </p>
        {expanded ? (
          <ChevronUp size={16} className="text-neutral-400" />
        ) : (
          <ChevronDown size={16} className="text-neutral-400" />
        )}
      </button>

      {expanded && (
        <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
          {OPTION_KEYS.map((key) => {
            const isCorrect = question.correct_option === key;
            const optionText = question[
              `option_${key}` as keyof Question
            ] as string;
            return (
              <div
                key={key}
                className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm ${
                  isCorrect
                    ? 'bg-positive-50 border-positive-200 border'
                    : 'border border-neutral-100 bg-neutral-50'
                }`}
              >
                {isCorrect ? (
                  <CheckCircle
                    size={14}
                    className="text-positive-600 shrink-0"
                  />
                ) : (
                  <XCircle size={14} className="shrink-0 text-neutral-300" />
                )}
                <span
                  className={`mr-1 font-medium ${
                    isCorrect ? 'text-positive-800' : 'text-neutral-400'
                  }`}
                >
                  {OPTION_LABELS[key]}:
                </span>
                <span
                  className={
                    isCorrect
                      ? 'text-positive-900 font-medium'
                      : 'text-neutral-600'
                  }
                >
                  {optionText}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── Info Tile ────────────────────────────────────────────────────────────────
function InfoTile({
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
      <p className="text-sm font-semibold text-neutral-800">{value}</p>
    </div>
  );
}
