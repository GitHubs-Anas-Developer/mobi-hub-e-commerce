import {
  createReview,
  getProductReviews,
  getMyReviews,
  updateReview,
  deleteReview,
  getAllReviews,
  toggleReviewVisibility,
} from "../services/review.service.js";

export const addReview = async (req, res, next) => {
  try {
    const review = await createReview(req.user._id, req.validatedData.body);

    res.status(201).json({
      success: true,
      message: "Review created successfully",
      data: review,
    });
  } catch (error) {
    next(error);
  }
};

export const fetchProductReviews = async (req, res, next) => {
  try {
    const result = await getProductReviews(
      req.validatedData.params.productId,
      req.validatedData.query,
    );

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const fetchMyReviews = async (req, res, next) => {
  try {
    const result = await getMyReviews(req.user._id, req.validatedData.query);

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const editReview = async (req, res, next) => {
  try {
    const review = await updateReview(
      req.validatedData.params.reviewId,
      req.user._id,
      req.validatedData.body,
    );

    res.status(200).json({
      success: true,
      message: "Review updated successfully",
      data: review,
    });
  } catch (error) {
    next(error);
  }
};

export const removeReview = async (req, res, next) => {
  try {
    const result = await deleteReview(
      req.validatedData.params.reviewId,
      req.user._id,
    );

    res.status(200).json({
      success: true,
      ...result,
    });
  } catch (error) {
    next(error);
  }
};

export const fetchAllReviews = async (req, res, next) => {
  try {
    const result = await getAllReviews(req.validatedData.query);

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const changeReviewVisibility = async (req, res, next) => {
  try {
    const review = await toggleReviewVisibility(
      req.validatedData.params.reviewId,
      req.validatedData.body.isVisible,
    );

    res.status(200).json({
      success: true,
      message: "Review visibility updated successfully",
      data: review,
    });
  } catch (error) {
    next(error);
  }
};
