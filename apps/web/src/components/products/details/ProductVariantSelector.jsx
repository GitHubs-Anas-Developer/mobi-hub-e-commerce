
"use client";

import {
  Check,
  Package,
  CircleAlert,
  Sparkles,
} from "lucide-react";

function formatPrice(price) {
  return `₹${Number(price || 0).toLocaleString("en-IN")}`;
}

export default function ProductVariantSelector({
  variants = [],
  selectedVariantId,
  onVariantChange,
}) {
  if (!variants.length) return null;

  return (
    <section className="mt-8">

      {/* Header */}
      <div className="mb-5 flex items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold tracking-tight text-[#101828]">
              Choose Variant
            </h2>

            <Sparkles
              size={15}
              className="text-[#0755E9]"
            />
          </div>

          <p className="mt-1 text-xs text-[#64748B]">
            Select your preferred product option
          </p>
        </div>

        <span className="shrink-0 rounded-full bg-[#EFF6FF] px-3 py-1.5 text-[11px] font-semibold text-[#0755E9]">
          {variants.length} Options
        </span>
      </div>

      {/* Variant Cards */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">

        {variants.map((variant) => {
          const attributes = Object.entries(
            variant.attributes instanceof Map
              ? Object.fromEntries(variant.attributes)
              : variant.attributes || {}
          );

          const label =
            attributes.length > 0
              ? attributes
                  .map(([key, value]) => `${key}: ${value}`)
                  .join(" / ")
              : variant.sku || "Standard Variant";

          const isSelected =
            String(selectedVariantId) === String(variant._id);

          const isOutOfStock =
            Number(variant.stock || 0) < 1;

          const sellingPrice = Number(
            variant.sellingPrice || 0
          );

          const mrp = Number(variant.mrp || 0);

          const discountPercentage =
            mrp > sellingPrice && mrp > 0
              ? Math.round(
                  ((mrp - sellingPrice) / mrp) * 100
                )
              : 0;

          return (
            <button
              key={variant._id}
              type="button"
              onClick={() => onVariantChange(variant._id)}
              disabled={isOutOfStock}
              aria-pressed={isSelected}
              className={`group relative w-full rounded-2xl border p-4 text-left transition-all duration-200 ${
                isSelected
                  ? "border-[#0755E9] bg-[#EFF6FF] shadow-sm ring-1 ring-[#0755E9]"
                  : "border-[#E2E8F0] bg-white hover:border-[#93C5FD] hover:shadow-sm"
              } ${
                isOutOfStock
                  ? "cursor-not-allowed opacity-55"
                  : "cursor-pointer"
              }`}
            >
              {/* Top Row */}
              <div className="flex items-start justify-between gap-3">

                <div className="min-w-0 flex-1">

                  <p className="text-sm font-bold leading-6 text-[#101828]">
                    {label}
                  </p>

                  <p className="mt-1 text-[11px] text-[#94A3B8]">
                    SKU: {variant.sku || "N/A"}
                  </p>
                </div>

                {/* Selection Indicator */}
                <span
                  className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border transition ${
                    isSelected
                      ? "border-[#0755E9] bg-[#0755E9] text-white"
                      : "border-[#CBD5E1] bg-white text-transparent group-hover:border-[#0755E9]"
                  }`}
                >
                  <Check size={14} strokeWidth={3} />
                </span>
              </div>

              {/* Divider */}
              <div className="my-4 border-t border-dashed border-[#E2E8F0]" />

              {/* Price Row */}
              <div className="flex items-end justify-between gap-2">

                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-lg font-extrabold tracking-tight text-[#101828]">
                      {formatPrice(sellingPrice)}
                    </span>

                    {discountPercentage > 0 && (
                      <span className="rounded-md bg-green-50 px-1.5 py-1 text-[10px] font-bold text-green-700">
                        {discountPercentage}% OFF
                      </span>
                    )}
                  </div>

                  {mrp > sellingPrice && (
                    <p className="mt-1 text-xs text-[#94A3B8] line-through">
                      {formatPrice(mrp)}
                    </p>
                  )}
                </div>

                {/* Stock */}
                <span
                  className={`inline-flex shrink-0 items-center gap-1 rounded-full px-2 py-1 text-[10px] font-semibold ${
                    isOutOfStock
                      ? "bg-red-50 text-red-600"
                      : Number(variant.stock) <= 5
                        ? "bg-amber-50 text-amber-700"
                        : "bg-green-50 text-green-700"
                  }`}
                >
                  {isOutOfStock ? (
                    <CircleAlert size={12} />
                  ) : (
                    <Package size={12} />
                  )}

                  {isOutOfStock
                    ? "Out of stock"
                    : Number(variant.stock) <= 5
                      ? `Only ${variant.stock} left`
                      : "In stock"}
                </span>
              </div>

              {/* Selected Label */}
              {isSelected && (
                <div className="mt-3 flex items-center gap-1.5 text-[11px] font-bold text-[#0755E9]">
                  <Check size={13} strokeWidth={3} />
                  Selected variant
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Footer Helper */}
      <div className="mt-4 flex items-start gap-2 rounded-xl bg-[#F8FAFC] p-3">
        <CircleAlert
          size={15}
          className="mt-0.5 shrink-0 text-[#64748B]"
        />

        <p className="text-xs leading-5 text-[#64748B]">
          Choose an available variant before adding the product
          to your cart.
        </p>
      </div>
    </section>
  );
}
