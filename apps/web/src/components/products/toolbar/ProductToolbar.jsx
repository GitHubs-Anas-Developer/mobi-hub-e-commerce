
"use client";

import { SlidersHorizontal } from "lucide-react";

import ProductSort from "./ProductSort";
import ProductViewToggle from "./ProductViewToggle";

export default function ProductToolbar({
  total = 0,
  sort = "newest",
  setSort,
  viewMode = "grid",
  setViewMode,
  onFilterClick,
  activeFilterCount = 0,
}) {
  return (
    <div
      className="
        mb-4 flex w-full min-w-0 flex-nowrap
        items-center justify-between gap-2
        rounded-xl border border-slate-200
        bg-white p-2.5
        sm:rounded-2xl sm:p-3
      "
    >
      {/* LEFT SECTION */}
      <div className="flex min-w-0 flex-1 items-center gap-2">

        {/* MOBILE FILTER BUTTON */}
        <button
          type="button"
          onClick={onFilterClick}
          aria-label={
            activeFilterCount > 0
              ? `Open filters, ${activeFilterCount} active`
              : "Open filters"
          }
          aria-haspopup="dialog"
          className="
            relative inline-flex h-9 shrink-0
            items-center justify-center gap-1.5
            rounded-lg border border-slate-200
            bg-white px-2.5
            text-xs font-semibold text-slate-700
            transition-all duration-200
            hover:border-blue-300 hover:bg-blue-50
            hover:text-blue-600
            focus-visible:outline-none
            focus-visible:ring-2
            focus-visible:ring-blue-500
            focus-visible:ring-offset-2
            sm:h-10 sm:gap-2 sm:px-3 sm:text-sm
            lg:hidden
          "
        >
          <SlidersHorizontal
            size={16}
            strokeWidth={2}
            aria-hidden="true"
          />
          <span>Filter</span>
        </button>
      </div>

      {/* RIGHT SECTION */}
      <div className="
        flex shrink-0 items-center
        gap-1 sm:gap-2
      ">
        <ProductSort
          sort={sort}
          setSort={setSort}
        />

        <ProductViewToggle
          viewMode={viewMode}
          setViewMode={setViewMode}
        />
      </div>
    </div>
  );
}
