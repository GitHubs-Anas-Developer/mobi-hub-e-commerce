"use client";

import Image from "next/image";
import Link from "next/link";

import {
  Heart,
  ShoppingBag,
  Star,
  Package,
  LoaderCircle,
  ArrowUpRight,
} from "lucide-react";

export default function ProductCard({
  product,
  onAddToCart,
  onWishlistToggle,
  isWishlisted = false,
  addingToCart = false,
  wishlistIsMutating = false,
}) {
  if (!product) return null;

  // Active Variants
  const variants = Array.isArray(product.variants)
    ? product.variants.filter(
        (variant) => variant.isActive !== false
      )
    : [];

  // Default Variant
  const activeVariant =
    variants.find((variant) => variant.isDefault) ||
    variants[0];

  // Price
  const price =
    activeVariant?.sellingPrice ??
    activeVariant?.price ??
    product.price ??
    0;

  const mrp =
    activeVariant?.mrp ??
    product.mrp ??
    price;

  // Discount
  const discount =
    mrp > price && mrp > 0
      ? Math.round(((mrp - price) / mrp) * 100)
      : 0;

  // Stock
  const stock =
    activeVariant?.stock ??
    activeVariant?.quantity ??
    product.stock ??
    product.quantity ??
    0;

  const inStock = Number(stock) > 0;

  // Product Image
  const image =
    product.thumbnail?.url ||
    product.images?.[0]?.url ||
    product.image?.url ||
    "";

  // Rating
  const rating =
    product.rating?.average ??
    product.averageRating ??
    0;

  const reviewCount =
    product.rating?.count ??
    product.reviewCount ??
    0;

  const hasRating = Number(rating) > 0;

  // Currency Formatter
  const formatPrice = (value) =>
    new Intl.NumberFormat("en-IN", {
      maximumFractionDigits: 0,
    }).format(Number(value) || 0);

  // ========================================
  // ADD TO CART
  // ========================================

  const handleAddToCart = () => {
    if (!inStock || addingToCart) return;

    onAddToCart?.(product, activeVariant);
  };

  // ========================================
  // WISHLIST
  // ========================================

  const handleWishlist = () => {
    if (wishlistIsMutating) return;

    onWishlistToggle?.(product);
  };

  // ========================================
  // RENDER
  // ========================================

  return (
    <article className="group relative flex h-full w-full min-w-0 flex-col overflow-hidden rounded-2xl border border-slate-200/80 bg-white transition-all duration-300 hover:-translate-y-1 hover:border-blue-100 hover:shadow-xl hover:shadow-slate-200/60">

      {/* Product Image Section */}

      <div className="relative w-full overflow-hidden ">

        <Link
          href={`/products/${product.slug}`}
          aria-label={`View ${product.name || "product"}`}
          className="relative flex aspect-square w-full items-center justify-center overflow-hidden p-3 sm:p-4 lg:p-5"
        >
          {image ? (
            <Image
              src={image}
              alt={product.name || "Product"}
              fill
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              className="object-contain p-2 transition-transform duration-500 ease-out group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center">
              <Package
                size={44}
                strokeWidth={1.2}
                className="text-slate-300"
              />
            </div>
          )}
        </Link>

        {/* Discount Badge */}

        {discount > 0 && (
          <span className="absolute left-2.5 top-2.5 z-10 inline-flex items-center rounded-lg bg-red-50 px-2 py-1 text-[10px] font-bold text-red-600 sm:left-3 sm:top-3 sm:px-2.5 sm:text-xs">
            {discount}% OFF
          </span>
        )}

        {/* Wishlist Button */}

        <button
          type="button"
          aria-label={
            isWishlisted
              ? "Remove from wishlist"
              : "Add to wishlist"
          }
          aria-pressed={isWishlisted}
          aria-busy={wishlistIsMutating}
          disabled={wishlistIsMutating}
          onClick={handleWishlist}
          className={`absolute right-2.5 top-2.5 z-10 flex h-8 w-8 items-center justify-center rounded-full border shadow-sm backdrop-blur-sm transition-all duration-200 hover:scale-110 disabled:cursor-not-allowed disabled:opacity-60 sm:right-3 sm:top-3 sm:h-9 sm:w-9 ${
            isWishlisted
              ? "border-red-100 bg-red-50 text-red-500"
              : "border-slate-200/80 bg-white/90 text-slate-600 hover:border-red-100 hover:bg-red-50 hover:text-red-500"
          }`}
        >
          {wishlistIsMutating ? (
            <LoaderCircle
              size={16}
              className="animate-spin"
            />
          ) : (
            <Heart
              size={17}
              strokeWidth={1.9}
              fill={isWishlisted ? "currentColor" : "none"}
            />
          )}
        </button>

        {/* Out of Stock Overlay */}

        {!inStock && (
          <div className="absolute inset-0 z-20 flex items-center justify-center bg-white/70 backdrop-blur-[2px]">
            <span className="rounded-lg bg-slate-900 px-3 py-2 text-[10px] font-bold tracking-wider text-white sm:text-xs">
              OUT OF STOCK
            </span>
          </div>
        )}

        {/* Quick View Indicator */}

        {product.slug && (
          <Link
            href={`/products/${product.slug}`}
            aria-label={`View details of ${product.name}`}
            className="absolute bottom-2.5 left-2.5 z-10 flex h-8 w-8 items-center justify-center rounded-full border border-slate-200/80 bg-white/95 text-slate-600 opacity-100 shadow-sm transition-all hover:border-blue-200 hover:bg-blue-600 hover:text-white sm:bottom-3 sm:left-3"
          >
            <ArrowUpRight size={16} />
          </Link>
        )}
      </div>

      {/* Product Information */}

      <div className="flex min-w-0 flex-1 flex-col p-2.5 sm:p-3.5">

        {/* Brand & Rating */}

        <div className="mb-2 flex min-w-0 items-center justify-between gap-1.5">

          <span className="min-w-0 truncate text-[9px] font-bold uppercase tracking-wider text-slate-400 sm:text-[10px]">
            {product.brand || "ELEZIO"}
          </span>

          {hasRating ? (
            <div className="flex shrink-0 items-center gap-1">
              <Star
                size={12}
                fill="currentColor"
                className="text-amber-400"
              />

              <span className="text-[10px] font-bold text-slate-700 sm:text-xs">
                {Number(rating).toFixed(1)}
              </span>

              {reviewCount > 0 && (
                <span className="text-[9px] text-slate-400 sm:text-[10px]">
                  ({formatPrice(reviewCount)})
                </span>
              )}
            </div>
          ) : (
            <span className="shrink-0 rounded-md bg-slate-100 px-1.5 py-1 text-[9px] font-semibold text-slate-500">
              New
            </span>
          )}
        </div>

        {/* Product Name */}

        <Link
          href={`/products/${product.slug}`}
          className="block"
        >
          <h3 className="line-clamp-2 min-h-9 text-xs font-bold leading-[1.4] text-slate-900 transition-colors duration-200 group-hover:text-blue-600 sm:min-h-10 sm:text-sm">
            {product.name}
          </h3>
        </Link>

        {/* Price Section */}

        <div className="mt-auto pt-3">

          <div className="flex min-w-0 flex-wrap items-baseline gap-x-2 gap-y-1">

            <span className="text-sm font-extrabold tracking-tight text-slate-950 sm:text-lg">
              ₹{formatPrice(price)}
            </span>

            {mrp > price && (
              <span className="text-[10px] font-medium text-slate-400 line-through sm:text-xs">
                ₹{formatPrice(mrp)}
              </span>
            )}
          </div>

          {/* Savings */}

          {discount > 0 && (
            <p className="mt-1 text-[9px] font-semibold text-emerald-600 sm:text-[10px]">
              You save ₹{formatPrice(mrp - price)}
            </p>
          )}

          {/* Stock Status */}

          <div className="mt-2 flex items-center gap-1.5">
            <span
              className={`h-1.5 w-1.5 shrink-0 rounded-full ${
                inStock ? "bg-emerald-500" : "bg-red-500"
              }`}
            />

            <span
              className={`text-[9px] font-semibold sm:text-[10px] ${
                inStock ? "text-emerald-700" : "text-red-600"
              }`}
            >
              {inStock ? "In Stock" : "Out of Stock"}
            </span>
          </div>
        </div>

        {/* Add to Cart Button */}

        <button
          type="button"
          disabled={!inStock || addingToCart}
          onClick={handleAddToCart}
          aria-label={
            addingToCart
              ? "Adding to cart"
              : `Add ${product.name} to cart`
          }
          className="mt-3 inline-flex w-full items-center justify-center gap-1.5 rounded-xl bg-blue-600 px-2 py-2.5 text-[10px] font-bold text-white shadow-sm shadow-blue-600/15 transition-all duration-200 hover:bg-blue-700 active:scale-[0.98] disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-500 disabled:shadow-none sm:gap-2 sm:py-3 sm:text-xs"
        >
          {addingToCart ? (
            <>
              <LoaderCircle
                size={15}
                className="animate-spin"
              />
              Adding...
            </>
          ) : (
            <>
              <ShoppingBag
                size={15}
                strokeWidth={2}
              />
              {inStock ? "Add to Cart" : "Out of Stock"}
            </>
          )}
        </button>
      </div>
    </article>
  );
}