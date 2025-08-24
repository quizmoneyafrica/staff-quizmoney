import { AxiosResponse } from 'axios';
import { ApiResponse } from './interface';
import { request } from '@/app/api/config';

const WithdrawalApi = {
  fetchWithdrawalRequest(): Promise<AxiosResponse<ApiResponse>> {
    return request.post(`/getWithdrawalRequestsV2`);
  },
  approveWithdrawal(
    transactionId: string,
    fee: number,
  ): Promise<AxiosResponse<ApiResponse>> {
    return request.post(`/approveWithdrawal`, {
      transactionId: transactionId,
      fee: fee,
    });
  },
  rejectWithdrawal(): Promise<AxiosResponse<ApiResponse>> {
    return request.post(`/rejectWithdrawal`);
  },
};

export default WithdrawalApi;
