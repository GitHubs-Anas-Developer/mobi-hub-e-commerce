"use client";

import Link from "next/link";
import Image from "next/image";
import {
  Heart,
  ShoppingBag,
  Package,
  LoaderCircle,
  Star,
  ArrowUpRight,
} from "lucide-react";

import { BRAND_NAME } from "@/config/brand";

function formatPrice(price) {
  const value = Number(price);
  return `₹${(Number.isFinite(value) ? value : 0).toLocaleString("en-IN")}`;
}

function getProductImage(product) {
  return (
    product?.thumbnail?.url ||
    product?.thumbnail?.secure_url ||
    (typeof product?.thumbnail === "string" ? product.thumbnail : "") ||
    product?.images?.[0]?.url ||
    product?.images?.[0]?.secure_url ||
    null
  );
}

export default function WishlistProductCard({
  product,
  isMutating = false,
  isRemoving = false,
  isAdding = false,
  onRemove,
  onAddToCart,
}) {
  if (!product) return null;

  const productId = product._id || product.id;
  const productSlug = product.slug || productId;
  const productLink = productSlug
    ? `/products/${encodeURIComponent(productSlug)}`
    : "/products";
  const productImage = getProductImage(product);

  const activeVariants = Array.isArray(product.variants)
    ? product.variants.filter((variant) => variant?.isActive !== false)
    : [];

  const selectedVariant =
    activeVariants.find((variant) => variant?.isDefault === true) ||
    activeVariants[0];

  const sellingPrice = Math.max(
    0,
    Number(
      selectedVariant?.sellingPrice ??
        product.sellingPrice ??
        product.basePrice ??
        product.price ??
        0
    ) || 0
  );

  const mrp = Math.max(
    sellingPrice,
    Number(selectedVariant?.mrp ?? product.mrp ?? sellingPrice) || sellingPrice
  );

  const discount =
    mrp > sellingPrice && mrp > 0
      ? Math.round(((mrp - sellingPrice) / mrp) * 100)
      : 0;

  const stock = Number(
    selectedVariant?.stock ?? product.totalStock ?? product.stock ?? 0
  );

  const isOutOfStock =
    product.isActive === false ||
    !selectedVariant ||
    !Number.isFinite(stock) ||
    stock < 1;

  const isLowStock = !isOutOfStock && stock <= 5;

  const rating = Number(
    product.rating?.average ??
      product.ratings?.average ??
      product.averageRating ??
      0
  );
  const reviewCount = Number(
    product.rating?.count ??
      product.ratings?.count ??
      product.reviewCount ??
      0
  );
  const hasRating =
    Number.isFinite(rating) && rating > 0 && reviewCount > 0;

  const isRemoveDisabled = isMutating || isRemoving || !productId;
  const isAddDisabled =
    isMutating || isAdding || isOutOfStock || !productId;

  const brandLabel = product.brand || BRAND_NAME;

  return (
    <article
      className={`group relative flex h-full w-full min-w-0 flex-col overflow-hidden rounded-2xl border border-[#E2E8F0] bg-white transition-all duration-200 hover:-translate-y-0.5 hover:border-[#0755E9]/35 hover:shadow-md ${
        isRemoving ? "opacity-60" : "opacity-100"
      }`}
    >
      {/* Product Image */}
      <div className="relative w-full overflow-hidden border-b border-[#F1F5F9] bg-[#F8FAFC]">
        <Link
          href={productLink}
          aria-label={`View ${product.name || "product"}`}
          className="relative flex aspect-square w-full items-center justify-center overflow-hidden p-3 sm:p-4 lg:p-5"
        >
          {productImage ? (
            <Image
              src={productImage}
              alt={product.name || "Product"}
              fill
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              className="object-contain p-2.5 transition-transform duration-500 ease-out group-hover:scale-105"
              unoptimized
            />
          ) : (
            <Package
              size={44}
              strokeWidth={1.2}
              className="text-slate-300"
              aria-hidden="true"
            />
          )}
        </Link>

        {discount > 0 && (
          <span className="absolute left-2.5 top-2.5 z-10 inline-flex items-center rounded-lg border border-red-100 bg-red-50 px-2 py-0.5 text-[10px] font-bold text-red-600 sm:left-3 sm:top-3 sm:px-2.5 sm:py-1 sm:text-xs">
            {discount}% OFF
          </span>
        )}

        {/* Remove from Wishlist Button */}
        <button
          type="button"
          aria-label={`Remove ${product.name || "product"} from wishlist`}
          title="Remove from wishlist"
          aria-busy={isRemoving}
          disabled={isRemoveDisabled}
          onClick={() => {
            if (!isRemoveDisabled) {
              onRemove?.(productId);
            }
          }}
          className="absolute right-2.5 top-2.5 z-10 flex h-8 w-8 items-center justify-center rounded-full border border-red-200 bg-red-50 text-red-500 shadow-xs backdrop-blur-xs transition-all duration-200 hover:scale-105 hover:bg-red-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 sm:right-3 sm:top-3 sm:h-9 sm:w-9"
        >
          {isRemoving ? (
            <LoaderCircle size={15} className="animate-spin" aria-hidden="true" />
          ) : (
            <Heart size={16} strokeWidth={1.9} fill="currentColor" aria-hidden="true" />
          )}
        </button>

        {isOutOfStock && (
          <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center bg-white/80 backdrop-blur-[2px]">
            <span className="rounded-lg bg-[#101828] px-3 py-1.5 text-[10px] font-bold tracking-wider text-white sm:text-xs">
              OUT OF STOCK
            </span>
          </div>
        )}

        <Link
          href={productLink}
          aria-label={`View details of ${product.name || "product"}`}
          className="absolute bottom-2.5 right-2.5 z-10 flex h-8 w-8 items-center justify-center rounded-full border border-[#E2E8F0] bg-white/95 text-[#64748B] shadow-xs transition-all hover:border-[#0755E9] hover:bg-[#0755E9] hover:text-white sm:bottom-3 sm:right-3"
        >
          <ArrowUpRight size={15} aria-hidden="true" />
        </Link>
      </div>

      {/* Product Information */}
      <div className="flex min-w-0 flex-1 flex-col p-3 sm:p-4">
        <div className="mb-1.5 flex min-w-0 items-center justify-between gap-2">
          <span className="min-w-0 truncate text-[10px] font-bold uppercase tracking-wider text-[#64748B]">
            {brandLabel}
          </span>

          {hasRating && (
            <div className="flex shrink-0 items-center gap-1 rounded-md border border-[#E2E8F0] bg-[#F8FAFC] px-1.5 py-0.5">
              <Star
                size={11}
                fill="currentColor"
                className="text-amber-400"
                aria-hidden="true"
              />
              <span className="text-[11px] font-bold text-[#101828] tabular-nums">
                {rating.toFixed(1)}
              </span>
              <span className="text-[10px] text-[#64748B] tabular-nums">
                ({reviewCount.toLocaleString("en-IN")})
              </span>
            </div>
          )}
        </div>

        <Link href={productLink} className="block">
          <h3 className="line-clamp-2 min-h-[2.35rem] text-xs font-bold leading-snug text-[#101828] transition-colors duration-200 group-hover:text-[#0755E9] sm:min-h-[2.6rem] sm:text-sm">
            {product.name || "Unnamed Product"}
          </h3>
        </Link>

        {/* Price & Stock */}
        <div className="mt-auto pt-3">
          <div className="flex min-w-0 flex-wrap items-baseline gap-x-2 gap-y-0.5">
            <span className="text-base font-extrabold tracking-tight text-[#101828] tabular-nums sm:text-lg">
              {formatPrice(sellingPrice)}
            </span>

            {mrp > sellingPrice && (
              <span className="text-[11px] font-medium text-slate-400 line-through tabular-nums sm:text-xs">
                {formatPrice(mrp)}
              </span>
            )}
          </div>

          {discount > 0 && (
            <p className="mt-0.5 text-[10px] font-semibold text-emerald-600 tabular-nums sm:text-[11px]">
              You save {formatPrice(mrp - sellingPrice)}
            </p>
          )}

          <div className="mt-2 flex items-center gap-1.5">
            <span
              className={`h-1.5 w-1.5 shrink-0 rounded-full ${
                isOutOfStock
                  ? "bg-red-500"
                  : isLowStock
                    ? "bg-amber-500"
                    : "bg-emerald-500"
              }`}
            />
            <span
              className={`text-[11px] font-semibold ${
                isOutOfStock
                  ? "text-red-600"
                  : isLowStock
                    ? "text-amber-700"
                    : "text-emerald-700"
              }`}
            >
              {isOutOfStock
                ? "Out of Stock"
                : isLowStock
                  ? `Only ${stock} left`
                  : "In Stock"}
            </span>
          </div>
        </div>

        {/* Add to Cart Button */}
        <button
          type="button"
          disabled={isAddDisabled}
          aria-busy={isAdding}
          aria-label={
            isAdding
              ? "Adding product to cart"
              : `Add ${product.name || "product"} to cart`
          }
          onClick={() => {
            if (!isAddDisabled) {
              onAddToCart?.(product);
            }
          }}
          className="mt-3 inline-flex min-h-10 w-full items-center justify-center gap-1.5 rounded-xl bg-[#0755E9] px-3 py-2.5 text-xs font-bold text-white shadow-xs transition-all duration-200 hover:bg-[#082B70] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0755E9] focus-visible:ring-offset-2 active:scale-[0.98] disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400 disabled:shadow-none sm:gap-2"
        >
          {isAdding ? (
            <>
              <LoaderCircle size={15} className="animate-spin" aria-hidden="true" />
              <span>Adding...</span>
            </>
          ) : (
            <>
              <ShoppingBag size={15} strokeWidth={2} aria-hidden="true" />
              <span>{isOutOfStock ? "Out of Stock" : "Add to Cart"}</span>
            </>
          )}
        </button>
      </div>
    </article>
  );
}
