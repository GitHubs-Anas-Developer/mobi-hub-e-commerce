import mongoose from "mongoose";

const webhookEventSchema = new mongoose.Schema(
  {
    eventId: {
      type: String,
      required: true,
      unique: true,
    },

    event: {
      type: String,
      required: true,
    },

    status: {
      type: String,
      enum: ["Processing", "Processed", "Failed"],
      default: "Processing",
    },

    processingStartedAt: {
      type: Date,
      default: null,
    },

    processingToken: {
      type: String,
      default: null,
    },

    processedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true },
);

const WebhookEvent = mongoose.model("WebhookEvent", webhookEventSchema);

export default WebhookEvent;