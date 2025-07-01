import { useQuery, UseQueryResult } from '@tanstack/react-query';
import PlayerApi, {
  ViewPlayerProfileRequest,
  GetPlayerTransactionsRequest,
  PlayerProfileData,
  PlayerTransactionsResponse,
} from '../api/PlayerProfileApi';

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
      try {
        const response = await PlayerApi.viewPlayerProfile(requestParams);
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
  const stableOptions = options
    ? {
        ...options,

        dateRange: options.dateRange
          ? {
              start: options.dateRange.start,
              end: options.dateRange.end,
            }
          : undefined,
      }
    : undefined;

  const requestParams: GetPlayerTransactionsRequest = {
    userId,
    ...DEFAULT_TRANSACTION_PARAMS,
    ...stableOptions,
  };

  const queryKey = [
    'playerTransactions',
    userId,
    {
      page: requestParams.page,
      limit: requestParams.limit,
      type: requestParams.type,
      status: requestParams.status,
      search: requestParams.search,
      dateRange: requestParams.dateRange
        ? `${requestParams.dateRange.start}-${requestParams.dateRange.end}`
        : undefined,
    },
  ];

  return useQuery({
    queryKey,
    queryFn: async (): Promise<PlayerTransactionsResponse['result']> => {
      try {
        const response = await PlayerApi.getPlayerTransactions(requestParams);
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
    staleTime: 30 * 1000,
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
