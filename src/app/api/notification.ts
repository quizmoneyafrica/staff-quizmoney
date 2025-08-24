import { AxiosResponse } from 'axios';
import { ApiResponse } from './interface';
import { request } from '@/app/api/config';

const NotificationApi = {
  fetchNotifications(): Promise<AxiosResponse<ApiResponse>> {
    return request.post(`/getNotifications`, {});
  },
  readNotification(
    notificationId: string,
  ): Promise<AxiosResponse<ApiResponse>> {
    return request.post(`/readNotification`, { notificationId });
  },
};

export default NotificationApi;
