import express from "express";

import {
  subscribeNewsletter,
  getAllNewsletterSubscribers,
  getNewsletterStatistics,
} from "../controllers/newsletter.controller.js";
import { authenticate, authorize } from "../middlewares/auth.middleware.js";

const router = express.Router();

// Public: Subscribe to newsletter
router.post("/subscribe", subscribeNewsletter);

// Admin endpoints protected by authentication and admin role check
router.get(
  "/subscribers",
  authenticate,
  authorize("admin"),
  getAllNewsletterSubscribers,
);
router.get(
  "/stats",
  authenticate,
  authorize("admin"),
  getNewsletterStatistics,
);

export default router;
