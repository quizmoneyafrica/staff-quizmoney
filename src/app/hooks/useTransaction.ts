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

    if (status && status !== 'All') {
      const statusMapping: Record<string, string> = {
        Successful: 'completed',
        Pending: 'pending',
        Failed: 'failed',
      };
      payload.status = statusMapping[status] || status.toLowerCase();
    }

    if (dateRange?.start && dateRange?.end) {
      payload.dateRange = {
        start: dateRange.start,
        end: dateRange.end,
      };
    }

    if (dateRangeStats?.start && dateRangeStats?.end) {
      payload.dateRangeStats = {
        start: dateRangeStats.start,
        end: dateRangeStats.end,
      };
    }

    return payload;
  };

  const queryKey = [
    'get_all_transactions_with_stats',
    page,
    limit,
    transactionType || null,
    search || null,
    status || null,
    dateRange ? `${dateRange.start}-${dateRange.end}` : null,
    dateRangeStats ? `${dateRangeStats.start}-${dateRangeStats.end}` : null,
  ];

  return useQuery({
    queryKey,
    queryFn: () => {
      return request
        .post(`/getAllTransactionsWithStats`, buildPayload())
        .then((res) => {
          return res.data.result;
        })
        .catch((error) => {
          console.error('API Error:', error);
          throw error.response?.data || error;
        });
    },
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
  });
};
