/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { useCreateGame, useUpdateGame } from '@/app/lib/queries';
import { ROUTES } from '@/app/lib/routes';
import { Coins, Music, Building2, Trophy, Info } from 'lucide-react';
import { api } from '@/app/lib/api-client';
import type { Game, CreateGameInput } from '@/app/lib/types';

interface Props {
  mode: 'create' | 'edit';
  game?: Game;
}

type GameType = 'standard' | 'sponsored';
type MusicPlatform = 'soundcloud' | 'spotify' | 'direct';

function usePlatformDefaults() {
  return useQuery({
    queryKey: ['platform-settings-defaults'],
    queryFn: () =>
      api.get('/api/admin/settings').then((r) => r.data.data.settings),
    staleTime: 5 * 60_000,
  });
}

// ── SoundCloud URL → embed URL ────────────────────────────────────────────────
function toSoundCloudEmbed(url: string): string {
  if (!url) return '';
  // Already an embed URL
  if (url.includes('w.soundcloud.com')) return url;
  // Convert track URL to embed
  return `https://w.soundcloud.com/player/?url=${encodeURIComponent(
    url,
  )}&color=%231a3a6b&auto_play=true&hide_related=true&show_comments=false&show_user=true&show_reposts=false&show_teaser=false`;
}

// ── Spotify URL → embed URL ───────────────────────────────────────────────────
function toSpotifyEmbed(url: string): string {
  if (!url) return '';
  if (url.includes('open.spotify.com/embed')) return url;
  return url.replace('open.spotify.com/', 'open.spotify.com/embed/');
}

