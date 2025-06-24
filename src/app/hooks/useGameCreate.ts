import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { AxiosError } from 'axios';

import GameApi from '../api/game';
import { CreateGamePayload, CreateGameResponse } from '../api/typesGame';
import { ROUTES } from '../utils';

interface UseCreateGameOptions {
  onSuccess?: (data: CreateGameResponse) => void;
  onError?: (error: unknown) => void;
}

export const useCreateGame = (options?: UseCreateGameOptions) => {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: async (
      payload: CreateGamePayload,
    ): Promise<CreateGameResponse> => {
      const response = await GameApi.createGame(payload);
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['games'] });
      toast.success('Game created successfully!');
      options?.onSuccess?.(data);
    },
    onError: (error: unknown) => {
      console.error('Error creating game:', error);

      let errorMessage = 'Failed to create game. Please try again.';

      if (error instanceof AxiosError) {
        errorMessage = error.response?.data?.message || error.message;
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }

      toast.error(errorMessage);
      options?.onError?.(error);
    },
  });
};
