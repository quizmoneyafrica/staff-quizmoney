import axios, { AxiosResponse } from "axios";
import { appHeaders, BASE_URL } from "./userApi";
import { ApiResponse } from "./interface";

const DashboardApi = {
  fetchDashboardDetails(user: string): Promise<AxiosResponse<ApiResponse>> {
    return axios.post(
      `${BASE_URL}/fetchAdminDashboardDetails`,
      { objectID: user },
      { headers: appHeaders }
    );
  },
};

export default DashboardApi;
