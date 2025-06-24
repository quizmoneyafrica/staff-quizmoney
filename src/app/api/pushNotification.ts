import { BASE_URL, getSessionTokenHeaders } from './userApi';

export interface SendToAllRequest {
  title: string;
  body: string;
}

export interface SendToUsersRequest {
  userEmails: string[];
  title: string;
  body: string;
}

export interface ApiResponse {
  success: boolean;
  message?: string;
}

export const notificationService = {
  sendToAll: async (data: SendToAllRequest): Promise<ApiResponse> => {
    const response = await fetch(
      `${BASE_URL}/sendAdminPushNotificationsToAll`,
      {
        method: 'POST',
        headers: getSessionTokenHeaders(),
        body: JSON.stringify(data),
      },
    );

    if (!response.ok) {
      throw new Error(
        `Failed to send notification to all users: ${response.statusText}`,
      );
    }

    return response.json();
  },

  sendToUsers: async (data: SendToUsersRequest): Promise<ApiResponse> => {
    const response = await fetch(`${BASE_URL}/sendAdminPushNotifications`, {
      method: 'POST',
      headers: getSessionTokenHeaders(),
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(
        `Failed to send notification to selected users: ${response.statusText}`,
      );
    }

    return response.json();
  },
};
