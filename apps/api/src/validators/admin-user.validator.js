import { z } from "zod";

const objectIdSchema = z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid user ID");

// User ID validation
export const userIdSchema = z.object({
  userId: objectIdSchema,
});

// Admin user listing filters
export const getAdminUsersSchema = z.object({
  search: z.string().trim().max(100).optional(),

  status: z.enum(["all", "active", "inactive"]).default("all"),

  verification: z.enum(["all", "verified", "unverified"]).default("all"),

  sort: z
    .enum(["newest", "oldest", "nameAZ", "nameZA", "lastLoginNewest"])
    .default("newest"),

  page: z.coerce.number().int().min(1).default(1),

  limit: z.coerce.number().int().min(1).max(100).default(10),
});

// Activate / Deactivate user
export const updateUserStatusSchema = z.object({
  isActive: z.boolean(),
});
