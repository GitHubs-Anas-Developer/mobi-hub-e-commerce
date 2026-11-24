import Review from "../models/review.model.js";
import Product from "../models/product.model.js";
import Order from "../models/order.model.js";
import mongoose from "mongoose";
import User from "../models/user.model.js";

/**
 * Recalculate and synchronize product rating.
 * Only visible reviews are included.
 */
const syncProductRating = async (productId) => {
  const stats = await Review.aggregate([
    {
      $match: {
        product: new mongoose.Types.ObjectId(productId),
        isVisible: true,
      },
    },
    {
      $group: {
        _id: null,
        average: { $avg: "$rating" },
        count: { $sum: 1 },
      },
    },
  ]);

  const average = stats[0]?.average ?? 0;
  const count = stats[0]?.count ?? 0;

  await Product.updateOne(
    { _id: productId },
    {
      $set: {
        "ratings.average": Number(average.toFixed(1)),
        "ratings.count": count,
      },
    },
  );

  return {
    average: Number(average.toFixed(1)),
    count,
  };
};

/**
 * Create application error.
 */
const createError = (message, statusCode = 400) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

/**
 * Pagination helper.
 */
const getPagination = (query = {}) => {
  const page = Math.max(1, Number(query.page) || 1);
  const limit = Math.min(50, Math.max(1, Number(query.limit) || 10));

  return {
    page,
    limit,
    skip: (page - 1) * limit,
  };
};

// ============================================
// CREATE REVIEW
// ============================================

export const createReview = async (userId, data) => {
  const { productId, rating, title, comment } = data;

  const product = await Product.findById(productId);

  if (!product || !product.isActive) {
    throw createError("Product not found", 404);
  }

  const existingReview = await Review.findOne({
    product: productId,
    user: userId,
  });

  if (existingReview) {
    throw createError("You have already reviewed this product", 409);
  }

  const hasPurchased = await Order.exists({
    user: userId,
    orderStatus: "Delivered",
    "items.product": productId,
  });

  let review;

  try {
    review = await Review.create({
      product: productId,
      user: userId,
      rating,
      title,
      comment,
      isVerifiedPurchase: Boolean(hasPurchased),
    });
  } catch (error) {
    // Handle duplicate review caused by concurrent requests.
    if (error.code === 11000) {
      throw createError("You have already reviewed this product", 409);
    }

    throw error;
  }

  // Synchronize Product model rating.
  await syncProductRating(productId);

  return review;
};

// ============================================
// GET PRODUCT REVIEWS + RATING STATISTICS
// ============================================

