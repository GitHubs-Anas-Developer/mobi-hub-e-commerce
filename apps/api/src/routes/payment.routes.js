import express from "express";

import {
  createPayment,
  verifyCustomerPayment,
  razorpayWebhook,
  processRefund,
  syncOrderRefund,
  fetchAdminOrderPaymentDetails,
  fetchAdminPayments,
  fetchAdminRefunds,
} from "../controllers/payment.controller.js";

import { authenticate, authorize } from "../middlewares/auth.middleware.js";
import { validate } from "../middlewares/validate.middleware.js";

import {
  initiatePaymentSchema,
  refundPaymentSchema,
  syncOrderRefundSchema,
  verifyPaymentSchema,
} from "../validators/payment.validator.js";
import { orderIdSchema } from "../validators/order.validator.js";

const router = express.Router();

// Razorpay Webhook (Public)
router.post("/webhook", razorpayWebhook);

// Customer Payment Routes
router.use(authenticate);

// Admin Payment & Refund Inspection / Action Routes
router.get(
  "/admin/transactions",
  authorize("admin"),
  fetchAdminPayments,
);

router.get(
  "/admin/refunds",
  authorize("admin"),
  fetchAdminRefunds,
);

router.get(
  "/admin/order/:orderId",
  authorize("admin"),
  validate(orderIdSchema, "params"),
  fetchAdminOrderPaymentDetails,
);

router.post(
  "/admin/refund",
  authorize("admin"),
  validate(refundPaymentSchema, "body"),
  processRefund,
);

router.post(
  "/admin/refund/sync",
  authorize("admin"),
  validate(syncOrderRefundSchema, "body"),
  syncOrderRefund,
);

router.post(
  "/initiate",
  validate(initiatePaymentSchema, "body"),
  createPayment,
);

router.post(
  "/verify",
  validate(verifyPaymentSchema, "body"),
  verifyCustomerPayment,
);

export default router;
