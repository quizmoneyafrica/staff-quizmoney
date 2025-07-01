/* eslint-disable @typescript-eslint/no-explicit-any */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRequestInstance } from './config';

interface DateRange {
  start: string;
  end: string;
}

interface WithdrawalRequestPayload {
  page: number;
  limit: number;
  status?: string;
  search?: string;
  dateRange?: DateRange;
}

interface WithdrawalResponse {
  results: any[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalCount: number;
    hasNext: boolean;
    hasPrevious: boolean;
  };
}

export const useGetWithdrawalRequests = (
  page: number,
  limit: number,
  filter: string,
  search = '',
  dateRange: DateRange | null = null,
) => {
  const request = useRequestInstance();

  const buildPayload = (): WithdrawalRequestPayload => {
    const payload: WithdrawalRequestPayload = {
      page,
      limit,
      status:
        filter === 'all'
          ? undefined
          : filter === 'approved'
          ? 'resolved'
          : filter,
    };

    if (search && search.trim()) {
      payload.search = search.trim();
    }

    if (dateRange && dateRange.start && dateRange.end) {
      payload.dateRange = {
        start: dateRange.start,
        end: dateRange.end,
      };
    }

    return payload;
  };

  return useQuery({
    queryKey: [
      'get_withdrawal_requests',
      page,
      limit,
      filter,
      search,
      dateRange?.start,
      dateRange?.end,
    ],
    queryFn: () =>
      request
        .post(`/getWithdrawalRequestsV2`, buildPayload())
        .then((res) => {
          return res.data.result;
        })
        .catch((error) => {
          console.error('API Error:', error);
          throw error.response?.data || error;
        }),
    placeholderData: (previousData) => previousData,
  });
};

export const useApproveWithdrawal = () => {
  const request = useRequestInstance();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (values: unknown) =>
      request
        .post(`/approveWithdrawal`, values)
        .then((res) => res.data)
        .catch((error) => {
          throw error.response?.data || error;
        }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['get_withdrawal_requests'] });
      queryClient.invalidateQueries({ queryKey: ['get_withdrawal_stats'] });
    },
  });
};

export const useRejectWithdrawal = () => {
  const request = useRequestInstance();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (values: unknown) =>
      request
        .post(`/rejectWithdrawal`, values)
        .then((res) => res.data)
        .catch((error) => {
          throw error.response?.data || error;
        }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['get_withdrawal_requests'] });
      queryClient.invalidateQueries({ queryKey: ['get_withdrawal_stats'] });
    },
  });
};

export const useGetWithdrawalStats = () => {
  const request = useRequestInstance();

  return useQuery({
    queryKey: ['get_withdrawal_stats'],
    queryFn: () =>
      request
        .post(`/withdrawalRequestStatsV2`)
        .then((res) => res.data)
        .catch((error) => {
          throw error.response?.data || error;
        }),
  });
};