export const getProductReviews = async (productId, query = {}) => {
  const { page, limit, skip } = getPagination(query);

  const { sort = "newest", rating } = query;

  // Review list filter.
  const filter = {
    product: productId,
    isVisible: true,
  };

  // Apply rating filter only to the review list.
  if (rating) {
    filter.rating = Number(rating);
  }

  // Aggregation does not automatically cast string IDs.
  const aggregateFilter = {
    product: new mongoose.Types.ObjectId(productId),
    isVisible: true,
  };

  // Sorting options.
  const sortOptions = {
    newest: { createdAt: -1 },
    highest: { rating: -1, createdAt: -1 },
    lowest: { rating: 1, createdAt: -1 },
  };

  const [reviews, total, ratingStats, distributionStats] = await Promise.all([
    Review.find(filter)
      .populate("user", "name")
      .sort(sortOptions[sort] || sortOptions.newest)
      .skip(skip)
      .limit(limit)
      .lean(),

    Review.countDocuments(filter),

    Review.aggregate([
      { $match: aggregateFilter },
      {
        $group: {
          _id: null,
          averageRating: { $avg: "$rating" },
          totalReviews: { $sum: 1 },
        },
      },
    ]),

    Review.aggregate([
      { $match: aggregateFilter },
      {
        $group: {
          _id: "$rating",
          count: { $sum: 1 },
        },
      },
    ]),
  ]);

  const stats = ratingStats[0] || {
    averageRating: 0,
    totalReviews: 0,
  };

  const ratingDistribution = {
    1: 0,
    2: 0,
    3: 0,
    4: 0,
    5: 0,
  };

  distributionStats.forEach((item) => {
    ratingDistribution[item._id] = item.count;
  });

  return {
    reviews,

    // Overall rating summary remains independent of filters.
    rating: {
      averageRating: Number((stats.averageRating || 0).toFixed(1)),
      totalReviews: stats.totalReviews,
      ratingDistribution,
    },

    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
};

// ============================================
// GET MY REVIEWS
// ============================================

export const getMyReviews = async (userId, query = {}) => {
  const { page, limit, skip } = getPagination(query);

  const filter = {
    user: userId,
  };

  const [reviews, total] = await Promise.all([
    Review.find(filter)
      .populate("product", "name slug thumbnail")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),

    Review.countDocuments(filter),
  ]);

  return {
    reviews,

    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
};

// ============================================
// UPDATE REVIEW
// ============================================

export const updateReview = async (reviewId, userId, data) => {
  const review = await Review.findOne({
    _id: reviewId,
    user: userId,
  });

  if (!review) {
    throw createError("Review not found", 404);
  }

  if (!review.isVisible) {
    throw createError("This review cannot be edited", 400);
  }

  if (data.rating !== undefined) {
    review.rating = data.rating;
  }

  if (data.title !== undefined) {
    review.title = data.title;
  }

  if (data.comment !== undefined) {
    review.comment = data.comment;
  }

  await review.save();

  // Recalculate rating after update.
  await syncProductRating(review.product);

  return review;
};

// ============================================
// DELETE REVIEW
// ============================================

export const deleteReview = async (reviewId, userId) => {
  const review = await Review.findOne({
    _id: reviewId,
    user: userId,
  });

  if (!review) {
    throw createError("Review not found", 404);
  }

  // Store product ID before deleting review.
  const productId = review.product;

  await review.deleteOne();

  // Recalculate rating after deletion.
  await syncProductRating(productId);

  return {
    message: "Review deleted successfully",
  };
};

// ============================================
// GET ALL REVIEWS (ADMIN)
// ============================================

export const getAllReviews = async (query = {}) => {
  const { page, limit, skip } = getPagination(query);

  const filter = {};

  if (query.isVisible !== undefined) {
    filter.isVisible = query.isVisible;
  }

  if (query.productId) {
    filter.product = query.productId;
  }

  if (query.rating) {
    filter.rating = Number(query.rating);
  }

  if (query.search?.trim()) {
    // Escape special regex characters.
    const search = query.search.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

    const [matchingUsers, matchingProducts] = await Promise.all([
      User.find({
        $or: [
          { name: { $regex: search, $options: "i" } },
          { email: { $regex: search, $options: "i" } },
        ],
      }).distinct("_id"),

      Product.find({
        name: { $regex: search, $options: "i" },
      }).distinct("_id"),
    ]);

    filter.$or = [
      { title: { $regex: search, $options: "i" } },
      { comment: { $regex: search, $options: "i" } },
      { user: { $in: matchingUsers } },
      { product: { $in: matchingProducts } },
    ];
  }

  const sortOptions = {
    newest: { createdAt: -1 },
    oldest: { createdAt: 1 },
    highest: { rating: -1, createdAt: -1 },
    lowest: { rating: 1, createdAt: -1 },
  };

  const sort = sortOptions[query.sort] || sortOptions.newest;

  const [reviews, total] = await Promise.all([
    Review.find(filter)
      .populate("user", "name email")
      .populate("product", "name slug")
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .lean(),

    Review.countDocuments(filter),
  ]);

  return {
    reviews,

    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
};

// ============================================
// UPDATE REVIEW VISIBILITY (ADMIN)
// ============================================

export const toggleReviewVisibility = async (reviewId, isVisible) => {
  const review = await Review.findById(reviewId);

  if (!review) {
    throw createError("Review not found", 404);
  }

  review.isVisible = isVisible;

  await review.save();

  // Recalculate rating when review visibility changes.
  await syncProductRating(review.product);

  return review;
};
