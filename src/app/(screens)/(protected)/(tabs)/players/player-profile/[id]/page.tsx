/* eslint-disable @next/next/no-img-element */
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';
import { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import {
  ArrowLeft,
  Flag,
  Trash2,
  Edit2,
  BadgeCheck,
  CheckCircle2,
  XCircle,
  Coins,
  Wallet,
  Search,
  Filter,
  Facebook,
  Twitter,
  Instagram,
} from 'lucide-react';
import { usePlayer, usePlayerFinancials } from '@/app/lib/queries';
import { formatDate, formatDateTime, formatNaira } from '@/app/lib/utils';
import { ROUTES } from '@/app/lib/routes';
import { useAuthStore } from '@/app/lib/auth-store';
import { hasPermission } from '@/app/lib/permissions';
import { TikTokIcon } from '@/app/components/screens/player/TikTokIcon';
import { InfoRow } from '@/app/components/screens/player/InfoRow';
import { SuspendDialog } from '@/app/components/screens/player/SuspendDialog';
import { DeleteDialog } from '@/app/components/screens/player/DeleteDialog';
import { EditProfileModal } from '@/app/components/screens/player/EditProfileModal';
import { TxDetailModal } from '@/app/components/screens/player/TxDetailModal';
import { GameDetailModal } from '@/app/components/screens/player/GameDetailModal';
import { EraserIcon, QmCoinIcon } from '@/app/icons/icons';
import { Button } from '@/app/components/ui/button';

export default function PlayerProfilePage() {
  const router = useRouter();
  const params = useParams();
  const playerId = params.id as string;
  const { user } = useAuthStore();
  const canWrite = hasPermission(
    user?.role ?? 'read_only_admin',
    'players.write',
  );

  const [showSuspend, setShowSuspend] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [selectedTx, setSelectedTx] = useState<any>(null);
  const [selectedGame, setSelectedGame] = useState<any>(null);
  const [txSearch, setTxSearch] = useState('');

  const { data: player, isLoading } = usePlayer(playerId);
  const { data: financials, isLoading: finLoading } =
    usePlayerFinancials(playerId);

  if (isLoading)
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
      </div>
    );
  if (!player)
    return (
      <div className="p-6 text-center text-gray-400">Player not found</div>
    );

  const isSuspended = !player.is_active;
  const walletBal = financials?.wallet?.ngn_balance ?? 0;
  const qmBal = financials?.wallet?.qmcoin_balance ?? 0;
  const eraserCount = (financials as any)?.eraser_count ?? 0;

  // ── Game history straight from financials ──────────────────────────────────
  const games: any[] = financials?.games ?? [];

  // ── Transactions ───────────────────────────────────────────────────────────
  const allTx: any[] = financials?.recent_transactions ?? [];
  const transactions = txSearch
    ? allTx.filter(
        (t) =>
          t.id?.includes(txSearch) ||
          (t.description ?? '').toLowerCase().includes(txSearch.toLowerCase()),
      )
    : allTx;

  return (
    <div className="space-y-6 p-6">
      {/* ── Top bar ── */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => router.back()}
          className="hover: flex items-center gap-1.5 text-sm text-gray-500"
        >
          <ArrowLeft className="h-4 w-4" /> Go Back
        </button>
        {canWrite && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowSuspend(true)}
              className={`flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-sm font-medium ${
                isSuspended
                  ? 'border-yellow-200 bg-yellow-50 text-yellow-700'
                  : 'border-red-200 bg-red-50 text-red-500'
              }`}
            >
              <Flag className="h-3.5 w-3.5" />
              {isSuspended ? 'Unsuspend User' : 'Suspend User'}
            </button>
            <button
              onClick={() => setShowEdit(true)}
              className="flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              <Edit2 className="h-3.5 w-3.5" /> Edit Profile
            </button>
            <Button
              variant="destructive"
              onClick={() => setShowDelete(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium"
            >
              <Trash2 className="h-3.5 w-3.5" /> Delete User
            </Button>
          </div>
        )}
      </div>

      {/* ── Two-column layout ── */}
      <div className="grid grid-cols-5 items-start gap-6">
        {/* ══ LEFT (2/5) ══ */}
        <div className="col-span-2 space-y-4">
          {/* Profile Details */}
          <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-start justify-between">
              <h2 className="font-semibold ">Profile Details</h2>
              <div className="text-right">
                <p className="text-xs leading-tight text-gray-400">User ID</p>
                <p className="font-mono text-xs font-semibold text-gray-600">
                  {'ID' +
                    player.id?.replace(/-/g, '').slice(0, 7).toUpperCase()}
                </p>
              </div>
            </div>
            {/* Avatar */}
            <div className="mb-3 flex items-center gap-3 border-b border-gray-50 pb-3">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-blue-400 to-blue-700 text-lg font-bold text-white">
                {player.avatar_url ? (
                  <img
                    src={player.avatar_url}
                    alt=""
                    className="h-full w-full object-cover"
                  />
                ) : (
                  (player.username?.[0] ?? '?').toUpperCase()
                )}
              </div>
              <div className="flex min-w-0 flex-wrap items-center gap-1.5">
                <span className="truncate font-semibold text-gray-900">
                  {player.username}
                </span>
                {player.verifications?.phone_verified &&
                  player.verifications?.bvn_verified && (
                    <BadgeCheck className="text-primary-800 h-4 w-4 shrink-0" />
                  )}
                {isSuspended && (
                  <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs text-red-600">
                    Suspended
                  </span>
                )}
              </div>
            </div>
            <InfoRow label="First name">{player.first_name ?? '—'}</InfoRow>
            <InfoRow label="Last name">{player.last_name ?? '—'}</InfoRow>
            <InfoRow label="Email Address">
              <span className="truncate">{player.email}</span>
            </InfoRow>
            <InfoRow label="Date of Birth">
              {player.date_of_birth ? formatDate(player.date_of_birth) : '—'}
            </InfoRow>
            <InfoRow label="Gender">{player.gender ?? '—'}</InfoRow>
            <InfoRow label="Country">
              <span className="flex items-center gap-1">🇳🇬 Nigeria</span>
            </InfoRow>
            <InfoRow label="Referred By">
              {player.referred_by ?? 'Null'}
            </InfoRow>
          </div>

          {/* KYC */}
          <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
            <h2 className="mb-3 font-semibold ">KYC Document</h2>
            <div className="space-y-4">
              {[
                {
                  label: 'Verified Phone Number',
                  v: !!player.verifications?.phone_verified,
                  d: player.verifications?.phone_verified_at,
                },
                {
                  label: 'Bank Verification Number (BVN)',
                  v: !!player.verifications?.bvn_verified,
                  d: player.verifications?.bvn_verified_at,
                },
              ].map(({ label, v, d }) => (
                <div
                  key={label}
                  className="flex items-center justify-between gap-2"
                >
                  <div>
                    <p className="text-sm font-medium leading-tight text-gray-700">
                      {label}
                    </p>
                    {d && (
                      <p className="text-xs text-gray-400">
                        Uploaded on {formatDate(d)}
                      </p>
                    )}
                  </div>
                  <span
                    className={`flex shrink-0 items-center gap-1 rounded-full px-2 py-1 text-xs font-medium ${
                      v
                        ? 'bg-green-100 text-green-700'
                        : 'bg-red-50 text-red-500'
                    }`}
                  >
                    {v ? (
                      <>
                        <CheckCircle2 className="h-3 w-3" /> Verified
                      </>
                    ) : (
                      <>
                        <XCircle className="h-3 w-3" /> Not Verified
                      </>
                    )}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Socials */}
          <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
            <h2 className="mb-3 font-semibold ">Socials</h2>
            <div className="space-y-2.5">
              {[
                {
                  icon: <Facebook className="h-4 w-4" />,
                  val: player.social_facebook,
                  label: 'Facebook',
                },
                {
                  icon: <Instagram className="h-4 w-4" />,
                  val: player.social_instagram,
                  label: 'Instagram',
                },
                {
                  icon: <Twitter className="h-4 w-4" />,
                  val: player.social_twitter,
                  label: 'X Twitter',
                },
                {
                  icon: <TikTokIcon />,
                  val: player.social_tiktok,
                  label: 'TikTok',
                },
              ].map(({ icon, val, label }) => (
                <div key={label} className="flex items-center gap-2">
                  <span className="text-primary-800 shrink-0">{icon}</span>
                  {val ? (
                    <a
                      href={val}
                      target="_blank"
                      rel="noreferrer"
                      className="truncate text-xs text-blue-600 hover:underline"
                    >
                      {val}
                    </a>
                  ) : (
                    <span className="text-xs text-gray-400">@______</span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Bank — placeholder */}
          <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
            <h2 className="mb-3 font-semibold ">Bank</h2>
            <p className="text-sm text-gray-400">No bank account linked</p>
          </div>

          {/* Leaderboard stats */}
          <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="font-semibold ">Rank on Leaderboard</h2>
              <button
                onClick={() => router.push(ROUTES.LEADERBOARD)}
                className="rounded-lg border border-blue-200 px-3 py-1 text-xs text-blue-600 hover:bg-blue-50"
              >
                View Leaderboard
              </button>
            </div>
            <div className="grid grid-cols-4 gap-2">
              {[
                { icon: '🏆', top: '1st Position' },
                {
                  icon: '🎮',
                  top: `${financials?.stats?.games_played ?? 0} games`,
                },
                {
                  icon: '💰',
                  top: formatNaira(financials?.stats?.total_ngn_won_kobo ?? 0),
                },
                {
                  icon: <QmCoinIcon />,
                  top: `+${financials?.stats?.total_qmcoin_won ?? 0} coins`,
                },
              ].map(({ icon, top }, idx) => (
                <div
                  key={idx}
                  className="grid gap-1 rounded-xl bg-gray-50 p-2 text-center"
                >
                  <div className="mb-0.5 flex items-center justify-center">
                    {icon}
                  </div>
                  <p className="truncate text-xs font-bold leading-tight ">
                    {top}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Actions */}
          {canWrite && (
            <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
              <h2 className="mb-3 font-semibold ">Action</h2>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setShowSuspend(true)}
                  className={`flex items-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-medium ${
                    isSuspended
                      ? 'border-yellow-200 bg-yellow-50 text-yellow-700'
                      : 'border-red-200 bg-red-50 text-red-600'
                  }`}
                >
                  <Flag className="h-3 w-3" />
                  {isSuspended ? 'Unsuspend User' : 'Suspend User'}
                </button>
                <Button
                  variant="destructive"
                  onClick={() => setShowDelete(true)}
                  className="flex items-center gap-1.5 rounded-lg bg-gray-800 px-3 py-2 text-xs font-medium text-white"
                >
                  <Trash2 className="h-3 w-3" /> Delete User
                </Button>
                <button
                  onClick={() => setShowEdit(true)}
                  className="flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-2 text-xs font-medium text-gray-700"
                >
                  <Edit2 className="h-3 w-3" /> Edit Profile
                </button>
              </div>
            </div>
          )}
        </div>

        {/* ══ RIGHT (3/5) ══ */}
        <div className="col-span-3 space-y-4">
          {/* Game History */}
          <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
            <div className="border-b border-gray-50 px-5 py-4">
              <h2 className="font-semibold ">Game History</h2>
            </div>
            <table className="w-full overflow-auto text-sm">
              <thead>
                <tr className="border-b border-gray-50 text-left text-xs uppercase tracking-wide text-gray-500">
                  <th className="px-5 py-3 font-medium">Game</th>
                  <th className="px-5 py-3 font-medium">Score</th>
                  <th className="px-5 py-3 font-medium">Rewards</th>
                  <th className="px-5 py-3 font-medium">Result</th>
                  <th className="px-5 py-3 font-medium">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {finLoading ? (
                  Array.from({ length: 4 }).map((_, i) => (
                    <tr key={i}>
                      {Array.from({ length: 5 }).map((_, j) => (
                        <td key={j} className="px-5 py-3">
                          <div className="h-4 animate-pulse rounded bg-gray-100" />
                        </td>
                      ))}
                    </tr>
                  ))
                ) : games.length === 0 ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="py-10 text-center text-sm text-gray-400"
                    >
                      No game history
                    </td>
                  </tr>
                ) : (
                  games.map((g: any) => (
                    <tr key={g.id ?? g.game_id} className="hover:bg-gray-50">
                      <td className="px-5 py-3">
                        <p className="font-mono text-xs text-neutral-700">
                          {'ID' +
                            (g.game_id ?? g.id ?? '')
                              .replace(/-/g, '')
                              .slice(0, 7)
                              .toUpperCase()}
                        </p>{' '}
                        <p className="max-w-30 truncatee text-xs text-neutral-500">
                          {formatDate(g.scheduled_start_time)}
                        </p>
                      </td>
                      <td className="px-5 py-3">
                        <p className="text-sm">{g.score}/10</p>
                      </td>
                      <td className="px-5 py-3">
                        {g.prize_won ? (
                          <span className="rounded-full bg-green-50 px-2 py-1 text-xs font-semibold text-green-700">
                            {formatNaira(g.prize_won)}
                          </span>
                        ) : g.qm_coins_won ? (
                          <span className="rounded-full bg-yellow-50 px-2 py-1 text-xs font-semibold text-yellow-700">
                            +{g.qm_coins_won} QMC
                          </span>
                        ) : (
                          <span className="rounded-full bg-gray-100 px-2 py-1 text-xs text-gray-400">
                            Nil
                          </span>
                        )}
                      </td>
                      <td className="px-5 py-3">
                        <span
                          className={`rounded-full px-2 py-1 text-xs font-semibold ${
                            g.status_label === 'won'
                              ? 'bg-positive-100 text-positive-800'
                              : 'bg-warning-100 text-warning-800'
                          }`}
                        >
                          {g.status_label === 'won' ? 'Won' : 'Played'}
                        </span>
                      </td>
                      <td className="px-5 py-3">
                        <Button
                          size="sm"
                          variant="link"
                          className="items-left px-0 text-left text-xs"
                          onClick={() =>
                            router.push(
                              `/players/player-profile/${playerId}/game-history/${
                                g.game_id ?? g.id
                              }`,
                            )
                          }
                        >
                          View game
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Wallet / Erasers / QM Coins */}
          <div className="grid grid-cols-3 gap-4">
            <div className="flex items-center gap-3 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
              <div className="bg-primary-50 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl">
                <Wallet className="text-primary-600 h-5 w-5" />
              </div>
              <div>
                <p className="text-xs text-gray-500">Wallet Balance</p>
                <p className="text-primary-700 font-bold">
                  {formatNaira(walletBal)}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
              <div className="bg-warning-50 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-xl">
                <EraserIcon />
              </div>
              <div>
                <p className="text-xs text-gray-500">Erasers</p>
                <p className="font-bold ">{eraserCount}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
              <div className="bg-warning-50 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl">
                <QmCoinIcon />
              </div>
              <div>
                <p className="text-xs text-gray-500">QM Coin</p>
                <p className="text-warning-800 font-bold">
                  {qmBal.toLocaleString()} coins
                </p>
              </div>
            </div>
          </div>

          {/* Transaction History */}
          <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
            <div className="flex items-center justify-between border-b border-gray-50 px-5 py-4">
              <h2 className="font-semibold ">Transaction History</h2>
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="absolute left-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-gray-400" />
                  <input
                    value={txSearch}
                    onChange={(e) => setTxSearch(e.target.value)}
                    placeholder="Search"
                    className="rounded-lg border border-gray-200 py-1.5 pl-7 pr-3 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                <button className="flex items-center gap-1 rounded-lg border border-gray-200 px-2 py-1.5 text-xs text-gray-600 hover:bg-gray-50">
                  <Filter className="h-3 w-3" /> Filter by
                </button>
              </div>
            </div>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-50 text-left text-xs uppercase tracking-wide text-gray-500">
                  <th className="px-5 py-3 font-medium">Transaction ID</th>
                  <th className="px-5 py-3 font-medium">Transaction Type</th>
                  <th className="px-5 py-3 font-medium">Amount</th>
                  <th className="px-5 py-3 font-medium">Date & Time</th>
                  <th className="px-5 py-3 font-medium">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {transactions.length === 0 ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="py-10 text-center text-sm text-gray-400"
                    >
                      No transactions
                    </td>
                  </tr>
                ) : (
                  transactions.map((tx: any) => {
                    const isCredit =
                      tx.direction === 'credit' ||
                      tx.type === 'deposit' ||
                      tx.type === 'wallet_topup';
                    return (
                      <tr key={tx.id} className="hover:bg-gray-50">
                        <td className="px-5 py-3">
                          <div className="flex items-center gap-2">
                            <div
                              className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                                isCredit
                                  ? 'bg-green-100 text-green-600'
                                  : 'bg-red-100 text-red-500'
                              }`}
                            >
                              {isCredit ? '↓' : '↑'}
                            </div>
                            <span className="font-mono text-xs text-gray-500">
                              {tx.id?.slice(0, 10)}
                            </span>
                          </div>
                        </td>
                        <td className="px-5 py-3 text-sm capitalize text-gray-700">
                          {(tx.description ?? tx.type ?? '—').replace(
                            /_/g,
                            ' ',
                          )}
                        </td>
                        <td
                          className={`px-5 py-3 text-sm font-semibold ${
                            isCredit ? 'text-green-600' : 'text-red-500'
                          }`}
                        >
                          {isCredit ? '+' : '-'}
                          {formatNaira(tx.amount ?? tx.amount_kobo ?? 0)}
                        </td>
                        <td className="px-5 py-3 text-xs text-gray-500">
                          {formatDateTime(tx.created_at)}
                        </td>
                        <td className="px-5 py-3">
                          <button
                            onClick={() => setSelectedTx(tx)}
                            className="rounded-lg bg-blue-600 px-3 py-1.5 text-xs text-white hover:bg-blue-700"
                          >
                            View Details
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* ── Modals ── */}
      {showSuspend && (
        <SuspendDialog
          playerId={playerId}
          isSuspended={isSuspended}
          onClose={() => setShowSuspend(false)}
        />
      )}
      {showDelete && (
        <DeleteDialog
          playerId={playerId}
          onClose={() => setShowDelete(false)}
          onDeleted={() => router.push(ROUTES.PLAYERS)}
        />
      )}
      {showEdit && (
        <EditProfileModal player={player} onClose={() => setShowEdit(false)} />
      )}
      {selectedTx && (
        <TxDetailModal tx={selectedTx} onClose={() => setSelectedTx(null)} />
      )}
      {selectedGame && (
        <GameDetailModal
          game={selectedGame}
          onClose={() => setSelectedGame(null)}
        />
      )}
    </div>
  );
}
