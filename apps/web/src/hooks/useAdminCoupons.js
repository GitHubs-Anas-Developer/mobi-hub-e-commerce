"use client";

import { useCallback, useEffect, useState } from "react";
import adminCouponService from "@/services/adminCouponService";

export default function useAdminCoupons() {
  const [coupons, setCoupons] = useState([]);
  const [pagination, setPagination] = useState(null);

  const [filters, setFilters] = useState({
    status: "all",
    search: "",
    expiryStatus: "all",
    sortBy: "createdAt",
    sortOrder: "desc",
    page: 1,
    limit: 10,
  });

  const [debouncedSearch, setDebouncedSearch] = useState("");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updatingCouponId, setUpdatingCouponId] = useState(null);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(filters.search.trim());
    }, 400);

    return () => clearTimeout(timer);
  }, [filters.search]);

  // Fetch coupons
  const fetchCoupons = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const params = {
        page: filters.page,
        limit: filters.limit,
        sortBy: filters.sortBy,
        sortOrder: filters.sortOrder,
        expiryStatus: filters.expiryStatus,
      };

      if (filters.status !== "all") {
        params.isActive = filters.status === "active";
      }

      if (debouncedSearch) {
        params.search = debouncedSearch;
      }

      const response = await adminCouponService.getCoupons(params);

      setCoupons(response.data?.coupons || []);
      setPagination(response.data?.pagination || null);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch coupons");
    } finally {
      setLoading(false);
    }
  }, [
    filters.page,
    filters.limit,
    filters.status,
    filters.expiryStatus,
    filters.sortBy,
    filters.sortOrder,
    debouncedSearch,
  ]);

  useEffect(() => {
    fetchCoupons();
  }, [fetchCoupons]);

  // Update filters and reset pagination
  const updateFilters = useCallback((updates) => {
    setFilters((previous) => ({
      ...previous,
      ...updates,
      page: 1,
    }));
  }, []);

  // Update coupon status
  const updateCouponStatus = async (couponId, isActive) => {
    try {
      setUpdatingCouponId(couponId);
      setError("");

      await adminCouponService.toggleCouponStatus(couponId, isActive);

      await fetchCoupons();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update coupon status");
      throw err;
    } finally {
      setUpdatingCouponId(null);
    }
  };

  return {
    coupons,
    pagination,
    filters,
    setFilters,
    updateFilters,
    loading,
    error,
    updatingCouponId,
    refreshCoupons: fetchCoupons,
    updateCouponStatus,
  };
}
