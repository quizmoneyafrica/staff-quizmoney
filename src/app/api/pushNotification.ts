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

export interface CreatePushNotificationRequest {
  subject: string;
  message: string;
  image?: string;
}

export interface GetPushNotificationsRequest {
  page: number;
  limit: number;
  dateRange?: {
    start: string;
    end: string;
  };
}

export interface UpdatePushNotificationRequest {
  notificationId: string;
  subject: string;
  message: string;
  image?: string;
}

export interface GetPushNotificationByIdRequest {
  notificationId: string;
}

export interface DeletePushNotificationRequest {
  notificationId: string;
}

export interface DeletePushNotificationResponse {
  message: string;
  success?: boolean;
}

export interface DeleteApiResponse {
  success: boolean;
  message?: string;
  result?: DeletePushNotificationResponse;
}

export interface PushNotificationFromAPI {
  objectId: string;
  subject: string;
  message: string;
  image?: string;
  createdAt: string;
  updatedAt: string;
  __type: string;
  className: string;
}

export interface GetPushNotificationsResponse {
  message: string;
  pushNotifications: PushNotificationFromAPI[];
  totalCount?: number;
}

export interface CreatePushNotificationResponse {
  message: string;
  notification?: PushNotificationFromAPI;
}

export interface UpdatePushNotificationResponse {
  message: string;
  notification?: PushNotificationFromAPI;
}

export interface GetPushNotificationByIdResponse {
  message: string;
  notification?: PushNotificationFromAPI;
}

export interface ApiResponse {
  success: boolean;
  message?: string;
  result?: GetPushNotificationsResponse;
}

export interface CreateApiResponse {
  success: boolean;
  message?: string;
  result?: CreatePushNotificationResponse;
}

export interface UpdateApiResponse {
  success: boolean;
  message?: string;
  result?: UpdatePushNotificationResponse;
}

export interface GetByIdApiResponse {
  success: boolean;
  message?: string;
  result?: GetPushNotificationByIdResponse;
}

export const notificationService = {
  getPushNotifications: async (
    data: GetPushNotificationsRequest,
  ): Promise<ApiResponse> => {
    const response = await fetch(`${BASE_URL}/getPushNotifications`, {
      method: 'POST',
      headers: getSessionTokenHeaders(),
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(
        `Failed to fetch push notifications: ${response.statusText}`,
      );
    }

    return response.json();
  },

  getPushNotificationById: async (
    data: GetPushNotificationByIdRequest,
  ): Promise<GetByIdApiResponse> => {
    const response = await fetch(`${BASE_URL}/getPushNotificationById`, {
      method: 'POST',
      headers: getSessionTokenHeaders(),
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(
        `Failed to fetch push notification: ${response.statusText}`,
      );
    }

    return response.json();
  },

  createPushNotification: async (
    data: CreatePushNotificationRequest,
  ): Promise<CreateApiResponse> => {
    const response = await fetch(`${BASE_URL}/createPushNotification`, {
      method: 'POST',
      headers: getSessionTokenHeaders(),
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(
        `Failed to create push notification: ${response.statusText}`,
      );
    }

    return response.json();
  },

  updatePushNotification: async (
    data: UpdatePushNotificationRequest,
  ): Promise<UpdateApiResponse> => {
    const response = await fetch(`${BASE_URL}/updatePushNotification`, {
      method: 'POST',
      headers: getSessionTokenHeaders(),
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(
        `Failed to update push notification: ${response.statusText}`,
      );
    }

    return response.json();
  },

  deletePushNotification: async (
    data: DeletePushNotificationRequest,
  ): Promise<DeleteApiResponse> => {
    const response = await fetch(`${BASE_URL}/deletePushNotification`, {
      method: 'POST',
      headers: getSessionTokenHeaders(),
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(
        `Failed to delete push notification: ${response.statusText}`,
      );
    }

    return response.json();
  },

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
