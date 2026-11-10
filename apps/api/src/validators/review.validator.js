import { z } from "zod";

const objectIdSchema = z
  .string()
  .regex(/^[0-9a-fA-F]{24}$/, "Invalid MongoDB ObjectId");

export const createReviewSchema = z.object({
  productId: objectIdSchema,

  rating: z.coerce.number().int().min(1).max(5),

  title: z.string().trim().min(3).max(100),

  comment: z.string().trim().min(10).max(1000),
});

export const updateReviewSchema = z
  .object({
    rating: z.coerce.number().int().min(1).max(5).optional(),

    title: z.string().trim().min(3).max(100).optional(),

    comment: z.string().trim().min(10).max(1000).optional(),
  })
  .refine(
    (data) => Object.keys(data).length > 0,
    "At least one field is required",
  );

export const reviewIdSchema = z.object({
  reviewId: objectIdSchema,
});

export const productIdSchema = z.object({
  productId: objectIdSchema,
});

export const reviewQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),

  limit: z.coerce.number().int().min(1).max(50).default(10),

  productId: objectIdSchema.optional(),

  isVisible: z
    .enum(["true", "false"])
    .transform((value) => value === "true")
    .optional(),

  sort: z.enum(["newest", "highest", "lowest"]).default("newest"),

  rating: z.coerce.number().int().min(1).max(5).optional(),
});

export const updateReviewVisibilitySchema = z.object({
  isVisible: z.boolean(),
});
