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

import { BRAND_NAME } from "@/config/brand";

export default function ProductCard({
  product,
  viewMode = "grid",
  onAddToCart,
  onWishlistToggle,
  isWishlisted = false,
  addingToCart = false,
  wishlistIsMutating = false,
}) {
  if (!product) return null;

  const variants = Array.isArray(product.variants)
    ? product.variants.filter((variant) => variant.isActive !== false)
    : [];

  const activeVariant =
    variants.find((variant) => variant.isDefault) || variants[0];

  const price =
    activeVariant?.sellingPrice ??
    activeVariant?.price ??
    product.price ??
    product.basePrice ??
    0;

  const mrp = activeVariant?.mrp ?? product.mrp ?? price;

  const discount =
    mrp > price && mrp > 0
      ? Math.round(((mrp - price) / mrp) * 100)
      : 0;

  const stock =
    activeVariant?.stock ??
    activeVariant?.quantity ??
    product.stock ??
    product.quantity ??
    0;

  const inStock = Number(stock) > 0;

  const image =
    product.thumbnail?.url ||
    product.images?.[0]?.url ||
    product.image?.url ||
    "";

  const rating = product.rating?.average ?? product.averageRating ?? 0;
  const reviewCount = product.rating?.count ?? product.reviewCount ?? 0;
  const hasRating = Number(rating) > 0;

  const formatPrice = (value) =>
    new Intl.NumberFormat("en-IN", {
      maximumFractionDigits: 0,
    }).format(Number(value) || 0);

  const handleAddToCart = () => {
    if (!inStock || addingToCart) return;
    onAddToCart?.(product, activeVariant);
  };

  const handleWishlist = () => {
    if (wishlistIsMutating) return;
    onWishlistToggle?.(product);
  };

  const isList = viewMode === "list";
  const productLink = product.slug
    ? `/products/${product.slug}`
    : `/products`;

  const brandLabel = product.brand || BRAND_NAME;

  const renderBrandAndRating = () => (
    <div className="mb-1.5 flex min-w-0 items-center justify-between gap-2">
      <span className="min-w-0 truncate text-[10px] font-bold uppercase tracking-wider text-[#64748B]">
        {brandLabel}
      </span>

      {hasRating && (
        <div className="flex shrink-0 items-center gap-1 rounded-md bg-[#F8FAFC] px-1.5 py-0.5 border border-[#E2E8F0]">
          <Star
            size={11}
            fill="currentColor"
            className="text-amber-400"
            aria-hidden="true"
          />
          <span className="text-[11px] font-bold text-[#101828] tabular-nums">
            {Number(rating).toFixed(1)}
          </span>
          {Number(reviewCount) > 0 && (
            <span className="text-[10px] text-[#64748B] tabular-nums">
              ({formatPrice(reviewCount)})
            </span>
          )}
        </div>
      )}
    </div>
  );

  const renderWishlistButton = (extraClass = "") => (
    <button
      type="button"
      aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
      aria-pressed={isWishlisted}
      aria-busy={wishlistIsMutating}
      disabled={wishlistIsMutating}
      onClick={handleWishlist}
      className={`flex h-8 w-8 items-center justify-center rounded-full border shadow-xs backdrop-blur-xs transition-all duration-200 hover:scale-105 disabled:cursor-not-allowed disabled:opacity-60 sm:h-9 sm:w-9 ${
        isWishlisted
          ? "border-red-200 bg-red-50 text-red-500"
          : "border-[#E2E8F0] bg-white/95 text-[#64748B] hover:border-red-200 hover:bg-red-50 hover:text-red-500"
      } ${extraClass}`}
    >
      {wishlistIsMutating ? (
        <LoaderCircle size={15} className="animate-spin" />
      ) : (
        <Heart
          size={16}
          strokeWidth={1.9}
          fill={isWishlisted ? "currentColor" : "none"}
        />
      )}
    </button>
  );

  const renderAddToCartButton = (extraClass = "") => (
    <button
      type="button"
      disabled={!inStock || addingToCart}
      onClick={handleAddToCart}
      aria-label={
        addingToCart
          ? "Adding to cart"
          : `Add ${product.name || "product"} to cart`
      }
      className={`inline-flex min-h-10 items-center justify-center gap-1.5 rounded-xl bg-[#0755E9] px-3.5 py-2.5 text-xs font-bold text-white shadow-xs transition-all duration-200 hover:bg-[#082B70] active:scale-[0.98] disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400 disabled:shadow-none sm:gap-2 ${extraClass}`}
    >
      {addingToCart ? (
        <>
          <LoaderCircle size={15} className="animate-spin" />
          <span>Adding...</span>
        </>
      ) : (
        <>
          <ShoppingBag size={15} strokeWidth={2} />
          <span>{inStock ? "Add to Cart" : "Out of Stock"}</span>
        </>
      )}
    </button>
  );

  const renderStockStatus = () => (
    <div className="flex items-center gap-1.5">
      <span
        className={`h-1.5 w-1.5 shrink-0 rounded-full ${
          inStock ? "bg-emerald-500" : "bg-red-500"
        }`}
      />
      <span
        className={`text-[11px] font-semibold ${
          inStock ? "text-emerald-700" : "text-red-600"
        }`}
      >
        {inStock ? "In Stock" : "Out of Stock"}
      </span>
    </div>
  );

  if (isList) {
    return (
      <article className="group relative flex w-full min-w-0 flex-col overflow-hidden rounded-2xl border border-[#E2E8F0] bg-white transition-all duration-200 hover:border-[#0755E9]/35 hover:shadow-md sm:flex-row">
        {/* List Image */}
        <div className="relative w-full shrink-0 overflow-hidden border-b border-[#E2E8F0] bg-[#F8FAFC] sm:w-48 sm:border-b-0 sm:border-r md:w-56">
          <Link
            href={productLink}
            aria-label={`View ${product.name || "product"}`}
            className="relative flex aspect-square w-full items-center justify-center overflow-hidden p-4 sm:aspect-auto sm:h-full sm:min-h-[196px]"
          >
            {image ? (
              <Image
                src={image}
                alt={product.name || "Product"}
                fill
                sizes="(max-width: 640px) 100vw, 224px"
                className="object-contain p-3 transition-transform duration-500 ease-out group-hover:scale-105"
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

          {discount > 0 ? (
            <span className="absolute left-3 top-3 z-10 inline-flex items-center rounded-lg border border-red-100 bg-red-50 px-2.5 py-1 text-[11px] font-bold text-red-600">
              {discount}% OFF
            </span>
          ) : product.isNewArrival ? (
            <span className="absolute left-3 top-3 z-10 inline-flex items-center rounded-lg border border-[#0755E9]/20 bg-[#EFF6FF] px-2.5 py-1 text-[11px] font-bold text-[#0755E9]">
              NEW
            </span>
          ) : null}

          <div className="sm:hidden">
            {renderWishlistButton("absolute right-3 top-3 z-10")}
          </div>

          {!inStock && (
            <div className="absolute inset-0 z-20 flex items-center justify-center bg-white/80 backdrop-blur-[2px]">
              <span className="rounded-lg bg-[#101828] px-3 py-1.5 text-[10px] font-bold tracking-wider text-white">
                OUT OF STOCK
              </span>
            </div>
          )}
        </div>

        {/* List Info */}
        <div className="flex min-w-0 flex-1 flex-col justify-between gap-4 p-4 sm:flex-row sm:items-center sm:p-5">
          <div className="flex min-w-0 flex-1 flex-col justify-between">
            <div>
              {renderBrandAndRating()}

              <Link href={productLink} className="block">
                <h3 className="line-clamp-2 text-sm font-bold leading-snug text-[#101828] transition-colors group-hover:text-[#0755E9] sm:text-base">
                  {product.name}
                </h3>
              </Link>

              {(product.shortDescription || product.description) && (
                <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-[#64748B] sm:text-sm">
                  {product.shortDescription || product.description}
                </p>
              )}
            </div>

            <div className="mt-3 flex flex-wrap items-center gap-3">
              {renderStockStatus()}

              {product.category?.name && (
                <span className="rounded-md bg-[#F8FAFC] px-2 py-0.5 text-[11px] font-medium text-[#64748B] border border-[#E2E8F0]">
                  {product.category.name}
                </span>
              )}

              {product.slug && (
                <Link
                  href={productLink}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-[#0755E9] transition hover:text-[#082B70]"
                >
                  <span>View Details</span>
                  <ArrowUpRight size={14} />
                </Link>
              )}
            </div>
          </div>

          {/* List Pricing + CTA */}
          <div className="flex shrink-0 flex-col justify-between gap-3 border-t border-[#E2E8F0] pt-3 sm:w-52 sm:items-end sm:border-l sm:border-t-0 sm:pl-5 sm:pt-0 sm:text-right">
            <div className="hidden sm:block">{renderWishlistButton("")}</div>

            <div className="w-full">
              <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1 sm:justify-end">
                <span className="text-lg font-extrabold tracking-tight text-[#101828] tabular-nums sm:text-xl">
                  ₹{formatPrice(price)}
                </span>
                {mrp > price && (
                  <span className="text-xs font-medium text-slate-400 line-through tabular-nums">
                    ₹{formatPrice(mrp)}
                  </span>
                )}
              </div>

              {discount > 0 && (
                <p className="mt-0.5 text-[11px] font-semibold text-emerald-600 tabular-nums">
                  Save ₹{formatPrice(mrp - price)}
                </p>
              )}

              {renderAddToCartButton("mt-3 w-full")}
            </div>
          </div>
        </div>
      </article>
    );
  }

  return (
    <article className="group relative flex h-full w-full min-w-0 flex-col overflow-hidden rounded-2xl border border-[#E2E8F0] bg-white transition-all duration-200 hover:-translate-y-0.5 hover:border-[#0755E9]/35 hover:shadow-md">
      {/* Product Image */}
      <div className="relative w-full overflow-hidden border-b border-[#F1F5F9] bg-[#F8FAFC]">
        <Link
          href={productLink}
          aria-label={`View ${product.name || "product"}`}
          className="relative flex aspect-square w-full items-center justify-center overflow-hidden p-3 sm:p-4 lg:p-5"
        >
          {image ? (
            <Image
              src={image}
              alt={product.name || "Product"}
              fill
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              className="object-contain p-2.5 transition-transform duration-500 ease-out group-hover:scale-105"
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

        {discount > 0 ? (
          <span className="absolute left-2.5 top-2.5 z-10 inline-flex items-center rounded-lg border border-red-100 bg-red-50 px-2 py-0.5 text-[10px] font-bold text-red-600 sm:left-3 sm:top-3 sm:px-2.5 sm:py-1 sm:text-xs">
            {discount}% OFF
          </span>
        ) : product.isNewArrival ? (
          <span className="absolute left-2.5 top-2.5 z-10 inline-flex items-center rounded-lg border border-[#0755E9]/20 bg-[#EFF6FF] px-2 py-0.5 text-[10px] font-bold text-[#0755E9] sm:left-3 sm:top-3 sm:px-2.5 sm:py-1 sm:text-xs">
            NEW
          </span>
        ) : null}

        {renderWishlistButton("absolute right-2.5 top-2.5 z-10 sm:right-3 sm:top-3")}

        {!inStock && (
          <div className="absolute inset-0 z-20 flex items-center justify-center bg-white/80 backdrop-blur-[2px]">
            <span className="rounded-lg bg-[#101828] px-3 py-1.5 text-[10px] font-bold tracking-wider text-white sm:text-xs">
              OUT OF STOCK
            </span>
          </div>
        )}

        {product.slug && (
          <Link
            href={productLink}
            aria-label={`View details of ${product.name || "product"}`}
            className="absolute bottom-2.5 right-2.5 z-10 flex h-8 w-8 items-center justify-center rounded-full border border-[#E2E8F0] bg-white/95 text-[#64748B] shadow-xs transition-all hover:border-[#0755E9] hover:bg-[#0755E9] hover:text-white sm:bottom-3 sm:right-3"
          >
            <ArrowUpRight size={15} />
          </Link>
        )}
      </div>

      {/* Product Info */}
      <div className="flex min-w-0 flex-1 flex-col p-3 sm:p-4">
        {renderBrandAndRating()}

        <Link href={productLink} className="block">
          <h3 className="line-clamp-2 min-h-[2.35rem] text-xs font-bold leading-snug text-[#101828] transition-colors duration-200 group-hover:text-[#0755E9] sm:min-h-[2.6rem] sm:text-sm">
            {product.name}
          </h3>
        </Link>

        <div className="mt-auto pt-3">
          <div className="flex min-w-0 flex-wrap items-baseline gap-x-2 gap-y-0.5">
            <span className="text-base font-extrabold tracking-tight text-[#101828] tabular-nums sm:text-lg">
              ₹{formatPrice(price)}
            </span>

            {mrp > price && (
              <span className="text-[11px] font-medium text-slate-400 line-through tabular-nums sm:text-xs">
                ₹{formatPrice(mrp)}
              </span>
            )}
          </div>

          {discount > 0 && (
            <p className="mt-0.5 text-[10px] font-semibold text-emerald-600 tabular-nums sm:text-[11px]">
              You save ₹{formatPrice(mrp - price)}
            </p>
          )}

          <div className="mt-2">{renderStockStatus()}</div>
        </div>

        {renderAddToCartButton("mt-3 w-full px-2.5 text-xs")}
      </div>
    </article>
  );
}