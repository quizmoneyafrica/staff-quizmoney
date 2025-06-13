import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRequestInstance } from './config';

export const useGetWithdrawalRequests = (page, limit, filter) => {
  const request = useRequestInstance();

  return useQuery({
    queryKey: ['get_withdrawal_requests', page, limit, filter],
    queryFn: () =>
      request
        .post(`/getWithdrawalRequests`, {
          page,
          limit,
          filter: filter === 'all' ? undefined : filter,
        })
        .then((res) => res.data)
        .catch((error) => {
          throw error.response.data;
        }),
  });
};

export const useApproveWithdrawal = () => {
  const request = useRequestInstance();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (values: UnknownObject) =>
      request
        .post(`/approveWithdrawal`, values)
        .then((res) => res.data)
        .catch((error) => {
          throw error.response.data;
        }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['get_withdrawal_requests'] });
    },
  });
};

export const useRejectWithdrawal = () => {
  const request = useRequestInstance();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (values: UnknownObject) =>
      request
        .post(`/rejectWithdrawal`, values)
        .then((res) => res.data)
        .catch((error) => {
          throw error.response.data;
        }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['get_withdrawal_requests'] });
    },
  });
};
