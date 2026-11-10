import Review from "../models/review.model.js";
import Product from "../models/product.model.js";
import Order from "../models/order.model.js";
import mongoose from "mongoose";

const createError = (message, statusCode = 400) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

const getPagination = (query = {}) => {
  const page = Math.max(1, Number(query.page) || 1);
  const limit = Math.min(50, Math.max(1, Number(query.limit) || 10));

  return {
    page,
    limit,
    skip: (page - 1) * limit,
  };
};

// Create Review
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

  try {
    const review = await Review.create({
      product: productId,
      user: userId,
      rating,
      title,
      comment,
      isVerifiedPurchase: Boolean(hasPurchased),
    });

    return review;
  } catch (error) {
    // Handle duplicate review caused by concurrent requests
    if (error.code === 11000) {
      throw createError("You have already reviewed this product", 409);
    }

    throw error;
  }
};

// Get Product Reviews + Rating Statistics

export const getProductReviews = async (productId, query = {}) => {
  const { page, limit, skip } = getPagination(query);

  const { sort = "newest", rating } = query;

  const filter = {
    product: productId,
    isVisible: true,
  };

  // Apply rating filter only to the review list.
  if (rating) {
    filter.rating = rating;
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

// Get My Reviews
export const getMyReviews = async (userId, query = {}) => {
  const { page, limit, skip } = getPagination(query);

  const filter = { user: userId };

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

// Update Review
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

  return review;
};

// Delete Review
export const deleteReview = async (reviewId, userId) => {
  const review = await Review.findOne({
    _id: reviewId,
    user: userId,
  });

  if (!review) {
    throw createError("Review not found", 404);
  }

  await review.deleteOne();

  return {
    message: "Review deleted successfully",
  };
};

// Get All Reviews (Admin)
export const getAllReviews = async (query = {}) => {
  const { page, limit, skip } = getPagination(query);

  const filter = {};

  if (query.isVisible !== undefined) {
    filter.isVisible = query.isVisible;
  }

  if (query.productId) {
    filter.product = query.productId;
  }

  const [reviews, total] = await Promise.all([
    Review.find(filter)
      .populate("user", "name email")
      .populate("product", "name slug")
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

// Update Review Visibility (Admin)
export const toggleReviewVisibility = async (reviewId, isVisible) => {
  const review = await Review.findById(reviewId);

  if (!review) {
    throw createError("Review not found", 404);
  }

  review.isVisible = isVisible;

  await review.save();

  return review;
};
