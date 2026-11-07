import mongoose from "mongoose";

const paymentRefundSchema = new mongoose.Schema(
  {
    payment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Payment",
      default: null,
      index: true,
    },

    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      required: true,
      index: true,
    },

    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    referenceType: {
      type: String,
      enum: ["Return", "OrderCancellation"],
      required: true,
    },

    referenceId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },

    attempt: {
      type: Number,
      required: true,
      default: 1,
      min: 1,
    },

    provider: {
      type: String,
      enum: ["Razorpay", "Manual"],
      required: true,
    },

    amount: {
      type: Number,
      required: true,
      min: 0.01,
    },

    currency: {
      type: String,
      default: "INR",
      uppercase: true,
      trim: true,
    },

    status: {
      type: String,
      enum: ["Pending", "Processing", "Processed", "Failed"],
      default: "Pending",
      index: true,
    },

    idempotencyKey: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    providerRefundId: {
      type: String,
      trim: true,
      default: undefined,
    },

    providerStatus: {
      type: String,
      enum: ["pending", "processed", "failed"],
      default: null,
    },

    providerStatusCheckedAt: {
      type: Date,
      default: null,
    },

    reason: {
      type: String,
      trim: true,
      maxlength: 500,
      default: "",
    },

    failureReason: {
      type: String,
      default: null,
    },

    processedAt: {
      type: Date,
      default: null,
    },
    reservationReleasedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  },
);

// Query indexes
paymentRefundSchema.index({ payment: 1, createdAt: -1 });
paymentRefundSchema.index({ order: 1, createdAt: -1 });

// One refund record per return/cancellation reference
paymentRefundSchema.index(
  { referenceType: 1, referenceId: 1, attempt: 1 },
  { unique: true },
);

// Prevent duplicate Razorpay refund IDs
paymentRefundSchema.index(
  { providerRefundId: 1 },
  {
    unique: true,
    partialFilterExpression: {
      providerRefundId: { $type: "string" },
    },
  },
);

const PaymentRefund = mongoose.model("PaymentRefund", paymentRefundSchema);

export default PaymentRefund;
