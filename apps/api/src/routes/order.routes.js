import express from "express";

import {
  placeOrder,
  fetchUserOrders,
  fetchOrderById,
  cancelUserOrder,
  fetchAllOrders,
  changeOrderStatus,
  changePaymentStatus,
  fetchAdminOrderById,
} from "../controllers/order.controller.js";

import { authenticate, authorize } from "../middlewares/auth.middleware.js";
import { validate } from "../middlewares/validate.middleware.js";

import {
  createOrderSchema,
  orderIdSchema,
  updateOrderStatusSchema,
  updatePaymentStatusSchema,
  orderQuerySchema,
} from "../validators/order.validator.js";

const router = express.Router();

// Authentication
router.use(authenticate);

// Admin routes
router.get(
  "/admin/all",
  authorize("admin"),
  validate(orderQuerySchema, "query"),
  fetchAllOrders,
);

router.patch(
  "/admin/:orderId/status",
  authorize("admin"),
  validate(orderIdSchema, "params"),
  validate(updateOrderStatusSchema, "body"),
  changeOrderStatus,
);

router.patch(
  "/admin/:orderId/payment",
  authorize("admin"),
  validate(orderIdSchema, "params"),
  validate(updatePaymentStatusSchema, "body"),
  changePaymentStatus,
);

// User routes
router.post("/", validate(createOrderSchema, "body"), placeOrder);

router.get("/", validate(orderQuerySchema, "query"), fetchUserOrders);

router.get(
  "/admin/:orderId",
  authorize("admin"),
  validate(orderIdSchema, "params"),
  fetchAdminOrderById,
);

router.get("/:orderId", validate(orderIdSchema, "params"), fetchOrderById);

router.patch(
  "/:orderId/cancel",
  validate(orderIdSchema, "params"),
  cancelUserOrder,
);

export default router;
