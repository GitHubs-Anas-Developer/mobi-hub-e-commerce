"use client";

import { useCallback, useEffect, useState } from "react";
import categoryService from "@/services/categoryService";

export default function useAdminCategories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchCategories = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const response = await categoryService.getAdminCategories();

      setCategories(response.data || []);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch categories");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  return {
    categories,
    loading,
    error,
    refreshCategories: fetchCategories,
  };
}
