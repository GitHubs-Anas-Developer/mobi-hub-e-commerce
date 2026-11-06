import express from "express";

import {
  adjustStock,
  getInventoryHistoryController,
  getLowStockController,
  getOutOfStockController,
} from "../controllers/inventory.controller.js";

import { authenticate, authorize } from "../middlewares/auth.middleware.js";
import { validate } from "../middlewares/validate.middleware.js";

import {
  adjustStockSchema,
  inventoryHistorySchema,
  lowStockQuerySchema,
} from "../validators/inventory.validator.js";

const router = express.Router();

router.use(authenticate, authorize("admin"));

router.post("/adjust", validate(adjustStockSchema), adjustStock);
router.get(
  "/history",
  validate(inventoryHistorySchema, "query"),
  getInventoryHistoryController,
);

// Get low-stock variants
router.get(
  "/low-stock",
  validate(lowStockQuerySchema, "query"),
  getLowStockController,
);

// Get out-of-stock variants
router.get(
  "/out-of-stock",
  validate(lowStockQuerySchema, "query"),
  getOutOfStockController,
);

export default router;
