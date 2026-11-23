import mongoose from "mongoose";

const productVideoSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: [true, "Product is required"],
      index: true,
    },

    title: {
      type: String,
      required: [true, "Video title is required"],
      trim: true,
      minlength: 3,
      maxlength: 100,
    },

    description: {
      type: String,
      trim: true,
      maxlength: 500,
      default: "",
    },

    videoUrl: {
      type: String,
      required: [true, "Video URL is required"],
      trim: true,
    },

    publicId: {
      type: String,
      required: [true, "Cloudinary public ID is required"],
      unique: true,
      trim: true,
    },

    thumbnailUrl: {
      type: String,
      trim: true,
      default: "",
    },

    duration: {
      type: Number,
      min: 0,
      default: 0,
    },

    views: {
      type: Number,
      min: 0,
      default: 0,
    },

    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },

    displayOrder: {
      type: Number,
      min: 0,
      default: 0,
    },

    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

// Optimized ordering for the public video feed.
productVideoSchema.index({
  isActive: 1,
  displayOrder: 1,
  createdAt: -1,
});

const ProductVideo =
  mongoose.models.ProductVideo ||
  mongoose.model("ProductVideo", productVideoSchema);

export default ProductVideo;
