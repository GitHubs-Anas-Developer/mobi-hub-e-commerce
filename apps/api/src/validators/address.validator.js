import { z } from "zod";

const phoneSchema = z
  .string()
  .trim()
  .regex(/^[0-9]{10}$/, "Phone number must contain exactly 10 digits");

const addressTypeSchema = z.enum(["Home", "Work", "Other"]);

export const createAddressSchema = z.object({
  fullName: z.string().trim().min(2).max(100),
  phone: phoneSchema,
  alternatePhone: phoneSchema.optional().or(z.literal("")),
  addressLine1: z.string().trim().min(5).max(200),
  addressLine2: z.string().trim().max(200).optional(),
  landmark: z.string().trim().max(100).optional(),
  city: z.string().trim().min(2).max(100),
  state: z.string().trim().min(2).max(100),
  pincode: z
    .string()
    .trim()
    .regex(/^[0-9]{6}$/, "Invalid PIN code"),
  country: z.string().trim().min(2).max(100).default("India"),
  addressType: addressTypeSchema.default("Home"),
  isDefault: z.boolean().optional(),
});

export const updateAddressSchema = createAddressSchema.partial();

export const addressIdSchema = z.object({
  addressId: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid Address ID"),
});
