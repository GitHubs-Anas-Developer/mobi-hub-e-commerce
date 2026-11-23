import { z } from "zod";

const objectIdSchema = z
  .string()
  .regex(/^[0-9a-fA-F]{24}$/, "Invalid MongoDB ID");

// Upload video validation
export const createProductVideoSchema = z.object({
  productId: objectIdSchema,

  title: z
    .string()
    .trim()
    .min(3, "Title must contain at least 3 characters")
    .max(100, "Title cannot exceed 100 characters"),

  description: z
    .string()
    .trim()
    .max(500, "Description cannot exceed 500 characters")
    .optional()
    .default(""),
});

// Update video validation
export const updateProductVideoSchema = z
  .object({
    title: z.string().trim().min(3).max(100).optional(),

    description: z.string().trim().max(500).optional(),

    isActive: z.boolean().optional(),

    displayOrder: z.number().int().min(0).optional(),
  })
  .strict()
  .refine(
    (data) => Object.keys(data).length > 0,
    "At least one field is required",
  );

// MongoDB ID validation
export const productVideoIdSchema = z.object({
  id: objectIdSchema,
});

// Public feed query validation
export const productVideoQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),

  limit: z.coerce.number().int().min(1).max(30).default(10),

  productId: objectIdSchema.optional(),
});
