import { useQuery } from '@tanstack/react-query';
import PlayerApi from '../api/PlayerProfileApi';

export const usePlayerGameDetails = (userId: string, gameId: string) => {
  return useQuery({
    queryKey: ['playerGameDetails', userId, gameId],
    queryFn: () =>
      PlayerApi.getPlayerGameDetails({ userId, gameId }).then(
        (res) => res.data.result,
      ),
    enabled: !!userId && !!gameId,
  });
};
