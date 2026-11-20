import crypto from "crypto";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

import {
  createRefreshToken,
  generateAccessToken,
  consumeRefreshToken,
  revokeRefreshToken,
  revokeAllUserRefreshTokens,
} from "../services/refresh-token.service.js";

import User from "../models/user.model.js";
import { randomBytes, createHash } from "node:crypto";
import {
  sendPasswordResetEmail,
  sendEmailVerificationEmail,
} from "../services/email.service.js";

// Cookie configuration
const getCookieOptions = (path) => ({
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
  path,
});

// Clear authentication cookies
const clearAuthCookies = (res) => {
  res.clearCookie("accessToken", getCookieOptions("/api/v1"));
  res.clearCookie("refreshToken", getCookieOptions("/api/v1/auth"));
};

// Generate legacy access token for existing registration flow
const generateToken = (userId) => {
  const secret = process.env.JWT_SECRET;
  const expiresIn = process.env.JWT_EXPIRES_IN;

  return jwt.sign({ userId }, secret, { expiresIn });
};

// Remove password from user response
const sanitizeUser = (user) => {
  const data = user.toObject ? user.toObject() : { ...user };

  delete data.password;

  return data;
};

// Register User
export const registerUser = async (req, res, next) => {
  try {
    const { name, email, password, phone } = req.body || {};

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Name, email, and password are required",
      });
    }

    const trimmedName = name.trim();
    const normalizedEmail = email.trim().toLowerCase();

    if (trimmedName.length < 2) {
      return res.status(400).json({
        success: false,
        message: "Name must be at least 2 characters",
      });
    }

    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 8 characters",
      });
    }

    const existingUser = await User.findOne({
      email: normalizedEmail,
    });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "User already exists with this email",
      });
    }

    // Generate secure verification token
    const verificationToken = randomBytes(32).toString("hex");

    // Store only hashed token in database
    const hashedVerificationToken = createHash("sha256")
      .update(verificationToken)
      .digest("hex");

    // Create user
    const user = await User.create({
      name: trimmedName,
      email: normalizedEmail,
      password,
      phone: phone ? phone.trim() : null,
      isEmailVerified: false,
      emailVerificationToken: hashedVerificationToken,
      emailVerificationExpires: Date.now() + 24 * 60 * 60 * 1000,
    });

    try {
      const frontendUrl = new URL(process.env.CLIENT_URL);

      if (!["http:", "https:"].includes(frontendUrl.protocol)) {
        throw new Error("Invalid CLIENT_URL protocol");
      }

      frontendUrl.pathname = "/verify-email";
      frontendUrl.search = "";
      frontendUrl.searchParams.set("token", verificationToken);

      await sendEmailVerificationEmail({
        to: user.email,
        name: user.name,
        verificationUrl: frontendUrl.toString(),
      });
    } catch (emailError) {
      // Remove user if verification email could not be sent
      await User.findByIdAndDelete(user._id);

      throw emailError;
    }

    return res.status(201).json({
      success: true,
      message:
        "Registration successful. Please check your email to verify your account.",
    });
  } catch (error) {
    return next(error);
  }
};

// Verify Email
export const verifyEmail = async (req, res, next) => {
  try {
    const { token } = req.body || {};

    if (!token) {
      return res.status(400).json({
        success: false,
        message: "Email verification token is required",
      });
    }

    // Hash the token received from frontend
    const hashedToken = createHash("sha256").update(token).digest("hex");

    // Find user with valid, unexpired verification token
    const user = await User.findOne({
      emailVerificationToken: hashedToken,
      emailVerificationExpires: { $gt: new Date() },
      isActive: true,
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired email verification link",
      });
    }

    // Verify email
    user.isEmailVerified = true;

    // Clear verification token
    user.emailVerificationToken = null;
    user.emailVerificationExpires = null;

    await user.save();

    return res.status(200).json({
      success: true,
      message: "Email verified successfully. You can now log in.",
    });
  } catch (error) {
    return next(error);
  }
};

