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
    paymentId: objectIdSchema,
    reason: z.string().trim().max(500).optional(),
  })
  .strict();
