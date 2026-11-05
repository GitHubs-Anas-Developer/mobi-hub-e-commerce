import express from "express";

import {
  addReview,
  fetchProductReviews,
  fetchMyReviews,
  editReview,
  removeReview,
  fetchAllReviews,
  changeReviewVisibility,
} from "../controllers/review.controller.js";

import { authenticate, authorize } from "../middlewares/auth.middleware.js";

import { validate } from "../middlewares/validate.middleware.js";

import {
  createReviewSchema,
  updateReviewSchema,
  reviewIdSchema,
  productIdSchema,
  reviewQuerySchema,
  updateReviewVisibilitySchema,
} from "../validators/review.validator.js";

const router = express.Router();

// Public: Product reviews
router.get(
  "/product/:productId",
  validate(productIdSchema, "params"),
  validate(reviewQuerySchema, "query"),
  fetchProductReviews,
);

// Authenticated customer routes
router.use(authenticate);

router.post("/", validate(createReviewSchema, "body"), addReview);

router.get("/my", validate(reviewQuerySchema, "query"), fetchMyReviews);

router.patch(
  "/:reviewId",
  validate(reviewIdSchema, "params"),
  validate(updateReviewSchema, "body"),
  editReview,
);

router.delete("/:reviewId", validate(reviewIdSchema, "params"), removeReview);

// Admin routes
router.get(
  "/admin/all",
  authorize("admin"),
  validate(reviewQuerySchema, "query"),
  fetchAllReviews,
);

router.patch(
  "/admin/:reviewId/visibility",
  authorize("admin"),
  validate(reviewIdSchema, "params"),
  validate(updateReviewVisibilitySchema, "body"),
  changeReviewVisibility,
);

export default router;
