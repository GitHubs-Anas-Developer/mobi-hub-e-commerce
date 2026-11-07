import {
  createNotification,
  getUserNotifications,
  getUnreadNotificationCount,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
  deleteAllNotifications,
} from "../services/notification.service.js";

// Get logged-in user's notifications
export const getNotifications = async (req, res) => {
  const { page = 1, limit = 10, isRead } = req.query;

  const result = await getUserNotifications(req.user._id, {
    page: Math.max(1, Number(page) || 1),
    limit: Math.min(100, Math.max(1, Number(limit) || 10)),
    isRead: isRead === "true" ? true : isRead === "false" ? false : undefined,
  });

  res.status(200).json({
    success: true,
    message: "Notifications fetched successfully",
    data: result,
  });
};

// Get unread notification count
export const getUnreadCount = async (req, res) => {
  const count = await getUnreadNotificationCount(req.user._id);

  res.status(200).json({
    success: true,
    message: "Unread notification count fetched successfully",
    data: { unreadCount: count },
  });
};

// Mark notification as read
export const markAsRead = async (req, res) => {
  const notification = await markNotificationAsRead(
    req.params.id,
    req.user._id,
  );

  res.status(200).json({
    success: true,
    message: "Notification marked as read",
    data: { notification },
  });
};

// Mark all notifications as read
export const markAllAsRead = async (req, res) => {
  const result = await markAllNotificationsAsRead(req.user._id);

  res.status(200).json({
    success: true,
    message: "All notifications marked as read",
    data: result,
  });
};

// Delete single notification
export const removeNotification = async (req, res) => {
  await deleteNotification(req.params.id, req.user._id);

  res.status(200).json({
    success: true,
    message: "Notification deleted successfully",
  });
};

// Delete all notifications
export const removeAllNotifications = async (req, res) => {
  const result = await deleteAllNotifications(req.user._id);

  res.status(200).json({
    success: true,
    message: "All notifications deleted successfully",
    data: result,
  });
};
