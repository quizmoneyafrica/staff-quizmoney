import axios, { AxiosResponse } from 'axios';
import { BASE_URL, getSessionTokenHeaders } from './userApi';
import { ApiResponse } from './interface';

const SalesApi = {
  getSalesDetails(): Promise<AxiosResponse<ApiResponse>> {
    return axios.post(
      `${BASE_URL}/getSalesDetails`,
      {},
      { headers: getSessionTokenHeaders() },
    );
  },
};

export default SalesApi;
