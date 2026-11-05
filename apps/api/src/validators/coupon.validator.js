import { z } from "zod";

const objectIdSchema = z
  .string()
  .regex(/^[0-9a-fA-F]{24}$/, "Invalid MongoDB ObjectId");

// Create Coupon
export const createCouponSchema = z
  .object({
    code: z
      .string()
      .trim()
      .min(3)
      .max(30)
      .regex(/^[A-Za-z0-9_-]+$/)
      .transform((value) => value.toUpperCase()),

    description: z.string().trim().max(300).optional(),

    discountType: z.enum(["Percentage", "Fixed"]),

    discountValue: z.coerce.number().positive(),

    minOrderAmount: z.coerce.number().min(0).default(0),

    maxDiscountAmount: z.coerce.number().positive().nullable().optional(),

    startDate: z.coerce.date(),

    expiryDate: z.coerce.date(),

    usageLimit: z.coerce.number().int().positive().nullable().optional(),

    perUserLimit: z.coerce.number().int().positive().default(1),
  })
  .refine((data) => data.expiryDate > data.startDate, {
    message: "Expiry date must be after start date",
    path: ["expiryDate"],
  })
  .refine(
    (data) => data.discountType !== "Percentage" || data.discountValue <= 100,
    {
      message: "Percentage discount cannot exceed 100",
      path: ["discountValue"],
    },
  );

// Update Coupon
export const updateCouponSchema = z
  .object({
    code: z
      .string()
      .trim()
      .min(3)
      .max(30)
      .regex(/^[A-Za-z0-9_-]+$/)
      .transform((value) => value.toUpperCase())
      .optional(),

    description: z.string().trim().max(300).optional(),

    discountType: z.enum(["Percentage", "Fixed"]).optional(),

    discountValue: z.coerce.number().positive().optional(),

    minOrderAmount: z.coerce.number().min(0).optional(),

    maxDiscountAmount: z.coerce.number().positive().nullable().optional(),

    startDate: z.coerce.date().optional(),

    expiryDate: z.coerce.date().optional(),

    usageLimit: z.coerce.number().int().positive().nullable().optional(),

    perUserLimit: z.coerce.number().int().positive().optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field is required",
  })
  .refine(
    (data) =>
      data.discountType !== "Percentage" ||
      data.discountValue === undefined ||
      data.discountValue <= 100,
    {
      message: "Percentage discount cannot exceed 100",
      path: ["discountValue"],
    },
  )
  .refine(
    (data) =>
      !data.startDate || !data.expiryDate || data.expiryDate > data.startDate,
    {
      message: "Expiry date must be after start date",
      path: ["expiryDate"],
    },
  );

// Coupon ID
export const couponIdSchema = z.object({
  couponId: objectIdSchema,
});

// Apply Coupon
export const applyCouponSchema = z.object({
  code: z.string().trim().min(3).max(30),
});

// Update Coupon Status
export const updateCouponStatusSchema = z.object({
  isActive: z.boolean(),
});


export const couponQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(10),
  isActive: z
    .enum(["true", "false"])
    .transform((value) => value === "true")
    .optional(),
});