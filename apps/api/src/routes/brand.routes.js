
import express from "express";

import {
  createBrand,
  getAllBrands,
  getBrandById,
  updateBrand,
  deleteBrand,
  toggleBrandStatus,
} from "../controllers/admin-brand.controller.js";

import { validate } from "../middlewares/validate.middleware.js";
import {
  authenticate,
  authorize,
} from "../middlewares/auth.middleware.js";

import {
  brandIdSchema,
  createBrandSchema,
  updateBrandSchema,
} from "../validators/brand.validator.js";

const router = express.Router();

// Public routes
router.get("/", getAllBrands);

router.get(
  "/:brandId",
  validate(brandIdSchema, "params"),
  getBrandById,
);

// Admin routes
router.post(
  "/",
  authenticate,
  authorize("admin"),
  validate(createBrandSchema, "body"),
  createBrand,
);

router.patch(
  "/:brandId",
  authenticate,
  authorize("admin"),
  validate(brandIdSchema, "params"),
  validate(updateBrandSchema, "body"),
  updateBrand,
);

router.delete(
  "/:brandId",
  authenticate,
  authorize("admin"),
  validate(brandIdSchema, "params"),
  deleteBrand,
);

router.patch(
  "/:brandId/status",
  authenticate,
  authorize("admin"),
  validate(brandIdSchema, "params"),
  toggleBrandStatus,
);

export default router;
