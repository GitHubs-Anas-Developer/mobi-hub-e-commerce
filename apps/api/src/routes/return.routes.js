import express from "express";

import {
  createReturnRequest,
  getAdminReturnsList,
  reviewReturnRequestController,
  markReturnProductReceivedController,
  inspectReturnProductController,
  restoreReturnStockController,
  processReturnRefundController,
} from "../controllers/return.controller.js";

import { authenticate, authorize } from "../middlewares/auth.middleware.js";

import { validate } from "../middlewares/validate.middleware.js";

import { requestReturnSchema } from "../validators/return.validator.js";

import { reviewReturnSchema } from "../validators/admin-return.validator.js";

import { inspectReturnSchema } from "../validators/admin-return-inspection.validator.js";

import { processReturnRefundSchema } from "../validators/admin-return-refund.validator.js";
const router = express.Router();

// Customer: Create return request
router.post(
  "/",
  authenticate,
  validate(requestReturnSchema),
  createReturnRequest,
);

// Admin: Get all return requests
router.get("/admin", authenticate, authorize("admin"), getAdminReturnsList);

// Admin: Approve or Reject return request
router.patch(
  "/admin/:id/review",
  authenticate,
  authorize("admin"),
  validate(reviewReturnSchema),
  reviewReturnRequestController,
);

// Admin: Mark return product as received
router.patch(
  "/admin/:id/received",
  authenticate,
  authorize("admin"),
  markReturnProductReceivedController,
);

// Admin: Inspect returned product
router.patch(
  "/admin/:id/inspect",
  authenticate,
  authorize("admin"),
  validate(inspectReturnSchema),
  inspectReturnProductController,
);

// Admin: Restore stock after inspection passed
router.patch(
  "/admin/:id/restore-stock",
  authenticate,
  authorize("admin"),
  restoreReturnStockController,
);

// Admin: Process return refund
router.post(
  "/admin/:id/refund",
  authenticate,
  authorize("admin"),
  validate(processReturnRefundSchema),
  processReturnRefundController,
);
export default router;
