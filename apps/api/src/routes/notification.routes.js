import express from "express";

import {
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  removeNotification,
  removeAllNotifications,
} from "../controllers/notification.controller.js";

import { authenticate } from "../middlewares/auth.middleware.js";
import validateObjectId from "../middlewares/validate-object-id.middleware.js";

const router = express.Router();

// Authentication required for all routes
router.use(authenticate);

// Get unread notification count
router.get("/unread-count", getUnreadCount);

// Get all notifications
router.get("/", getNotifications);

// Mark all notifications as read
router.patch("/read-all", markAllAsRead);

// Delete all notifications
router.delete("/delete-all", removeAllNotifications);

// Mark single notification as read
router.patch("/:id/read", validateObjectId("id"), markAsRead);

// Delete single notification
router.delete("/:id", validateObjectId("id"), removeNotification);

export default router;
