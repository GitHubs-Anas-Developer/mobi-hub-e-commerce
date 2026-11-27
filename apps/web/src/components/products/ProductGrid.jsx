"use client";

import { useMemo } from "react";
import ProductCard from "./ProductCard";
import ProductSkeleton from "./ProductSkeleton";
import ProductEmptyState from "./ProductEmptyState";

const getWishlistProductId = (item) => {
  if (typeof item === "string") return item;
  if (!item || typeof item !== "object") return "";

  const productRef = item.product ?? item.productId;
  if (typeof productRef === "string") return productRef;
  if (productRef && typeof productRef === "object") {
    return productRef._id ?? productRef.id ?? "";
  }
  return item._id ?? item.id ?? "";
};

export default function ProductGrid({
  products = [],
  loading = false,
  viewMode = "grid",
  search = "",
  hasActiveFilters = false,
  onClearFilters,
  onAddToCart,
  onWishlistToggle,
  wishlistedProducts = [],
  addingProductId = null,
  wishlistIsMutating = false,
}) {
  const safeProducts = useMemo(
    () => (Array.isArray(products) ? products : []),
    [products]
  );

  const wishlistedIds = useMemo(() => {
    return new Set(
      (Array.isArray(wishlistedProducts) ? wishlistedProducts : [])
        .map(getWishlistProductId)
        .filter(Boolean)
        .map(String)
    );
  }, [wishlistedProducts]);

  const isListView = viewMode === "list";

  const gridClassName = isListView
    ? "grid grid-cols-1 gap-3 sm:gap-4"
    : "grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 xl:grid-cols-4";

  if (loading && safeProducts.length === 0) {
    return (
      <div
        className={gridClassName}
        aria-label="Loading products"
        aria-busy="true"
      >
        {Array.from({ length: 8 }).map((_, index) => (
          <ProductSkeleton
            key={`product-skeleton-${index}`}
            viewMode={viewMode}
          />
        ))}
      </div>
    );
  }

  if (!loading && safeProducts.length === 0) {
    return (
      <ProductEmptyState
        search={search}
        hasActiveFilters={hasActiveFilters}
        onClearFilters={onClearFilters}
      />
    );
  }

  return (
    <div
      className={`${gridClassName} transition-opacity duration-150 ${
        loading ? "opacity-65" : "opacity-100"
      }`}
      aria-busy={loading}
    >
      {safeProducts.map((product) => {
        const productId = product?._id ?? product?.id;
        if (!productId) return null;

        const normalizedId = String(productId);
        const isWishlisted = wishlistedIds.has(normalizedId);
        const isAddingToCart = String(addingProductId ?? "") === normalizedId;

        return (
          <div key={normalizedId} className="min-w-0">
            <ProductCard
              product={product}
              viewMode={viewMode}
              onAddToCart={onAddToCart}
              onWishlistToggle={onWishlistToggle}
              isWishlisted={isWishlisted}
              addingToCart={isAddingToCart}
              wishlistIsMutating={wishlistIsMutating}
            />
          </div>
        );
      })}
    </div>
  );
}
