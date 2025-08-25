import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { AxiosError } from 'axios';

import GameApi from '../api/game';
import { CreateGamePayload, CreateGameResponse } from '../api/game';

interface UseCreateGameOptions {
  onSuccess?: (data: CreateGameResponse) => void;
  onError?: (error: unknown) => void;
  redirectOnSuccess?: boolean;
  redirectPath?: string;
}

export const useCreateGame = (options?: UseCreateGameOptions) => {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: async (
      payload: CreateGamePayload,
    ): Promise<CreateGameResponse> => {
      try {
        const response = await GameApi.createGame(payload);
        return response.data;
      } catch (error) {
        throw error;
      }
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['games'] });
      if (options?.redirectOnSuccess !== false) {
        const redirectPath = options?.redirectPath || '/game-zone';
        router.push(redirectPath);
      }

      options?.onSuccess?.(data);
    },
    onError: (error: unknown) => {
      let errorMessage = 'Failed to create game. Please try again.';

      if (error instanceof AxiosError) {
        if (error.response?.status === 400) {
          errorMessage =
            error.response?.data?.message || 'Invalid game data provided.';
        } else if (error.response?.status === 401) {
          errorMessage = 'You are not authorized to create games.';
        } else if (error.response?.status === 409) {
          errorMessage = 'A game with this name already exists.';
        } else if (error.response?.status >= 500) {
          errorMessage = 'Server error. Please try again later.';
        } else {
          errorMessage =
            error.response?.data?.message || error.message || errorMessage;
        }
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }

      toast.error(errorMessage);
      options?.onError?.(error);
    },
  });
};