export const resendVerificationEmail = async (req, res, next) => {
  try {
    const { email } = req.body || {};

    if (!email || typeof email !== "string") {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const user = await User.findOne({
      email: normalizedEmail,
      isActive: true,
    });

    // Generic response prevents revealing account details
    const response = {
      success: true,
      message:
        "If an unverified account exists with this email, a verification link will be sent.",
    };

    if (!user || user.isEmailVerified) {
      return res.status(200).json(response);
    }

    // Generate a new verification token
    const verificationToken = randomBytes(32).toString("hex");

    // Store only the SHA-256 hash
    user.emailVerificationToken = createHash("sha256")
      .update(verificationToken)
      .digest("hex");

    // Link expires in 24 hours
    user.emailVerificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);

    await user.save({ validateBeforeSave: false });

    try {
      const frontendUrl = new URL(process.env.CLIENT_URL);

      if (!["http:", "https:"].includes(frontendUrl.protocol)) {
        throw new Error("Invalid CLIENT_URL protocol");
      }

      frontendUrl.pathname = "/verify-email";
      frontendUrl.search = "";
      frontendUrl.searchParams.set("token", verificationToken);

      await sendEmailVerificationEmail({
        to: user.email,
        name: user.name,
        verificationUrl: frontendUrl.toString(),
      });
    } catch (emailError) {
      // Invalidate token if email sending fails
      user.emailVerificationToken = null;
      user.emailVerificationExpires = null;

      await user.save({ validateBeforeSave: false });

      throw emailError;
    }

    return res.status(200).json(response);
  } catch (error) {
    return next(error);
  }
};

// Login User
export const loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body || {};

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const user = await User.findOne({
      email: normalizedEmail,
    }).select("+password");

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    // Google-only accounts cannot use password login
    if (!user.password) {
      return res.status(401).json({
        success: false,
        message: "This account uses Google login. Please continue with Google.",
        code: "GOOGLE_LOGIN_REQUIRED",
      });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    // Check email verification
    if (!user.isEmailVerified) {
      return res.status(403).json({
        success: false,
        message: "Please verify your email before logging in.",
        code: "EMAIL_NOT_VERIFIED",
      });
    }

    // Update last login
    user.lastLoginAt = new Date();
    await user.save();

    // Generate authentication tokens
    const accessToken = generateAccessToken(user._id, user.role);
    const refreshToken = await createRefreshToken(user._id);

    // Set access token cookie
    res.cookie("accessToken", accessToken, {
      ...getCookieOptions("/api/v1"),
      maxAge: 15 * 60 * 1000,
    });

    // Set refresh token cookie
    res.cookie("refreshToken", refreshToken, {
      ...getCookieOptions("/api/v1/auth"),
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.status(200).json({
      success: true,
      message: "Login successful",
      user: sanitizeUser(user),
    });
  } catch (error) {
    return next(error);
  }
};

// Refresh Access Token
export const refreshAccessToken = async (req, res, next) => {
  try {
    const oldRefreshToken = req.cookies?.refreshToken;

    if (!oldRefreshToken) {
      return res.status(401).json({
        success: false,
        message: "Refresh token is required",
      });
    }

    const user = await consumeRefreshToken(oldRefreshToken);

    if (!user) {
      clearAuthCookies(res);

      return res.status(401).json({
        success: false,
        message: "Invalid or expired refresh token",
      });
    }

    const accessToken = generateAccessToken(user._id, user.role);
    const newRefreshToken = await createRefreshToken(user._id);

    res.cookie("accessToken", accessToken, {
      ...getCookieOptions("/api/v1"),
      maxAge: 15 * 60 * 1000,
    });

    res.cookie("refreshToken", newRefreshToken, {
      ...getCookieOptions("/api/v1/auth"),
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.status(200).json({
      success: true,
      message: "Token refreshed successfully",
    });
  } catch (error) {
    return next(error);
  }
};

// Logout User
export const logoutUser = async (req, res, next) => {
  try {
    const refreshToken = req.cookies?.refreshToken;

    if (refreshToken) {
      await revokeRefreshToken(refreshToken);
    }

    clearAuthCookies(res);

    return res.status(200).json({
      success: true,
      message: "Logout successful",
    });
  } catch (error) {
    return next(error);
  }
};

// Forgot Password

export const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const user = await User.findOne({
      email: normalizedEmail,
      isActive: true,
    });

    // Always return the same response to avoid revealing whether
    // an email address has an account.
    const response = {
      success: true,
      message:
        "If an account exists with this email, a password reset link will be sent.",
    };

    if (!user) {
      return res.status(200).json(response);
    }

    // Generate a secure random token.
    const resetToken = randomBytes(32).toString("hex");

    // Store only the hashed token in MongoDB.
    user.resetPasswordToken = createHash("sha256")
      .update(resetToken)
      .digest("hex");

    user.resetPasswordExpires = Date.now() + 15 * 60 * 1000;

    await user.save({ validateBeforeSave: false });

    try {
      const frontendUrl = new URL(process.env.CLIENT_URL);

      if (!["http:", "https:"].includes(frontendUrl.protocol)) {
        throw new Error("Invalid CLIENT_URL protocol");
      }

      frontendUrl.pathname = "/reset-password";
      frontendUrl.search = "";
      frontendUrl.searchParams.set("token", resetToken);

      await sendPasswordResetEmail({
        to: user.email,
        name: user.name,
        resetUrl: frontendUrl.toString(),
      });
    } catch (emailError) {
      // Invalidate the token if the email could not be sent.
      user.resetPasswordToken = undefined;
      user.resetPasswordExpires = undefined;

      await user.save({ validateBeforeSave: false });

      throw emailError;
    }

    return res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};

// Reset Password
export const resetPassword = async (req, res, next) => {
  try {
    const { token, password } = req.body || {};

    if (!token || !password) {
      return res.status(400).json({
        success: false,
        message: "Reset token and new password are required",
      });
    }

    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 8 characters",
      });
    }

    // Hash the token received from the frontend
    const hashedToken = createHash("sha256").update(token).digest("hex");

    // Find user with valid, unexpired reset token
    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: new Date() },
      isActive: true,
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired password reset link",
      });
    }

    // Update password
    user.password = password;

    // Enable email/password login
    user.authProvider = "local";

    // Clear reset token
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;

    // User model pre-save hook hashes the password
    await user.save();

    // Revoke all existing refresh-token sessions
    await revokeAllUserRefreshTokens(user._id);

    return res.status(200).json({
      success: true,
      message: "Password reset successful. Please log in again.",
    });
  } catch (error) {
    return next(error);
  }
};

