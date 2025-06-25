import { useQuery, UseQueryResult } from '@tanstack/react-query';
import PlayerApi, {
  ViewPlayerProfileRequest,
  GetPlayerTransactionsRequest,
  PlayerProfileData,
  PlayerTransactionsResponse,
} from '../api/PlayerProfileApi';
import { ApiResponse } from '../api/interface';

const DEFAULT_PARAMS = {
  gameHistoryPage: 1,
  gameHistoryLimit: 10,
  transactionPage: 1,
  transactionLimit: 10,
  transactionStatus: 'completed',
} as const;

const DEFAULT_TRANSACTION_PARAMS = {
  page: 1,
  limit: 10,
  status: 'completed',
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

export const usePlayerTransactions = (
  userId: string,
  options?: Partial<Omit<GetPlayerTransactionsRequest, 'userId'>>,
): UseQueryResult<PlayerTransactionsResponse['result'], Error> => {
  const requestParams: GetPlayerTransactionsRequest = {
    userId,
    ...DEFAULT_TRANSACTION_PARAMS,
    ...options,
  };

  return useQuery({
    queryKey: ['playerTransactions', userId, requestParams],
    queryFn: async (): Promise<PlayerTransactionsResponse['result']> => {
      console.log(
        'Debug - Making transactions API call with params:',
        requestParams,
      );

      try {
        const response = await PlayerApi.getPlayerTransactions(requestParams);
        console.log('Debug - Transactions API Response:', response);
        console.log('Debug - Transactions Response Data:', response.data);

        if (response.data.result) {
          return response.data.result;
        } else {
          console.error('Debug - No result in transactions API response');
          throw new Error('No transaction data returned from API');
        }
      } catch (error) {
        console.error('Debug - Transactions API call failed:', error);
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
