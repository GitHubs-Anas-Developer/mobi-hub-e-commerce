import Coupon from "../models/coupon.model.js";
import CouponUsage from "../models/coupon-usage.model.js";
import Cart from "../models/cart.model.js";

const createError = (message, statusCode = 400) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

// Create coupon
export const createCoupon = async (data) => {
  const existingCoupon = await Coupon.findOne({
    code: data.code,
  });

  if (existingCoupon) {
    throw createError("Coupon code already exists", 409);
  }

  if (data.discountType === "Percentage" && data.discountValue > 100) {
    throw createError("Percentage discount cannot exceed 100");
  }

  return Coupon.create(data);
};

// Get all coupons (Admin)
// Get all coupons (Admin)
export const getAllCoupons = async (query = {}) => {
  const page = Number(query.page) || 1;
  const limit = Number(query.limit) || 10;
  const skip = (page - 1) * limit;

  const filter = {};

  // Active / Inactive filter
  if (query.isActive !== undefined) {
    filter.isActive = query.isActive;
  }

  // Search by coupon code or description
  if (query.search?.trim()) {
    const search = query.search.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

    filter.$or = [
      { code: { $regex: search, $options: "i" } },
      { description: { $regex: search, $options: "i" } },
    ];
  }

  // Expiry status filter
  const now = new Date();

  switch (query.expiryStatus) {
    case "active":
      filter.startDate = { $lte: now };
      filter.expiryDate = { $gte: now };
      break;

    case "expired":
      filter.expiryDate = { $lt: now };
      break;

    case "scheduled":
      filter.startDate = { $gt: now };
      break;

    case "all":
    default:
      break;
  }

  // Sorting
  const sortBy = query.sortBy || "createdAt";
  const sortOrder = query.sortOrder === "asc" ? 1 : -1;

  const sort = {
    [sortBy]: sortOrder,
  };

  // Fetch coupons and total count
  const [coupons, total] = await Promise.all([
    Coupon.find(filter).sort(sort).skip(skip).limit(limit),

    Coupon.countDocuments(filter),
  ]);

  return {
    coupons,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
};
// Get coupon by ID (Admin)
export const getCouponById = async (couponId) => {
  const coupon = await Coupon.findById(couponId);

  if (!coupon) {
    throw createError("Coupon not found", 404);
  }

  return coupon;
};

// Update coupon (Admin)
export const updateCoupon = async (couponId, data) => {
  const coupon = await Coupon.findById(couponId);

  if (!coupon) {
    throw createError("Coupon not found", 404);
  }

  if (data.code && data.code !== coupon.code) {
    const existingCoupon = await Coupon.findOne({
      code: data.code,
      _id: { $ne: couponId },
    });

    if (existingCoupon) {
      throw createError("Coupon code already exists", 409);
    }
  }

  const discountType = data.discountType ?? coupon.discountType;
  const discountValue = data.discountValue ?? coupon.discountValue;

  if (discountType === "Percentage" && discountValue > 100) {
    throw createError("Percentage discount cannot exceed 100");
  }

  const startDate = data.startDate ?? coupon.startDate;
  const expiryDate = data.expiryDate ?? coupon.expiryDate;

  if (expiryDate <= startDate) {
    throw createError("Expiry date must be after start date");
  }

  Object.assign(coupon, data);

  await coupon.save();

  return coupon;
};

// Delete coupon (Admin)
// Delete coupon (Admin)
export const deleteCoupon = async (couponId) => {
  const coupon = await Coupon.findById(couponId);

  if (!coupon) {
    throw createError("Coupon not found", 404);
  }

  // Check whether the coupon has been used
  const usageExists = await CouponUsage.exists({
    coupon: couponId,
  });

  if (coupon.usedCount > 0 || usageExists) {
    throw createError(
      "This coupon has already been used and cannot be deleted. You can deactivate it instead.",
      409,
    );
  }

  await coupon.deleteOne();

  return {
    message: "Coupon deleted successfully",
  };
};

// Toggle coupon status (Admin)
export const toggleCouponStatus = async (couponId, isActive) => {
  const coupon = await Coupon.findById(couponId);

  if (!coupon) {
    throw createError("Coupon not found", 404);
  }

  coupon.isActive = isActive;

  await coupon.save();

  return coupon;
};

// Apply coupon (Customer)
export const applyCoupon = async (userId, code) => {
  // Get user's cart from database
  const cart = await Cart.findOne({ user: userId }).populate({
    path: "items.product",
    select: "name isActive variants",
  });

  if (!cart || cart.items.length === 0) {
    throw createError("Your cart is empty");
  }

  // Calculate subtotal using database prices
  let orderAmount = 0;

  for (const item of cart.items) {
    const product = item.product;

    if (!product || !product.isActive) {
      throw createError("Your cart contains an unavailable product");
    }

    const variant = product.variants.id(item.variantId);

    if (!variant || !variant.isActive) {
      throw createError("A product variant in your cart is unavailable");
    }

    if (variant.stock < item.quantity) {
      throw createError("Insufficient stock for a product in your cart");
    }

    orderAmount += variant.sellingPrice * item.quantity;
  }

  if (!Number.isFinite(orderAmount) || orderAmount <= 0) {
    throw createError("Invalid cart amount");
  }

  // Find coupon
  const coupon = await Coupon.findOne({
    code: code.toUpperCase(),
  });

  if (!coupon) {
    throw createError("Invalid coupon code", 404);
  }

  if (!coupon.isActive) {
    throw createError("This coupon is inactive");
  }

  const now = new Date();

  if (now < coupon.startDate || now > coupon.expiryDate) {
    throw createError("This coupon is not currently valid");
  }

  if (coupon.usageLimit !== null && coupon.usedCount >= coupon.usageLimit) {
    throw createError("Coupon usage limit reached");
  }

  if (orderAmount < coupon.minOrderAmount) {
    throw createError(`Minimum order amount is ${coupon.minOrderAmount}`);
  }

  const userUsage = await CouponUsage.findOne({
    coupon: coupon._id,
    user: userId,
  });

  if (userUsage && userUsage.usedCount >= coupon.perUserLimit) {
    throw createError("You have reached this coupon's usage limit");
  }

  // Calculate discount
  let discountAmount = 0;

  if (coupon.discountType === "Percentage") {
    discountAmount = (orderAmount * coupon.discountValue) / 100;

    if (coupon.maxDiscountAmount !== null) {
      discountAmount = Math.min(discountAmount, coupon.maxDiscountAmount);
    }
  } else {
    discountAmount = coupon.discountValue;
  }

  discountAmount = Math.min(discountAmount, orderAmount);

  return {
    coupon: {
      _id: coupon._id,
      code: coupon.code,
      discountType: coupon.discountType,
      discountValue: coupon.discountValue,
    },
    orderAmount,
    discountAmount,
    finalAmount: orderAmount - discountAmount,
  };
};
