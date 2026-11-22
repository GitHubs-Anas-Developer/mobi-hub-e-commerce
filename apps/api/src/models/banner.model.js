import mongoose from "mongoose";

const bannerSchema = new mongoose.Schema(
  {
    // Banner Content
    title: {
      type: String,
      required: true,
      trim: true,
    },

    subtitle: {
      type: String,
      trim: true,
      default: "",
    },

    description: {
      type: String,
      trim: true,
      default: "",
    },

    // Desktop Image
    desktopImage: {
      type: String,
      required: true,
    },

    desktopImagePublicId: {
      type: String,
      default: "",
    },

    // Mobile Image
    mobileImage: {
      type: String,
      default: "",
    },

    mobileImagePublicId: {
      type: String,
      default: "",
    },

    // Button
    buttonText: {
      type: String,
      trim: true,
      default: "Shop Now",
    },

    buttonLink: {
      type: String,
      trim: true,
      default: "/products",
    },

    // Banner Placement
    placement: {
      type: String,
      enum: ["home", "products", "categories", "subcategory"],
      default: "home",
      required: true,
      index: true,
    },

    // Banner Position
    position: {
      type: String,
      enum: ["hero", "top", "middle", "bottom"],
      default: "top",
    },

    // Target Category
    targetCategory: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      default: null,
    },

    // Target Subcategory
    targetSubCategory: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "SubCategory",
      default: null,
    },

    // Banner Status
    isActive: {
      type: Boolean,
      default: true,
    },

    // Display Order
    sortOrder: {
      type: Number,
      default: 0,
      min: 0,
    },

    // Scheduling
    startDate: {
      type: Date,
      default: null,
    },

    endDate: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  },
);

// Indexes
bannerSchema.index({ isActive: 1, sortOrder: 1 });

bannerSchema.index({
  placement: 1,
  position: 1,
  isActive: 1,
  sortOrder: 1,
});

bannerSchema.index({
  targetCategory: 1,
  targetSubCategory: 1,
});

bannerSchema.index({ startDate: 1, endDate: 1 });

const Banner = mongoose.model("Banner", bannerSchema);

export default Banner;
