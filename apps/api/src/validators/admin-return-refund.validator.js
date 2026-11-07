import { z } from "zod";

export const processReturnRefundSchema = z
  .object({
    manualRefundConfirmed: z.boolean().optional(),
    reason: z
      .string()
      .trim()
      .max(500, "Refund reason cannot exceed 500 characters")
      .optional()
      .default(""),
  })
  .strict();
