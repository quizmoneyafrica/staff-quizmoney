import { useMutation, useQueryClient } from '@tanstack/react-query';
import GameApi, { UpdateGamePayload } from '@/app/api/game';
import { toast } from 'sonner';
import { AxiosError } from 'axios';

export const useUpdateGame = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: UpdateGamePayload) => GameApi.updateGame(payload),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['game', variables.objectId] });
      queryClient.invalidateQueries({ queryKey: ['games'] });

      toast.success('Game updated successfully!');
    },
    onError: (error: unknown) => {
      console.error('Update game error:', error);

      if (error instanceof AxiosError) {
        const message =
          error.response?.data?.message ||
          'Failed to update game. Please try again.';
        toast.error(message);
      } else {
        toast.error('Failed to update game. Please try again.');
      }
    },
  });
};
