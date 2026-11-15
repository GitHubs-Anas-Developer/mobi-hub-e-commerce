
"use client";

import {
  SlidersHorizontal,
  ArrowUpDown,
  LayoutGrid,
  List,
  ChevronDown,
  Package,
} from "lucide-react";

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
    <div className="
      mb-4 flex items-center justify-between gap-2

      lg:rounded-2xl
      lg:border lg:border-slate-200/80
      lg:bg-white
      lg:px-4 lg:py-3
      lg:shadow-sm
      lg:gap-4
    ">

      {/* ========================================
          MOBILE FILTER BUTTON
      ======================================== */}

      <button
        type="button"
        onClick={onFilterClick}
        className="
          flex h-10 shrink-0 items-center justify-center
          gap-2 rounded-lg border border-slate-200
          bg-white px-3 text-sm font-semibold text-slate-700
          transition hover:border-blue-500 hover:text-blue-600

          lg:hidden
        "
      >
        <SlidersHorizontal size={17} />

        <span>Filter</span>

        {activeFilterCount > 0 && (
          <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-blue-600 px-1 text-[10px] text-white">
            {activeFilterCount}
          </span>
        )}
      </button>

      {/* ========================================
          DESKTOP PRODUCT COUNT
      ======================================== */}

      <div className="
        hidden min-w-0 items-center gap-3
        lg:order-1 lg:mr-auto lg:flex
      ">

        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
          <Package size={20} strokeWidth={1.8} />
        </div>

        <div className="min-w-0">
          <h3 className="text-sm font-bold text-slate-900">
            Shop Products
          </h3>

          <p className="text-xs text-slate-500">
            {Number(total).toLocaleString("en-IN")} products available
          </p>
        </div>

      </div>

      {/* ========================================
          SORT DROPDOWN
      ======================================== */}

      <div className="
        relative min-w-0 flex-1
        sm:flex-none
        lg:order-2 lg:w-[215px]
      ">

        <ArrowUpDown
          size={14}
          className="
            pointer-events-none absolute left-3 top-1/2
            z-10 -translate-y-1/2 text-slate-500
          "
        />

        <select
          value={sort}
          onChange={(event) =>
            setSort?.(event.target.value)
          }
          aria-label="Sort products"
          className="
            h-10 w-full appearance-none rounded-lg
            border border-slate-200 bg-white
            py-2 pl-9 pr-8 text-sm font-medium
            text-slate-700 outline-none transition
            focus:border-blue-500

            lg:rounded-xl
            lg:border-slate-200
            lg:bg-slate-50
            lg:text-xs
            lg:font-semibold
            lg:hover:border-blue-300
            lg:hover:bg-blue-50/40
            lg:focus:bg-white
            lg:focus:ring-2
            lg:focus:ring-blue-50
          "
        >
          <option value="newest">
            Newest
          </option>

          <option value="popular">
            Popular
          </option>

          <option value="price-low-high">
            Price: Low to High
          </option>

          <option value="price-high-low">
            Price: High to Low
          </option>

          <option value="rating">
            Top Rated
          </option>
        </select>

        <ChevronDown
          size={14}
          className="
            pointer-events-none absolute right-3
            top-1/2 -translate-y-1/2 text-slate-500
          "
        />

      </div>

      {/* ========================================
          GRID / LIST VIEW
      ======================================== */}

      <div className="
        flex h-10 shrink-0 items-center gap-1
        rounded-lg border border-slate-200
        bg-white p-1

        lg:order-3
        lg:h-11
        lg:rounded-xl
        lg:border-slate-200
        lg:bg-slate-50
        lg:p-1
      ">

        {/* Grid View */}

        <button
          type="button"
          onClick={() => setViewMode?.("grid")}
          aria-label="Grid view"
          aria-pressed={viewMode === "grid"}
          className={`
            flex h-8 w-8 items-center justify-center rounded-md
            transition-all duration-200

            lg:h-9 lg:w-10 lg:rounded-lg

            ${
              viewMode === "grid"
                ? "bg-blue-600 text-white shadow-sm"
                : "text-slate-500 hover:bg-slate-100"
            }
          `}
        >
          <LayoutGrid size={17} />
        </button>

        {/* List View */}

        <button
          type="button"
          onClick={() => setViewMode?.("list")}
          aria-label="List view"
          aria-pressed={viewMode === "list"}
          className={`
            flex h-8 w-8 items-center justify-center rounded-md
            transition-all duration-200

            lg:h-9 lg:w-10 lg:rounded-lg

            ${
              viewMode === "list"
                ? "bg-blue-600 text-white shadow-sm"
                : "text-slate-500 hover:bg-slate-100"
            }
          `}
        >
          <List size={18} />
        </button>

      </div>

      {/* ========================================
          MOBILE PRODUCT COUNT
      ======================================== */}

      <span className="
        hidden whitespace-nowrap text-sm
        font-medium text-slate-500 xl:hidden
      ">
        {Number(total).toLocaleString("en-IN")} Products
      </span>

    </div>
  );
}
