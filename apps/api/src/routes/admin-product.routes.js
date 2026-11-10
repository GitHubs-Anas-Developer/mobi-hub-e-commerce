import express from "express";

import { getAdminProducts } from "../controllers/admin-product.controller.js";

import { authenticate, authorize } from "../middlewares/auth.middleware.js";

const router = express.Router();

// All admin product routes require admin authentication
router.use(authenticate, authorize("admin"));

// Get all products (including inactive products)
router.get("/", getAdminProducts);

export default router;
