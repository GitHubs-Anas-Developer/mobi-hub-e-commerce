import User from "../models/user.model.js";
import { revokeAllUserRefreshTokens } from "./refresh-token.service.js";

const createError = (message, statusCode = 400) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

// Get all users with search, filters and pagination
export const getAdminUsers = async (filters = {}) => {
  const query = {
    role: "customer",
  };

  if (filters.status === "active") {
    query.isActive = true;
  } else if (filters.status === "inactive") {
    query.isActive = false;
  }

  if (filters.verification === "verified") {
    query.isEmailVerified = true;
  } else if (filters.verification === "unverified") {
    query.isEmailVerified = false;
  }

  if (filters.search?.trim()) {
    const search = filters.search.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

    query.$or = [
      { name: { $regex: search, $options: "i" } },
      { email: { $regex: search, $options: "i" } },
      { phone: { $regex: search, $options: "i" } },
    ];
  }

  const sortOptions = {
    newest: { createdAt: -1 },
    oldest: { createdAt: 1 },
    nameAZ: { name: 1 },
    nameZA: { name: -1 },
    lastLoginNewest: { lastLoginAt: -1 },
  };

  const sort = sortOptions[filters.sort] || sortOptions.newest;

  const page = Math.max(1, Number(filters.page) || 1);
  const limit = Math.min(100, Math.max(1, Number(filters.limit) || 10));
  const skip = (page - 1) * limit;

  const [users, total] = await Promise.all([
    User.find(query)
      .select("-password -resetPasswordToken -resetPasswordExpires")
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .lean(),

    User.countDocuments(query),
  ]);

  return {
    users,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      hasNextPage: page * limit < total,
      hasPrevPage: page > 1,
    },
  };
};

// Get single customer details
export const getAdminUserById = async (userId) => {
  const user = await User.findOne({
    _id: userId,
    role: "customer",
  })
    .select("-password -resetPasswordToken -resetPasswordExpires")
    .lean();

  if (!user) {
    throw createError("User not found", 404);
  }

  return user;
};

// Activate / Deactivate customer
export const updateUserStatus = async (userId, isActive, adminId) => {
  const user = await User.findOne({
    _id: userId,
    role: "customer",
  });

  if (!user) {
    throw createError("User not found", 404);
  }

  if (String(user._id) === String(adminId)) {
    throw createError("You cannot deactivate your own account");
  }

  user.isActive = isActive;

  await user.save();

  // Revoke existing sessions immediately when deactivated.
  if (!isActive) {
    await revokeAllUserRefreshTokens(user._id);
  }

  return user;
};
