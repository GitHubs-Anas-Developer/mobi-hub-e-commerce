import { Router } from "express";

import {
  forgotPassword,
  loginUser,
  registerUser,
  resetPassword,
} from "../controllers/auth.controller.js";
import { authenticate } from "../middlewares/auth.middleware.js";

const router = Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);



router.get("/me", authenticate, (req, res) => {
  return res.status(200).json({
    success: true,
    message: "User authenticated successfully",
    user: req.user,
  });
});

export default router;
