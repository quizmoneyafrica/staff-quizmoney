import { useQuery } from '@tanstack/react-query';
import { useRequestInstance } from '../api/config';

interface GetAllTransactionsWithStatsPayload {
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

export const useGetAllTransactionsWithStats = (
  page: number,
  limit: number,
  transactionType?: string,
  search?: string,
  status?: string,
  dateRange?: {
    start: string;
    end: string;
  },
  dateRangeStats?: {
    start: string;
    end: string;
  },
) => {
  const request = useRequestInstance();

  const buildPayload = (): GetAllTransactionsWithStatsPayload => {
    const payload: GetAllTransactionsWithStatsPayload = {
      page,
      limit,
    };

    if (transactionType?.trim()) {
      payload.transactionType = transactionType.trim();
    }

    if (search?.trim()) {
      payload.search = search.trim();
    }

    // if (status && status !== 'All') {
    //   payload.status = status.toLowerCase();
    // }

    if (status && status !== 'All') {
      const statusMapping: Record<string, string> = {
        Successful: 'completed',
        Pending: 'pending',
        Failed: 'failed',
      };
      payload.status = statusMapping[status] || status.toLowerCase();
    }

    if (dateRange?.start && dateRange.end) {
      payload.dateRange = {
        start: dateRange.start,
        end: dateRange.end,
      };
    }

    if (dateRangeStats?.start && dateRangeStats.end) {
      payload.dateRangeStats = {
        start: dateRangeStats.start,
        end: dateRangeStats.end,
      };
    }

    return payload;
  };

  return useQuery({
    queryKey: [
      'get_all_transactions_with_stats',
      page,
      limit,
      transactionType,
      search,
      status,
      dateRange?.start,
      dateRange?.end,
      dateRangeStats?.start,
      dateRangeStats?.end,
    ],
    queryFn: () =>
      request
        .post(`/getAllTransactionsWithStats`, buildPayload())
        .then((res) => {
          console.log('API Response:', res.data);
          return res.data.result;
        })
        .catch((error) => {
          console.error('API Error:', error);
          throw error.response?.data || error;
        }),
    staleTime: search ? 2 * 60 * 1000 : 10 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
};

export const useGetWalletStats = () => {
  const request = useRequestInstance();

  return useQuery({
    queryKey: ['get_wallet_stats'],
    queryFn: () =>
      request
        .post(`/fetchCustomerWallet`, {})
        .then((res) => res.data)
        .catch((error) => {
          throw error.response?.data || error;
        }),
    staleTime: 5 * 60 * 1000,
    refetchInterval: 5 * 60 * 1000,
  });
};
