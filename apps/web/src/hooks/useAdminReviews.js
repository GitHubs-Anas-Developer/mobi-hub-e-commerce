"use client";

import { useCallback, useEffect, useState } from "react";
import adminReviewService from "@/services/adminReviewService";

export default function useAdminReviews() {
  const [reviews, setReviews] = useState([]);
  const [pagination, setPagination] = useState(null);

  const [filters, setFilters] = useState({
    search: "",
    visibility: "all",
    rating: "all",
    sort: "newest",
    page: 1,
    limit: 10,
  });

  const [debouncedSearch, setDebouncedSearch] = useState("");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updatingReviewId, setUpdatingReviewId] = useState(null);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(filters.search.trim());
    }, 400);

    return () => clearTimeout(timer);
  }, [filters.search]);

  // Fetch reviews
  const fetchReviews = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const params = {
        page: filters.page,
        limit: filters.limit,
        sort: filters.sort,
      };

      if (filters.visibility !== "all") {
        params.isVisible = filters.visibility === "visible";
      }

      if (filters.rating !== "all") {
        params.rating = Number(filters.rating);
      }

      if (debouncedSearch) {
        params.search = debouncedSearch;
      }

      const response = await adminReviewService.getReviews(params);

      setReviews(response.data?.reviews || []);
      setPagination(response.data?.pagination || null);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch reviews");
    } finally {
      setLoading(false);
    }
  }, [
    filters.page,
    filters.limit,
    filters.visibility,
    filters.rating,
    filters.sort,
    debouncedSearch,
  ]);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  // Update filters
  const updateFilters = useCallback((updates) => {
    setFilters((previous) => ({
      ...previous,
      ...updates,
      page: updates.page ?? 1,
    }));
  }, []);

  // Show / Hide review
  const updateReviewVisibility = async (reviewId, isVisible) => {
    try {
      setUpdatingReviewId(reviewId);
      setError("");

      await adminReviewService.updateReviewVisibility(reviewId, isVisible);

      await fetchReviews();
    } catch (err) {
      setError(
        err.response?.data?.message || "Failed to update review visibility",
      );

      throw err;
    } finally {
      setUpdatingReviewId(null);
    }
  };

  return {
    reviews,
    pagination,
    filters,
    setFilters,
    updateFilters,
    loading,
    error,
    updatingReviewId,
    refreshReviews: fetchReviews,
    updateReviewVisibility,
  };
}
