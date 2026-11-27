"use client";

import { SlidersHorizontal, LoaderCircle } from "lucide-react";
import ProductSort from "./ProductSort";
import ProductViewToggle from "./ProductViewToggle";

export default function ProductToolbar({
  total = 0,
  shownCount = 0,
  page = 1,
  pageSize = 12,
  loading = false,
  sort = "newest",
  setSort,
  viewMode = "grid",
  setViewMode,
  onFilterClick,
  activeFilterCount = 0,
}) {
  const totalNum = Math.max(0, Number(total) || 0);
  const startItem =
    totalNum > 0 && shownCount > 0 ? (Math.max(1, page) - 1) * pageSize + 1 : 0;
  const endItem =
    totalNum > 0 && shownCount > 0
      ? Math.min(totalNum, startItem + shownCount - 1)
      : 0;

  return (
    <div className="mb-4 flex w-full min-w-0 flex-wrap items-center justify-between gap-2.5 rounded-2xl border border-[#E2E8F0] bg-white px-3 py-2.5 sm:px-4 sm:py-3">
      {/* Left: Mobile Filter Trigger + Desktop Count */}
      <div className="flex min-w-0 items-center gap-2.5">
        <button
          type="button"
          onClick={onFilterClick}
          aria-label={
            activeFilterCount > 0
              ? `Open filters, ${activeFilterCount} active`
              : "Open filters"
          }
          aria-haspopup="dialog"
          className="inline-flex h-9 shrink-0 items-center justify-center gap-2 rounded-xl border border-[#E2E8F0] bg-white px-3 text-xs font-bold text-[#101828] transition hover:border-[#0755E9]/40 hover:bg-[#EFF6FF] hover:text-[#0755E9] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0755E9] focus-visible:ring-offset-2 sm:h-10 sm:text-[13px] lg:hidden"
        >
          <SlidersHorizontal size={15} strokeWidth={2} aria-hidden="true" />
          <span>Filters</span>
          {activeFilterCount > 0 && (
            <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-[#0755E9] px-1.5 text-[10px] font-bold text-white tabular-nums">
              {activeFilterCount}
            </span>
          )}
        </button>

        <div className="hidden items-center gap-2 lg:flex">
          <p className="text-xs font-medium text-[#64748B] sm:text-sm">
            {totalNum > 0 && endItem >= startItem && startItem > 0 ? (
              <>
                Showing{" "}
                <span className="font-bold text-[#101828] tabular-nums">
                  {startItem}–{endItem}
                </span>{" "}
                of{" "}
                <span className="font-bold text-[#101828] tabular-nums">
                  {totalNum.toLocaleString("en-IN")}
                </span>{" "}
                {totalNum === 1 ? "product" : "products"}
              </>
            ) : (
              <>
                <span className="font-bold text-[#101828] tabular-nums">
                  {totalNum.toLocaleString("en-IN")}
                </span>{" "}
                {totalNum === 1 ? "product" : "products"} found
              </>
            )}
          </p>

          {loading && (
            <LoaderCircle
              size={15}
              className="animate-spin text-[#0755E9]"
              aria-label="Updating results"
            />
          )}
        </div>
      </div>

      {/* Right: Sort & View Switcher */}
      <div className="flex flex-1 items-center justify-end gap-2 sm:flex-none">
        <ProductSort sort={sort} setSort={setSort} />
        <ProductViewToggle viewMode={viewMode} setViewMode={setViewMode} />
      </div>
    </div>
  );
}
