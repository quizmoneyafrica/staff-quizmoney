import { useQuery } from '@tanstack/react-query';
import PlayerApi from '../api/PlayerProfileApi';

export interface PlayerBalances {
  eraserBalance: number;
  walletBalance: number;
  coinBalance: number;
}

interface ApiResponse {
  success: boolean;
  code: string;
  message: string;
  data: PlayerBalances;
}

export const usePlayerBalances = (userId: string) => {
  return useQuery<PlayerBalances>({
    queryKey: ['playerBalances', userId],
    queryFn: async () => {
      const response = await PlayerApi.getPlayerBalances(userId);
      const data = response.data as unknown as ApiResponse;
      if (data.success && data.data) {
        return data.data;
      }
      throw new Error(data.message || 'Failed to fetch balances');
    },
    enabled: !!userId,
  });
};
