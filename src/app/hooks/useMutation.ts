import { useMutation } from '@tanstack/react-query';
import { notificationService } from '../api/pushNotification';
import { SendToAllRequest, SendToUsersRequest } from '../api/pushNotification';

export const useSendNotificationToAll = () => {
  return useMutation({
    mutationFn: (data: SendToAllRequest) => notificationService.sendToAll(data),
  });
};

export const useSendNotificationToUsers = () => {
  return useMutation({
    mutationFn: (data: SendToUsersRequest) =>
      notificationService.sendToUsers(data),
  });
};
