import { Router } from "express";
import passport from "passport";

import {
  forgotPassword,
  loginUser,
  logoutUser,
  refreshAccessToken,
  registerUser,
  resetPassword,
  updateUserProfile,
  changePassword,
  verifyEmail,
  resendVerificationEmail,
} from "../controllers/auth.controller.js";

import { googleAuthSuccess } from "../controllers/google-auth.controller.js";

import { authenticate } from "../middlewares/auth.middleware.js";

const router = Router();

// Google Authentication
router.get(
  "/google",
  passport.authenticate("google", {
    scope: ["profile", "email"],
  }),
);

// Google Authentication Callback
router.get("/google/callback", (req, res, next) => {
  passport.authenticate("google", { session: false }, (error, user, info) => {
    if (error) {
      return next(error);
    }

    if (!user) {
      const clientUrl = process.env.CLIENT_URL?.split(",")[0].trim();

      if (!clientUrl) {
        return next(new Error("CLIENT_URL is missing"));
      }

      const failureUrl = new URL(clientUrl);
      failureUrl.pathname = "/login";
      failureUrl.search = "";
      failureUrl.searchParams.set("google", "failed");

      return res.redirect(failureUrl.toString());
    }

    req.user = user;

    return googleAuthSuccess(req, res, next);
  })(req, res, next);
});

// Register
router.post("/register", registerUser);

// Email Verification
router.post("/verify-email", verifyEmail);
router.post("/resend-verification", resendVerificationEmail);

// Login / Logout
router.post("/login", loginUser);
router.post("/refresh", refreshAccessToken);
router.post("/logout", logoutUser);

// Password
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);

// Current User
router.get("/me", authenticate, (req, res) => {
  return res.status(200).json({
    success: true,
    message: "User authenticated successfully",
    user: req.user,
  });
});

// Profile
router.patch("/me", authenticate, updateUserProfile);
router.patch("/change-password", authenticate, changePassword);

export default router;
