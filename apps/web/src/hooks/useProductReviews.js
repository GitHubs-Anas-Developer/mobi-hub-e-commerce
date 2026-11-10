"use client";

import { useCallback, useEffect, useState } from "react";

import reviewService from "@/services/reviewService";

import { REVIEW_CONFIG, REVIEW_MESSAGES } from "@/constants/review.constants";

export default function useProductReviews(productId, filters = {}) {
  const sort = filters.sort || "newest";
  const rating = filters.rating || "all";

  const [reviews, setReviews] = useState([]);
  const [ratingInfo, setRatingInfo] = useState({});
  const [pagination, setPagination] = useState({});

  const [page, setPage] = useState(REVIEW_CONFIG.DEFAULT_PAGE);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchReviews = useCallback(
    async (pageNumber = REVIEW_CONFIG.DEFAULT_PAGE) => {
      if (!productId) {
        setReviews([]);
        setRatingInfo({});
        setPagination({});
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError("");

        const params = {
          page: pageNumber,
          limit: REVIEW_CONFIG.DEFAULT_LIMIT,
          sort,
        };

        if (rating !== "all") {
          params.rating = Number(rating);
        }

        const response = await reviewService.getProductReviews(
          productId,
          params,
        );

        const result = response?.data || {};

        setReviews(result.reviews || []);
        setRatingInfo(result.rating || {});
        setPagination(result.pagination || {});
      } catch (err) {
        console.error("Product Reviews API Error:", {
          message: err.message,
          status: err.response?.status,
          response: err.response?.data,
          url: err.config?.url,
        });

        setReviews([]);
        setRatingInfo({});
        setPagination({});

        setError(err.response?.data?.message || REVIEW_MESSAGES.LOAD_ERROR);
      } finally {
        setLoading(false);
      }
    },
    [productId, sort, rating],
  );

  useEffect(() => {
    fetchReviews(page);
  }, [fetchReviews, page]);

  const refreshReviews = useCallback(
    async (pageNumber = page) => {
      setPage(pageNumber);

      await fetchReviews(pageNumber);
    },
    [fetchReviews, page],
  );

  return {
    reviews,
    ratingInfo,
    pagination,
    page,
    setPage,
    loading,
    error,
    fetchReviews,
    refreshReviews,
  };
}
