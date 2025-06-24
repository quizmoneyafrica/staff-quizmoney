import { useMutation, useQueryClient } from '@tanstack/react-query';

import { notificationService } from '../api/pushNotification';
import { SendToAllRequest, SendToUsersRequest } from '../api/pushNotification';

export const useSendNotificationToAll = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: SendToAllRequest) => notificationService.sendToAll(data),
    onSuccess: (data) => {
      console.log('Notification sent to all users successfully:', data);
    },
    onError: (error) => {
      console.error('Failed to send notification to all users:', error);
    },
  });
};

export const useSendNotificationToUsers = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: SendToUsersRequest) =>
      notificationService.sendToUsers(data),
    onSuccess: (data) => {
      console.log('Notification sent to selected users successfully:', data);
    },
    onError: (error) => {
      console.error('Failed to send notification to selected users:', error);
    },
  });
};
