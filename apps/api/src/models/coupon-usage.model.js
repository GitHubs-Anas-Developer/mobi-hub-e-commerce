import mongoose from "mongoose";

const couponUsageSchema = new mongoose.Schema(
  {
    coupon: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Coupon",
      required: true,
    },

    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    usedCount: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  {
    timestamps: true,
  },
);

couponUsageSchema.index({ coupon: 1, user: 1 }, { unique: true });

const CouponUsage = mongoose.model("CouponUsage", couponUsageSchema);

export default CouponUsage;
