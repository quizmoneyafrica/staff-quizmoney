'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useGames, useCancelGame } from '@/app/lib/queries';
import {
  formatNaira,
  formatNigeriaTime,
  GAME_STATUS_COLORS,
  GAME_STATUS_LABELS,
} from '@/app/lib/utils';
import { useAuthStore } from '@/app/lib/auth-store';
import { hasPermission } from '@/app/lib/permissions';
import { ROUTES } from '@/app/lib/routes';
import { Search, Trash2, Plus, SlidersHorizontal } from 'lucide-react';
import * as Dialog from '@radix-ui/react-dialog';
import { motion } from 'framer-motion';
import type { Game, GameStatus } from '@/app/lib/types';
import { Button } from '@/app/components/ui/button';
import { DropdownMenu } from 'radix-ui';

const STATUS_FILTERS: { label: string; value: GameStatus | 'all' }[] = [
  { label: 'All', value: 'all' },
  { label: 'Scheduled', value: 'scheduled' },
  { label: 'Active', value: 'active' },
  { label: 'Finished', value: 'finished' },
  { label: 'Cancelled', value: 'cancelled' },
];

export default function GameZonePage() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const canWrite = user ? hasPermission(user.role, 'games.write') : false;

  const [search, setSearch] = useState('');
  const [deleteTarget, setDeleteTarget] = useState<Game | null>(null);
  const [statusFilter, setStatusFilter] = useState<GameStatus | 'all'>('all');

  const { data, isLoading } = useGames({
    limit: 10,
    status: statusFilter === 'all' ? undefined : statusFilter,
  });
  const { mutate: cancelGame, isPending: cancelling } = useCancelGame();

  const games = (data?.games ?? []).filter((g) =>
    search
      ? g.title?.toLowerCase().includes(search.toLowerCase()) ||
        g.id.includes(search)
      : true,
  );

  const handleDelete = () => {
    if (!deleteTarget) return;
    cancelGame(
      { gameId: deleteTarget.id, reason: 'Cancelled by admin' },
      { onSuccess: () => setDeleteTarget(null) },
    );
  };

  return (
    <>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <p className="font-heading text-lg font-semibold text-neutral-800">
            All available Game
          </p>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search
                size={14}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400"
              />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search game.."
                className="focus:border-primary-400 h-9 w-48 rounded-lg border border-neutral-200 bg-white pl-8 pr-3 text-sm outline-none"
              />
            </div>
            {/* Status Filter */}
            <DropdownMenu.Root>
              <DropdownMenu.Trigger asChild>
                <button className="flex h-9 items-center gap-2 rounded-lg border border-neutral-200 bg-neutral-50 px-3 text-sm capitalize text-neutral-600 transition-colors hover:bg-neutral-100">
                  <SlidersHorizontal size={14} />
                  {statusFilter === 'all'
                    ? 'Filter games'
                    : `Filter by ${statusFilter}`}
                </button>
              </DropdownMenu.Trigger>
              <DropdownMenu.Portal>
                <DropdownMenu.Content
                  className="DropdownMenuContent"
                  sideOffset={4}
                >
                  {STATUS_FILTERS.map((f) => (
                    <DropdownMenu.Item
                      key={f.value}
                      className={`DropdownMenuItem ${
                        statusFilter === f.value ? 'font-semibold' : ''
                      }`}
                      onSelect={() => {
                        setStatusFilter(f.value);
                        //   setPage(1);
                      }}
                    >
                      {f.label}
                    </DropdownMenu.Item>
                  ))}
                </DropdownMenu.Content>
              </DropdownMenu.Portal>
            </DropdownMenu.Root>
            <Button onClick={() => router.push(ROUTES.GAME_ZONE_ADD)}>
              Create Live Game
            </Button>
          </div>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className="h-52 animate-pulse rounded-xl bg-neutral-200"
              />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {games.map((game) => (
              <GameCard
                key={game.id}
                game={game}
                canWrite={canWrite}
                onEdit={() => router.push(ROUTES.GAME_ZONE_EDIT(game.id))}
                onView={() => router.push(ROUTES.GAME_ZONE_VIEW(game.id))}
                onDelete={() => setDeleteTarget(game)}
              />
            ))}

            {/* Add New Game card */}
            {canWrite && (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => router.push(ROUTES.GAME_ZONE_ADD)}
                className="border-primary-300 text-primary-600 hover:border-primary-500 hover:bg-primary-50 flex h-52 flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed bg-white transition"
              >
                <Plus size={32} className="text-primary-500" />
                <span className="font-medium">Add New game</span>
              </motion.button>
            )}
          </div>
        )}
      </div>

      {/* Delete confirmation dialog */}
      <Dialog.Root
        open={!!deleteTarget}
        onOpenChange={(o) => {
          if (!o) setDeleteTarget(null);
        }}
      >
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm" />
          <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-full max-w-sm -translate-x-1/2 -translate-y-1/2 rounded-2xl bg-white p-8 text-center shadow-2xl">
            <Dialog.Title className="font-heading mb-6 text-lg font-semibold text-neutral-800">
              Are you sure you want to delete this game?
            </Dialog.Title>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteTarget(null)}
                className="bg-error-600 hover:bg-error-700 flex-1 rounded-full py-3 text-sm font-semibold text-white transition"
              >
                No, Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={cancelling}
                className="bg-primary-800 hover:bg-primary-700 flex-1 rounded-full py-3 text-sm font-semibold text-white transition disabled:opacity-50"
              >
                {cancelling ? 'Deleting…' : 'Yes, Delete'}
              </button>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </>
  );
}

