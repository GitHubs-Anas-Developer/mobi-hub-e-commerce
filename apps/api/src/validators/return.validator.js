import { z } from "zod";

const objectIdSchema = z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid ID");

export const requestReturnSchema = z.object({
  orderId: objectIdSchema,

  reason: z.enum([
    "Damaged",
    "Defective",
    "WrongItem",
    "NotAsDescribed",
    "MissingParts",
    "Other",
  ]),

  description: z
    .string()
    .trim()
    .max(500, "Description cannot exceed 500 characters")
    .optional()
    .default(""),

  items: z
    .array(
      z.object({
        productId: objectIdSchema,

        variantId: objectIdSchema,

        quantity: z.number().int().min(1, "Quantity must be at least 1"),
      }),
    )
    .min(1, "At least one return item is required"),
});
