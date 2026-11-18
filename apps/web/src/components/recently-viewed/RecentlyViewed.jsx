
"use client";

import { useEffect, useState } from "react";
import { useSelector } from "react-redux";

import recentlyViewedService from "@/services/recentlyViewed.service";
import ProductSection from "../home/ProductSection";

export default function RecentlyViewed({
  title = "Recently Viewed Products",
  subtitle = "Products you explored recently.",
  limit = 10,
  excludeProductId,
}) {
  const isAuthenticated = useSelector(
    (state) => state.auth?.isAuthenticated ?? false
  );

  const [mounted, setMounted] = useState(false);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Wait until client hydration completes
  useEffect(() => {
    setMounted(true);
  }, []);

  // Fetch recently viewed products
  useEffect(() => {
    if (!mounted || !isAuthenticated) {
      setProducts([]);
      setLoading(false);
      setError("");
      return;
    }

    let cancelled = false;

    const fetchRecentlyViewed = async () => {
      try {
        setLoading(true);
        setError("");

        const response =
          await recentlyViewedService.getRecentlyViewed();

        if (cancelled) return;

        const filteredProducts = (
          Array.isArray(response?.data)
            ? response.data
            : []
        )
          .filter(
            (product) =>
              String(product._id) !==
              String(excludeProductId)
          )
          .slice(0, limit);

        setProducts(filteredProducts);
      } catch (err) {
        if (!cancelled) {
          setError(
            err.response?.data?.message ||
              "Unable to load recently viewed products."
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    fetchRecentlyViewed();

    return () => {
      cancelled = true;
    };
  }, [
    mounted,
    isAuthenticated,
    limit,
    excludeProductId,
  ]);

  // Keep server and first client render identical
  if (!mounted || !isAuthenticated) {
    return null;
  }

  return (
    <ProductSection
      title={title}
      subtitle={subtitle}
      products={products}
      loading={loading}
      error={error}
      showViewAll={false}
      showNavigation={false}
    />
  );
}
