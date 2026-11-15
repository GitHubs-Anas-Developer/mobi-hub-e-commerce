"use client";

import ProductCard from "./ProductCard";
import { Package } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";

// Wishlist Product ID Helper
const getWishlistProductId = (item) => {
  if (typeof item === "string") return item;

  if (!item || typeof item !== "object") return "";

  const productRef = item.product ?? item.productId;

  if (typeof productRef === "string") {
    return productRef;
  }

  if (productRef && typeof productRef === "object") {
    return productRef._id ?? productRef.id ?? "";
  }

  return item._id ?? item.id ?? "";
};

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

  const gridClassName = `grid gap-3 sm:gap-4 ${
    viewMode === "list"
      ? "grid-cols-1"
      : "grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
  }`;

  // Wishlist IDs
  const wishlistedIds = new Set(
    wishlistedProducts
      .map(getWishlistProductId)
      .filter(Boolean)
      .map(String)
  );

  // Animations
  const containerVariants = {
    hidden: {},

    visible: {
      transition: {
        staggerChildren: shouldReduceMotion ? 0 : 0.06,
      },
    },
  };

  const itemVariants = {
    hidden: {
      opacity: 0,
      y: shouldReduceMotion ? 0 : 18,
    },

    visible: {
      opacity: 1,
      y: 0,

      transition: {
        duration: shouldReduceMotion ? 0 : 0.35,
        ease: [0.22, 1, 0.36, 1],
      },
    },
  };

  // ========================================
  // LOADING
  // ========================================

  if (loading) {
    return (
      <div className={gridClassName}>
        {Array.from({ length: 8 }).map((_, index) => (
          <div
            key={index}
            className="overflow-hidden rounded-xl border border-slate-200 bg-white"
          >
            <div className="aspect-square animate-pulse bg-slate-100" />

            <div className="space-y-3 p-3">
              <div className="h-4 w-3/4 animate-pulse rounded bg-slate-100" />
              <div className="h-3 w-1/2 animate-pulse rounded bg-slate-100" />
              <div className="h-5 w-2/3 animate-pulse rounded bg-slate-100" />
              <div className="h-9 animate-pulse rounded-lg bg-slate-100" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  // ========================================
  // EMPTY STATE
  // ========================================

  if (!products.length) {
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
        transition={{ duration: 0.3 }}
        className="rounded-xl border border-slate-200 bg-white px-5 py-14 text-center"
      >
        <Package
          size={38}
          className="mx-auto text-slate-300"
        />

        <h3 className="mt-3 text-base font-bold text-slate-900">
          No products found
        </h3>

        <p className="mt-1 text-sm text-slate-500">
          Try changing your filters.
        </p>
      </motion.div>
    );
  }

  // ========================================
  // PRODUCT GRID
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
      {products.map((product) => {
        const isWishlisted = wishlistedIds.has(
          String(product._id)
        );

        return (
          <motion.div
            key={product._id}
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
              onAddToCart={onAddToCart}
              onWishlistToggle={onWishlistToggle}
              isWishlisted={isWishlisted}
              addingToCart={addingProductId === product._id}
              wishlistIsMutating={wishlistIsMutating}
            />
          </motion.div>
        );
      })}
    </motion.div>
  );
}