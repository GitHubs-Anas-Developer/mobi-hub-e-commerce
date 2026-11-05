import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

import authRoutes from "./routes/auth.routes.js";
import healthRoutes from "./routes/health.routes.js";
import categoryRoutes from "./routes/category.routes.js"
import { errorMiddleware } from "./middlewares/error.middleware.js";

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use(
  cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
  }),
);

// Health Check
app.use("/api/v1/health", healthRoutes);

// Authentication Routes
app.use("/api/v1/auth", authRoutes);

// Category Routes
app.use("/api/v1/categories", categoryRoutes);

// Default route
app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Welcome to MOBI HUB API",
  });
});

// 404 Handler
app.use((req, res, next) => {
  const error = new Error("Route not found");
  error.statusCode = 404;
  next(error);
});

// Error Middleware (Always last)
app.use(errorMiddleware);

export default app;
