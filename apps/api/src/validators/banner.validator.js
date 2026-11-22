import { z } from "zod";

// Form-data helpers
const booleanField = z.preprocess((value) => {
  if (value === "true") return true;
  if (value === "false") return false;
  return value;
}, z.boolean().optional());

const numberField = z.preprocess((value) => {
  if (value === "" || value === undefined) return undefined;
  return Number(value);
}, z.number().int().min(0).optional());

const dateField = z.preprocess((value) => {
  if (value === "" || value === undefined) return undefined;
  return value;
}, z.coerce.date().nullable().optional());

// MongoDB ObjectId helper
const objectIdField = z.preprocess(
  (value) => {
    if (value === "" || value === undefined) return null;
    return value;
  },
  z
    .string()
    .regex(/^[0-9a-fA-F]{24}$/, "Invalid ID")
    .nullable()
    .optional(),
);

// Banner fields
const bannerFields = {
  title: z.string().trim().min(1, "Banner title is required"),
  subtitle: z.string().trim().optional(),
  description: z.string().trim().optional(),

  buttonText: z.string().trim().optional(),
  buttonLink: z.string().trim().optional(),

  // Page placement
  placement: z
    .enum(["home", "products", "categories", "subcategory"])
    .optional(),

  // Position inside the page
  position: z.enum(["hero", "top", "middle", "bottom"]).optional(),

  // Optional category targeting
  targetCategory: objectIdField,
  targetSubCategory: objectIdField,

  isActive: booleanField,
  sortOrder: numberField,
  startDate: dateField,
  endDate: dateField,
};

// CREATE BANNER
export const createBannerSchema = z.object({
  ...bannerFields,
  placement: z
    .enum(["home", "products", "categories", "subcategory"])
    .default("home"),
  position: z.enum(["hero", "top", "middle", "bottom"]).default("top"),
});

// UPDATE BANNER
export const updateBannerSchema = z
  .object({
    ...bannerFields,
  })
  .partial()
  .refine(
    (data) => Object.keys(data).length > 0,
    "At least one field is required to update",
  );

// BANNER ID
export const bannerIdSchema = z.object({
  id: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid banner ID"),
});
