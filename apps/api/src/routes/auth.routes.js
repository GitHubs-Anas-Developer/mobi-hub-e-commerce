import { Router } from "express";

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
  resendVerificationEmail
} from "../controllers/auth.controller.js";
import { authenticate } from "../middlewares/auth.middleware.js";

const router = Router();

router.post("/register", registerUser);
router.post("/verify-email", verifyEmail);
router.post("/resend-verification", resendVerificationEmail);
router.post("/login", loginUser);
router.post("/refresh", refreshAccessToken);
router.post("/logout", logoutUser);

router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);

router.get("/me", authenticate, (req, res) => {
  return res.status(200).json({
    success: true,
    message: "User authenticated successfully",
    user: req.user,
  });
});

router.patch("/me", authenticate, updateUserProfile);
router.patch("/change-password", authenticate, changePassword);

export default router;
