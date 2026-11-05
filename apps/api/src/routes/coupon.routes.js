import express from "express";

import {
  addCoupon,
  fetchAllCoupons,
  fetchCouponById,
  editCoupon,
  removeCoupon,
  changeCouponStatus,
  applyCouponCode,
} from "../controllers/coupon.controller.js";

import { authenticate, authorize } from "../middlewares/auth.middleware.js";

import { validate } from "../middlewares/validate.middleware.js";

import {
  createCouponSchema,
  updateCouponSchema,
  couponIdSchema,
  updateCouponStatusSchema,
  couponQuerySchema,
  applyCouponSchema,
} from "../validators/coupon.validator.js";

const router = express.Router();

// Authentication required for all coupon routes
router.use(authenticate);

// Customer Apply Coupon
router.post("/apply", validate(applyCouponSchema, "body"), applyCouponCode);

// Admin authentication required for remaining routes
router.use(authorize("admin"));

// Create Coupon
router.post("/", validate(createCouponSchema, "body"), addCoupon);

// Get All Coupons
router.get("/", validate(couponQuerySchema, "query"), fetchAllCoupons);

// Get Coupon By ID
router.get("/:couponId", validate(couponIdSchema, "params"), fetchCouponById);

// Activate / Deactivate Coupon
router.patch(
  "/:couponId/status",
  validate(couponIdSchema, "params"),
  validate(updateCouponStatusSchema, "body"),
  changeCouponStatus,
);

// Update Coupon
router.patch(
  "/:couponId",
  validate(couponIdSchema, "params"),
  validate(updateCouponSchema, "body"),
  editCoupon,
);

// Delete Coupon
router.delete("/:couponId", validate(couponIdSchema, "params"), removeCoupon);

export default router;
