import * as React from "react";
import { useRouter } from "next/navigation";
import { Game } from "@/app/store/gameSlice";
import { Trash2 } from "lucide-react";
import { formatDateTime, formatNaira } from "@/app/utils/utils";

interface IGameBoxTemplateProps {
  game: Game;
  deleteGame: (objectId: string) => void;
}

const GameBoxTemplate: React.FunctionComponent<IGameBoxTemplateProps> = (
  props
) => {
  const { game, deleteGame } = props;
  const router = useRouter();
  const handleDelete = () => {
    if (window.confirm("Are you sure you want to delete this game?")) {
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
    <div className="relative shadow overflow-clip w-full h-[299px] bg-white rounded-lg flex flex-col gap-5 items-center justify-center">
      <div className="absolute -left-5 -bottom-14 z-[1] opacity-40 h-[150px] w-[150px] lg:h-[180px] lg:w-[180px] rounded-full bg-transparent border-8 border-primary-100" />
      <div className="absolute -right-10 -top-8 z-[1] opacity-40 h-[150px] w-[150px] lg:h-[180px] lg:w-[180px] rounded-full bg-transparent border-8 border-primary-100" />
      <button
        onClick={handleDelete}
        className="absolute cursor-pointer top-3 right-5 lg:right-4 text-3xl"
      >
        <Trash2 className="text-error-700" />
      </button>
      <div className="z-[1] flex flex-col gap-5 items-center justify-center">
        <h3 className="text-black text-lg font-bold uppercase">{game.name}</h3>
        <p className="text-neutral-800 text-xs font-medium font-heading">
          {/* 10th March, 2024 8:00PM */}
          {fullDate} {time}
        </p>
        <p className="text-primary-900 text-lg font-bold">
          Game Prize: {formatNaira(Number(game?.gamePrize))}
        </p>
        <p className="text-primary-900 text-sm font-medium font-heading">
          Entry Fee: {formatNaira(Number(game?.entryFee))}
        </p>
        <p className="font-heading text-sm font-medium">
          {game?.questions?.length} Questions
        </p>
        <div className="flex items-center justify-center gap-5 ">
          <button
            onClick={handleEditGame}
            className="cursor-pointer font-heading py-2 px-4 bg-error-400 text-white rounded-full"
          >
            Edit Game
          </button>
          <button
            onClick={handleViewGameDetails}
            className="cursor-pointer font-heading py-2 px-4 text-white bg-primary-900 rounded-full"
          >
            View Details
          </button>
        </div>
      </div>
    </div>
  );
};

export default GameBoxTemplate;
