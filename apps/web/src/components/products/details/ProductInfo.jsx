
"use client";

import {
  Star,
  BadgeCheck,
  Tag,
  PackageCheck,
  ShieldCheck,
} from "lucide-react";

/* =====================================
   PRICE FORMATTER
===================================== */

function formatPrice(price) {
  return `₹${Number(price || 0).toLocaleString("en-IN")}`;
}

/* =====================================
   PRODUCT INFO
===================================== */

export default function ProductInfo({
  product,
  selectedVariant,
  sellingPrice,
  mrp,
  discount,
}) {
  const rating = Number(product?.ratings?.average || 0);
  const reviewCount = Number(product?.ratings?.count || 0);

  const currentPrice = Number(sellingPrice || 0);
  const originalPrice = Number(mrp || 0);

  const savings = Math.max(
    0,
    originalPrice - currentPrice
  );

  const hasDiscount =
    originalPrice > currentPrice && originalPrice > 0;

  const hasRating = reviewCount > 0;

  return (
    <section className="w-full">

      {/* =====================================
          BRAND & PRODUCT ASSURANCE
      ===================================== */}

      <div className="flex flex-wrap items-center justify-between gap-3">

        <span className="text-xs font-bold uppercase tracking-[0.16em] text-[#0755e9]">
          {product?.brand || "ELEZIO"}
        </span>

        {selectedVariant && (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-green-100 bg-green-50 px-3 py-1.5 text-xs font-semibold text-green-700">
            <BadgeCheck size={14} />
            Genuine Product
          </span>
        )}

      </div>

      {/* =====================================
          PRODUCT NAME
      ===================================== */}

      <h1 className="mt-3 text-2xl font-bold leading-tight tracking-tight text-[#101828] sm:text-3xl lg:text-[34px]">
        {product?.name || "Product Name"}
      </h1>

      {/* =====================================
          RATING & SKU
      ===================================== */}

      <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2">

        {/* Rating */}

        {hasRating ? (
          <div className="flex items-center gap-2">

            <div className="inline-flex items-center gap-1.5 rounded-md bg-amber-50 px-2 py-1 text-amber-600">
              <Star
                size={15}
                fill="currentColor"
                strokeWidth={1.5}
              />

              <span className="text-sm font-bold">
                {rating.toFixed(1)}
              </span>
            </div>

            <span className="text-xs text-slate-500">
              {reviewCount}{" "}
              {reviewCount === 1 ? "Review" : "Reviews"}
            </span>

          </div>
        ) : (
          <span className="text-xs font-medium text-slate-500">
            No reviews yet
          </span>
        )}

        {/* SKU */}

        {selectedVariant?.sku && (
          <>
            <span className="hidden h-4 w-px bg-slate-200 sm:block" />

            <span className="text-xs text-slate-500">
              SKU:{" "}
              <span className="font-semibold text-slate-700">
                {selectedVariant.sku}
              </span>
            </span>
          </>
        )}

      </div>

      {/* =====================================
          DIVIDER
      ===================================== */}

      <div className="my-6 border-t border-slate-200" />

      {/* =====================================
          PRICE SECTION
      ===================================== */}

      {selectedVariant ? (

        <div className="rounded-2xl border border-slate-200 bg-[#F8FAFC] p-4 sm:p-5">

          {/* Price Label */}

          <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-500">
            Special Price
          </p>

          {/* Selling Price & MRP */}

          <div className="flex flex-wrap items-center gap-x-3 gap-y-2">

            <span className="text-3xl font-extrabold tracking-tight text-[#101828] sm:text-4xl">
              {formatPrice(currentPrice)}
            </span>

            {hasDiscount && (
              <span className="text-lg font-medium text-slate-400 line-through">
                {formatPrice(originalPrice)}
              </span>
            )}

            {discount > 0 && (
              <span className="inline-flex items-center rounded-md bg-green-50 px-2.5 py-1 text-xs font-bold text-green-700">
                {discount}% OFF
              </span>
            )}

          </div>

          {/* Savings */}

          {savings > 0 && (
            <div className="mt-3 flex items-center gap-2 text-sm font-semibold text-green-700">

              <Tag size={16} />

              <span>
                You save {formatPrice(savings)}
              </span>

            </div>
          )}

          {/* Tax Information */}

          <p className="mt-3 text-xs text-slate-500">
            Inclusive of applicable taxes
          </p>

        </div>

      ) : (

        <div className="rounded-xl border border-red-100 bg-red-50 p-4">

          <p className="text-sm font-semibold text-red-600">
            No active variants available for this product.
          </p>

        </div>

      )}

      {/* =====================================
          PRODUCT ASSURANCE
      ===================================== */}

      <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">

        <div className="flex items-center gap-2.5 rounded-xl border border-slate-100 bg-white p-3">

          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-[#0755e9]">
            <PackageCheck size={19} />
          </div>

          <div>
            <p className="text-xs font-semibold text-[#101828]">
              Quality Checked
            </p>

            <p className="mt-0.5 text-[11px] text-slate-500">
              Products from ELEZIO
            </p>
          </div>

        </div>

        <div className="flex items-center gap-2.5 rounded-xl border border-slate-100 bg-white p-3">

          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-[#0755e9]">
            <ShieldCheck size={19} />
          </div>

          <div>
            <p className="text-xs font-semibold text-[#101828]">
              Secure Shopping
            </p>

            <p className="mt-0.5 text-[11px] text-slate-500">
              Shop with confidence
            </p>
          </div>

        </div>

      </div>

    </section>
  );
}
