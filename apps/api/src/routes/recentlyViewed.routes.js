import express from "express";

import {
  addRecentlyViewed,
  getRecentlyViewed,
  clearRecentlyViewed,
} from "../controllers/recentlyViewed.controller.js";

import { authenticate } from "../middlewares/auth.middleware.js";
import { validate } from "../middlewares/validate.middleware.js";

import {
  addRecentlyViewedSchema,
} from "../validators/recentlyViewed.validator.js";

const router = express.Router();

router.get("/", authenticate, getRecentlyViewed);

router.post(
  "/:productId",
  authenticate,
  validate(addRecentlyViewedSchema, "params"),
  addRecentlyViewed
);

router.delete("/", authenticate, clearRecentlyViewed);

export default router;