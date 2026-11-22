
"use client";

import { useMemo } from "react";

import ProductCard from "./ProductCard";

import { Package, SearchX } from "lucide-react";

import {
  motion,
  useReducedMotion,
} from "motion/react";

// ========================================
// WISHLIST PRODUCT ID HELPER
// ========================================

const getWishlistProductId = (item) => {
  if (typeof item === "string") {
    return item;
  }

  if (!item || typeof item !== "object") {
    return "";
  }

  const productRef = item.product ?? item.productId;

  if (typeof productRef === "string") {
    return productRef;
  }

  if (productRef && typeof productRef === "object") {
    return (
      productRef._id ??
      productRef.id ??
      ""
    );
  }

  return item._id ?? item.id ?? "";
};

// ========================================
// LOADING SKELETON
// ========================================

function ProductSkeleton({ viewMode = "grid" }) {
  if (viewMode === "list") {
    return (
      <div className="flex gap-4 overflow-hidden rounded-2xl border border-slate-200 bg-white p-3 sm:p-4">
        <div className="h-28 w-28 shrink-0 animate-pulse rounded-xl bg-slate-100 sm:h-36 sm:w-36" />

        <div className="flex min-w-0 flex-1 flex-col justify-center gap-3">
          <div className="h-3 w-20 animate-pulse rounded bg-slate-100" />
          <div className="h-4 w-3/4 animate-pulse rounded bg-slate-100" />
          <div className="h-3 w-1/2 animate-pulse rounded bg-slate-100" />
          <div className="h-5 w-24 animate-pulse rounded bg-slate-100" />
          <div className="h-8 w-full max-w-40 animate-pulse rounded-lg bg-slate-100" />
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
      <div className="aspect-square animate-pulse bg-slate-100" />

      <div className="space-y-3 p-3 sm:p-4">
        <div className="h-3 w-1/3 animate-pulse rounded bg-slate-100" />
        <div className="h-4 w-3/4 animate-pulse rounded bg-slate-100" />
        <div className="h-3 w-1/2 animate-pulse rounded bg-slate-100" />
        <div className="h-5 w-2/3 animate-pulse rounded bg-slate-100" />
        <div className="h-9 animate-pulse rounded-lg bg-slate-100" />
      </div>
    </div>
  );
}

// ========================================
// EMPTY STATE
// ========================================

function EmptyProducts() {
  const shouldReduceMotion = useReducedMotion();

  return (
    <motion.div
      initial={{
        opacity: 0,
        y: shouldReduceMotion ? 0 : 15,
      }}
      animate={{
        opacity: 1,
        y: 0,
      }}
      transition={{
        duration: shouldReduceMotion ? 0 : 0.3,
      }}
      className="
        flex min-h-[300px] flex-col
        items-center justify-center
        rounded-2xl border border-slate-200
        bg-white px-5 py-14 text-center
      "
    >
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-50">
        <SearchX
          size={32}
          strokeWidth={1.6}
          className="text-slate-300"
        />
      </div>

      <h3 className="mt-4 text-base font-extrabold text-slate-900">
        No products found
      </h3>

      <p className="mt-1 max-w-xs text-xs leading-5 text-slate-500 sm:text-sm">
        We couldn't find products matching your selection.
        Try changing your filters or search keywords.
      </p>
    </motion.div>
  );
}

// ========================================
// MAIN PRODUCT GRID
// ========================================

export default function ProductGrid({
  products = [],
  loading = false,
  viewMode = "grid",

  onAddToCart,
  onWishlistToggle,

  wishlistedProducts = [],

  addingProductId = null,
  wishlistIsMutating = false,
}) {
  const shouldReduceMotion = useReducedMotion();

  // ========================================
  // SAFE PRODUCT DATA
  // ========================================

  const safeProducts = useMemo(
    () => (Array.isArray(products) ? products : []),
    [products]
  );

  // ========================================
  // WISHLIST IDS
  // ========================================

  const wishlistedIds = useMemo(() => {
    return new Set(
      (Array.isArray(wishlistedProducts)
        ? wishlistedProducts
        : []
      )
        .map(getWishlistProductId)
        .filter(Boolean)
        .map(String)
    );
  }, [wishlistedProducts]);

  // ========================================
  // GRID LAYOUT
  // ========================================

  const isListView = viewMode === "list";

  const gridClassName = isListView
    ? "grid grid-cols-1 gap-3 sm:gap-4"
    : "grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3 xl:grid-cols-4";

  // ========================================
  // ANIMATION VARIANTS
  // ========================================

  const containerVariants = {
    hidden: {},

    visible: {
      transition: {
        staggerChildren: shouldReduceMotion ? 0 : 0.05,
      },
    },
  };

  const itemVariants = {
    hidden: {
      opacity: 0,
      y: shouldReduceMotion ? 0 : 16,
    },

    visible: {
      opacity: 1,
      y: 0,

      transition: {
        duration: shouldReduceMotion ? 0 : 0.3,
        ease: [0.22, 1, 0.36, 1],
      },
    },
  };

  // ========================================
  // LOADING STATE
  // ========================================

  if (loading) {
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

  // ========================================
  // EMPTY STATE
  // ========================================

  if (safeProducts.length === 0) {
    return <EmptyProducts />;
  }

  // ========================================
  // PRODUCT LIST
  // ========================================

  return (
    <motion.div
      key={viewMode}
      className={gridClassName}
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      layout
    >
      {safeProducts.map((product, index) => {
        const productId = product?._id ?? product?.id;

        if (!productId) {
          return null;
        }

        const normalizedId = String(productId);

        const isWishlisted = wishlistedIds.has(normalizedId);

        const isAddingToCart =
          String(addingProductId ?? "") === normalizedId;

        return (
          <motion.div
            key={normalizedId}
            variants={itemVariants}
            layout
            className="min-w-0"
            transition={{
              layout: {
                duration: shouldReduceMotion ? 0 : 0.3,
                ease: "easeInOut",
              },
            }}
          >
            <ProductCard
              product={product}
              viewMode={viewMode}
              onAddToCart={onAddToCart}
              onWishlistToggle={onWishlistToggle}
              isWishlisted={isWishlisted}
              addingToCart={isAddingToCart}
              wishlistIsMutating={wishlistIsMutating}
            />
          </motion.div>
        );
      })}
    </motion.div>
  );
}
