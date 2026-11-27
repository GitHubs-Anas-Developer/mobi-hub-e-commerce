import express from "express";

// ==========================================
// Order Controllers
// ==========================================

import {
  placeOrder,
  fetchUserOrders,
  fetchOrderById,
  cancelUserOrder,
  cancelAdminOrder,
  fetchAllOrders,
  changeOrderStatus,
  changePaymentStatus,
  fetchAdminOrderById,
  fetchUserOrderTracking,
  changeShipmentTracking,
} from "../controllers/order.controller.js";

// ==========================================
// Shiprocket Controllers
// ==========================================

import {
  checkCourierServiceabilityController,
  createMockShipmentController,
  updateMockShipmentTrackingController,
} from "../controllers/shiprocket.controller.js";

// ==========================================
// Middlewares
// ==========================================

import { authenticate, authorize } from "../middlewares/auth.middleware.js";

import { validate } from "../middlewares/validate.middleware.js";

// ==========================================
// Validators
// ==========================================

import {
  createOrderSchema,
  orderIdSchema,
  cancelOrderSchema,
  adminCancelOrderSchema,
  updateOrderStatusSchema,
  updatePaymentStatusSchema,
  orderQuerySchema,
  updateShipmentTrackingSchema,
} from "../validators/order.validator.js";

// ==========================================
// Router
// ==========================================

const router = express.Router();

// ==========================================
// Authentication
// ==========================================

router.use(authenticate);

// ==========================================
// Admin Routes
// ==========================================

// Create Mock Shipment
router.post(
  "/admin/:orderId/mock-shipment",
  authorize("admin"),
  validate(orderIdSchema, "params"),
  createMockShipmentController,
);

// Update Mock Shipment Tracking
router.patch(
  "/admin/:orderId/mock-tracking",
  authorize("admin"),
  validate(orderIdSchema, "params"),
  updateMockShipmentTrackingController,
);

// Update Shipment Tracking (Manual Admin Update)
router.patch(
  "/admin/:orderId/shipment",
  authorize("admin"),
  validate(orderIdSchema, "params"),
  validate(updateShipmentTrackingSchema, "body"),
  changeShipmentTracking,
);

// Fetch All Orders
router.get(
  "/admin/all",
  authorize("admin"),
  validate(orderQuerySchema, "query"),
  fetchAllOrders,
);

// Update Order Status
router.patch(
  "/admin/:orderId/status",
  authorize("admin"),
  validate(orderIdSchema, "params"),
  validate(updateOrderStatusSchema, "body"),
  changeOrderStatus,
);

// Update Payment Status
router.patch(
  "/admin/:orderId/payment",
  authorize("admin"),
  validate(orderIdSchema, "params"),
  validate(updatePaymentStatusSchema, "body"),
  changePaymentStatus,
);

// Fetch Admin Order Details
router.get(
  "/admin/:orderId",
  authorize("admin"),
  validate(orderIdSchema, "params"),
  fetchAdminOrderById,
);

// Cancel Order (Admin)
router.patch(
  "/admin/:orderId/cancel",
  authorize("admin"),
  validate(orderIdSchema, "params"),
  validate(adminCancelOrderSchema, "body"),
  cancelAdminOrder,
);

// ==========================================
// Shiprocket Routes
// ==========================================

// Check Courier Serviceability
router.post(
  "/shipping/courier-serviceability",
  checkCourierServiceabilityController,
);

// ==========================================
// User Routes
// ==========================================

// Place New Order
router.post("/", validate(createOrderSchema, "body"), placeOrder);

// Fetch Logged-in User Orders
router.get("/", validate(orderQuerySchema, "query"), fetchUserOrders);

// Fetch User Order Tracking
// Keep this before /:orderId
router.get(
  "/:orderId/tracking",
  validate(orderIdSchema, "params"),
  fetchUserOrderTracking,
);

// Fetch Order Details
router.get("/:orderId", validate(orderIdSchema, "params"), fetchOrderById);

// Cancel Order
router.patch(
  "/:orderId/cancel",
  validate(orderIdSchema, "params"),
  validate(cancelOrderSchema, "body"),
  cancelUserOrder,
);

export default router;
