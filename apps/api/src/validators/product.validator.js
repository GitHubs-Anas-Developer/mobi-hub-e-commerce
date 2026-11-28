import { z } from "zod";

const objectIdSchema = z
  .string()
  .regex(/^[0-9a-fA-F]{24}$/, "Invalid MongoDB ObjectId");

const imageSchema = z.object({
  url: z.string().trim().url("Invalid image URL"),
  publicId: z.string().trim().min(1, "Image public ID is required"),
});

const optionalProductFields = {
  seoTitle: z.string().trim().max(180).optional(),
  seoDescription: z.string().trim().max(320).optional(),
  seoKeywords: z.array(z.string().trim().min(1).max(80)).max(30).optional(),
  canonicalSlug: z.string().trim().min(1).max(180).optional(),
  hsnCode: z.string().trim().max(32).optional(),
  gstRate: z.coerce.number().min(0).max(100).optional(),
  isTaxable: z.boolean().optional(),
  weight: z.coerce.number().min(0).optional(),
  weightUnit: z.enum(["g", "kg"]).optional(),
  length: z.coerce.number().min(0).optional(),
  width: z.coerce.number().min(0).optional(),
  height: z.coerce.number().min(0).optional(),
  dimensionUnit: z.enum(["mm", "cm", "m"]).optional(),
  isFreeShipping: z.boolean().optional(),
  status: z.enum(["draft", "active", "archived"]).optional(),
  returnEligible: z.boolean().optional(),
  warranty: z.string().trim().max(500).optional(),
};

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

  lowStockThreshold: z.coerce
    .number()
    .int("Low stock threshold must be an integer")
    .min(0, "Low stock threshold cannot be negative")
    .default(5),

  images: z.array(imageSchema).default([]),

  isActive: z.boolean().default(true),
  status: z.enum(["draft", "active", "archived"]).optional(),

  isDefault: z.boolean().default(false),
}).refine((variant) => variant.sellingPrice <= variant.mrp, {
  message: "Selling price cannot exceed MRP",
  path: ["sellingPrice"],
});

export const createProductSchema = z.object({
  name: z.string().trim().min(2).max(120),

  brand: z.string().trim().min(1).max(100),

  category: objectIdSchema,

  description: z.string().trim().min(10),

  thumbnail: imageSchema,

  images: z.array(imageSchema).default([]),

  specifications: z.record(z.string(), z.string()).default({}),

  variants: z.array(variantSchema).min(1, "At least one variant is required").superRefine((variants, ctx) => {
    const skus = new Set();
    let activeDefaultCount = 0;
    variants.forEach((variant, index) => {
      const sku = variant.sku.toUpperCase();
      if (skus.has(sku)) ctx.addIssue({ code: "custom", path: [index, "sku"], message: "Duplicate variant SKU found" });
      skus.add(sku);
      if (variant.isActive && variant.isDefault) activeDefaultCount += 1;
    });
    if (activeDefaultCount > 1) ctx.addIssue({ code: "custom", path: ["root"], message: "Only one active default variant is allowed" });
  }),

  isFeatured: z.boolean().default(false),

  isNewArrival: z.boolean().default(true),

  isActive: z.boolean().default(true),

  ...optionalProductFields,
});

export const updateProductSchema = createProductSchema.partial();

export const productIdSchema = z.object({
  productId: objectIdSchema,
});
