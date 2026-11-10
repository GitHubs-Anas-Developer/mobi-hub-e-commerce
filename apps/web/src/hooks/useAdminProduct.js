"use client";

import { useCallback, useEffect, useState } from "react";
import adminProductService from "@/services/adminProductService";

export default function useAdminProduct(productId) {
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchProduct = useCallback(async () => {
    if (!productId) {
      setError("Product ID is required");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError("");

      const response = await adminProductService.getProductById(productId);

      setProduct(response.data || null);
    } catch (err) {
      console.error("Admin Product Error:", err);

      setError(
        err.response?.data?.message ||
          "Unable to load product. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  }, [productId]);

  useEffect(() => {
    fetchProduct();
  }, [fetchProduct]);

  return {
    product,
    loading,
    error,
    refreshProduct: fetchProduct,
  };
}
