import { z } from "zod";

const objectIdSchema = z
  .string()
  .regex(/^[0-9a-fA-F]{24}$/, "Invalid MongoDB ObjectId");

export const addToWishlistSchema = z.object({
  productId: objectIdSchema,
});

export const wishlistProductIdSchema = z.object({
  productId: objectIdSchema,
});
