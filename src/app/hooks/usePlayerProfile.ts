import { useQuery, UseQueryResult } from '@tanstack/react-query';
import PlayerApi, {
  ViewPlayerProfileRequest,
  PlayerProfileData,
} from '../api/PlayerProfileApi';
import { ApiResponse } from '../api/interface';

const DEFAULT_PARAMS = {
  gameHistoryPage: 1,
  gameHistoryLimit: 10,
  transactionPage: 1,
  transactionLimit: 10,
  transactionStatus: 'completed',
} as const;

export const usePlayerProfile = (
  userId: string,
  options?: Partial<Omit<ViewPlayerProfileRequest, 'userId'>>,
): UseQueryResult<PlayerProfileData, Error> => {
  const requestParams: ViewPlayerProfileRequest = {
    userId,
    ...DEFAULT_PARAMS,
    ...options,
  };

  return useQuery({
    queryKey: ['playerProfile', userId, requestParams],
    queryFn: async (): Promise<PlayerProfileData> => {
      console.log('Debug - Making API call with params:', requestParams);

      try {
        const response = await PlayerApi.viewPlayerProfile(requestParams);
        console.log('Debug - API Response:', response);
        console.log('Debug - Response Data:', response.data);

        if (response.data.result) {
          return response.data.result;
        } else {
          console.error('Debug - No result in API response');
          throw new Error('No data returned from API');
        }
      } catch (error) {
        console.error('Debug - API call failed:', error);
        throw error;
      }
    },
    enabled: !!userId,
    staleTime: 5 * 60 * 1000,
    retry: 3,
  });
};

export const usePlayerProfileWithFilters = (
  userId: string,
  transactionFilters?: {
    transactionType?: string;
    transactionStatus?: string;
    transactionDateRange?: {
      start: string;
      end: string;
    };
    transactionPage?: number;
    transactionLimit?: number;
  },
  gameHistoryFilters?: {
    gameHistoryPage?: number;
    gameHistoryLimit?: number;
  },
): UseQueryResult<PlayerProfileData, Error> => {
  return usePlayerProfile(userId, {
    ...transactionFilters,
    ...gameHistoryFilters,
  });
};
