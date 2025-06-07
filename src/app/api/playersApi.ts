import axios, { AxiosResponse } from 'axios';
import { BASE_URL, getSessionTokenHeaders } from './userApi';
import { ApiResponse } from './interface';

const PlayersApi = {
  fetchAdminPlayers(): Promise<AxiosResponse<ApiResponse>> {
    return axios.post(
      `${BASE_URL}/fetchAdminPlayers`,
      {},
      { headers: getSessionTokenHeaders() },
    );
  },
};

export default PlayersApi;
