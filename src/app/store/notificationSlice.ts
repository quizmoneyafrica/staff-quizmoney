import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { ApiResponse } from "../api/interface";

interface NotificationState {
  notifications: ApiResponse["result"] | null;
}
const initialState: NotificationState = {
  notifications: null,
};

const notificationSlice = createSlice({
  name: "notifications",
  initialState,
  reducers: {
    setNotifications(state, action: PayloadAction<ApiResponse["result"]>) {
      state.notifications = action.payload;
    },
    addNotification(
      state,
      action: PayloadAction<ApiResponse["result"][number]>
    ) {
      if (state.notifications) {
        state.notifications.unshift(action.payload);
      } else {
        state.notifications = [action.payload];
      }
    },
    markAsRead(state, action: PayloadAction<string>) {
      if (!state.notifications) return;
      const index = state.notifications.findIndex(
        (n: ApiResponse) => n.objectId === action.payload
      );
      if (index !== -1) {
        state.notifications[index].read = true;
      }
    },
    clearNotifications(state) {
      state.notifications = null;
    },
  },
});

export const {
  setNotifications,
  addNotification,
  markAsRead,
  clearNotifications,
} = notificationSlice.actions;

export default notificationSlice.reducer;
