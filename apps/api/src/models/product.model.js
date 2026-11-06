import mongoose from "mongoose";

// Dynamic variant attributes (Color, Size, Length, Capacity, etc.)
const variantSchema = new mongoose.Schema(
  {
    sku: {
      type: String,
      required: [true, "Variant SKU is required"],
      unique: true,
      uppercase: true,
      trim: true,
    },
    attributes: {
      type: Map,
      of: String,
      default: {},
    },
    mrp: {
      type: Number,
      required: [true, "MRP is required"],
      min: [0, "MRP cannot be negative"],
    },
    sellingPrice: {
      type: Number,
      required: [true, "Selling price is required"],
      min: [0, "Selling price cannot be negative"],
    },
    stock: {
      type: Number,
      required: true,
      min: [0, "Stock cannot be negative"],
      default: 0,
    },
    lowStockThreshold: {
      type: Number,
      required: true,
      min: [0, "Low stock threshold cannot be negative"],
      default: 5,
    },
    images: [
      {
        url: { type: String, required: true },
        publicId: { type: String, required: true },
      },
    ],
    isActive: {
      type: Boolean,
      default: true,
    },
    isDefault: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true },
);

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Product name is required"],
      trim: true,
      maxlength: [120, "Product name cannot exceed 120 characters"],
    },
    slug: {
      type: String,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    brand: {
      type: String,
      required: [true, "Brand is required"],
      trim: true,
      index: true,
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: [true, "Category is required"],
      index: true,
    },
    description: {
      type: String,
      required: [true, "Description is required"],
      trim: true,
    },
    thumbnail: {
      url: {
        type: String,
        required: [true, "Product thumbnail is required"],
      },
      publicId: {
        type: String,
        required: [true, "Thumbnail public ID is required"],
      },
    },
    images: [
      {
        url: { type: String, required: true },
        publicId: { type: String, required: true },
      },
    ],
    specifications: {
      type: Map,
      of: String,
      default: {},
    },
    variants: {
      type: [variantSchema],
      validate: {
        validator: (variants) =>
          Array.isArray(variants) && variants.length >= 1,
        message: "At least one product variant is required",
      },
    },
    basePrice: {
      type: Number,
      default: 0,
      index: true,
    },
    totalStock: {
      type: Number,
      default: 0,
      index: true,
    },
    ratings: {
      average: {
        type: Number,
        default: 0,
        min: 0,
        max: 5,
      },
      count: {
        type: Number,
        default: 0,
      },
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },
    isNewArrival: {
      type: Boolean,
      default: true,
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
  },
  { timestamps: true },
);

// Search and filter indexes
productSchema.index({ name: "text", brand: "text" });
productSchema.index({ category: 1, isActive: 1 });
productSchema.index({ basePrice: 1, totalStock: 1 });

// Automatically generate slug and calculate price/stock
productSchema.pre("validate", function () {
  if (this.isModified("name") && this.name) {
    this.slug = this.name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
  }

  if (this.variants?.length) {
    const activeVariants = this.variants.filter((variant) => variant.isActive);

    this.basePrice = activeVariants.length
      ? Math.min(...activeVariants.map((variant) => variant.sellingPrice))
      : 0;

    this.totalStock = activeVariants.reduce(
      (total, variant) => total + variant.stock,
      0,
    );

    const defaultVariants = this.variants.filter(
      (variant) => variant.isDefault && variant.isActive,
    );

    if (defaultVariants.length !== 1 && activeVariants.length) {
      this.variants.forEach((variant) => {
        variant.isDefault = false;
      });

      activeVariants[0].isDefault = true;
    }
  }
});

const Product = mongoose.model("Product", productSchema);

export default Product;
