
"use client";

import { useCallback, useEffect, useState } from "react";
import brandService from "@/services/brandService";

export default function useAdminBrands() {
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchBrands = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const response = await brandService.getBrands();

      setBrands(response.data || []);
    } catch (err) {
      setError(
        err.response?.data?.message || "Failed to fetch brands"
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBrands();
  }, [fetchBrands]);

  return {
    brands,
    loading,
    error,
    refreshBrands: fetchBrands,
  };
}
