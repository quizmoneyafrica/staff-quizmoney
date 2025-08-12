import { useQueryClient } from '@tanstack/react-query';
import GameApi, { UpdateGamePayloadV2 } from '@/app/api/game';
import { toast } from 'sonner';
import { AxiosError } from 'axios';

export const useUpdateGame = () => {
  const queryClient = useQueryClient();

  const updateGame = async (gameId: string, payload: UpdateGamePayloadV2) => {
    try {
      const response = await GameApi.updateGameV2(gameId, payload);

      if (response.data.success) {
        queryClient.invalidateQueries({ queryKey: ['game', gameId] });
        queryClient.invalidateQueries({ queryKey: ['games'] });
        toast.success('Game updated successfully!');
        return response.data;
      } else {
        throw new Error(response.data.message || 'Failed to update game');
      }
    } catch (error) {
      console.error('Update game error:', error);

      if (error instanceof AxiosError) {
        const message =
          error.response?.data?.message ||
          'Failed to update game. Please try again.';
        toast.error(message);
      } else if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error('Failed to update game. Please try again.');
      }
      throw error;
    }
  };

  return { updateGame };
};