// Update User Profile
export const updateUserProfile = async (req, res, next) => {
  try {
    const { name, phone } = req.body || {};

    if (name !== undefined) {
      if (typeof name !== "string" || name.trim().length < 2) {
        return res.status(400).json({
          success: false,
          message: "Name must be at least 2 characters",
        });
      }

      if (name.trim().length > 50) {
        return res.status(400).json({
          success: false,
          message: "Name cannot exceed 50 characters",
        });
      }

      req.user.name = name.trim();
    }

    if (phone !== undefined) {
      if (phone !== null && typeof phone !== "string") {
        return res.status(400).json({
          success: false,
          message: "Invalid phone number",
        });
      }

      req.user.phone = phone?.trim() || null;
    }

    await req.user.save();

    return res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      user: sanitizeUser(req.user),
    });
  } catch (error) {
    return next(error);
  }
};

// Change User Password
export const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword, confirmPassword } = req.body || {};

    if (!currentPassword || !newPassword || !confirmPassword) {
      return res.status(400).json({
        success: false,
        message:
          "Current password, new password and confirm password are required",
      });
    }

    if (typeof newPassword !== "string" || newPassword.length < 8) {
      return res.status(400).json({
        success: false,
        message: "New password must be at least 8 characters",
      });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "New password and confirm password do not match",
      });
    }

    if (currentPassword === newPassword) {
      return res.status(400).json({
        success: false,
        message: "New password must be different from current password",
      });
    }

    const user = await User.findById(req.user._id).select("+password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Google-only users must set a password through password reset first
    if (!user.password) {
      return res.status(400).json({
        success: false,
        message:
          "You do not have a password yet. Please set your password using the forgot password option.",
        code: "PASSWORD_NOT_SET",
      });
    }

    const isPasswordValid = await bcrypt.compare(
      currentPassword,
      user.password,
    );

    if (!isPasswordValid) {
      return res.status(400).json({
        success: false,
        message: "Current password is incorrect",
      });
    }

    user.password = newPassword;

    await user.save();

    // Revoke all existing refresh-token sessions
    await revokeAllUserRefreshTokens(user._id);

    // Clear current authentication cookies
    clearAuthCookies(res);

    return res.status(200).json({
      success: true,
      message: "Password changed successfully. Please login again.",
    });
  } catch (error) {
    return next(error);
  }
};
