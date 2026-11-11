import express from "express";

import {
  getAdminUsers,
  getAdminUserById,
  updateUserStatus,
} from "../controllers/admin-user.controller.js";

import { authenticate, authorize } from "../middlewares/auth.middleware.js";

import { validate } from "../middlewares/validate.middleware.js";

import {
  getAdminUsersSchema,
  userIdSchema,
  updateUserStatusSchema,
} from "../validators/admin-user.validator.js";

const router = express.Router();

// Admin authentication
router.use(authenticate, authorize("admin"));

// Get all customers
router.get("/", validate(getAdminUsersSchema, "query"), getAdminUsers);

// Get single customer
router.get("/:userId", validate(userIdSchema, "params"), getAdminUserById);

// Activate / Deactivate customer
router.patch(
  "/:userId/status",
  validate(userIdSchema, "params"),
  validate(updateUserStatusSchema, "body"),
  updateUserStatus,
);

export default router;
