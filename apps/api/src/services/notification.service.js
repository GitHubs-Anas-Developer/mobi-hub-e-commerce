import mongoose from "mongoose";

import Notification from "../models/notification.model.js";

const createError = (message, statusCode = 400) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

// Create notification
export const createNotification = async ({
  recipient,
  title,
  message,
  type,
  relatedId = null,
  relatedModel = null,
}) => {
  if (!mongoose.isValidObjectId(recipient)) {
    throw createError("Invalid notification recipient");
  }

  const notification = await Notification.create({
    recipient,
    title,
    message,
    type,
    relatedId,
    relatedModel,
  });

  return notification;
};

// Get user notifications
export const getUserNotifications = async (
  userId,
  { page = 1, limit = 10, isRead },
) => {
  const filter = { recipient: userId };

  if (typeof isRead === "boolean") {
    filter.isRead = isRead;
  }

  const skip = (page - 1) * limit;

  const [notifications, total] = await Promise.all([
    Notification.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),

    Notification.countDocuments(filter),
  ]);

  return {
    notifications,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
};

// Get unread notification count
export const getUnreadNotificationCount = async (userId) => {
  return Notification.countDocuments({
    recipient: userId,
    isRead: false,
  });
};

// Mark single notification as read
export const markNotificationAsRead = async (notificationId, userId) => {
  const notification = await Notification.findOneAndUpdate(
    {
      _id: notificationId,
      recipient: userId,
      isRead: false,
    },
    {
      $set: {
        isRead: true,
        readAt: new Date(),
      },
    },
    {
      new: true,
      runValidators: true,
    },
  );

  if (!notification) {
    const existing = await Notification.exists({
      _id: notificationId,
      recipient: userId,
    });

    if (!existing) {
      throw createError("Notification not found", 404);
    }

    return Notification.findById(notificationId).lean();
  }

  return notification;
};

// Mark all notifications as read
export const markAllNotificationsAsRead = async (userId) => {
  const result = await Notification.updateMany(
    {
      recipient: userId,
      isRead: false,
    },
    {
      $set: {
        isRead: true,
        readAt: new Date(),
      },
    },
  );

  return {
    modifiedCount: result.modifiedCount,
  };
};

// Delete single notification
export const deleteNotification = async (notificationId, userId) => {
  const notification = await Notification.findOneAndDelete({
    _id: notificationId,
    recipient: userId,
  });

  if (!notification) {
    throw createError("Notification not found", 404);
  }

  return notification;
};

// Delete all user notifications
export const deleteAllNotifications = async (userId) => {
  const result = await Notification.deleteMany({
    recipient: userId,
  });

  return {
    deletedCount: result.deletedCount,
  };
};
