import { z } from "zod";

const objectIdSchema = z
  .string()
  .regex(/^[0-9a-fA-F]{24}$/, "Invalid MongoDB ObjectId");

export const initiatePaymentSchema = z.object({
  orderId: objectIdSchema,
});

export const verifyPaymentSchema = z.object({
  razorpay_order_id: z.string().trim().min(1),
  razorpay_payment_id: z.string().trim().min(1),
  razorpay_signature: z.string().trim().min(1),
});

export const refundPaymentSchema = z.object({
  paymentId: objectIdSchema,
  reason: z.string().trim().max(500).optional(),
});
