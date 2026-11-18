import mongoose from "mongoose";

const recentlyViewedSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },

    viewedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  },
);

// Prevent duplicate product entries for the same user
recentlyViewedSchema.index({ user: 1, product: 1 }, { unique: true });

// Fetch latest viewed products efficiently
recentlyViewedSchema.index({ user: 1, viewedAt: -1 });

const RecentlyViewed = mongoose.model("RecentlyViewed", recentlyViewedSchema);

export default RecentlyViewed;
