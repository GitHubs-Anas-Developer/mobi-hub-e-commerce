import jwt from "jsonwebtoken";
import crypto from "node:crypto";
import RefreshToken from "../models/refresh-token.model.js";

const REFRESH_TOKEN_EXPIRES_DAYS = 7;

export const createRefreshToken = async (userId) => {
  const token = crypto.randomBytes(64).toString("hex");

  const tokenHash = crypto.createHash("sha256").update(token).digest("hex");

  const expiresAt = new Date(
    Date.now() + REFRESH_TOKEN_EXPIRES_DAYS * 24 * 60 * 60 * 1000,
  );

  await RefreshToken.create({
    user: userId,
    tokenHash,
    expiresAt,
  });

  return token;
};

export const verifyRefreshToken = async (token) => {
  if (!token || typeof token !== "string") {
    return null;
  }

  const tokenHash = crypto.createHash("sha256").update(token).digest("hex");

  const storedToken = await RefreshToken.findOne({
    tokenHash,
    revokedAt: null,
    expiresAt: { $gt: new Date() },
  });

  return storedToken;
};

export const revokeRefreshToken = async (token) => {
  if (!token || typeof token !== "string") {
    return null;
  }

  const tokenHash = crypto.createHash("sha256").update(token).digest("hex");

  return RefreshToken.findOneAndUpdate(
    {
      tokenHash,
      revokedAt: null,
    },
    {
      revokedAt: new Date(),
    },
    { new: true },
  );
};

export const generateAccessToken = (userId, role) => {
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET is missing");
  }

  return jwt.sign({ userId: userId.toString(), role }, process.env.JWT_SECRET, {
    expiresIn: "15m",
  });
};

export const consumeRefreshToken = async (token) => {
  if (!token || typeof token !== "string") {
    return null;
  }

  const tokenHash = crypto.createHash("sha256").update(token).digest("hex");

  // Atomically revoke the old token to prevent reuse.
  const storedToken = await RefreshToken.findOneAndUpdate(
    {
      tokenHash,
      revokedAt: null,
      expiresAt: { $gt: new Date() },
    },
    {
      revokedAt: new Date(),
    },
    { new: true },
  ).populate("user");

  if (!storedToken || !storedToken.user) {
    return null;
  }

  return storedToken.user;
};
