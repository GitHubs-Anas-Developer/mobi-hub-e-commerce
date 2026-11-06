import express from "express";

import {
  createPayment,
  verifyCustomerPayment,
  razorpayWebhook,
  processRefund,
} from "../controllers/payment.controller.js";

import { authenticate, authorize } from "../middlewares/auth.middleware.js";
import { validate } from "../middlewares/validate.middleware.js";

import {
  initiatePaymentSchema,
  refundPaymentSchema,
  verifyPaymentSchema,
} from "../validators/payment.validator.js";

const router = express.Router();

// Razorpay Webhook (Public)
router.post("/webhook", razorpayWebhook);

// Customer Payment Routes
router.use(authenticate);

// Admin Refund
router.post(
  "/admin/refund",
  authorize("admin"),
  validate(refundPaymentSchema, "body"),
  processRefund,
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
