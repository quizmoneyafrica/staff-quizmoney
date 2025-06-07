import axios, { AxiosResponse } from 'axios';
import { ApiResponse } from './interface';
import { BASE_URL, getSessionTokenHeaders } from './userApi';

const WithdrawalApi = {
  fetchWithdrawalRequest(): Promise<AxiosResponse<ApiResponse>> {
    return axios.post(
      `${BASE_URL}/getWithdrawalRequests`,
      {},
      { headers: getSessionTokenHeaders() },
    );
  },
  approveWithdrawal(
    transactionId: string,
    fee: number,
  ): Promise<AxiosResponse<ApiResponse>> {
    return axios.post(
      `${BASE_URL}/approveWithdrawal`,
      { transactionId: transactionId, fee: fee },
      { headers: getSessionTokenHeaders() },
    );
  },
  rejectWithdrawal(): Promise<AxiosResponse<ApiResponse>> {
    return axios.post(
      `${BASE_URL}/rejectWithdrawal`,
      {},
      { headers: getSessionTokenHeaders() },
    );
  },
};

export default WithdrawalApi;
