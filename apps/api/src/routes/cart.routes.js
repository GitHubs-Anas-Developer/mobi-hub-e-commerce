import express from "express";

import {
  getCart,
  addToCart,
  updateCartItem,
  removeCartItem,
  clearCart,
} from "../controllers/cart.controller.js";

import { authenticate } from "../middlewares/auth.middleware.js";
import { validate } from "../middlewares/validate.middleware.js";

import {
  addToCartSchema,
  updateCartItemSchema,
  cartItemIdSchema,
} from "../validators/cart.validator.js";

const router = express.Router();

// All cart routes require authentication
router.use(authenticate);

// Get cart
router.get("/", getCart);

// Add item to cart
router.post("/items", validate(addToCartSchema, "body"), addToCart);

// Update cart item quantity
router.patch(
  "/items/:itemId",
  validate(cartItemIdSchema, "params"),
  validate(updateCartItemSchema, "body"),
  updateCartItem,
);

// Remove cart item
router.delete(
  "/items/:itemId",
  validate(cartItemIdSchema, "params"),
  removeCartItem,
);

// Clear cart
router.delete("/", clearCart);

export default router;
