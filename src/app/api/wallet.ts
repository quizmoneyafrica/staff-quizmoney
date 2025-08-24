import { AxiosResponse } from 'axios';
import { ApiResponse } from './interface';
import { request } from '@/app/api/config';

export interface CustomerWalletTransactionResponse {
  id: string;
  transactionDate: string;
  transactionStatus: string;
  transactionType: string;
  narration: string;
  firstName: string;
  lastName: string;
  amount: number;
  direction: 'CREDIT' | 'DEBIT';
  customerId: string;
  walletBalance: number;
}
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRequestInstance } from './config';

interface GetAllTransactionsWithStatsRequest {
  page: number;
  limit: number;
  transactionType?: string;
  search?: string;
  status?: string;
  dateRange?: {
    start: string;
    end: string;
  };
  dateRangeStats?: {
    start: string;
    end: string;
  };
}

export interface WalletStatistics {
  totalWalletBalance: number;
  totalDeposits: number;
  totalWithdrawals: number;
  totalExpenses: number;
  totalTransactions: number;
}

export interface WalletSummaryResponse {
  totalBalance: number;
  totalDeposit: number;
  totalWithdrawal: number;
  totalExpenses: number;
}

export interface WalletTransaction {
  id: string;
  createdAt: { __type: 'Date'; iso: string };
  updatedAt: { __type: 'Date'; iso: string };
  user: {
    id: string;
    name: string;
    email: string;
    avatar: string;
    blacklisted: boolean;
    kycVerified: boolean;
  };
  title: string;
  type: 'withdrawal' | 'deposit' | string;
  amount: number;
  status: 'completed' | 'pending' | 'failed';
  description: string;
}

export interface WalletTransactionResponse {
  id: string;
  transactionDate: string;
  transactionStatus: 'PENDING' | 'SUCCESSFUL' | 'FAILED';
  transactionType: 'WITHDRAWAL' | 'FUNDING';
  narration: string;
  firstName: string;
  lastName: string;
  amount: number;
  direction: 'CREDIT' | 'DEBIT';
  walletBalance?: number;
}

export interface WalletTransactionsListResponse {
  transactions: WalletTransaction[];
  pagination: {
    currentPage: number;
    limit: number;
    totalPages: number;
    totalItems: number;
  };
}

export interface PageResponse<T> {
  data: T[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

const WalletApi = {
  fetchCustomerWallet(): Promise<AxiosResponse<ApiResponse>> {
    return request.post(`/fetchCustomerWallet`, {});
  },
  fetchTransactions(page?: {
    page: number;
    limit: number;
  }): Promise<AxiosResponse<ApiResponse>> {
    return request.post(`/fetchTransactions`, page ? { ...page } : {}, {});
  },

  getAllTransactionsWithStats(
    data: GetAllTransactionsWithStatsRequest,
  ): Promise<AxiosResponse<ApiResponse>> {
    return request.post(`/getAllTransactionsWithStats`, { ...data });
  },

  getCheckoutLink(data: {
    amount: string;
  }): Promise<AxiosResponse<ApiResponse>> {
    return request.post(`/getCheckoutLink`, { ...data });
  },
  addBankAccount(data: UnknownObject): Promise<AxiosResponse<ApiResponse>> {
    return request.post(`/addBankAccount`, { ...data });
  },
  verifyAccount(data: {
    email: string;
    accountNumber: string;
    bankCode: string;
  }): Promise<AxiosResponse<ApiResponse>> {
    return request.post(`/verifyAccount`, { ...data });
  },
  listBanks(): Promise<AxiosResponse<ApiResponse>> {
    return request.post(`/listBanks`, {});
  },
  fetchDedicatedAccount(data: {
    email: string;
  }): Promise<AxiosResponse<ApiResponse>> {
    return request.post(`/fetchDedicatedAccount`, { ...data });
  },
  createWithdrawalPin(data: {
    pin: string;
    edit?: boolean;
    oldPin?: string;
  }): Promise<AxiosResponse<ApiResponse>> {
    return request.post(
      `/createWithdrawalPin`,
      data?.edit ? { ...data } : { pin: data?.pin },
    );
  },
  requestWithdrawal(data: {
    amount: string;
    pin: string;
    bankAccount: {
      accountNumber: string;
      bankName: string;
      accountName: string;
    };
  }): Promise<AxiosResponse<ApiResponse>> {
    return request.post(`/requestWithdrawal`, { ...data });
  },
  removeBankAccount(data: {
    bankAccount: {
      accountNumber: string;
      bankName: string;
      accountName: string;
    };
  }): Promise<AxiosResponse<ApiResponse>> {
    return request.post(`/removeBankAccount`, { ...data });
  },
  searchTransactions(data: {
    query: string;
  }): Promise<AxiosResponse<ApiResponse>> {
    return request.post(`/searchTransactions`, { ...data });
  },

  getWalletTransactionStats(data: {
    dateRange?: { start: string; end: string };
  }): Promise<AxiosResponse<{ result: { statistics: WalletStatistics } }>> {
    return request.post(`/getWalletTransactionStats`, { ...data });
  },

  getWalletTransactionsList(data: {
    page: number;
    limit: number;
    search?: string;
    type?: string;
    status?: string;
    dateRange?: { start: string; end: string };
  }): Promise<AxiosResponse<{ result: WalletTransactionsListResponse }>> {
    return request.post(`/getWalletTransactionsList`, { ...data });
  },

  getWalletSummary(): Promise<
    AxiosResponse<{
      success: boolean;
      code: string;
      message: string;
      data: WalletSummaryResponse;
    }>
  > {
    return request.get(`/wallets/summary`, {});
  },

  getWalletTransactions(params: {
    type?: 'WITHDRAWAL' | 'FUNDING';
    status?: 'PENDING' | 'SUCCESSFUL' | 'FAILED';
    search?: string;
    page?: number;
    limit?: number;
  }): Promise<
    AxiosResponse<{
      success: boolean;
      code: string;
      message: string;
      data: {
        content: WalletTransactionResponse[];
        pageNo: number;
        pageSize: number;
        totalElements: number;
        totalPages: number;
        last: boolean;
      };
    }>
  > {
    const queryParams = new URLSearchParams();

    if (params.type) queryParams.append('type', params.type);
    if (params.status) queryParams.append('status', params.status);
    if (params.search) queryParams.append('search', params.search);
    if (params.page) queryParams.append('pageNo', params.page.toString());
    if (params.limit) queryParams.append('pageSize', params.limit.toString());

    return request.get(`/wallet-transactions?${queryParams.toString()}`, {});
  },

  getTransactionById(
    transactionId: string,
  ): Promise<
    AxiosResponse<ApiResponse & { data: CustomerWalletTransactionResponse }>
  > {
    return request.get(`/wallet-transactions/${transactionId}`, {});
  },
};

export default WalletApi;
export type { GetAllTransactionsWithStatsRequest };

export const useGetBanks = () => {
  const request = useRequestInstance();

  return useQuery({
    queryKey: ['get_banks'],
    queryFn: () =>
      request
        .post(`/listBanks`)
        .then((res) => res.data)
        .catch((error) => {
          throw error.response?.data || error;
        }),
  });
};

export const useVerifyAccount = () => {
  const request = useRequestInstance();

  return useMutation({
    mutationFn: (values: unknown) =>
      request
        .post(`/verifyAccount`, values)
        .then((res) => res.data)
        .catch((error) => {
          throw error.response?.data || error;
        }),
  });
};

export const useUpdatePlayer = () => {
  const request = useRequestInstance();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (values: unknown) =>
      request
        .post(`/updatePlayer`, values)
        .then((res) => res.data)
        .catch((error) => {
          throw error.response?.data || error;
        }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['playerProfile'] });
    },
  });
};

