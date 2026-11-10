import { createSlice } from "@reduxjs/toolkit";

import {
  fetchNotifications,
  fetchUnreadCount,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
  deleteAllNotifications,
} from "../thunks/notificationThunks";

const initialState = {
  notifications: [],
  unreadCount: 0,
  pagination: {
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 0,
  },
  isLoading: false,
  isMutating: false,
  error: null,
};

const notificationSlice = createSlice({
  name: "notifications",
  initialState,

  reducers: {
    clearNotificationError: (state) => {
      state.error = null;
    },

    resetNotifications: () => initialState,
  },

  extraReducers: (builder) => {
    builder

      // Fetch notifications
      .addCase(fetchNotifications.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchNotifications.fulfilled, (state, action) => {
        state.isLoading = false;

        const result = action.payload?.data || {};

        state.notifications = result.notifications || [];
        state.pagination = result.pagination || initialState.pagination;

        state.unreadCount = state.notifications.filter(
          (notification) => !notification.isRead,
        ).length;
      })
      .addCase(fetchNotifications.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || "Failed to fetch notifications";
      })

      // Fetch unread count
      .addCase(fetchUnreadCount.fulfilled, (state, action) => {
        state.unreadCount =
          action.payload?.data?.unreadCount ?? state.unreadCount;
      })

      // Mark single notification as read
      .addCase(markNotificationAsRead.pending, (state) => {
        state.isMutating = true;
        state.error = null;
      })
      .addCase(markNotificationAsRead.fulfilled, (state, action) => {
        state.isMutating = false;

        const notification = state.notifications.find(
          (item) => item._id === action.payload,
        );

        if (notification && !notification.isRead) {
          notification.isRead = true;
          notification.readAt = new Date().toISOString();
          state.unreadCount = Math.max(0, state.unreadCount - 1);
        }
      })
      .addCase(markNotificationAsRead.rejected, (state, action) => {
        state.isMutating = false;
        state.error = action.payload || "Failed to mark notification as read";
      })

      // Mark all notifications as read
      .addCase(markAllNotificationsAsRead.pending, (state) => {
        state.isMutating = true;
        state.error = null;
      })
      .addCase(markAllNotificationsAsRead.fulfilled, (state) => {
        state.isMutating = false;

        state.notifications.forEach((notification) => {
          notification.isRead = true;
          notification.readAt = notification.readAt || new Date().toISOString();
        });

        state.unreadCount = 0;
      })
      .addCase(markAllNotificationsAsRead.rejected, (state, action) => {
        state.isMutating = false;
        state.error =
          action.payload || "Failed to mark all notifications as read";
      })

      // Delete single notification
      .addCase(deleteNotification.pending, (state) => {
        state.isMutating = true;
        state.error = null;
      })
      .addCase(deleteNotification.fulfilled, (state, action) => {
        state.isMutating = false;

        const notification = state.notifications.find(
          (item) => item._id === action.payload,
        );

        if (notification && !notification.isRead) {
          state.unreadCount = Math.max(0, state.unreadCount - 1);
        }

        state.notifications = state.notifications.filter(
          (item) => item._id !== action.payload,
        );

        state.pagination.total = Math.max(0, state.pagination.total - 1);
      })
      .addCase(deleteNotification.rejected, (state, action) => {
        state.isMutating = false;
        state.error = action.payload || "Failed to delete notification";
      })

      // Delete all notifications
      .addCase(deleteAllNotifications.pending, (state) => {
        state.isMutating = true;
        state.error = null;
      })
      .addCase(deleteAllNotifications.fulfilled, (state) => {
        state.isMutating = false;
        state.notifications = [];
        state.unreadCount = 0;
        state.pagination.total = 0;
        state.pagination.totalPages = 0;
      })
      .addCase(deleteAllNotifications.rejected, (state, action) => {
        state.isMutating = false;
        state.error = action.payload || "Failed to delete all notifications";
      });
  },
});

export const { clearNotificationError, resetNotifications } =
  notificationSlice.actions;

export default notificationSlice.reducer;
