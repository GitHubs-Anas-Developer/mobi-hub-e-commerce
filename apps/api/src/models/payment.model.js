import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema(
  {
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

    provider: {
      type: String,
      enum: ["Razorpay"],
      default: "Razorpay",
      required: true,
    },

    razorpayOrderId: {
      type: String,
      unique: true,
      sparse: true,
    },

    razorpayPaymentId: {
      type: String,
      unique: true,
      sparse: true,
    },

    amount: {
      type: Number,
      required: true,
      min: 0,
    },

    currency: {
      type: String,
      default: "INR",
      uppercase: true,
    },

    status: {
      type: String,
      enum: ["Created", "Paid", "Failed", "RefundPending", "Refunded"],
      default: "Created",
    },

    paymentMethod: {
      type: String,
      default: null,
    },

    signature: {
      type: String,
      default: null,
    },

    verifiedAt: {
      type: Date,
      default: null,
    },

    failureReason: {
      type: String,
      default: null,
    },

    refundIdempotencyKey: {
      type: String,
      default: null,
    },

    refundReason: {
      type: String,
      default: null,
    },

    refundId: {
      type: String,
      default: null,
    },

    refundedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  },
);

paymentSchema.index({ user: 1, createdAt: -1 });
paymentSchema.index({ order: 1, createdAt: -1 });

// Allow only one Created payment per order.
paymentSchema.index(
  { order: 1 },
  {
    unique: true,
    partialFilterExpression: {
      status: "Created",
    },
    name: "unique_created_payment_per_order",
  },
);

const Payment = mongoose.model("Payment", paymentSchema);

export default Payment;
