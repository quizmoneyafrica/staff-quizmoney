import { useQuery } from '@tanstack/react-query';
import PlayerApi from '../api/PlayerProfileApi';

export const useGameStats = (gameId: string, customerId: string) => {
  return useQuery({
    queryKey: ['gameStats', gameId, customerId],
    queryFn: async () => {
      const response = await PlayerApi.getGameStats(gameId, customerId);

      return response.data.data;
    },
    enabled: !!gameId && !!customerId,
  });
};
