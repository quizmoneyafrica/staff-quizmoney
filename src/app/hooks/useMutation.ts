import { useMutation } from '@tanstack/react-query';
import {
  notificationService,
  SendPushNotificationByIdRequest,
  SendToUsersRequest,
} from '../api/pushNotification';

export const useSendNotificationToAll = () => {
  return useMutation({
    mutationFn: (data: SendPushNotificationByIdRequest) =>
      notificationService.sendPushNotificationById(data),
  });
};

// export const useSendPushNotificationById = () => {
//   return useMutation({
//     mutationFn: (data: SendPushNotificationByIdRequest) =>
//       notificationService.sendPushNotificationById(data),
//   });
// };

export const useSendNotificationToUsers = () => {
  return useMutation({
    mutationFn: (data: SendToUsersRequest) =>
      notificationService.sendToUsers(data),
  });
};
