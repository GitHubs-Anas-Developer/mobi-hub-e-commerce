import { z } from "zod";

const objectIdSchema = z
  .string()
  .trim()
  .regex(/^[0-9a-fA-F]{24}$/, "Invalid MongoDB ObjectId");

export const initiatePaymentSchema = z
  .object({
    orderId: objectIdSchema,
  })
  .strict();

export const verifyPaymentSchema = z
  .object({
    razorpay_order_id: z.string().trim().min(1).max(100),
    razorpay_payment_id: z.string().trim().min(1).max(100),
    razorpay_signature: z
      .string()
      .trim()
      .regex(/^[a-fA-F0-9]{64}$/, "Invalid Razorpay signature"),
  })
  .strict();

export const refundPaymentSchema = z
  .object({
    paymentId: objectIdSchema.optional(),
    orderId: objectIdSchema.optional(),
    reason: z.string().trim().min(1).max(500).optional(),
    amount: z.coerce.number().positive("Refund amount must be greater than zero").optional(),
    provider: z.enum(["Razorpay", "Manual"]).optional(),
    manualRefundConfirmed: z.boolean().optional(),
  })
  .strict()
  .superRefine((data, ctx) => {
    if (!data.paymentId && !data.orderId) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Either paymentId or orderId is required",
        path: ["orderId"],
      });
    }
  });

export const syncOrderRefundSchema = z
  .object({
    orderId: objectIdSchema,
  })
  .strict();
