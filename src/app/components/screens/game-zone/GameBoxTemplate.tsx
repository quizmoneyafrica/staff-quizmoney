import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Game } from '@/app/store/gameSlice';
import { Trash2, Loader2 } from 'lucide-react';
import { formatDateTime, formatNaira } from '@/app/utils/utils';
import DeleteConfirmationModal from '../../gamezone/deleteconfirmation';

interface IGameBoxTemplateProps {
  game: Game;
  deleteGame: (objectId: string) => Promise<void>;
}

const GameBoxTemplate: React.FunctionComponent<IGameBoxTemplateProps> = (
  props,
) => {
  const { game, deleteGame } = props;
  const router = useRouter();
  const [showDeleteModal, setShowDeleteModal] = React.useState(false);
  const [isDeleting, setIsDeleting] = React.useState(false);

  const handleDelete = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    setIsDeleting(true);
    try {
      await deleteGame(game.objectId);
      setShowDeleteModal(false);
    } catch (error) {
      console.error('Delete operation failed:', error);
    } finally {
      setIsDeleting(false);
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
    <>
      <div className="relative flex h-[299px] w-full flex-col items-center justify-center gap-5 overflow-clip rounded-lg bg-white shadow">
        <div className="border-primary-100 absolute -bottom-14 -left-5 z-0 h-[150px] w-[150px] rounded-full border-8 bg-transparent opacity-40 lg:h-[180px] lg:w-[180px]" />
        <div className="border-primary-100 absolute -right-10 -top-8 z-0 h-[150px] w-[150px] rounded-full border-8 bg-transparent opacity-40 lg:h-[180px] lg:w-[180px]" />

        <button
          onClick={handleDelete}
          disabled={isDeleting}
          className="absolute right-3 top-3 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white/80 transition-colors duration-200 hover:bg-white/100 disabled:cursor-not-allowed disabled:opacity-50"
          style={{ cursor: isDeleting ? 'not-allowed' : 'pointer' }}
          aria-label="Delete game"
          type="button"
        >
          {isDeleting ? (
            <Loader2 className="h-5 w-5 animate-spin text-red-600" />
          ) : (
            <Trash2 className="h-6 w-6 text-red-600" />
          )}
        </button>

        <div className="z-[2] flex flex-col items-center justify-center gap-5">
          <h3 className="text-lg font-bold uppercase text-black">
            {game.name}
          </h3>
          <p className="font-heading text-xs font-medium text-neutral-800">
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
          <div className="flex items-center justify-center gap-5">
            <button
              onClick={handleEditGame}
              disabled={isDeleting}
              className="font-heading bg-error-400 hover:bg-error-500 cursor-pointer rounded-full px-4 py-2 text-white transition-colors duration-200 disabled:cursor-not-allowed disabled:opacity-50"
              type="button"
            >
              Edit Game
            </button>
            <button
              onClick={handleViewGameDetails}
              disabled={isDeleting}
              className="font-heading bg-primary-900 hover:bg-primary-800 cursor-pointer rounded-full px-4 py-2 text-white transition-colors duration-200 disabled:cursor-not-allowed disabled:opacity-50"
              type="button"
            >
              View Details
            </button>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleConfirmDelete}
        title={`Are you sure you want to delete "${game.name}"?`}
        isLoading={isDeleting}
      />
    </>
  );
};

export default GameBoxTemplate;
