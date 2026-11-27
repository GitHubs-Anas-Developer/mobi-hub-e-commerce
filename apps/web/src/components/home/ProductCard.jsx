"use client";

import Link from "next/link";
import {
  Heart,
  Loader2,
  Package,
  ShoppingBag,
  Star,
} from "lucide-react";

import formatPrice from "@/utils/formatPrice";
import { BRAND_NAME } from "@/config/brand";

export default function ProductCard({
  product,
  onAddToCart,
  onWishlistToggle,
  isWishlisted = false,
  addingToCart = false,
  wishlistIsMutating = false,
}) {
  if (!product) return null;

  const imageUrl =
    product.thumbnail?.url || product.images?.[0]?.url || "";

  const activeVariants = Array.isArray(product.variants)
    ? product.variants.filter((v) => v?.isActive !== false)
    : [];

  const defaultVariant =
    activeVariants.find((v) => v.isDefault) || activeVariants[0] || null;

  const price =
    defaultVariant?.sellingPrice ?? product.basePrice ?? 0;

  const mrp = defaultVariant?.mrp ?? 0;

  const discount =
    mrp > price && mrp > 0
      ? Math.round(((mrp - price) / mrp) * 100)
      : 0;

  const stock = Number(
    defaultVariant?.stock ??
    product.totalStock ??
    product.stock ??
    0
  );
  const inStock = stock > 0;

  const reviewCount = Number(
    product.ratings?.count ?? product.rating?.count ?? 0
  );
  const ratingValue = Number(
    product.ratings?.average ?? product.rating?.average ?? 0
  );
  const hasRealRating = reviewCount > 0 && ratingValue > 0;

  const productHref = `/products/${product.slug}`;

  return (
    <article className="group flex h-full min-w-0 flex-col overflow-hidden rounded-2xl border border-[#E2E8F0] bg-white transition-all duration-200 hover:-translate-y-0.5 hover:border-[#0755E9]/35 hover:shadow-md">
      {/* Studio Image Panel */}
      <div className="relative w-full overflow-hidden border-b border-[#E2E8F0]/70 bg-[#F8FAFC]">
        <Link
          href={productHref}
          aria-label={`View ${product.name}`}
          className="flex aspect-square items-center justify-center p-4 sm:p-5 lg:p-6"
        >
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={product.name}
              loading="lazy"
              decoding="async"
              className="h-full w-full object-contain transition-transform duration-300 ease-out group-hover:scale-105"
            />
          ) : (
            <Package
              size={44}
              strokeWidth={1.2}
              className="text-slate-300"
            />
          )}
        </Link>

        {/* Top-left Discount Badge */}
        {discount > 0 && (
          <span className="absolute left-2.5 top-2.5 z-10 rounded-full border border-[#0755E9]/15 bg-white px-2.5 py-1 text-[10px] font-bold text-[#0755E9] shadow-xs tabular-nums sm:left-3 sm:top-3">
            {discount}% OFF
          </span>
        )}

        {/* Top-right Wishlist Button */}
        <button
          type="button"
          onClick={() => onWishlistToggle?.(product)}
          disabled={wishlistIsMutating}
          aria-label={
            isWishlisted ? "Remove from wishlist" : "Add to wishlist"
          }
          aria-pressed={isWishlisted}
          className={`absolute right-2.5 top-2.5 z-10 flex h-8 w-8 items-center justify-center rounded-full border shadow-xs transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-60 sm:right-3 sm:top-3 sm:h-9 sm:w-9 ${isWishlisted
              ? "border-red-100 bg-red-50 text-red-500"
              : "border-[#E2E8F0] bg-white text-[#64748B] hover:border-red-200 hover:bg-red-50 hover:text-red-500"
            }`}
        >
          {wishlistIsMutating ? (
            <Loader2 size={15} className="animate-spin" />
          ) : (
            <Heart
              size={16}
              strokeWidth={1.9}
              fill={isWishlisted ? "currentColor" : "none"}
            />
          )}
        </button>

        {/* Out of Stock Badge Overlay */}
        {!inStock && (
          <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center bg-white/75 backdrop-blur-[1px]">
            <span className="rounded-lg bg-[#101828] px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-white">
              Out of Stock
            </span>
          </div>
        )}
      </div>

      {/* Product Info */}
      <div className="flex min-w-0 flex-1 flex-col p-3 sm:p-4">
        <div className="mb-1.5 flex items-center justify-between gap-2">
          <span className="truncate text-[10px] font-bold uppercase tracking-[0.12em] text-[#0755E9]">
            {product.brand || BRAND_NAME}
          </span>

          {hasRealRating && (
            <span className="inline-flex shrink-0 items-center gap-1 rounded-md bg-amber-50 px-1.5 py-0.5 text-[10px] font-bold text-[#101828] tabular-nums">
              <Star size={11} fill="#FBBF24" stroke="#FBBF24" />
              {ratingValue.toFixed(1)}
              <span className="font-medium text-[#64748B]">
                ({reviewCount})
              </span>
            </span>
          )}
        </div>

        <Link href={productHref}>
          <h3 className="line-clamp-2 min-h-[36px] text-xs font-bold leading-[1.45] text-[#101828] transition-colors group-hover:text-[#0755E9] sm:min-h-[42px] sm:text-sm">
            {product.name}
          </h3>
        </Link>

        {/* Price + Stock */}
        <div className="mt-auto pt-3">
          <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
            <span className="text-base font-extrabold tracking-tight text-[#101828] tabular-nums sm:text-lg">
              {formatPrice(price)}
            </span>

            {mrp > price && (
              <span className="text-[11px] font-medium text-[#64748B] line-through tabular-nums sm:text-xs">
                {formatPrice(mrp)}
              </span>
            )}
          </div>

          <div className="mt-1.5 flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5">
              <span
                className={`h-1.5 w-1.5 shrink-0 rounded-full ${inStock ? "bg-[#16A34A]" : "bg-[#DC2626]"
                  }`}
              />
              <span
                className={`text-[10px] font-semibold sm:text-[11px] ${inStock ? "text-[#16A34A]" : "text-[#DC2626]"
                  }`}
              >
                {inStock ? "In Stock" : "Out of Stock"}
              </span>
            </div>

            {discount > 0 && (
              <span className="text-[10px] font-semibold text-emerald-600 tabular-nums sm:text-[11px]">
                Save {formatPrice(mrp - price)}
              </span>
            )}
          </div>
        </div>

        {/* Add to Cart Button */}
        <button
          type="button"
          onClick={() => onAddToCart?.(product, defaultVariant)}
          disabled={!inStock || addingToCart}
          aria-label={
            addingToCart
              ? "Adding to cart"
              : `Add ${product.name} to cart`
          }
          className="mt-3 inline-flex h-10 w-full items-center justify-center gap-1.5 rounded-xl bg-[#0755E9] px-3 text-xs font-bold text-white shadow-xs transition-all duration-200 hover:bg-[#0645C4] active:scale-[0.98] disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400 disabled:shadow-none"
        >
          {addingToCart ? (
            <>
              <Loader2 size={14} className="animate-spin" />
              Adding...
            </>
          ) : (
            <>
              <ShoppingBag size={14} strokeWidth={2} />
              {inStock ? "Add to Cart" : "Out of Stock"}
            </>
          )}
        </button>
      </div>
    </article>
  );
}
