import express from "express";

import {
  uploadProductVideo,
  getAllProductVideos,
  getProductVideoById,
  getActiveProductVideos,
  updateProductVideo,
  deleteProductVideo,
} from "../controllers/product-video.controller.js";

import { validate } from "../middlewares/validate.middleware.js";

import { authenticate, authorize } from "../middlewares/auth.middleware.js";


import {
  createProductVideoSchema,
  updateProductVideoSchema,
  productVideoIdSchema,
  productVideoQuerySchema,
} from "../validators/product-video.validator.js";
import videoUpload from "../middlewares/video.upload.middleware.js";

const router = express.Router();

// Public routes
router.get(
  "/active",
  validate(productVideoQuerySchema, "query"),
  getActiveProductVideos,
);

// Admin routes
router.get("/", authenticate, authorize("admin"), getAllProductVideos);

router.get(
  "/:id",
  authenticate,
  authorize("admin"),
  validate(productVideoIdSchema, "params"),
  getProductVideoById,
);

router.post(
  "/",
  authenticate,
  authorize("admin"),
  videoUpload.single("video"),
  validate(createProductVideoSchema, "body"),
  uploadProductVideo,
);

router.patch(
  "/:id",
  authenticate,
  authorize("admin"),
  validate(productVideoIdSchema, "params"),
  validate(updateProductVideoSchema, "body"),
  updateProductVideo,
);

router.delete(
  "/:id",
  authenticate,
  authorize("admin"),
  validate(productVideoIdSchema, "params"),
  deleteProductVideo,
);

export default router;
