import mongoose from "mongoose";

const returnItemSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    productName: {
      type: String,
      required: true,
      trim: true,
    },
    slug: {
      type: String,
      required: true,
    },
    thumbnail: {
      type: String,
      default: null,
    },
    variantId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    sku: {
      type: String,
      required: true,
      uppercase: true,
      trim: true,
    },
    attributes: {
      type: Map,
      of: String,
      default: {},
    },
    orderedQuantity: {
      type: Number,
      required: true,
      min: 1,
    },
    returnQuantity: {
      type: Number,
      required: true,
      min: 1,
    },
    unitPrice: {
      type: Number,
      required: true,
      min: 0,
    },
    allocatedDiscount: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },
    refundAmount: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  { _id: false },
);

const returnSchema = new mongoose.Schema(
  {
    returnNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true,
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

    items: {
      type: [returnItemSchema],
      required: true,
      validate: {
        validator: (items) => items.length > 0,
        message: "At least one return item is required",
      },
    },

    reason: {
      type: String,
      enum: [
        "Damaged",
        "Defective",
        "WrongItem",
        "NotAsDescribed",
        "MissingParts",
        "Other",
      ],
      required: true,
    },

    description: {
      type: String,
      trim: true,
      maxlength: [500, "Description cannot exceed 500 characters"],
      default: "",
    },

    status: {
      type: String,
      enum: [
        "Requested",
        "Approved",
        "Rejected",
        "ProductReceived",
        "InspectionPassed",
        "InspectionFailed",
        "RefundProcessing",
        "Refunded",
      ],
      default: "Requested",
      index: true,
    },

    refundAmount: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },

    refundMethod: {
      type: String,
      enum: ["Razorpay", "Manual"],
      default: null,
    },

    paymentRefund: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "PaymentRefund",
      default: null,
    },

    stockRestoredAt: {
      type: Date,
      default: null,
    },

    adminNote: {
      type: String,
      trim: true,
      maxlength: 1000,
      default: "",
    },

    receivedAt: {
      type: Date,
      default: null,
    },

    inspectedAt: {
      type: Date,
      default: null,
    },

    refundProcessedAt: {
      type: Date,
      default: null,
    },

    refundedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true },
);

returnSchema.index({ user: 1, createdAt: -1 });
returnSchema.index({ order: 1, createdAt: -1 });

const Return = mongoose.model("Return", returnSchema);

export default Return;
