"use client";

import { Package, Sparkles, Search, Layers3, X } from "lucide-react";

export default function ProductsHeader({
  total = 0,
  title = "All Products",
  description = "Explore genuine gadgets, smart devices, and electronics curated by ELENZO.",
  eyebrow = "ELENZO Storefront",
  isSearch = false,
  isFeatured = false,
  isNewArrival = false,
  activeCategoryLabel = "",
  discoveredCategories = [],
  onClearSearch,
  onSelectDiscoveredCategory,
}) {
  const safeTotal = Number.isFinite(Number(total))
    ? Math.max(0, Number(total))
    : 0;

  const badgeLabel = isSearch
    ? "Search Results"
    : isFeatured
      ? "Featured Tech"
      : isNewArrival
        ? "Latest Releases"
        : eyebrow;

  const BadgeIcon = isSearch
    ? Search
    : isFeatured || isNewArrival
      ? Sparkles
      : Layers3;

  return (
    <header className="mb-5 rounded-2xl border border-[#E2E8F0] bg-white px-4 py-4 sm:mb-6 sm:px-6 sm:py-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0 flex-1">
          <div className="mb-2 flex flex-wrap items-center gap-2">
            <div className="inline-flex items-center gap-1.5 rounded-full border border-[#0755E9]/15 bg-[#EFF6FF] px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-[#0755E9]">
              <BadgeIcon size={13} aria-hidden="true" />
              <span>{badgeLabel}</span>
            </div>

            {activeCategoryLabel && (
              <span className="inline-flex items-center gap-1 rounded-full border border-[#E2E8F0] bg-[#F8FAFC] px-2.5 py-1 text-[11px] font-bold text-[#101828]">
                <Layers3 size={12} className="text-[#0755E9]" aria-hidden="true" />
                {activeCategoryLabel}
              </span>
            )}
          </div>

          <h1 className="break-words text-xl font-extrabold tracking-tight text-[#101828] sm:text-2xl lg:text-[28px]">
            {title}
          </h1>

          <p className="mt-1 max-w-2xl text-xs leading-relaxed text-[#64748B] sm:text-sm">
            {description}
          </p>

          {isSearch && discoveredCategories.length > 0 && !activeCategoryLabel && (
            <div className="mt-3 flex flex-wrap items-center gap-1.5">
              <span className="mr-1 text-[11px] font-bold uppercase tracking-wider text-[#64748B]">
                In Categories:
              </span>
              {discoveredCategories.map((cat) => (
                <button
                  key={cat._id}
                  type="button"
                  onClick={() => onSelectDiscoveredCategory?.(cat._id)}
                  className="inline-flex items-center gap-1 rounded-full border border-[#E2E8F0] bg-[#F8FAFC] px-2.5 py-1 text-[11px] font-bold text-[#101828] transition hover:border-[#0755E9]/40 hover:bg-[#EFF6FF] hover:text-[#0755E9]"
                >
                  {cat.name}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2.5 self-start sm:shrink-0 sm:self-center">
          {isSearch && onClearSearch && (
            <button
              type="button"
              onClick={onClearSearch}
              className="inline-flex h-10 items-center gap-1.5 rounded-xl border border-[#E2E8F0] bg-white px-3.5 text-xs font-bold text-[#64748B] transition hover:border-red-200 hover:bg-red-50 hover:text-red-600"
            >
              <X size={14} aria-hidden="true" />
              Clear Search
            </button>
          )}

          <div className="flex items-center gap-2.5 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] px-3.5 py-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#EFF6FF] text-[#0755E9]">
              <Package size={18} strokeWidth={2} aria-hidden="true" />
            </div>

            <div>
              <p className="text-[11px] font-medium uppercase tracking-wide text-[#64748B]">
                {isSearch ? "Matches" : "Catalog"}
              </p>
              <p className="text-sm font-bold text-[#101828] tabular-nums">
                {safeTotal.toLocaleString("en-IN")}{" "}
                {safeTotal === 1 ? "Product" : "Products"}
              </p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
