import express from "express";

import { uploadImages } from "../controllers/upload.controller.js";

import upload from "../middlewares/upload.middleware.js";

import { authenticate, authorize } from "../middlewares/auth.middleware.js";

const router = express.Router();

// All upload routes require admin authentication
router.use(authenticate, authorize("admin"));

// Upload multiple images
router.post("/images", upload.array("images", 7), uploadImages);

export default router;
