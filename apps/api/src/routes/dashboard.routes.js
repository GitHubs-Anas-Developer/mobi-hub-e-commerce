import express from "express";

import {
  dashboardOverview,
  salesAnalytics,
  recentOrders,
  topProducts,
  lowStockProducts,
  orderStats,
  paymentStats,
} from "../controllers/dashboard.controller.js";

import { authenticate, authorize } from "../middlewares/auth.middleware.js";

const router = express.Router();

// All dashboard routes require admin authentication
router.use(authenticate, authorize("admin"));

router.get("/overview", dashboardOverview);
router.get("/sales", salesAnalytics);
router.get("/recent-orders", recentOrders);
router.get("/top-products", topProducts);
router.get("/low-stock", lowStockProducts);
router.get("/order-stats", orderStats);
router.get("/payment-stats", paymentStats);

export default router;
