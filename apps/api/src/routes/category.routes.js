import express from "express";

import {
  createCategory,
  getAllCategories,
  getCategoryById,
  updateCategory,
  deleteCategory,
  toggleCategoryStatus,
} from "../controllers/category.controller.js";

import { validate } from "../middlewares/validate.middleware.js";


import { authenticate, authorize } from "../middlewares/auth.middleware.js";
import { categoryIdSchema, createCategorySchema, updateCategorySchema } from "../validators/category.validator.js";

const router = express.Router();

// Public routes
router.get("/", getAllCategories);

router.get(
  "/:categoryId",
  validate(categoryIdSchema, "params"),
  getCategoryById,
);

// Admin routes
router.post(
  "/",
  authenticate,
  authorize("admin"),
  validate(createCategorySchema, "body"),
  createCategory,
);

router.patch(
  "/:categoryId",
  authenticate,
  authorize("admin"),
  validate(categoryIdSchema, "params"),
  validate(updateCategorySchema, "body"),
  updateCategory,
);

router.delete(
  "/:categoryId",
  authenticate,
  authorize("admin"),
  validate(categoryIdSchema, "params"),
  deleteCategory,
);

router.patch(
  "/:categoryId/status",
  authenticate,
  authorize("admin"),
  validate(categoryIdSchema, "params"),
  toggleCategoryStatus,
);

export default router;
