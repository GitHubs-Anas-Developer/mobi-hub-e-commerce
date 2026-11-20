import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import session from "express-session";
import MongoStore from "connect-mongo";
import passport from "passport";

import "./config/passport.js";

import { errorMiddleware } from "./middlewares/error.middleware.js";

import authRoutes from "./routes/auth.routes.js";
import healthRoutes from "./routes/health.routes.js";
import categoryRoutes from "./routes/category.routes.js";
import productRoutes from "./routes/product.routes.js";
import cartRoutes from "./routes/cart.routes.js";
import wishlistRoutes from "./routes/wishlist.routes.js";
import addressRoutes from "./routes/address.routes.js";
import orderRoutes from "./routes/order.routes.js";
import reviewRoutes from "./routes/review.routes.js";
import couponRoutes from "./routes/coupon.routes.js";
import paymentRoutes from "./routes/payment.routes.js";
import dashboardRoutes from "./routes/dashboard.routes.js";
import inventoryRoutes from "./routes/inventory.routes.js";
import notificationRoutes from "./routes/notification.routes.js";
import returnRoutes from "./routes/return.routes.js";
import adminProductRoutes from "./routes/admin-product.routes.js";
import uploadRoutes from "./routes/upload.routes.js";
import brandRoutes from "./routes/brand.routes.js";
import adminUserRoutes from "./routes/admin-user.routes.js";
import recentlyViewedRoutes from "./routes/recentlyViewed.routes.js";
import searchRoutes from "./routes/search.routes.js";

const app = express();

const isProduction = process.env.NODE_ENV === "production";

// Trust proxy in production
if (isProduction) {
  app.set("trust proxy", 1);
}

// Payment webhook must receive raw body
app.use("/api/v1/payments/webhook", express.raw({ type: "application/json" }));

// JSON and URL-encoded body parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Cookie parser
app.use(cookieParser());

// CORS configuration
const allowedOrigins = (process.env.CLIENT_URL || "")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
  }),
);

// Validate Google OAuth session configuration
if (!process.env.SESSION_SECRET) {
  throw new Error("SESSION_SECRET is missing");
}

if (!process.env.MONGODB_URI) {
  throw new Error("MONGODB_URI is missing");
}

// Google OAuth session configuration
app.use(
  session({
    name: "mobi_hub.sid",
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,

    store: MongoStore.create({
      mongoUrl: process.env.MONGODB_URI,
      collectionName: "sessions",
      ttl: 14 * 24 * 60 * 60,
    }),

    cookie: {
      httpOnly: true,
      secure: isProduction,
      sameSite: "lax",
      maxAge: 14 * 24 * 60 * 60 * 1000,
    },
  }),
);

// Passport initialization
app.use(passport.initialize());

// Health check
app.use("/api/v1/health", healthRoutes);

// Authentication
app.use("/api/v1/auth", authRoutes);

// Main routes
app.use("/api/v1/categories", categoryRoutes);
app.use("/api/v1/products", productRoutes);
app.use("/api/v1/cart", cartRoutes);
app.use("/api/v1/wishlist", wishlistRoutes);
app.use("/api/v1/addresses", addressRoutes);
app.use("/api/v1/orders", orderRoutes);
app.use("/api/v1/reviews", reviewRoutes);
app.use("/api/v1/coupons", couponRoutes);
app.use("/api/v1/payments", paymentRoutes);

// Admin routes
app.use("/api/v1/admin/dashboard", dashboardRoutes);
app.use("/api/v1/admin/inventory", inventoryRoutes);
app.use("/api/v1/admin/products", adminProductRoutes);
app.use("/api/v1/admin/upload", uploadRoutes);
app.use("/api/v1/admin/users", adminUserRoutes);

// Other routes
app.use("/api/v1/notifications", notificationRoutes);
app.use("/api/v1/returns", returnRoutes);
app.use("/api/v1/brands", brandRoutes);
app.use("/api/v1/recently-viewed", recentlyViewedRoutes);
app.use("/api/v1/search", searchRoutes);

// Default route
app.get("/", (req, res) => {
  return res.status(200).json({
    success: true,
    message: "Welcome to MOBI HUB API",
  });
});

// 404 handler
app.use((req, res, next) => {
  const error = new Error("Route not found");
  error.statusCode = 404;
  next(error);
});

// Error middleware (always last)
app.use(errorMiddleware);

export default app;
