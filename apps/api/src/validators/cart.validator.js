import { z } from "zod";

const objectIdSchema = z
  .string()
  .regex(/^[0-9a-fA-F]{24}$/, "Invalid MongoDB ObjectId");

export const addToCartSchema = z.object({
  productId: objectIdSchema,
  variantId: objectIdSchema,
  quantity: z.coerce.number().int().min(1).default(1),
});

export const updateCartItemSchema = z.object({
  quantity: z.coerce.number().int().min(1),
});

export const cartItemIdSchema = z.object({
  itemId: objectIdSchema,
});
