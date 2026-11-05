import { z } from "zod";

const objectIdSchema = z
  .string()
  .regex(/^[0-9a-fA-F]{24}$/, "Invalid MongoDB ObjectId");

const imageSchema = z.object({
  url: z.string().trim().url("Invalid image URL"),
  publicId: z.string().trim().min(1, "Image public ID is required"),
});

const variantSchema = z.object({
  sku: z
    .string()
    .trim()
    .min(1, "Variant SKU is required")
    .max(50)
    .transform((value) => value.toUpperCase()),

  attributes: z.record(z.string(), z.string()).default({}),

  mrp: z.coerce.number().min(0, "MRP cannot be negative"),

  sellingPrice: z.coerce.number().min(0, "Selling price cannot be negative"),

  stock: z.coerce.number().int().min(0).default(0),

  images: z.array(imageSchema).default([]),

  isActive: z.boolean().default(true),

  isDefault: z.boolean().default(false),
});

export const createProductSchema = z.object({
  name: z.string().trim().min(2).max(120),

  brand: z.string().trim().min(1).max(100),

  category: objectIdSchema,

  description: z.string().trim().min(10),

  thumbnail: imageSchema,

  images: z.array(imageSchema).default([]),

  specifications: z.record(z.string(), z.string()).default({}),

  variants: z.array(variantSchema).min(1, "At least one variant is required"),

  isFeatured: z.boolean().default(false),

  isNewArrival: z.boolean().default(true),

  isActive: z.boolean().default(true),
});

export const updateProductSchema = createProductSchema.partial();

export const productIdSchema = z.object({
  productId: objectIdSchema,
});
