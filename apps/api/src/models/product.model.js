import mongoose from "mongoose";

const imageSchema = new mongoose.Schema(
  {
    url: { type: String, required: true, trim: true, validate: { validator: (value) => /^https?:\/\//i.test(value), message: "Image URL must be an HTTP(S) URL" } },
    publicId: { type: String, required: true, trim: true },
  },
  { _id: false },
);
const titleMaxLength = 180;

const variantSchema = new mongoose.Schema(
  {
    sku: { type: String, required: [true, "Variant SKU is required"], uppercase: true, trim: true, maxlength: 50 },
    attributes: { type: Map, of: String, default: {} },
    mrp: { type: Number, required: [true, "MRP is required"], min: [0, "MRP cannot be negative"] },
    sellingPrice: { type: Number, required: [true, "Selling price is required"], min: [0, "Selling price cannot be negative"], validate: { validator(value) { return this.mrp == null || value <= this.mrp; }, message: "Selling price cannot exceed MRP" } },
    stock: { type: Number, required: true, min: [0, "Stock cannot be negative"], default: 0, validate: { validator: Number.isSafeInteger, message: "Stock must be a whole number" } },
    lowStockThreshold: { type: Number, required: true, min: [0, "Low stock threshold cannot be negative"], default: 5, validate: { validator: Number.isSafeInteger, message: "Low stock threshold must be a whole number" } },
    images: { type: [imageSchema], default: [] },
    isActive: { type: Boolean, default: true },
    status: { type: String, enum: ["draft", "active", "archived"], default: "active" },
    isDefault: { type: Boolean, default: false },
  },
  { timestamps: true },
);

const optionalNonNegativeNumber = { type: Number, min: 0 };

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: [true, "Product name is required"], trim: true, maxlength: [120, "Product name cannot exceed 120 characters"] },
    slug: { type: String, unique: true, lowercase: true, trim: true, index: true },
    brand: { type: String, required: [true, "Brand is required"], trim: true, index: true },
    category: { type: mongoose.Schema.Types.ObjectId, ref: "Category", required: [true, "Category is required"], index: true },
    description: { type: String, required: [true, "Description is required"], trim: true },
    thumbnail: { type: imageSchema, required: [true, "Product thumbnail is required"] },
    images: { type: [imageSchema], default: [] },
    specifications: { type: Map, of: String, default: {} },
    variants: {
      type: [variantSchema],
      validate: [{ validator: (variants) => Array.isArray(variants) && variants.length >= 1, message: "At least one product variant is required" },
        { validator(variants) { const skus = variants.map((variant) => variant.sku?.trim().toUpperCase()); return new Set(skus).size === skus.length; }, message: "Variant SKUs must be unique within a product" },
        { validator(variants) { return variants.filter((variant) => variant.isDefault && variant.isActive).length <= 1; }, message: "Only one active default variant is allowed" }],
    },
    basePrice: { type: Number, default: 0, min: 0 },
    totalStock: { type: Number, default: 0, min: 0, validate: { validator: Number.isSafeInteger, message: "Total stock must be a whole number" } },
    ratings: { average: { type: Number, default: 0, min: 0, max: 5 }, count: { type: Number, default: 0, min: 0 } },
    isFeatured: { type: Boolean, default: false },
    isNewArrival: { type: Boolean, default: true },
    isActive: { type: Boolean, default: true, index: true },
    status: { type: String, enum: ["draft", "active", "archived"], default: "active", index: true },
    seoTitle: { type: String, trim: true, maxlength: titleMaxLength },
    seoDescription: { type: String, trim: true, maxlength: 320 },
    seoKeywords: { type: [String], default: [] },
    canonicalSlug: { type: String, lowercase: true, trim: true },
    hsnCode: { type: String, trim: true },
    gstRate: { ...optionalNonNegativeNumber, max: 100 },
    isTaxable: { type: Boolean, default: true },
    weight: optionalNonNegativeNumber,
    weightUnit: { type: String, enum: ["g", "kg"], default: "g" },
    length: optionalNonNegativeNumber,
    width: optionalNonNegativeNumber,
    height: optionalNonNegativeNumber,
    dimensionUnit: { type: String, enum: ["mm", "cm", "m"], default: "cm" },
    isFreeShipping: { type: Boolean, default: false },
    returnEligible: { type: Boolean, default: true },
    warranty: { type: String, trim: true, maxlength: 500 },
  },
  { timestamps: true },
);

// Keep a single text index; compound filter indexes are intentional query paths.
productSchema.index({ name: "text", brand: "text" });
productSchema.index({ category: 1, isActive: 1 });
productSchema.index({ brand: 1, isActive: 1 });
productSchema.index({ "variants.sku": 1 });

productSchema.pre("validate", function () {
  if (this.isModified("name") && this.name) {
    this.slug = this.name.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
  }

  if (this.variants?.length) {
    const active = this.variants.filter((variant) => variant.isActive);
    this.basePrice = active.length ? Math.min(...active.map((variant) => variant.sellingPrice)) : 0;
    this.totalStock = active.reduce((total, variant) => total + variant.stock, 0);
    const activeDefaults = active.filter((variant) => variant.isDefault);
    if (active.length && activeDefaults.length === 0) {
      this.variants.forEach((variant) => { variant.isDefault = false; });
      active[0].isDefault = true;
    }
  }
});

const Product = mongoose.model("Product", productSchema);
export default Product;
