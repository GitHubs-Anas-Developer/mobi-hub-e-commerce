import { z } from "zod";

const objectIdSchema = z
  .string()
  .regex(/^[0-9a-fA-F]{24}$/, "Invalid MongoDB ObjectId");

export const createOrderSchema = z.object({
  addressId: objectIdSchema,
  paymentMethod: z.enum(["COD", "Online"]),
  couponCode: z
    .string()
    .trim()
    .min(3)
    .max(30)
    .transform((value) => value.toUpperCase())
    .optional(),
});

export const orderIdSchema = z.object({
  orderId: objectIdSchema,
});

export const updateOrderStatusSchema = z.object({
  orderStatus: z.enum(["Confirmed", "Processing", "Shipped", "Delivered"]),
});

export const updatePaymentStatusSchema = z.object({
  paymentStatus: z.enum(["Pending", "Paid", "Failed", "Refunded"]),
});

export const orderQuerySchema = z
  .object({
    page: z.coerce.number().int().min(1).default(1),

    limit: z.coerce.number().int().min(1).max(50).default(10),

    status: z
      .enum([
        "Pending",
        "Confirmed",
        "Processing",
        "Shipped",
        "Delivered",
        "Cancelled",
      ])
      .optional(),

    paymentStatus: z.enum(["Pending", "Paid", "Failed", "Refunded"]).optional(),

    search: z.string().trim().max(100).optional(),

    sort: z
      .enum(["newest", "oldest", "amount-high", "amount-low"])
      .default("newest"),

    startDate: z.string().date().optional(),

    endDate: z.string().date().optional(),
  })
  .refine(
    (data) =>
      !data.startDate || !data.endDate || data.startDate <= data.endDate,
    {
      message: "End date must be after or equal to start date",
      path: ["endDate"],
    },
  );
