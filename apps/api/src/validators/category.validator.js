import { z } from "zod";

export const createCategorySchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Category name must be at least 2 characters")
    .max(100, "Category name cannot exceed 100 characters"),

  description: z
    .string()
    .trim()
    .max(500, "Description cannot exceed 500 characters")
    .optional()
    .default(""),

  image: z
    .object({
      url: z.string().trim().url().or(z.literal("")).optional(),
      publicId: z.string().trim().optional(),
    })
    .optional(),

  parentCategory: z
    .string()
    .regex(/^[0-9a-fA-F]{24}$/, "Invalid parent category ID")
    .nullable()
    .optional(),

  sortOrder: z.coerce.number().int().min(0).optional().default(0),
});

export const updateCategorySchema = createCategorySchema
  .omit({
    parentCategory: true,
  })
  .partial()
  .extend({
    parentCategory: z
      .string()
      .regex(/^[0-9a-fA-F]{24}$/, "Invalid parent category ID")
      .nullable()
      .optional(),

    isActive: z.boolean().optional(),
  });

export const categoryIdSchema = z.object({
  categoryId: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid category ID"),
});
