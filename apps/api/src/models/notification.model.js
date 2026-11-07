import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 150,
    },

    message: {
      type: String,
      required: true,
      trim: true,
      maxlength: 500,
    },

    type: {
      type: String,
      required: true,
      enum: [
        "ORDER_PLACED",
        "ORDER_CONFIRMED",
        "ORDER_SHIPPED",
        "ORDER_DELIVERED",
        "ORDER_CANCELLED",
        "PAYMENT_SUCCESS",
        "PAYMENT_FAILED",
        "REFUND_PROCESSED",
        "LOW_STOCK",
        "OUT_OF_STOCK",
        "SYSTEM",
      ],
    },

    relatedId: {
      type: mongoose.Schema.Types.ObjectId,
      default: null,
    },

    relatedModel: {
      type: String,
      enum: ["Order", "Payment", "Product", null],
      default: null,
    },

    isRead: {
      type: Boolean,
      default: false,
      index: true,
    },

    readAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

// Efficient notification listing
notificationSchema.index({
  recipient: 1,
  createdAt: -1,
});

// Efficient unread notification queries
notificationSchema.index({
  recipient: 1,
  isRead: 1,
});

const Notification = mongoose.model("Notification", notificationSchema);

export default Notification;
