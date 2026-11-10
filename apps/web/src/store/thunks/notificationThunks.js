import { createAsyncThunk } from "@reduxjs/toolkit";
import notificationService from "@/services/notificationService";

export const fetchNotifications = createAsyncThunk(
  "notifications/fetchNotifications",
  async (params = {}, { rejectWithValue }) => {
    try {
      return await notificationService.getNotifications(params);
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch notifications",
      );
    }
  },
);

export const fetchUnreadCount = createAsyncThunk(
  "notifications/fetchUnreadCount",
  async (_, { rejectWithValue }) => {
    try {
      return await notificationService.getUnreadCount();
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch unread count",
      );
    }
  },
);

export const markNotificationAsRead = createAsyncThunk(
  "notifications/markAsRead",
  async (notificationId, { rejectWithValue }) => {
    try {
      await notificationService.markAsRead(notificationId);
      return notificationId;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to mark notification as read",
      );
    }
  },
);

export const markAllNotificationsAsRead = createAsyncThunk(
  "notifications/markAllAsRead",
  async (_, { rejectWithValue }) => {
    try {
      return await notificationService.markAllAsRead();
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message ||
          "Failed to mark all notifications as read",
      );
    }
  },
);

export const deleteNotification = createAsyncThunk(
  "notifications/deleteNotification",
  async (notificationId, { rejectWithValue }) => {
    try {
      await notificationService.removeNotification(notificationId);
      return notificationId;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to delete notification",
      );
    }
  },
);

export const deleteAllNotifications = createAsyncThunk(
  "notifications/deleteAllNotifications",
  async (_, { rejectWithValue }) => {
    try {
      return await notificationService.removeAllNotifications();
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to delete all notifications",
      );
    }
  },
);
