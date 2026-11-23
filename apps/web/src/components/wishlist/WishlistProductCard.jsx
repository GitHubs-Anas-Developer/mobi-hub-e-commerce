
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
  const safePrice = Number(price);

  return `₹${(Number.isFinite(safePrice) ? safePrice : 0).toLocaleString(
    "en-IN"
  )}`;
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
  isMutating = false,
  isRemoving = false,
  isAdding = false,
  shouldReduceMotion = false,
  onRemove,
  onAddToCart,
}) {
  if (!product) return null;

  const productId = product._id || product.id;
  const productSlug = product.slug || productId;
  const productImage = getProductImage(product);

  const activeVariants = Array.isArray(product.variants)
    ? product.variants.filter(
        (variant) => variant?.isActive !== false
      )
    : [];

  const defaultVariant =
    activeVariants.find((variant) => variant.isDefault) ||
    activeVariants[0];

  const price = Number(
    defaultVariant?.sellingPrice ??
    product.sellingPrice ??
    product.basePrice ??
    0
  );

  const stock = Number(defaultVariant?.stock ?? product.stock ?? 0);

  const isOutOfStock = !defaultVariant || !Number.isFinite(stock) || stock < 1;

  const isRemoveDisabled =
    isMutating || isRemoving || !productId;

  const isAddDisabled =
    isMutating || isAdding || isOutOfStock || !productId;

  const motionEnabled = !shouldReduceMotion;

  return (
    <motion.article
      layout={motionEnabled}
      variants={cardVariants}
      initial={shouldReduceMotion ? false : "hidden"}
      animate="visible"
      exit={shouldReduceMotion ? undefined : "exit"}
      whileHover={motionEnabled ? { y: -5 } : undefined}
      transition={{
        layout: { duration: 0.25 },
      }}
      className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white transition-shadow duration-300 hover:shadow-xl hover:shadow-slate-200/60"
    >
      {/* Product Image */}
      <div className="relative aspect-square overflow-hidden bg-[#F8FAFC] p-4 sm:p-6">
        <Link
          href={`/products/${encodeURIComponent(productSlug)}`}
          aria-label={`View ${product.name || "product"}`}
          className="flex h-full w-full items-center justify-center"
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
              size={48}
              strokeWidth={1.4}
              className="text-slate-300"
              aria-hidden="true"
            />
          )}
        </Link>

        {/* Remove Wishlist */}
        <motion.button
          type="button"
          aria-label={`Remove ${product.name || "product"} from wishlist`}
          onClick={() => onRemove?.(productId)}
          disabled={isRemoveDisabled}
          whileHover={motionEnabled ? { scale: 1.08 } : undefined}
          whileTap={motionEnabled ? { scale: 0.92 } : undefined}
          className="absolute right-2.5 top-2.5 z-10 flex h-9 w-9 items-center justify-center rounded-full border border-slate-100 bg-white text-red-500 shadow-sm transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50 sm:right-3 sm:top-3"
        >
          {isRemoving ? (
            <Loader2
              size={16}
              className="animate-spin"
              aria-hidden="true"
            />
          ) : (
            <Heart
              size={17}
              fill="currentColor"
              aria-hidden="true"
            />
          )}
        </motion.button>

        {/* Stock Status */}
        <span
          className={`absolute bottom-3 left-3 rounded-lg px-2.5 py-1.5 text-[10px] font-bold sm:text-xs ${
            isOutOfStock
              ? "bg-red-50 text-red-600"
              : "bg-green-50 text-green-700"
          }`}
        >
          {isOutOfStock ? "Out of Stock" : "In Stock"}
        </span>
      </div>

      {/* Product Details */}
      <div className="p-3 sm:p-4">
        <p className="mb-1.5 text-[10px] font-bold uppercase tracking-wider text-[#0755e9] sm:text-xs">
          {product.brand || "MOBI HUB"}
        </p>

        <Link
          href={`/products/${encodeURIComponent(productSlug)}`}
          className="block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0755e9]"
        >
          <h3 className="line-clamp-2 min-h-10 text-xs font-bold leading-5 text-[#101828] transition-colors hover:text-[#0755e9] sm:min-h-12 sm:text-sm sm:leading-6">
            {product.name || "Unnamed Product"}
          </h3>
        </Link>

        {/* Price */}
        <div className="mt-3 flex items-center justify-between gap-2">
          <span className="text-base font-extrabold text-[#101828] sm:text-lg">
            {formatPrice(price)}
          </span>
        </div>

        {/* Add To Cart */}
        <motion.button
          type="button"
          disabled={isAddDisabled}
          onClick={() => onAddToCart?.(product)}
          whileHover={
            motionEnabled && !isAddDisabled
              ? { scale: 1.02 }
              : undefined
          }
          whileTap={
            motionEnabled && !isAddDisabled
              ? { scale: 0.97 }
              : undefined
          }
          className="mt-4 flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-[#0755e9] px-2 py-3 text-xs font-bold text-white transition-colors hover:bg-[#0645c4] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0755e9] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:bg-slate-300 sm:px-4 sm:text-sm"
        >
          {isAdding ? (
            <Loader2
              size={16}
              className="animate-spin"
              aria-hidden="true"
            />
          ) : (
            <ShoppingCart size={16} aria-hidden="true" />
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
        </motion.button>
      </div>
    </motion.article>
  );
}
