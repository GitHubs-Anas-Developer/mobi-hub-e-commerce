import { z } from "zod";

const objectIdSchema = z
  .string()
  .regex(/^[0-9a-fA-F]{24}$/, "Invalid MongoDB ObjectId");

export const adjustStockSchema = z.object({
  productId: objectIdSchema,

  variantId: objectIdSchema,

  quantity: z
    .number()
    .int("Quantity must be an integer")
    .min(1, "Quantity must be at least 1"),

  direction: z.enum(["IN", "OUT"]),

  note: z
    .string()
    .trim()
    .max(500, "Note cannot exceed 500 characters")
    .optional()
    .default(""),

  idempotencyKey: z
    .string()
    .trim()
    .min(1, "Idempotency key cannot be empty")
    .max(200, "Idempotency key cannot exceed 200 characters")
    .optional(),
});

export const inventoryHistorySchema = z.object({
  productId: objectIdSchema.optional(),
  variantId: objectIdSchema.optional(),

  type: z
    .enum(["Order", "Cancellation", "Adjustment", "Return", "Correction"])
    .optional(),

  direction: z.enum(["IN", "OUT"]).optional(),

  page: z.coerce.number().int().min(1).default(1),

  limit: z.coerce.number().int().min(1).max(100).default(10),
});

export const lowStockQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
});
