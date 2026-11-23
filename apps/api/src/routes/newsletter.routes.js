import express from "express";

import {
  subscribeNewsletter,
  getAllNewsletterSubscribers,
  getNewsletterStatistics,
} from "../controllers/newsletter.controller.js";

const router = express.Router();

// Public: Subscribe to newsletter
router.post("/subscribe", subscribeNewsletter);

// Admin endpoints: Add your existing admin authentication middleware
// before enabling these routes in production.
router.get("/subscribers", getAllNewsletterSubscribers);
router.get("/stats", getNewsletterStatistics);

export default router;
