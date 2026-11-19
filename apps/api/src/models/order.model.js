import mongoose from "mongoose";

// Order item schema
const orderItemSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    productName: {
      type: String,
      required: true,
    },
    slug: {
      type: String,
      required: true,
    },
    thumbnail: {
      type: String,
      default: "",
    },
    variantId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    sku: {
      type: String,
      required: true,
    },
    attributes: {
      type: Map,
      of: String,
      default: {},
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
    },
    mrp: {
      type: Number,
      required: true,
      min: 0,
    },
    sellingPrice: {
      type: Number,
      required: true,
      min: 0,
    },
    subtotal: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  { _id: false },
);

// Shipping address schema
const shippingAddressSchema = new mongoose.Schema(
  {
    fullName: { type: String, required: true },
    phone: { type: String, required: true },
    alternatePhone: { type: String, default: "" },
    addressLine1: { type: String, required: true },
    addressLine2: { type: String, default: "" },
    landmark: { type: String, default: "" },
    city: { type: String, required: true },
    state: { type: String, required: true },
    pincode: { type: String, required: true },
    country: { type: String, required: true },
  },
  { _id: false },
);

// Coupon snapshot schema
const couponSnapshotSchema = new mongoose.Schema(
  {
    couponId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Coupon",
      default: null,
    },
    code: {
      type: String,
      default: null,
    },
    discountType: {
      type: String,
      enum: ["Percentage", "Fixed"],
      default: null,
    },
    discountValue: {
      type: Number,
      default: null,
    },
    discountAmount: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  { _id: false },
);

// Internal order status history
const orderStatusHistorySchema = new mongoose.Schema(
  {
    status: {
      type: String,
      enum: [
        "Pending",
        "Confirmed",
        "Processing",
        "Shipped",
        "Delivered",
        "Cancelled",
      ],
      required: true,
    },
    note: {
      type: String,
      default: "",
    },
    changedBy: {
      type: mongoose.Schema.Types.ObjectId,
      default: null,
    },
    source: {
      type: String,
      enum: ["ADMIN", "USER", "SYSTEM"],
      default: "SYSTEM",
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: true },
);

// Courier tracking event schema
const trackingEventSchema = new mongoose.Schema(
  {
    status: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      default: "",
    },
    location: {
      type: String,
      default: "",
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
    source: {
      type: String,
      enum: ["ADMIN", "SHIPROCKET", "SYSTEM"],
      default: "SYSTEM",
    },
    externalEventId: {
      type: String,
      default: null,
    },
  },
  { _id: true },
);

// Shipment location schema
const shipmentLocationSchema = new mongoose.Schema(
  {
    latitude: {
      type: Number,
      default: null,
    },
    longitude: {
      type: Number,
      default: null,
    },
  },
  { _id: false },
);

// Shipment schema
const shipmentSchema = new mongoose.Schema(
  {
    provider: {
      type: String,
      enum: ["SHIPROCKET", "SELF", "OTHER"],
      default: "SHIPROCKET",
    },
    shipmentId: {
      type: String,
      default: null,
    },
    awbCode: {
      type: String,
      default: null,
      trim: true,
    },
    courierName: {
      type: String,
      default: null,
      trim: true,
    },
    courierCompanyId: {
      type: Number,
      default: null,
    },
    trackingUrl: {
      type: String,
      default: null,
    },
    currentStatus: {
      type: String,
      default: "PENDING",
      trim: true,
    },
    estimatedDeliveryDate: {
      type: Date,
      default: null,
    },
    pickupScheduledAt: {
      type: Date,
      default: null,
    },
    shippedAt: {
      type: Date,
      default: null,
    },
    deliveredAt: {
      type: Date,
      default: null,
    },
    lastLocation: {
      type: String,
      default: null,
    },
    lastLocationCoordinates: {
      type: shipmentLocationSchema,
      default: () => ({}),
    },
    trackingHistory: {
      type: [trackingEventSchema],
      default: [],
    },
  },
  { _id: false },
);

// Main order schema
const orderSchema = new mongoose.Schema(
  {
    orderNumber: {
      type: String,
      required: true,
      unique: true,
    },

    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    items: {
      type: [orderItemSchema],
      required: true,
      validate: {
        validator: (items) => items.length > 0,
        message: "Order must contain at least one item",
      },
    },

    shippingAddress: {
      type: shippingAddressSchema,
      required: true,
    },

    subtotal: {
      type: Number,
      required: true,
      min: 0,
    },

    shippingFee: {
      type: Number,
      default: 0,
      min: 0,
    },

    discount: {
      type: Number,
      default: 0,
      min: 0,
    },

    coupon: {
      type: couponSnapshotSchema,
      default: () => ({
        couponId: null,
        code: null,
        discountType: null,
        discountValue: null,
        discountAmount: 0,
      }),
    },

    totalAmount: {
      type: Number,
      required: true,
      min: 0,
    },

    paymentMethod: {
      type: String,
      enum: ["COD", "Online"],
      required: true,
    },

    paymentStatus: {
      type: String,
      enum: ["Pending", "Paid", "Failed", "PartiallyRefunded", "Refunded"],
      default: "Pending",
    },

    orderStatus: {
      type: String,
      enum: [
        "Pending",
        "Confirmed",
        "Processing",
        "Shipped",
        "Delivered",
        "Cancelled",
      ],
      default: "Pending",
    },

    // Internal Mobi Hub order status timeline
    orderStatusHistory: {
      type: [orderStatusHistorySchema],
      default: [],
    },

    // Shiprocket / courier shipment information
    shipment: {
      type: shipmentSchema,
      default: () => ({}),
    },

    cancelledAt: {
      type: Date,
      default: null,
    },

    deliveredAt: {
      type: Date,
      default: null,
    },

    returnRequestVersion: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  { timestamps: true },
);

const Order = mongoose.model("Order", orderSchema);

export default Order;
