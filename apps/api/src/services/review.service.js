import Review from "../models/review.model.js";
import Product from "../models/product.model.js";
import Order from "../models/order.model.js";

const createError = (message, statusCode = 400) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

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

  // Check whether the user purchased and received this product
  const hasPurchased = await Order.exists({
    user: userId,
    orderStatus: "Delivered",
    "items.product": productId,
  });

  const review = await Review.create({
    product: productId,
    user: userId,
    rating,
    title,
    comment,
    isVerifiedPurchase: Boolean(hasPurchased),
  });

  return review;
};

export const getProductReviews = async (productId, query = {}) => {
  const page = Math.max(1, Number(query.page) || 1);
  const limit = Math.min(50, Math.max(1, Number(query.limit) || 10));

  const filter = {
    product: productId,
    isVisible: true,
  };

  const [reviews, total, ratingStats] = await Promise.all([
    Review.find(filter)
      .populate("user", "name")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean(),

    Review.countDocuments(filter),

    Review.aggregate([
      { $match: filter },
      {
        $group: {
          _id: null,
          averageRating: { $avg: "$rating" },
          totalReviews: { $sum: 1 },
        },
      },
    ]),
  ]);

  const stats = ratingStats[0] || {
    averageRating: 0,
    totalReviews: 0,
  };

  return {
    reviews,
    rating: {
      averageRating: Number(stats.averageRating.toFixed(1)),
      totalReviews: stats.totalReviews,
    },
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
};

export const getMyReviews = async (userId, query = {}) => {
  const page = Math.max(1, Number(query.page) || 1);
  const limit = Math.min(50, Math.max(1, Number(query.limit) || 10));

  const filter = { user: userId };

  const [reviews, total] = await Promise.all([
    Review.find(filter)
      .populate("product", "name slug thumbnail")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
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

export const getAllReviews = async (query = {}) => {
  const page = Math.max(1, Number(query.page) || 1);
  const limit = Math.min(50, Math.max(1, Number(query.limit) || 10));

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
      .skip((page - 1) * limit)
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

export const toggleReviewVisibility = async (reviewId, isVisible) => {
  const review = await Review.findById(reviewId);

  if (!review) {
    throw createError("Review not found", 404);
  }

  review.isVisible = isVisible;

  await review.save();

  return review;
};
