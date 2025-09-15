import {
  useQuery,
  UseQueryResult,
  UseQueryOptions,
} from '@tanstack/react-query';
import PlayerApi, {
  ViewPlayerProfileRequest,
  GetPlayerTransactionsRequest,
  PlayerProfileData,
  PlayerTransactionsResponse,
} from '../api/PlayerProfileApi';
import { request } from '@/app/api/config';

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
): UseQueryResult<UnknownObject, Error> => {
  const requestParams: ViewPlayerProfileRequest = {
    userId,
    ...DEFAULT_PARAMS,
    ...options,
  };

  return useQuery({
    queryKey: ['playerProfile', userId, requestParams],
    queryFn: async (): Promise<UnknownObject> => {
      try {
        const response = await PlayerApi.viewPlayerProfile(requestParams);
        if (response.data.data) {
          return response.data.data;
        } else {
          console.error('Debug - No result in API response');
          throw new Error('No data returned from API');
        }
      } catch (error) {
        console.error('Debug - API call failed:', error);
        throw error;
      }
    },
  });
};

export const useGetPlayerPayoutAccounts = (userId: string) => {
  return useQuery({
    queryKey: ['playerPayoutAccounts', userId],
    queryFn: async ({ signal }) => {
      try {
        const response = await request.get(`/payout-accounts`, {
          signal,
          params: {
            'customer-id': userId,
          },
        });
        if (response.data.data) {
          return response.data.data;
        } else {
          console.error('Debug - No result in API response');
          throw new Error('No data returned from API');
        }
      } catch (error) {
        console.error('Debug - API call failed:', error);
        throw error;
      }
    },
    enabled: Boolean(userId),
  });
};

export const useGetPlayerKyc = (userId: string) => {
  return useQuery({
    queryKey: ['getPlayerKyc', userId],
    queryFn: async ({ signal }) => {
      try {
        const response = await request.get(`/customer-kyc`, {
          signal,
          params: {
            'customer-id': userId,
          },
        });
        if (response.data.data) {
          return response.data.data;
        } else {
          console.error('Debug - No result in API response');
          throw new Error('No data returned from API');
        }
      } catch (error) {
        console.error('Debug - API call failed:', error);
        throw error;
      }
    },
    enabled: Boolean(userId),
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
    enabled: Boolean(userId),
  });
};

export interface WalletTransaction {
  id: string;
  transactionDate: string;
  transactionStatus: string;
  transactionType: string;
  narration: string;
  firstName: string;
  lastName: string;
  amount: number;
  direction: 'DEBIT' | 'CREDIT';
  currency: string;
}

export interface WalletTransactionsResponse {
  content: WalletTransaction[];
  pageNo: number;
  pageSize: number;
  totalElements: number;
  totalPages: number;
  last: boolean;
}

export interface WalletTransactionsApiResponse {
  success: boolean;
  code: string;
  message: string;
  data: {
    content: WalletTransaction[];
    pageNo: number;
    pageSize: number;
    totalElements: number;
    totalPages: number;
    last: boolean;
  };
}

export const useWalletTransactions = (
  customerId: string,
  params: {
    page?: number;
    size?: number;
    status?: 'PENDING' | 'SUCCESSFUL' | 'FAILED';
    type?: 'FUNDING' | 'WITHDRAWAL' | 'REVERSAL';
    search?: string;
    'start-date'?: string;
    'end-date'?: string;
  } = {},
  options?: Omit<
    UseQueryOptions<WalletTransactionsResponse, Error>,
    'queryKey' | 'queryFn'
  >,
) => {
  return useQuery<WalletTransactionsResponse, Error>({
    queryKey: ['walletTransactions', customerId, params],
    queryFn: async () => {
      const response = await PlayerApi.getWalletTransactions(
        customerId,
        params,
      );

      if (response.data?.data?.content) {
        const { data } = response.data;
        return {
          content: data.content,
          pageNo: data.pageNo,
          pageSize: data.pageSize,
          totalElements: data.totalElements,
          totalPages: data.totalPages,
          last: data.last,
        } as WalletTransactionsResponse;
      }

      return {
        content: [],
        pageNo: 0,
        pageSize: 10,
        totalElements: 0,
        totalPages: 0,
        last: true,
      } as WalletTransactionsResponse;
    },
    ...options,
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
): UseQueryResult<UnknownObject, Error> => {
  return usePlayerProfile(userId, {
    ...transactionFilters,
    ...gameHistoryFilters,
  });
};
