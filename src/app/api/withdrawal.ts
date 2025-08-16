/* eslint-disable @typescript-eslint/no-explicit-any */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRequestInstance } from './config';

interface DateRange {
  start: string;
  end: string;
}

interface WithdrawalRequest {
  id: string;
  purpose: string;
  comment: string;
  amount: number;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  processAt: string;
  createdAt: string;
  firstName: string;
  availableBalance: number;
  approvedBy?: string;
}

interface WithdrawalData {
  content: WithdrawalRequest[];
  pageable: {
    pageNumber: number;
    pageSize: number;
    totalPages: number;
    totalElements: number;
  };
}

interface WithdrawalApiResponse {
  success: boolean;
  code: string;
  message: string;
  data: WithdrawalData;
}

interface SingleWithdrawalApiResponse {
  success: boolean;
  code: string;
  message: string;
  data: WithdrawalRequest;
}

interface DefaultResponse {
  message: string;
  timestamp: string;
}

interface ApproveWithdrawalRequest {
  id: string;
  comment: string;
}

interface RejectWithdrawalRequest {
  id: string;
  comment: string;
}

interface WithdrawalStatsData {
  totalWithdrawalRequest: number;
  totalWithdrawalPerChange: number;
  totalApprovedRequest: number;
  totalApprovedPerChange: number;
  totalPendingRequest: number;
  totalPendingPerChange: number;
}

interface WithdrawalStatsApiResponse {
  success: boolean;
  code: string;
  message: string;
  data: WithdrawalStatsData;
}

export const useGetWithdrawalRequests = (
  page: number,
  pageSize: number,
  status?: string,
  search?: string,
) => {
  const request = useRequestInstance();

  return useQuery({
    queryKey: ['withdrawal_requests', page, pageSize, status, search],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: String(page),
        size: String(pageSize),
        search: search || '',
        ...(status && { status }),
      });

      const response = await request.get<WithdrawalApiResponse>(
        `/withdrawal-requests?${params.toString()}`,
      );

      return response.data.data;
    },
  });
};

export const useGetWithdrawalRequest = (id: string) => {
  const request = useRequestInstance();

  return useQuery({
    queryKey: ['withdrawal_request', id],
    queryFn: async () => {
      const response = await request.get<SingleWithdrawalApiResponse>(
        `/withdrawal-requests/${id}`,
      );

      return response.data.data;
    },
    enabled: !!id,
  });
};

export const useApproveWithdrawal = () => {
  const request = useRequestInstance();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (values: ApproveWithdrawalRequest) => {
      const response = await request.patch<DefaultResponse>(
        `/withdrawal-requests/approve`,
        values,
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['withdrawal_requests'] });
      queryClient.invalidateQueries({ queryKey: ['withdrawal_request'] });
      queryClient.invalidateQueries({ queryKey: ['get_withdrawal_stats'] });
    },
    onError: (error: any) => {
      throw error.response?.data || error;
    },
  });
};

export const useRejectWithdrawal = () => {
  const request = useRequestInstance();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (values: RejectWithdrawalRequest) => {
      const response = await request.patch<DefaultResponse>(
        `/withdrawal-requests/reject`,
        values,
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['withdrawal_requests'] });
      queryClient.invalidateQueries({ queryKey: ['withdrawal_request'] });
      queryClient.invalidateQueries({ queryKey: ['get_withdrawal_stats'] });
    },
    onError: (error: any) => {
      throw error.response?.data || error;
    },
  });
};

export const useGetWithdrawalStats = (dateRange?: DateRange) => {
  const request = useRequestInstance();

  return useQuery({
    queryKey: ['get_withdrawal_stats', dateRange],
    queryFn: async () => {
      const params = new URLSearchParams();

      if (dateRange) {
        params.append('start-date', dateRange.start);
        params.append('end-date', dateRange.end);
      } else {
        const endDate = new Date();
        const startDate = new Date();
        startDate.setDate(endDate.getDate() - 30);

        params.append('start-date', startDate.toISOString().split('T')[0]);
        params.append('end-date', endDate.toISOString().split('T')[0]);
      }

      const response = await request.get<WithdrawalStatsApiResponse>(
        `/withdrawal-requests/summary?${params.toString()}`,
      );

      return response.data.data;
    },
  });
};
