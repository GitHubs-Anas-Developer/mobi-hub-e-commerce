import { z } from "zod";

const objectIdSchema = z
  .string()
  .regex(/^[0-9a-fA-F]{24}$/, "Invalid MongoDB ObjectId");

const directCheckoutItemSchema = z.object({
  productId: objectIdSchema,
  variantId: objectIdSchema,
  quantity: z.coerce.number().int().min(1).max(100),
});

export const createOrderSchema = z
  .object({
    addressId: objectIdSchema,

    paymentMethod: z.enum(["COD", "Online"]),

    couponCode: z
      .string()
      .trim()
      .min(3)
      .max(30)
      .transform((value) => value.toUpperCase())
      .optional(),

    checkoutType: z.enum(["cart", "direct"]).default("cart"),

    items: z.array(directCheckoutItemSchema).optional(),
  })
  .superRefine((data, ctx) => {
    if (data.checkoutType === "direct") {
      if (!data.items || data.items.length !== 1) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Direct checkout requires exactly one product",
          path: ["items"],
        });
      }
    }

    if (data.checkoutType === "cart" && data.items !== undefined) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Items should not be provided for cart checkout",
        path: ["items"],
      });
    }
  });

export const orderIdSchema = z.object({
  orderId: objectIdSchema,
});

export const cancelOrderSchema = z
  .object({
    reason: z
      .string({
        required_error: "Cancellation reason is required",
      })
      .trim()
      .min(3, "Cancellation reason must be at least 3 characters")
      .max(200, "Cancellation reason cannot exceed 200 characters"),

    comment: z
      .string()
      .trim()
      .max(500, "Cancellation comment cannot exceed 500 characters")
      .optional()
      .default(""),
  })
  .strict();

export const adminCancelOrderSchema = z
  .object({
    reason: z
      .string()
      .trim()
      .min(3, "Cancellation reason must be at least 3 characters")
      .max(200, "Cancellation reason cannot exceed 200 characters"),

    comment: z
      .string()
      .trim()
      .max(500, "Cancellation comment cannot exceed 500 characters")
      .optional()
      .default(""),
  })
  .strict();

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

    paymentStatus: z
      .enum(["Pending", "Paid", "Failed", "PartiallyRefunded", "Refunded"])
      .optional(),

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

// ==========================================
// Update Shipment Tracking Schema
// ==========================================

export const updateShipmentTrackingSchema = z
  .object({
    provider: z.enum(["SHIPROCKET", "SELF", "OTHER"]).optional(),

    shipmentId: z.string().trim().min(1).optional(),

    awbCode: z.string().trim().min(1).optional(),

    courierName: z.string().trim().min(1).optional(),

    courierCompanyId: z.union([z.string(), z.number()]).optional(),

    trackingUrl: z.string().url().optional(),

    estimatedDeliveryDate: z.coerce.date().optional(),

    status: z
      .enum([
        "NEW",
        "PICKUP SCHEDULED",
        "PICKED UP",
        "IN TRANSIT",
        "OUT FOR DELIVERY",
        "DELIVERED",
      ])
      .optional(),

    description: z.string().trim().min(1).optional(),

    location: z.string().trim().min(1).optional(),
  })
  .strict()
  .superRefine((data, ctx) => {
    if (data.status && !data.description) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Description is required when updating tracking status",
        path: ["description"],
      });
    }

    if (Object.keys(data).length === 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "At least one shipment field is required",
      });
    }
  });
