import express from "express";

import {
  createProduct,
  getAllProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  toggleProductStatus,
} from "../controllers/product.controller.js";

import { validate } from "../middlewares/validate.middleware.js";

import { authenticate, authorize } from "../middlewares/auth.middleware.js";

import {
  productIdSchema,
  createProductSchema,
  updateProductSchema,
} from "../validators/product.validator.js";

const router = express.Router();

// Public routes
router.get("/", getAllProducts);

router.get("/:productId", validate(productIdSchema, "params"), getProductById);

// Admin routes
router.post(
  "/",
  authenticate,
  authorize("admin"),
  validate(createProductSchema, "body"),
  createProduct,
);

router.patch(
  "/:productId",
  authenticate,
  authorize("admin"),
  validate(productIdSchema, "params"),
  validate(updateProductSchema, "body"),
  updateProduct,
);

router.delete(
  "/:productId",
  authenticate,
  authorize("admin"),
  validate(productIdSchema, "params"),
  deleteProduct,
);

router.patch(
  "/:productId/status",
  authenticate,
  authorize("admin"),
  validate(productIdSchema, "params"),
  toggleProductStatus,
);

export default router;
