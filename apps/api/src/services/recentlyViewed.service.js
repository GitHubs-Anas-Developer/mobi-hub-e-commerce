import mongoose from "mongoose";

import RecentlyViewed from "../models/recentlyViewed.model.js";
import Product from "../models/product.model.js";
import { createError } from "../utils/createError.js";

// Add or update recently viewed product
export const addRecentlyViewed = async (userId, productId) => {
  if (
    !mongoose.Types.ObjectId.isValid(userId) ||
    !mongoose.Types.ObjectId.isValid(productId)
  ) {
    throw new AppError("Invalid user or product ID", 400);
  }

  const product = await Product.findOne({
    _id: productId,
    isActive: true,
  }).select("_id");

  if (!product) {
    throw new createError("Product not found", 404);
  }

  const recentlyViewed = await RecentlyViewed.findOneAndUpdate(
    {
      user: userId,
      product: productId,
    },
    {
      $set: {
        viewedAt: new Date(),
      },
    },
    {
      upsert: true,
      new: true,
      runValidators: true,
      setDefaultsOnInsert: true,
    },
  );

  // Keep only the latest 20 viewed products
  const oldRecords = await RecentlyViewed.find({ user: userId })
    .sort({ viewedAt: -1 })
    .skip(20)
    .select("_id");

  if (oldRecords.length > 0) {
    await RecentlyViewed.deleteMany({
      _id: { $in: oldRecords.map((item) => item._id) },
    });
  }

  return recentlyViewed;
};

// Get recently viewed products
export const getRecentlyViewed = async (userId) => {
  const records = await RecentlyViewed.find({ user: userId })
    .sort({ viewedAt: -1 })
    .limit(20)
    .populate({
      path: "product",
      match: { isActive: true },
      select: "name slug brand basePrice thumbnail images ratings variants",
    })
    .lean();

  return records
    .filter((record) => record.product)
    .map((record) => ({
      ...record.product,
      viewedAt: record.viewedAt,
    }));
};

// Clear recently viewed history
export const clearRecentlyViewed = async (userId) => {
  await RecentlyViewed.deleteMany({ user: userId });

  return {
    message: "Recently viewed history cleared successfully",
  };
};
