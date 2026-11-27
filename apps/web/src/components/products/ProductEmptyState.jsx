"use client";

import Link from "next/link";
import { SearchX, RotateCcw, ShoppingBag } from "lucide-react";

export default function ProductEmptyState({
  search = "",
  hasActiveFilters = false,
  onClearFilters,
}) {
  return (
    <div className="flex min-h-[340px] flex-col items-center justify-center rounded-2xl border border-[#E2E8F0] bg-white px-6 py-14 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-[#0755E9]/15 bg-[#EFF6FF] text-[#0755E9]">
        <SearchX size={30} strokeWidth={1.7} aria-hidden="true" />
      </div>

      <h3 className="mt-5 text-lg font-bold tracking-tight text-[#101828]">
        {search
          ? `No results found for "${search}"`
          : "No products match your selection"}
      </h3>

      <p className="mt-2 max-w-md text-xs leading-relaxed text-[#64748B] sm:text-sm">
        {hasActiveFilters || search
          ? "Try clearing one or more active filters, expanding your price range, or searching with a broader product keyword."
          : "New gadgets and electronics are being updated. Explore all departments to see available products."}
      </p>

      <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
        {(hasActiveFilters || search) && onClearFilters && (
          <button
            type="button"
            onClick={onClearFilters}
            className="inline-flex h-10 items-center gap-2 rounded-xl bg-[#0755E9] px-5 text-xs font-bold text-white shadow-xs transition hover:bg-[#082B70] sm:text-sm"
          >
            <RotateCcw size={15} />
            Reset All Filters
          </button>
        )}

        <Link
          href="/products"
          className="inline-flex h-10 items-center gap-2 rounded-xl border border-[#E2E8F0] bg-white px-5 text-xs font-bold text-[#101828] transition hover:border-[#0755E9]/40 hover:bg-[#EFF6FF] hover:text-[#0755E9] sm:text-sm"
        >
          <ShoppingBag size={15} />
          Browse Full Catalog
        </Link>
      </div>
    </div>
  );
}

