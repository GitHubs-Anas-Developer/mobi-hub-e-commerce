import express from "express";

import {
  getWishlist,
  addToWishlist,
  removeFromWishlist,
  clearWishlist,
} from "../controllers/wishlist.controller.js";

import { authenticate } from "../middlewares/auth.middleware.js";
import { validate } from "../middlewares/validate.middleware.js";

import {
  addToWishlistSchema,
  wishlistProductIdSchema,
} from "../validators/wishlist.validator.js";

const router = express.Router();

router.use(authenticate);

router.get("/", getWishlist);

router.post("/items", validate(addToWishlistSchema, "body"), addToWishlist);

router.delete(
  "/items/:productId",
  validate(wishlistProductIdSchema, "params"),
  removeFromWishlist,
);

router.delete("/", clearWishlist);

export default router;
