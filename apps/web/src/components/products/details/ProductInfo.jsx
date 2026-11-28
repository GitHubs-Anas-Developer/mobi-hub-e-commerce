"use client";

import { Star, BadgeCheck, Tag, CheckCircle2, AlertCircle } from "lucide-react";
import { BRAND_NAME } from "@/config/brand";

function formatPrice(price) {
  return `₹${Number(price || 0).toLocaleString("en-IN")}`;
}

export default function ProductInfo({
  product,
  selectedVariant,
  sellingPrice = 0,
  mrp = 0,
  discount = 0,
  stock = 0,
  canPurchase = false,
  onReviewsClick,
}) {
  const rating = Number(
    product?.ratings?.average ?? product?.rating?.average ?? 0
  );
  const reviewCount = Number(
    product?.ratings?.count ?? product?.rating?.count ?? 0
  );

  const currentPrice = Number(sellingPrice || 0);
  const originalPrice = Number(mrp || 0);
  const savings = Math.max(0, originalPrice - currentPrice);
  const hasDiscount = originalPrice > currentPrice && originalPrice > 0;
  const hasRating = rating > 0 && reviewCount > 0;

  const isLowStock = canPurchase && stock > 0 && stock <= 5;

  return (
    <section className="w-full" aria-label="Product summary">
      {/* Brand, Category & Genuine Pill */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-md bg-[#EFF6FF] px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider text-[#0755E9]">
            {product?.brand || BRAND_NAME}
          </span>

          {product?.category?.name && (
            <span className="rounded-md border border-[#E2E8F0] bg-[#F8FAFC] px-2.5 py-1 text-[11px] font-semibold text-[#64748B]">
              {product.category.name}
            </span>
          )}
        </div>

        <span className="inline-flex items-center gap-1 text-xs font-semibold text-[#082B70]">
          <BadgeCheck size={15} className="text-[#0755E9]" aria-hidden="true" />
          <span>Genuine {BRAND_NAME} Product</span>
        </span>
      </div>

      {/* Product Title */}
      <h1 className="mt-3 text-2xl font-bold leading-snug tracking-tight text-[#101828] sm:text-3xl">
        {product?.name || "Product Name"}
      </h1>

      {/* Short Description (only when provided) */}
      {product?.shortDescription && (
        <p className="mt-2 text-sm leading-relaxed text-[#64748B]">
          {product.shortDescription}
        </p>
      )}

      {/* Rating, Reviews Anchor & SKU */}
      <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2">
        {hasRating ? (
          <a
            href="#reviews-section"
            onClick={onReviewsClick}
            className="inline-flex items-center gap-2 rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] px-2.5 py-1 transition hover:border-[#0755E9]/40"
          >
            <span className="inline-flex items-center gap-1 text-amber-500">
              <Star size={14} fill="currentColor" aria-hidden="true" />
              <span className="text-xs font-bold text-[#101828] tabular-nums">
                {rating.toFixed(1)}
              </span>
            </span>

            <span className="h-3 w-px bg-[#E2E8F0]" />

            <span className="text-xs font-medium text-[#64748B] tabular-nums">
              {reviewCount.toLocaleString("en-IN")}{" "}
              {reviewCount === 1 ? "Review" : "Reviews"}
            </span>
          </a>
        ) : (
          <a
            href="#reviews-section"
            onClick={onReviewsClick}
            className="text-xs font-semibold text-[#0755E9] hover:text-[#082B70] hover:underline"
          >
            Be the first to review
          </a>
        )}

        {selectedVariant?.sku && (
          <span className="text-xs text-[#64748B]">
            SKU:{" "}
            <span className="font-semibold text-[#101828]">
              {selectedVariant.sku}
            </span>
          </span>
        )}
      </div>

      {/* Pricing & Stock Card */}
      <div className="mt-5 rounded-2xl border border-[#E2E8F0] bg-[#F8FAFC] p-4 sm:p-5">
        {selectedVariant ? (
          <>
            <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1.5">
              <span className="text-3xl font-extrabold tracking-tight text-[#101828] tabular-nums sm:text-[34px]">
                {formatPrice(currentPrice)}
              </span>

              {hasDiscount && (
                <span className="text-base font-medium text-slate-400 line-through tabular-nums sm:text-lg">
                  {formatPrice(originalPrice)}
                </span>
              )}

              {discount > 0 && (
                <span className="inline-flex items-center rounded-lg border border-emerald-200 bg-emerald-50 px-2.5 py-0.5 text-xs font-bold text-emerald-700">
                  {discount}% OFF
                </span>
              )}
            </div>

            {savings > 0 && (
              <p className="mt-2 inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 tabular-nums sm:text-sm">
                <Tag size={14} aria-hidden="true" />
                <span>You save {formatPrice(savings)}</span>
              </p>
            )}
            {product?.warranty && <p className="mt-2 text-xs text-[#475569]">Warranty: {product.warranty}</p>}

            <div className="mt-3.5 border-t border-[#E2E8F0] pt-3">
              {canPurchase ? (
                <p
                  className={`inline-flex items-center gap-1.5 text-xs font-bold sm:text-sm ${
                    isLowStock ? "text-amber-700" : "text-emerald-700"
                  }`}
                >
                  <CheckCircle2 size={15} aria-hidden="true" />
                  <span>
                    {isLowStock
                      ? `In Stock · Only ${stock} left`
                      : `In Stock · ${stock} available`}
                  </span>
                </p>
              ) : (
                <p className="inline-flex items-center gap-1.5 text-xs font-bold text-red-600 sm:text-sm">
                  <AlertCircle size={15} aria-hidden="true" />
                  <span>Currently Out of Stock</span>
                </p>
              )}
            </div>
          </>
        ) : (
          <p className="text-sm font-semibold text-red-600">
            No active variants available for this product.
          </p>
        )}
      </div>
    </section>
  );
}
