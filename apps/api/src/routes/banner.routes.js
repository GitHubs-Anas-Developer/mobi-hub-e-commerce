import express from "express";

import {
  createBanner,
  getAllBanners,
  getBannerById,
  getActiveBanners,
  updateBanner,
  deleteBanner,
} from "../controllers/banner.controller.js";

import { validate } from "../middlewares/validate.middleware.js";
import { authenticate, authorize } from "../middlewares/auth.middleware.js";
import upload from "../middlewares/upload.middleware.js";

import {
  createBannerSchema,
  updateBannerSchema,
  bannerIdSchema,
} from "../validators/banner.validator.js";

const router = express.Router();

// Public route
router.get("/active", getActiveBanners);

// Admin routes
router.get("/", authenticate, authorize("admin"), getAllBanners);

router.get(
  "/:id",
  authenticate,
  authorize("admin"),
  validate(bannerIdSchema, "params"),
  getBannerById,
);

router.post(
  "/",
  authenticate,
  authorize("admin"),
  upload.fields([
    { name: "desktopImage", maxCount: 1 },
    { name: "mobileImage", maxCount: 1 },
  ]),
  validate(createBannerSchema, "body"),
  createBanner,
);

router.patch(
  "/:id",
  authenticate,
  authorize("admin"),
  upload.fields([
    { name: "desktopImage", maxCount: 1 },
    { name: "mobileImage", maxCount: 1 },
  ]),
  validate(bannerIdSchema, "params"),
  validate(updateBannerSchema, "body"),
  updateBanner,
);

router.delete(
  "/:id",
  authenticate,
  authorize("admin"),
  validate(bannerIdSchema, "params"),
  deleteBanner,
);

export default router;
