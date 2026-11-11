import { z } from "zod";

export const createBrandSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Brand name must be at least 2 characters")
    .max(100, "Brand name cannot exceed 100 characters"),

  description: z
    .string()
    .trim()
    .max(500, "Description cannot exceed 500 characters")
    .optional()
    .default(""),

  logo: z
    .object({
      url: z.string().trim().url().or(z.literal("")).optional(),
      publicId: z.string().trim().optional(),
    })
    .optional(),

  isActive: z.boolean().optional().default(true),
});

export const updateBrandSchema = createBrandSchema.partial();

export const brandIdSchema = z.object({
  brandId: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid brand ID"),
});
