import mongoose from "mongoose";

const newsletterSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: [true, "Email address is required"],
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },

    status: {
      type: String,
      enum: ["subscribed", "unsubscribed"],
      default: "subscribed",
    },

    subscribedAt: {
      type: Date,
      default: Date.now,
    },

    unsubscribedAt: {
      type: Date,
      default: null,
    },

    source: {
      type: String,
      default: "website",
    },
  },
  {
    timestamps: true,
  },
);

const Newsletter =
  mongoose.models.Newsletter || mongoose.model("Newsletter", newsletterSchema);

export default Newsletter;
