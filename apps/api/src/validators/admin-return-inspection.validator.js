import { z } from "zod";

export const inspectReturnSchema = z.object({
  status: z.enum(["InspectionPassed", "InspectionFailed"]),
  adminNote: z
    .string()
    .trim()
    .max(1000, "Admin note cannot exceed 1000 characters")
    .optional()
    .default(""),
});
