import axios, { AxiosResponse } from "axios";
import { BASE_URL, getSessionTokenHeaders } from "./userApi";
import { ApiResponse } from "./interface";

const NotificationApi = {
  fetchNotifications(): Promise<AxiosResponse<ApiResponse>> {
    return axios.post(
      `${BASE_URL}/getNotifications`,
      {},
      { headers: getSessionTokenHeaders() }
    );
  },
  readNotification(
    notificationId: string
  ): Promise<AxiosResponse<ApiResponse>> {
    return axios.post(
      `${BASE_URL}/readNotification`,
      { notificationId },
      { headers: getSessionTokenHeaders() }
    );
  },
};
export default NotificationApi;
