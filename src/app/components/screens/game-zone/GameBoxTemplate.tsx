import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Game } from '@/app/store/gameSlice';
import { Trash2 } from 'lucide-react';
import { formatDateTime, formatNaira } from '@/app/utils/utils';

interface IGameBoxTemplateProps {
  game: Game;
  deleteGame: (objectId: string) => void;
}

const GameBoxTemplate: React.FunctionComponent<IGameBoxTemplateProps> = (
  props,
) => {
  const { game, deleteGame } = props;
  const router = useRouter();
  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this game?')) {
      deleteGame(game.objectId);
    }
  };

  const handleEditGame = () => {
    router.push(`/game-zone/edit-game/${game.objectId}`);
  };
  const handleViewGameDetails = () => {
    router.push(`/game-zone/view-game/${game.objectId}`);
  };
  const { time, fullDate } = formatDateTime(game.startDate.iso);
  return (
    <div className="relative flex h-[299px] w-full flex-col items-center justify-center gap-5 overflow-clip rounded-lg bg-white shadow">
      <div className="border-primary-100 absolute -bottom-14 -left-5 z-[1] h-[150px] w-[150px] rounded-full border-8 bg-transparent opacity-40 lg:h-[180px] lg:w-[180px]" />
      <div className="border-primary-100 absolute -right-10 -top-8 z-[1] h-[150px] w-[150px] rounded-full border-8 bg-transparent opacity-40 lg:h-[180px] lg:w-[180px]" />
      <button
        onClick={handleDelete}
        className="absolute right-5 top-3 cursor-pointer text-3xl lg:right-4"
      >
        <Trash2 className="text-error-700" />
      </button>
      <div className="z-[1] flex flex-col items-center justify-center gap-5">
        <h3 className="text-lg font-bold uppercase text-black">{game.name}</h3>
        <p className="font-heading text-xs font-medium text-neutral-800">
          {/* 10th March, 2024 8:00PM */}
          {fullDate} {time}
        </p>
        <p className="text-primary-900 text-lg font-bold">
          Game Prize: {formatNaira(Number(game?.gamePrize))}
        </p>
        <p className="text-primary-900 font-heading text-sm font-medium">
          Entry Fee: {formatNaira(Number(game?.entryFee))}
        </p>
        <p className="font-heading text-sm font-medium">
          {game?.questions?.length} Questions
        </p>
        <div className="flex items-center justify-center gap-5 ">
          <button
            onClick={handleEditGame}
            className="font-heading bg-error-400 cursor-pointer rounded-full px-4 py-2 text-white"
          >
            Edit Game
          </button>
          <button
            onClick={handleViewGameDetails}
            className="font-heading bg-primary-900 cursor-pointer rounded-full px-4 py-2 text-white"
          >
            View Details
          </button>
        </div>
      </div>
    </div>
  );
};

export default GameBoxTemplate;
