import { z } from "zod";

export const reviewReturnSchema = z.object({
  status: z.enum(["Approved", "Rejected"]),

  adminNote: z
    .string()
    .trim()
    .max(1000, "Admin note cannot exceed 1000 characters")
    .optional()
    .default(""),
});
