"use client";

import { useCallback, useEffect, useState } from "react";
import adminProductService from "@/services/adminProductService";

export default function useAdminProducts(initialFilters = {}) {
  const [products, setProducts] = useState([]);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 0,
    hasNextPage: false,
    hasPrevPage: false,
  });

  const [filters, setFilters] = useState({
    page: 1,
    limit: 10,
    search: "",
    isActive: "",
    category: "",
    brand: "",
    sort: "newest",
    ...initialFilters,
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const params = Object.fromEntries(
        Object.entries(filters).filter(
          ([, value]) => value !== "" && value !== null && value !== undefined,
        ),
      );

      const response = await adminProductService.getProducts(params);

      setProducts(response.data || []);
      setPagination(response.pagination || {});
    } catch (err) {
      console.error("Admin Products API Error:", err);

      setError(
        err.response?.data?.message ||
          "Unable to load products. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const updateFilters = (newFilters) => {
    setFilters((prev) => ({
      ...prev,
      ...newFilters,
      page: 1,
    }));
  };

  const changePage = (page) => {
    setFilters((prev) => ({
      ...prev,
      page,
    }));
  };

  return {
    products,
    pagination,
    filters,
    loading,
    error,
    updateFilters,
    changePage,
    refreshProducts: fetchProducts,
  };
}
