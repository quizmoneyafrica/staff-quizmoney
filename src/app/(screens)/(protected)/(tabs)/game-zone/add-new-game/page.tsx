'use client';

import GameForm from '@/app/components/game/GameForm';

export default function AddNewGamePage() {
  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <p className="font-heading text-lg font-semibold text-neutral-800">
          Add New Game
        </p>
      </div>
      <GameForm mode="create" />
    </div>
  );
}