export default function GameForm({ mode, game }: Props) {
  const router = useRouter();
  const { mutate: createGame, isPending: creating } = useCreateGame();
  const { mutate: updateGame, isPending: updating } = useUpdateGame();
  const isPending = creating || updating;

  const { data: platformSettings, isLoading: loadingDefaults } =
    usePlatformDefaults();

  // ── Game type ─────────────────────────────────────────────────────────────
  const [gameType, setGameType] = useState<GameType>(
    game?.is_sponsored ? 'sponsored' : 'standard',
  );

  // ── Core form ─────────────────────────────────────────────────────────────
  const [form, setForm] = useState<Record<string, string> | null>(null);

  const defaultEntryFee =
    mode === 'edit' && game
      ? String(game.entry_fee_kobo / 100)
      : platformSettings
      ? String(platformSettings.standard_entry_fee_kobo / 100)
      : '200';

  const defaultPrizePct =
    mode === 'edit' && game
      ? String(game.prize_percent)
      : platformSettings
      ? String(platformSettings.prize_pool_pct)
      : '70';

  const initialised = form !== null;
  if (!initialised && (mode === 'edit' ? !!game : !loadingDefaults)) {
    setForm({
      title: game?.title ?? '',
      entry_fee: defaultEntryFee,
      prize_percent: defaultPrizePct,
      prize_pool_max: game?.prize_pool_max_kobo
        ? String(game.prize_pool_max_kobo / 100)
        : '',
      winner_count_percent: game ? String(game.winner_count_percent) : '30',
      winner_count_max: game ? String(game.winner_count_max) : '100',
      ngn_winner_percent: game ? String(game.ngn_winner_percent) : '70',
      qmcoin_prize_total: game ? String(game.qmcoin_prize_total) : '500',
      scheduled_date: game
        ? (() => {
            const wat = new Date(
              new Date(game.scheduled_start_time).getTime() + 60 * 60 * 1000,
            );
            return wat.toISOString().split('T')[0];
          })()
        : '',
      scheduled_start_time: game
        ? (() => {
            const wat = new Date(
              new Date(game.scheduled_start_time).getTime() + 60 * 60 * 1000,
            );
            return wat.toISOString().split('T')[1]?.slice(0, 5);
          })()
        : '',
      description: game?.description ?? '',
    });
  }

  const set = (key: string, val: string) =>
    setForm((f) => (f ? { ...f, [key]: val } : f));

  // ── Sponsorship fields ────────────────────────────────────────────────────
  const [sponsorName, setSponsorName] = useState(game?.sponsor_name ?? '');
  const [sponsorLogo, setSponsorLogo] = useState(game?.sponsor_logo_url ?? '');
  const [sponsorVideo, setSponsorVideo] = useState(
    game?.sponsor_video_url ?? '',
  );
  const [sponsorBoost, setSponsorBoost] = useState(
    game?.sponsor_prize_boost_kobo
      ? String(game.sponsor_prize_boost_kobo / 100)
      : '',
  );

  // ── Music fields ──────────────────────────────────────────────────────────
  const [musicUrl, setMusicUrl] = useState(game?.music_url ?? '');
  const [musicArtist, setMusicArtist] = useState(game?.music_artist_name ?? '');
  const [musicTrack, setMusicTrack] = useState(game?.music_track_title ?? '');
  const [musicPlatform, setMusicPlatform] = useState<MusicPlatform>(
    (game?.music_platform as MusicPlatform) ?? 'soundcloud',
  );

  // ── Preview state ─────────────────────────────────────────────────────────
  const [showMusicPreview, setShowMusicPreview] = useState(false);

  const buildScheduledTime = () => {
    if (!form) return '';
    if (!form.scheduled_date || !form.scheduled_start_time) return '';

    // Admin inputs Nigeria time (WAT = UTC+1)
    // Construct as UTC by subtracting the WAT offset (1 hour = 60 minutes)
    const [year, month, day] = form.scheduled_date.split('-').map(Number);
    const [hours, minutes] = form.scheduled_start_time.split(':').map(Number);

    // Build as UTC directly: Nigeria time minus 1 hour
    const utc = new Date(Date.UTC(year, month - 1, day, hours - 1, minutes, 0));
    return utc.toISOString();
  };

  const buildInput = (): CreateGameInput & Record<string, any> => ({
    title: form?.title || undefined,
    description: form?.description || undefined,
    entry_fee_kobo: Math.round(parseFloat(form?.entry_fee ?? '0') * 100),
    prize_percent: parseFloat(form?.prize_percent ?? '70'),
    prize_pool_max_kobo: form?.prize_pool_max
      ? Math.round(parseFloat(form.prize_pool_max) * 100)
      : undefined,
    winner_count_percent: parseFloat(form?.winner_count_percent ?? '30'),
    winner_count_max: parseInt(form?.winner_count_max ?? '100'),
    ngn_winner_percent: parseFloat(form?.ngn_winner_percent ?? '70'),
    qmcoin_prize_total: parseInt(form?.qmcoin_prize_total ?? '0') || 0,
    scheduled_start_time: buildScheduledTime(),
    // Sponsorship
    is_sponsored: gameType === 'sponsored',
    sponsor_name: gameType === 'sponsored' ? sponsorName || null : null,
    sponsor_logo_url: gameType === 'sponsored' ? sponsorLogo || null : null,
    sponsor_video_url: gameType === 'sponsored' ? sponsorVideo || null : null,
    sponsor_prize_boost_kobo:
      gameType === 'sponsored' && sponsorBoost
        ? Math.round(parseFloat(sponsorBoost) * 100)
        : null,
    // Music (available for both types)
    music_url: musicUrl || null,
    music_artist_name: musicArtist || null,
    music_track_title: musicTrack || null,
    music_platform: musicUrl ? musicPlatform : null,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form?.scheduled_date || !form?.scheduled_start_time) return;

    if (mode === 'create') {
      createGame(buildInput(), {
        onSuccess: (data) => router.push(ROUTES.GAME_ZONE_VIEW(data.id)),
      });
    } else if (game) {
      updateGame(
        { gameId: game.id, input: buildInput() },
        { onSuccess: () => router.push(ROUTES.GAME_ZONE_VIEW(game.id)) },
      );
    }
  };

  if (mode === 'create' && loadingDefaults) {
    return (
      <div className="space-y-4 rounded-xl bg-white p-6 shadow-sm">
        <div className="h-5 w-40 animate-pulse rounded bg-gray-100" />
        <div className="grid grid-cols-2 gap-5">
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className="h-10 animate-pulse rounded-lg bg-gray-100"
            />
          ))}
        </div>
      </div>
    );
  }

  if (!form) return null;

  // Embed preview URL
  const embedUrl = musicUrl
    ? musicPlatform === 'soundcloud'
      ? toSoundCloudEmbed(musicUrl)
      : musicPlatform === 'spotify'
      ? toSpotifyEmbed(musicUrl)
      : musicUrl
    : '';

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* ── Game Type Toggle ──────────────────────────────────── */}
      <div className="rounded-xl bg-white p-6 shadow-sm">
        <p className="font-heading mb-4 font-semibold text-neutral-700">
          Game Type
        </p>
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => setGameType('standard')}
            className={`flex items-center gap-3 rounded-xl border-2 p-4 text-left transition-all ${
              gameType === 'standard'
                ? 'border-primary-500 bg-primary-50'
                : 'border-neutral-200 hover:border-neutral-300'
            }`}
          >
            <div
              className={`flex h-9 w-9 items-center justify-center rounded-lg ${
                gameType === 'standard' ? 'bg-primary-100' : 'bg-neutral-100'
              }`}
            >
              <Trophy
                size={18}
                className={
                  gameType === 'standard'
                    ? 'text-primary-700'
                    : 'text-neutral-400'
                }
              />
            </div>
            <div>
              <p
                className={`text-sm font-semibold ${
                  gameType === 'standard'
                    ? 'text-primary-800'
                    : 'text-neutral-700'
                }`}
              >
                Standard Game
              </p>
              <p className="mt-0.5 text-xs text-neutral-500">
                Prize pool from entry fees
              </p>
            </div>
          </button>

          <button
            type="button"
            onClick={() => setGameType('sponsored')}
            className={`flex items-center gap-3 rounded-xl border-2 p-4 text-left transition-all ${
              gameType === 'sponsored'
                ? 'border-amber-500 bg-amber-50'
                : 'border-neutral-200 hover:border-neutral-300'
            }`}
          >
            <div
              className={`flex h-9 w-9 items-center justify-center rounded-lg ${
                gameType === 'sponsored' ? 'bg-amber-100' : 'bg-neutral-100'
              }`}
            >
              <Building2
                size={18}
                className={
                  gameType === 'sponsored'
                    ? 'text-amber-700'
                    : 'text-neutral-400'
                }
              />
            </div>
            <div>
              <p
                className={`text-sm font-semibold ${
                  gameType === 'sponsored'
                    ? 'text-amber-800'
                    : 'text-neutral-700'
                }`}
              >
                Sponsored Game
              </p>
              <p className="mt-0.5 text-xs text-neutral-500">
                Brand sponsor, custom prize pool
              </p>
            </div>
          </button>
        </div>

        {gameType === 'sponsored' && (
          <div className="mt-3 flex items-start gap-2 rounded-lg border border-amber-100 bg-amber-50 px-3 py-2.5">
            <Info size={14} className="mt-0.5 shrink-0 text-amber-600" />
            <p className="text-xs text-amber-700">
              Sponsored games: platform keeps 100% of entry fees. Prize pool
              comes entirely from the sponsor boost amount you set below.
            </p>
          </div>
        )}
      </div>

      {/* ── Core Game Details ─────────────────────────────────── */}
      <div className="rounded-xl bg-white p-6 shadow-sm">
        <div className="mb-6 flex items-center justify-between">
          <p className="font-heading font-semibold text-neutral-700">
            Game Details
          </p>
          {mode === 'create' && platformSettings && (
            <span className="rounded-full bg-blue-50 px-3 py-1 text-xs text-blue-600">
              Defaults from Platform Settings
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <Field label="Game Name">
            <input
              value={form.title}
              onChange={(e) => set('title', e.target.value)}
              placeholder="Monday Night Trivia"
              className={inputCls}
            />
          </Field>

          <Field label="Entry Fee (₦)">
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 font-semibold text-neutral-400">
                ₦
              </span>
              <input
                type="number"
                value={form.entry_fee}
                onChange={(e) => set('entry_fee', e.target.value)}
                placeholder="200"
                required
                className={`${inputCls} pl-7`}
              />
            </div>
            {mode === 'create' && platformSettings && (
              <p className="mt-1 text-xs text-gray-400">
                Standard: ₦
                {(
                  platformSettings.standard_entry_fee_kobo / 100
                ).toLocaleString()}{' '}
                · Saturday: ₦
                {(
                  platformSettings.saturday_entry_fee_kobo / 100
                ).toLocaleString()}
              </p>
            )}
            {gameType === 'sponsored' && (
              <p className="mt-1 text-xs text-amber-600">
                Platform keeps 100% of entry fees for sponsored games
              </p>
            )}
          </Field>

          {/* Prize pool % — hidden for sponsored (prize comes from boost) */}
          {gameType === 'standard' && (
            <Field label="Prize Pool % (of entry fees collected)">
              <input
                type="number"
                value={form.prize_percent}
                onChange={(e) => set('prize_percent', e.target.value)}
                placeholder="70"
                required
                className={inputCls}
              />
              {mode === 'create' && platformSettings && (
                <p className="mt-1 text-xs text-gray-400">
                  Default: {platformSettings.prize_pool_pct}% prize /{' '}
                  {platformSettings.platform_cut_pct}% platform
                </p>
              )}
            </Field>
          )}

          <Field label="Max Prize Pool Cap (₦, optional)">
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 font-semibold text-neutral-400">
                ₦
              </span>
              <input
                type="number"
                value={form.prize_pool_max}
                onChange={(e) => set('prize_pool_max', e.target.value)}
                placeholder="Leave blank for no cap"
                className={`${inputCls} pl-7`}
              />
            </div>
          </Field>

          <Field label="QM Coin Prize Total">
            <div className="relative">
              <Coins
                size={14}
                className="text-warning-500 absolute left-3 top-1/2 -translate-y-1/2"
              />
              <input
                type="number"
                value={form.qmcoin_prize_total}
                onChange={(e) => set('qmcoin_prize_total', e.target.value)}
                placeholder="2500"
                className={`${inputCls} pl-8`}
              />
            </div>
          </Field>

          <Field label="Winner % (top % of players win NGN)">
            <input
              type="number"
              value={form.ngn_winner_percent}
              onChange={(e) => set('ngn_winner_percent', e.target.value)}
              placeholder="70"
              required
              className={inputCls}
            />
          </Field>

          <Field label="Game Date (Nigeria Time)">
            <input
              type="date"
              value={form.scheduled_date}
              onChange={(e) => set('scheduled_date', e.target.value)}
              required
              className={inputCls}
            />
          </Field>

          <Field label="Game Time (Nigeria Time)">
            <input
              type="time"
              value={form.scheduled_start_time}
              onChange={(e) => set('scheduled_start_time', e.target.value)}
              required
              className={inputCls}
            />
          </Field>

          <Field label="Game Description" className="sm:col-span-2">
            <textarea
              value={form.description}
              onChange={(e) => set('description', e.target.value)}
              placeholder="Type something here"
              rows={3}
              className={`${inputCls} resize-none`}
            />
          </Field>
        </div>
      </div>

      {/* ── Sponsorship Details (sponsored games only) ────────── */}
      {gameType === 'sponsored' && (
        <div className="rounded-xl border-l-4 border-amber-400 bg-white p-6 shadow-sm">
          <div className="mb-5 flex items-center gap-2">
            <Building2 size={16} className="text-amber-600" />
            <p className="font-heading font-semibold text-neutral-700">
              Sponsor Details
            </p>
            <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs text-amber-700">
              Required for sponsored games
            </span>
          </div>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <Field label="Sponsor / Brand Name" className="sm:col-span-2">
              <input
                value={sponsorName}
                onChange={(e) => setSponsorName(e.target.value)}
                placeholder="e.g. Pepsi Nigeria"
                className={inputCls}
              />
            </Field>

            <Field label="Sponsor Logo URL">
              <input
                value={sponsorLogo}
                onChange={(e) => setSponsorLogo(e.target.value)}
                placeholder="https://cdn.brand.com/logo.png"
                className={inputCls}
              />
              <p className="mt-1 text-xs text-gray-400">
                Shown in game lobby and loading screens
              </p>
            </Field>

            <Field label="Sponsor Prize Boost (₦)">
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 font-semibold text-neutral-400">
                  ₦
                </span>
                <input
                  type="number"
                  value={sponsorBoost}
                  onChange={(e) => setSponsorBoost(e.target.value)}
                  placeholder="e.g. 1500000 for ₦1.5M"
                  className={`${inputCls} pl-7`}
                />
              </div>
              <p className="mt-1 text-xs text-gray-400">
                Amount sponsor pays into the prize pool. Platform keeps the rest
                of sponsor fee.
              </p>
              {sponsorBoost && (
                <p className="mt-1 text-xs font-medium text-amber-700">
                  Prize pool: ₦{Number(sponsorBoost).toLocaleString()}
                </p>
              )}
            </Field>

            <Field label="Post-Game Ad Video URL" className="sm:col-span-2">
              <input
                value={sponsorVideo}
                onChange={(e) => setSponsorVideo(e.target.value)}
                placeholder="https://cdn.brand.com/ad-video.mp4 (direct MP4, max 30s)"
                className={inputCls}
              />
              <p className="mt-1 text-xs text-gray-400">
                Direct MP4 link only. Played after game ends, before leaderboard
                reveal. Max 30 seconds. The mobile app will pre-fetch this video
                before the game ends to avoid loading delays.
              </p>
            </Field>
          </div>

          {/* Sponsor preview */}
          {(sponsorLogo || sponsorName) && (
            <div className="mt-4 flex items-center gap-3 rounded-xl border border-amber-100 bg-amber-50 p-3">
              {sponsorLogo && (
                <img
                  src={sponsorLogo}
                  alt=""
                  className="h-10 w-10 rounded-lg border border-amber-100 bg-white object-contain p-1"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />
              )}
              <div>
                <p className="text-xs font-medium text-amber-600">
                  Lobby preview
                </p>
                <p className="text-sm font-semibold text-amber-900">
                  {form.title || 'Game Title'}{' '}
                  <span className="font-normal text-amber-700">
                    presented by
                  </span>{' '}
                  {sponsorName || 'Sponsor'}
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── Background Music (optional for all games) ─────────── */}
      <div className="rounded-xl bg-white p-6 shadow-sm">
        <div className="mb-1 flex items-center gap-2">
          <Music size={16} className="text-neutral-500" />
          <p className="font-heading font-semibold text-neutral-700">
            Background Music
          </p>
          <span className="rounded-full bg-neutral-100 px-2 py-0.5 text-xs text-neutral-500">
            Optional
          </span>
        </div>
        <p className="mb-5 text-xs text-neutral-500">
          Plays during the live game. Artists can promote their tracks — revenue
          opportunity.
        </p>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <Field label="Music Platform">
            <div className="flex gap-2">
              {(['soundcloud', 'spotify', 'direct'] as MusicPlatform[]).map(
                (p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setMusicPlatform(p)}
                    className={`flex-1 rounded-lg border py-2 text-xs font-medium capitalize transition-colors ${
                      musicPlatform === p
                        ? 'border-primary-500 bg-primary-50 text-primary-700'
                        : 'border-neutral-200 text-neutral-500 hover:bg-neutral-50'
                    }`}
                  >
                    {p === 'direct'
                      ? 'Direct URL'
                      : p.charAt(0).toUpperCase() + p.slice(1)}
                  </button>
                ),
              )}
            </div>
          </Field>

          <Field label="Artist Name">
            <input
              value={musicArtist}
              onChange={(e) => setMusicArtist(e.target.value)}
              placeholder="e.g. Burna Boy"
              className={inputCls}
            />
          </Field>

          <Field label="Track Title">
            <input
              value={musicTrack}
              onChange={(e) => setMusicTrack(e.target.value)}
              placeholder="e.g. Last Last"
              className={inputCls}
            />
          </Field>

          <Field
            label={
              musicPlatform === 'soundcloud'
                ? 'SoundCloud Track URL'
                : musicPlatform === 'spotify'
                ? 'Spotify Track URL'
                : 'Direct Audio URL (MP3)'
            }
          >
            <input
              value={musicUrl}
              onChange={(e) => setMusicUrl(e.target.value)}
              placeholder={
                musicPlatform === 'soundcloud'
                  ? 'https://soundcloud.com/artist/track-name'
                  : musicPlatform === 'spotify'
                  ? 'https://open.spotify.com/track/...'
                  : 'https://cdn.example.com/track.mp3'
              }
              className={inputCls}
            />
            {musicPlatform === 'soundcloud' && (
              <p className="mt-1 text-xs text-gray-400">
                Paste the SoundCloud track URL — will auto-convert to embed
              </p>
            )}
            {musicPlatform === 'spotify' && (
              <p className="mt-1 text-xs text-amber-600">
                Note: Spotify autoplay may be blocked on some devices.
                SoundCloud is recommended.
              </p>
            )}
          </Field>
        </div>

        {/* Music preview */}
        {musicUrl && embedUrl && (
          <div className="mt-4">
            <button
              type="button"
              onClick={() => setShowMusicPreview((p) => !p)}
              className="text-primary-600 mb-2 text-xs hover:underline"
            >
              {showMusicPreview ? 'Hide preview' : 'Preview embed'}
            </button>
            {showMusicPreview && (
              <div className="overflow-hidden rounded-xl border border-neutral-200">
                {musicPlatform === 'soundcloud' && (
                  <iframe
                    width="100%"
                    height="80"
                    scrolling="no"
                    frameBorder="no"
                    allow="autoplay"
                    src={embedUrl}
                    className="block"
                  />
                )}
                {musicPlatform === 'spotify' && (
                  <iframe
                    src={embedUrl}
                    width="100%"
                    height="80"
                    frameBorder="0"
                    allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                    className="block"
                  />
                )}
                {musicPlatform === 'direct' && (
                  <audio controls className="w-full bg-neutral-50 p-2">
                    <source src={embedUrl} />
                    Your browser does not support audio.
                  </audio>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── Submit ────────────────────────────────────────────── */}
      <button
        type="submit"
        disabled={isPending}
        className="bg-primary-800 hover:bg-primary-700 rounded-full px-8 py-3 text-sm font-semibold text-white transition disabled:opacity-50"
      >
        {isPending
          ? 'Saving…'
          : mode === 'create'
          ? 'Create Game'
          : 'Save Changes'}
      </button>
    </form>
  );
}

const inputCls =
  'w-full rounded-lg border border-neutral-200 px-3 py-2.5 text-sm text-neutral-800 outline-none focus:border-primary-400 placeholder:text-neutral-400 bg-neutral-50';

function Field({
  label,
  children,
  className = '',
}: {
  label: string | React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={className}>
      <label className="mb-1.5 block text-sm font-medium text-neutral-600">
        {label}
      </label>
      {children}
    </div>
  );
}
