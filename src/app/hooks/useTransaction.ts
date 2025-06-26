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
      console.log('Adding dateRange to payload:', payload.dateRange);
    }

    if (dateRangeStats?.start && dateRangeStats?.end) {
      payload.dateRangeStats = {
        start: dateRangeStats.start,
        end: dateRangeStats.end,
      };
      console.log('Adding dateRangeStats to payload:', payload.dateRangeStats);
    }

    console.log(
      'Final API Payload being sent:',
      JSON.stringify(payload, null, 2),
    );
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

  console.log('React Query Key:', queryKey);

  return useQuery({
    queryKey,
    queryFn: () => {
      console.log('Making API call with payload:', buildPayload());
      return request
        .post(`/getAllTransactionsWithStats`, buildPayload())
        .then((res) => {
          console.log('API Response:', res.data);
          return res.data.result;
        })
        .catch((error) => {
          console.error('API Error:', error);
          throw error.response?.data || error;
        });
    },
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
