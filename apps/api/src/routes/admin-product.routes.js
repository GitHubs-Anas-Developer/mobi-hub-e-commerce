import express from "express";

import {
  getAdminProducts,
  getAdminProductById,
} from "../controllers/admin-product.controller.js";

import { authenticate, authorize } from "../middlewares/auth.middleware.js";
import { validate } from "../middlewares/validate.middleware.js";
import { productIdSchema } from "../validators/product.validator.js";

const router = express.Router();

// All admin product routes require admin authentication
router.use(authenticate, authorize("admin"));

// Get all products (including inactive products)
router.get("/", getAdminProducts);

// Get single product (including inactive products)
router.get(
  "/:productId",
  validate(productIdSchema, "params"),
  getAdminProductById,
);

export default router;
