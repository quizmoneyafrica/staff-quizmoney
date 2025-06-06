import axios, { AxiosResponse } from "axios";
import { BASE_URL, getSessionTokenHeaders } from "./userApi";
import { ApiResponse } from "./interface";

const DashboardApi = {
  fetchDashboardDetails(user: string): Promise<AxiosResponse<ApiResponse>> {
    return axios.post(
      `${BASE_URL}/fetchAdminDashboardDetails`, 
      { objectID: user },
      { headers: getSessionTokenHeaders() }
    );
  },
};

export default DashboardApi;
