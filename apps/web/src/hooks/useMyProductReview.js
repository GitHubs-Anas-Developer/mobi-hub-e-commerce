"use client";

import { useCallback, useEffect, useState } from "react";

import reviewService from "@/services/reviewService";

import { REVIEW_CONFIG, REVIEW_MESSAGES } from "@/constants/review.constants";

import { getReviewProductId } from "@/utils/reviewHelpers";

export default function useMyProductReview(productId, isAuthenticated) {
  const [myReview, setMyReview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchMyReview = useCallback(async () => {
    if (!isAuthenticated || !productId) {
      setMyReview(null);
      setLoading(false);
      setError("");
      return null;
    }

    try {
      setLoading(true);
      setError("");

      const response = await reviewService.getMyReviews({
        page: REVIEW_CONFIG.DEFAULT_PAGE,
        limit: 50,
      });

      const result = response?.data || {};

      const userReviews = result.reviews || [];

      const ownReview = userReviews.find(
        (review) => getReviewProductId(review) === String(productId),
      );

      setMyReview(ownReview || null);

      return ownReview || null;
    } catch (err) {
      console.error("My Review API Error:", {
        message: err.message,
        status: err.response?.status,
        response: err.response?.data,
        url: err.config?.url,
      });

      setError(err.response?.data?.message || REVIEW_MESSAGES.MY_REVIEW_ERROR);

      setMyReview(null);

      return null;
    } finally {
      setLoading(false);
    }
  }, [productId, isAuthenticated]);

  useEffect(() => {
    fetchMyReview();
  }, [fetchMyReview]);

  const updateMyReview = useCallback(
    async (reviewData) => {
      if (!myReview?._id) {
        throw new Error("Your review was not found.");
      }

      const response = await reviewService.updateReview(
        myReview._id,
        reviewData,
      );

      await fetchMyReview();

      return response;
    },
    [myReview, fetchMyReview],
  );

  const deleteMyReview = useCallback(async () => {
    if (!myReview?._id) {
      throw new Error("Your review was not found.");
    }

    const response = await reviewService.deleteReview(myReview._id);

    setMyReview(null);

    return response;
  }, [myReview]);

  const resetMyReview = useCallback(() => {
    setMyReview(null);
    setError("");
  }, []);

  return {
    myReview,
    loading,
    error,
    fetchMyReview,
    updateMyReview,
    deleteMyReview,
    resetMyReview,
  };
}
