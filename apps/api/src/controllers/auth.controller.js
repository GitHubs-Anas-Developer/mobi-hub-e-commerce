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

// Cookie configuration
const getCookieOptions = (path) => ({
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax",
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

    const user = await User.create({
      name: trimmedName,
      email: normalizedEmail,
      password,
      phone: phone ? phone.trim() : null,
    });

    const token = generateToken(user._id);

    return res.status(201).json({
      success: true,
      message: "User registered successfully",
      token,
      user: sanitizeUser(user),
    });
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

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    user.lastLoginAt = new Date();
    await user.save();

    const accessToken = generateAccessToken(user._id, user.role);
    const refreshToken = await createRefreshToken(user._id);

    res.cookie("accessToken", accessToken, {
      ...getCookieOptions("/api/v1"),
      maxAge: 15 * 60 * 1000,
    });

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
    const { email } = req.body || {};

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const user = await User.findOne({
      email: normalizedEmail,
    });

    if (!user) {
      return res.status(200).json({
        success: true,
        message:
          "If an account exists for that email, a reset link has been generated.",
      });
    }

    const resetToken = crypto.randomBytes(32).toString("hex");

    const hashedToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");

    user.resetPasswordToken = hashedToken;
    user.resetPasswordExpires = Date.now() + 15 * 60 * 1000;

    await user.save({ validateBeforeSave: false });

    return res.status(200).json({
      success: true,
      message: "Password reset token generated successfully.",
      resetToken,
      expiresInMinutes: 15,
    });
  } catch (error) {
    return next(error);
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

    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Reset token is invalid or has expired",
      });
    }

    user.password = password;
    user.resetPasswordToken = null;
    user.resetPasswordExpires = null;

    await user.save();

    return res.status(200).json({
      success: true,
      message: "Password reset successfully",
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

    // Revoke all existing refresh-token sessions.
    await revokeAllUserRefreshTokens(user._id);

    // Clear current authentication cookies.
    clearAuthCookies(res);

    return res.status(200).json({
      success: true,
      message: "Password changed successfully. Please login again.",
    });
  } catch (error) {
    return next(error);
  }
};
