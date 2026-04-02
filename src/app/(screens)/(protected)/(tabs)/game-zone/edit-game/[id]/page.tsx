'use client';

import { use } from 'react';
import { useGame } from '@/app/lib/queries';
import GameForm from '@/app/components/game/GameForm';

export default function EditGamePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { data: game, isLoading } = useGame(id);

  if (isLoading) {
    return <div className="h-96 animate-pulse rounded-xl bg-neutral-200" />;
  }

  if (!game) return <p className="text-neutral-500">Game not found</p>;

  return (
    <div className="max-w-2xl space-y-6">
      <p className="font-heading text-lg font-semibold text-neutral-800">
        Edit Game
      </p>
      <GameForm mode="edit" game={game} />
    </div>
  );
}