// ─── Game Card ────────────────────────────────────────────────

function GameCard({
  game,
  canWrite,
  onEdit,
  onView,
  onDelete,
}: {
  game: Game;
  canWrite: boolean;
  onEdit: () => void;
  onView: () => void;
  onDelete: () => void;
}) {
  const prizeKobo = Math.floor(
    (game.entry_fee_kobo * (game.total_players || 0) * game.prize_percent) /
      100,
  );

  const isEditable = game.status === 'scheduled';

  return (
    <motion.div
      whileHover={{ y: -2 }}
      className="relative rounded-xl border border-neutral-100 bg-white p-5 shadow-sm"
    >
      {/* Delete button */}
      {canWrite && isEditable && (
        <button
          onClick={onDelete}
          className="bg-error-50 hover:bg-error-100 absolute right-4 top-4 rounded-lg p-1.5 transition"
        >
          <Trash2 size={14} className="text-error-600" />
        </button>
      )}

      {/* Status badge */}
      <span
        className={`mb-3 inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold ${
          GAME_STATUS_COLORS[game.status]
        }`}
      >
        {GAME_STATUS_LABELS[game.status]}
      </span>

      <p className="font-heading pr-8 font-semibold text-neutral-800">
        {game.title ?? 'Exclusive Trivia'}
      </p>
      <p className="mt-0.5 text-xs text-neutral-500">
        {formatNigeriaTime(game.scheduled_start_time)}
      </p>

      <p className="text-primary-800 mt-3 font-bold">
        Game Prize: {formatNaira(prizeKobo)}
      </p>
      <p className="text-secondary-700 text-sm">
        Entry Fee {formatNaira(game.entry_fee_kobo)}
      </p>
      <p className="mt-1 text-sm text-neutral-500">
        {game.qmcoin_prize_total > 0 &&
          `${game.qmcoin_prize_total.toLocaleString()} QM Coins`}
      </p>

      <div className="mt-4 flex gap-2">
        {canWrite && isEditable && (
          <Button
            onClick={onEdit}
            variant="destructive"
            className="flex-1 rounded-full  text-xs"
          >
            Edit game
          </Button>
        )}
        <Button onClick={onView} className=" flex-1 rounded-full py-2 text-xs">
          View game Details
        </Button>
      </div>
    </motion.div>
  );
}