export const useUpdatePlayerErasers = () => {
  const request = useRequestInstance();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (values: UnknownObject) =>
      request
        .post(`/updatePlayerErasers`, values)
        .then((res) => res.data)
        .catch((error) => {
          throw error.response.data;
        }),
    onMutate: async (payload) => {
      await queryClient.cancelQueries({
        queryKey: ['playerProfile', payload?.userId],
      });

      const previous = queryClient.getQueryData([
        'playerProfile',
        payload?.userId,
      ]);

      queryClient.setQueryData(
        ['playerProfile', payload?.userId],
        (old_payload: UnknownObject) => {
          return {
            ...old_payload,
            userDetails: {
              ...old_payload?.userDetails,
              eraser: old_payload?.userDetails?.eraser + payload?.erasersCount,
            },
          };
        },
      );

      return { previous };
    },
    onError: (error, _variables, context?: UnknownObject) => {
      queryClient.setQueryData(
        ['playerProfile', _variables?.userId],
        context?.previous,
      );
    },
    onSettled: (data, error, _variables) => {
      queryClient.invalidateQueries({
        queryKey: ['playerProfile', _variables?.userId],
      });
    },
  });
};

export const useUpdatePlayerCoins = () => {
  const request = useRequestInstance();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (values: UnknownObject) =>
      request
        .post(`/updatePlayerCoins`, values)
        .then((res) => res.data)
        .catch((error) => {
          throw error.response.data;
        }),
    onMutate: async (payload) => {
      await queryClient.cancelQueries({
        queryKey: ['playerProfile', payload?.userId],
      });

      const previous = queryClient.getQueryData([
        'playerProfile',
        payload?.userId,
      ]);

      queryClient.setQueryData(
        ['playerProfile', payload?.userId],
        (old_payload: UnknownObject) => {
          return {
            ...old_payload,
            userDetails: {
              ...old_payload?.userDetails,
              coinBalance:
                old_payload?.userDetails?.coinBalance + payload?.coinsCount,
            },
          };
        },
      );

      return { previous };
    },
    onError: (error, _variables, context?: UnknownObject) => {
      queryClient.setQueryData(
        ['playerProfile', _variables?.userId],
        context?.previous,
      );
    },
    onSettled: (data, error, _variables) => {
      queryClient.invalidateQueries({
        queryKey: ['playerProfile', _variables?.userId],
      });
    },
  });
};
