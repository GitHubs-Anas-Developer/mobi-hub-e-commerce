"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "motion/react";

import {
  Heart,
  ShoppingCart,
  Package,
  Loader2,
  ArrowUpRight,
} from "lucide-react";

function formatPrice(price) {
  return `₹${Number(price || 0).toLocaleString("en-IN")}`;
}

const cardVariants = {
  hidden: {
    opacity: 0,
    y: 22,
    scale: 0.98,
  },

  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.35,
      ease: [0.22, 1, 0.36, 1],
    },
  },

  exit: {
    opacity: 0,
    scale: 0.95,
    y: 12,
    transition: {
      duration: 0.2,
    },
  },
};

export default function WishlistProductCard({
  product,
  isMutating,
  isRemoving,
  isAdding,
  shouldReduceMotion,
  onRemove,
  onAddToCart,
}) {
  const activeVariants = (product.variants || []).filter(
    (variant) => variant.isActive !== false
  );

  const defaultVariant =
    activeVariants.find((variant) => variant.isDefault) ||
    activeVariants[0];

  const price = Number(
    defaultVariant?.sellingPrice ??
    product.basePrice ??
    0
  );

  const isOutOfStock =
    !defaultVariant ||
    Number(defaultVariant.stock || 0) < 1;

  return (
    <motion.article
      key={product._id}
      layout={!shouldReduceMotion}
      variants={cardVariants}
      initial={shouldReduceMotion ? false : "hidden"}
      animate="visible"
      exit={shouldReduceMotion ? undefined : "exit"}
      whileHover={shouldReduceMotion ? {} : { y: -5 }}
      transition={{
        layout: { duration: 0.25 },
      }}
      className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white transition-shadow duration-300 hover:shadow-xl hover:shadow-slate-200/60"
    >
      {/* Product Image */}
      <div className="relative aspect-square overflow-hidden bg-[#F8FAFC] p-4 sm:p-6">
        <Link
          href={`/products/${product.slug}`}
          className="flex h-full w-full items-center justify-center"
        >
          {product.thumbnail?.url ? (
            <Image
              src={product.thumbnail.url}
              alt={product.name || "Product"}
              fill
              sizes="(max-width: 640px) 50vw, (max-width: 1280px) 33vw, 25vw"
              className="object-contain p-4 transition-transform duration-500 group-hover:scale-105 sm:p-6"
              unoptimized
            />
          ) : (
            <Package
              size={48}
              strokeWidth={1.4}
              className="text-slate-300"
            />
          )}
        </Link>

        {/* Remove Wishlist */}
        <motion.button
          type="button"
          aria-label="Remove from wishlist"
          onClick={() => onRemove(product._id)}
          disabled={isMutating || Boolean(isRemoving)}
          whileHover={shouldReduceMotion ? {} : { scale: 1.08 }}
          whileTap={shouldReduceMotion ? {} : { scale: 0.92 }}
          className="absolute right-2.5 top-2.5 z-10 flex h-9 w-9 items-center justify-center rounded-full border border-slate-100 bg-white text-red-500 shadow-sm transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50 sm:right-3 sm:top-3"
        >
          {isRemoving ? (
            <Loader2 size={16} className="animate-spin" />
          ) : (
            <Heart size={17} fill="currentColor" />
          )}
        </motion.button>

        {/* Stock Status */}
        {isOutOfStock && (
          <span className="absolute bottom-3 left-3 rounded-lg bg-red-50 px-2.5 py-1.5 text-[10px] font-bold text-red-600 sm:text-xs">
            Out of Stock
          </span>
        )}
      </div>

      {/* Product Details */}
      <div className="p-3 sm:p-4">
        <p className="mb-1.5 text-[10px] font-bold uppercase tracking-wider text-[#0755e9] sm:text-xs">
          {product.brand || "MOBI HUB"}
        </p>

        <Link
          href={`/products/${product.slug}`}
          className="block"
        >
          <h3 className="line-clamp-2 min-h-10 text-xs font-bold leading-5 text-[#101828] transition-colors hover:text-[#0755e9] sm:min-h-12 sm:text-sm sm:leading-6">
            {product.name}
          </h3>
        </Link>

        {/* Price */}
        <div className="mt-3 flex items-center justify-between gap-2">
          <span className="text-base font-extrabold text-[#101828] sm:text-lg">
            {formatPrice(price)}
          </span>

          <span
            className={`hidden items-center gap-1 text-[10px] font-semibold sm:inline-flex ${
              isOutOfStock ? "text-red-500" : "text-green-600"
            }`}
          >
            <span
              className={`h-1.5 w-1.5 rounded-full ${
                isOutOfStock ? "bg-red-500" : "bg-green-500"
              }`}
            />

            {isOutOfStock ? "Unavailable" : "In Stock"}
          </span>
        </div>

        {/* Add To Cart */}
        <motion.button
          type="button"
          disabled={isOutOfStock || isAdding}
          onClick={() => onAddToCart(product)}
          whileHover={
            shouldReduceMotion || isOutOfStock
              ? {}
              : { scale: 1.02 }
          }
          whileTap={
            shouldReduceMotion || isOutOfStock
              ? {}
              : { scale: 0.97 }
          }
          className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-[#0755e9] px-2 py-3 text-xs font-bold text-white transition-colors hover:bg-[#0645c4] disabled:cursor-not-allowed disabled:bg-slate-300 sm:px-4 sm:text-sm"
        >
          {isAdding ? (
            <Loader2 size={16} className="animate-spin" />
          ) : (
            <ShoppingCart size={16} />
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
            />
          )}
        </motion.button>
      </div>
    </motion.article>
  );
}