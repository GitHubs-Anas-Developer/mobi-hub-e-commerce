
"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "motion/react";

import {
  Heart,
  ShoppingCart,
  Package,
  Loader2,
  Star,
  ArrowUpRight,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";

// ========================================
// HELPERS
// ========================================

function formatPrice(price) {
  const value = Number(price);

  return `₹${(
    Number.isFinite(value) ? value : 0
  ).toLocaleString("en-IN")}`;
}

function getProductImage(product) {
  return (
    product?.thumbnail?.url ||
    product?.thumbnail?.secure_url ||
    product?.images?.[0]?.url ||
    product?.images?.[0]?.secure_url ||
    null
  );
}

// ========================================
// WISHLIST PRODUCT CARD
// ========================================

export default function WishlistProductCard({
  product,
  isMutating = false,
  isRemoving = false,
  isAdding = false,
  shouldReduceMotion = false,
  onRemove,
  onAddToCart,
}) {
  if (!product) return null;

  // ========================================
  // PRODUCT DETAILS
  // ========================================

  const productId = product._id || product.id;
  const productSlug = product.slug || productId;
  const productImage = getProductImage(product);

  // ========================================
  // ACTIVE VARIANTS
  // ========================================

  const activeVariants = Array.isArray(product.variants)
    ? product.variants.filter(
        (variant) => variant?.isActive !== false
      )
    : [];

  const selectedVariant =
    activeVariants.find(
      (variant) => variant?.isDefault === true
    ) || activeVariants[0];

  // ========================================
  // PRICE
  // ========================================

  const sellingPrice = Number(
    selectedVariant?.sellingPrice ??
      product.sellingPrice ??
      product.basePrice ??
      0
  );

  const mrp = Number(selectedVariant?.mrp ?? 0);

  // ========================================
  // DISCOUNT
  // ========================================

  const discount =
    Number.isFinite(mrp) &&
    Number.isFinite(sellingPrice) &&
    mrp > sellingPrice &&
    sellingPrice >= 0
      ? Math.round(((mrp - sellingPrice) / mrp) * 100)
      : 0;

  // ========================================
  // STOCK
  // ========================================

  const stock = Number(
    selectedVariant?.stock ?? product.stock ?? 0
  );

  const isOutOfStock =
    !selectedVariant ||
    !Number.isFinite(stock) ||
    stock < 1;

  const isLowStock =
    !isOutOfStock && stock <= 5;

  // ========================================
  // RATINGS
  // ========================================

  const rating = Number(product.ratings?.average ?? 0);
  const reviewCount = Number(product.ratings?.count ?? 0);

  const hasRating =
    Number.isFinite(rating) &&
    rating > 0 &&
    reviewCount > 0;

  // ========================================
  // BUTTON STATES
  // ========================================

  const isRemoveDisabled =
    isMutating || isRemoving || !productId;

  const isAddDisabled =
    isMutating ||
    isAdding ||
    isOutOfStock ||
    !productId;

  const motionEnabled = !shouldReduceMotion;

  // ========================================
  // RENDER
  // ========================================

  return (
    <motion.article
      layout={motionEnabled}
      initial={
        shouldReduceMotion
          ? false
          : { opacity: 0, y: 15 }
      }
      animate={{
        opacity: 1,
        y: 0,
      }}
      exit={
        shouldReduceMotion
          ? undefined
          : { opacity: 0, scale: 0.96 }
      }
      whileHover={
        motionEnabled
          ? { y: -4 }
          : undefined
      }
      transition={{
        duration: 0.25,
      }}
      className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-all duration-300 hover:border-blue-200 hover:shadow-xl hover:shadow-blue-900/5"
    >
      {/* ================================= */}
      {/* PRODUCT IMAGE */}
      {/* ================================= */}

      <div className="relative aspect-square overflow-hidden bg-[#f7f9fc]">
        <Link
          href={`/products/${encodeURIComponent(productSlug)}`}
          aria-label={`View ${product.name || "product"}`}
          className="absolute inset-0 flex items-center justify-center"
        >
          {productImage ? (
            <Image
              src={productImage}
              alt={product.name || "Product"}
              fill
              sizes="(max-width: 640px) 50vw, (max-width: 1280px) 33vw, 25vw"
              className="object-contain p-4 transition-transform duration-500 group-hover:scale-105 sm:p-6"
              unoptimized
            />
          ) : (
            <Package
              size={50}
              strokeWidth={1.3}
              className="text-slate-300"
              aria-hidden="true"
            />
          )}
        </Link>

        {/* DISCOUNT BADGE */}

        {discount > 0 && (
          <span className="absolute left-3 top-3 z-10 rounded-lg bg-red-500 px-2.5 py-1.5 text-[10px] font-bold text-white shadow-sm sm:text-xs">
            {discount}% OFF
          </span>
        )}

        {/* REMOVE WISHLIST BUTTON */}

        <button
          type="button"
          aria-label={`Remove ${product.name || "product"} from wishlist`}
          aria-busy={isRemoving}
          onClick={() => {
            if (!isRemoveDisabled) {
              onRemove?.(productId);
            }
          }}
          disabled={isRemoveDisabled}
          className="absolute right-3 top-3 z-10 flex h-9 w-9 items-center justify-center rounded-full border border-slate-100 bg-white text-red-500 shadow-md transition-all hover:scale-105 hover:bg-red-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 sm:h-10 sm:w-10"
        >
          {isRemoving ? (
            <Loader2
              size={17}
              className="animate-spin"
              aria-hidden="true"
            />
          ) : (
            <Heart
              size={18}
              fill="currentColor"
              aria-hidden="true"
            />
          )}
        </button>

        {/* STOCK STATUS */}

        <div className="absolute bottom-3 left-3 z-10">
          {isOutOfStock ? (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-red-100 bg-white px-2.5 py-1.5 text-[10px] font-bold text-red-600 shadow-sm sm:text-xs">
              <AlertCircle size={12} />
              Out of Stock
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-green-100 bg-white px-2.5 py-1.5 text-[10px] font-bold text-green-700 shadow-sm sm:text-xs">
              <CheckCircle2 size={12} />
              {isLowStock
                ? `Only ${stock} left`
                : "In Stock"}
            </span>
          )}
        </div>
      </div>

      {/* ================================= */}
      {/* PRODUCT INFORMATION */}
      {/* ================================= */}

      <div className="flex flex-1 flex-col p-3.5 sm:p-4">
        {/* BRAND */}

        <p className="mb-1.5 truncate text-[10px] font-bold uppercase tracking-[0.13em] text-[#0755e9] sm:text-xs">
          {product.brand || "ELEZIO"}
        </p>

        {/* PRODUCT NAME */}

        <Link
          href={`/products/${encodeURIComponent(productSlug)}`}
          className="block"
        >
          <h3 className="line-clamp-2 min-h-10 text-xs font-bold leading-5 text-[#101828] transition-colors hover:text-[#0755e9] sm:min-h-12 sm:text-sm sm:leading-6">
            {product.name || "Unnamed Product"}
          </h3>
        </Link>

        {/* RATING */}

        {hasRating && (
          <div className="mt-2 flex items-center gap-1.5">
            <Star
              size={14}
              fill="#f59e0b"
              className="text-amber-500"
              aria-hidden="true"
            />

            <span className="text-xs font-bold text-[#101828]">
              {rating.toFixed(1)}
            </span>

            <span className="text-[11px] text-slate-400">
              ({reviewCount}{" "}
              {reviewCount === 1 ? "review" : "reviews"})
            </span>
          </div>
        )}

        {/* PRICE SECTION */}

        <div className="mt-3 border-t border-slate-100 pt-3">
          <div className="flex flex-wrap items-center gap-2">
            {/* SELLING PRICE */}

            <span className="text-lg font-extrabold tracking-tight text-[#101828] sm:text-xl">
              {formatPrice(sellingPrice)}
            </span>

            {/* MRP */}

            {discount > 0 && (
              <span className="text-xs font-medium text-slate-400 line-through">
                {formatPrice(mrp)}
              </span>
            )}
          </div>

          {/* SAVINGS */}

          {discount > 0 && (
            <p className="mt-1 text-[11px] font-semibold text-green-600">
              You save {formatPrice(mrp - sellingPrice)}
            </p>
          )}
        </div>

        {/* ADD TO CART */}

        <button
          type="button"
          disabled={isAddDisabled}
          aria-busy={isAdding}
          onClick={() => {
            if (!isAddDisabled) {
              onAddToCart?.(product);
            }
          }}
          className="mt-auto flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-[#0755e9] px-3 py-3 text-xs font-bold text-white shadow-sm transition-all hover:bg-[#0645c4] hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0755e9] focus-visible:ring-offset-2 active:scale-[0.98] disabled:cursor-not-allowed disabled:bg-slate-300 disabled:shadow-none sm:mt-4 sm:text-sm"
        >
          {isAdding ? (
            <Loader2
              size={16}
              className="animate-spin"
              aria-hidden="true"
            />
          ) : (
            <ShoppingCart
              size={16}
              aria-hidden="true"
            />
          )}

          <span>
            {isOutOfStock
              ? "Unavailable"
              : isAdding
                ? "Adding..."
                : "Add to Cart"}
          </span>

          {!isOutOfStock && !isAdding && (
            <ArrowUpRight
              size={15}
              className="hidden sm:block"
              aria-hidden="true"
            />
          )}
        </button>
      </div>
    </motion.article>
  );
}
