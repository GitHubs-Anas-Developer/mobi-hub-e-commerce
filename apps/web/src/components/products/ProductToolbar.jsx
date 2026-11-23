
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
  const productCount = Number.isFinite(Number(total))
    ? Number(total)
    : 0;

  const filterCount = Math.max(
    0,
    Number(activeFilterCount) || 0
  );

  const handleSortChange = (event) => {
    setSort?.(event.target.value);
  };

  const handleViewChange = (mode) => {
    if (mode !== viewMode) {
      setViewMode?.(mode);
    }
  };

  return (
    <div
      className="
        mb-4 flex min-w-0 items-center justify-between gap-2
        rounded-xl

        lg:gap-4
        lg:rounded-2xl
        lg:border lg:border-slate-200/80
        lg:bg-white
        lg:px-4 lg:py-3
        lg:shadow-sm
      "
    >
      {/* MOBILE FILTER BUTTON */}

      <button
        type="button"
        onClick={onFilterClick}
        aria-label={
          filterCount > 0
            ? `Open filters, ${filterCount} active filter sections`
            : "Open product filters"
        }
        className="
          relative flex h-10 shrink-0 items-center
          justify-center gap-2 rounded-xl
          border border-slate-200 bg-white
          px-3 text-xs font-bold text-slate-700
          transition-all duration-200
          hover:border-blue-300 hover:bg-blue-50/50
          hover:text-blue-600
          active:scale-[0.97]
          lg:hidden
        "
      >
        <SlidersHorizontal size={16} />

        <span>Filter</span>

        {filterCount > 0 && (
          <span
            className="
              flex h-5 min-w-5 items-center justify-center
              rounded-full bg-blue-600 px-1.5
              text-[10px] font-bold text-white
            "
          >
            {filterCount}
          </span>
        )}
      </button>

      {/* DESKTOP PRODUCT COUNT */}

      <div
        className="
          hidden min-w-0 items-center gap-3
          lg:order-1 lg:mr-auto lg:flex
        "
      >
        <div
          className="
            flex h-10 w-10 shrink-0 items-center
            justify-center rounded-xl
            bg-blue-50 text-blue-600
          "
        >
          <Package size={20} strokeWidth={1.8} />
        </div>

        <div className="min-w-0">
          <h3 className="text-sm font-extrabold text-slate-900">
            Shop Products
          </h3>

          <p className="mt-0.5 text-xs text-slate-500">
            {productCount.toLocaleString("en-IN")} products available
          </p>
        </div>
      </div>

      {/* SORT DROPDOWN */}

      <div
        className="
          relative min-w-0 flex-1
          sm:flex-none
          lg:order-2 lg:w-[215px]
        "
      >
        <ArrowUpDown
          size={14}
          className="
            pointer-events-none absolute left-3 top-1/2
            z-10 -translate-y-1/2 text-slate-500
          "
        />

        <select
          value={sort}
          onChange={handleSortChange}
          aria-label="Sort products"
          className="
            h-10 w-full appearance-none rounded-xl
            border border-slate-200 bg-white
            py-2 pl-9 pr-8 text-xs font-semibold
            text-slate-700 outline-none
            transition-all duration-200
            hover:border-blue-300
            focus:border-blue-500
            focus:ring-2 focus:ring-blue-100

            lg:bg-slate-50
            lg:focus:bg-white
          "
        >
          <option value="newest">Newest</option>
          <option value="popular">Popular</option>
          <option value="price-low-high">
            Price: Low to High
          </option>
          <option value="price-high-low">
            Price: High to Low
          </option>
          <option value="rating">Top Rated</option>
        </select>

        <ChevronDown
          size={14}
          className="
            pointer-events-none absolute right-3 top-1/2
            -translate-y-1/2 text-slate-500
          "
        />
      </div>

      {/* GRID / LIST VIEW */}

      <div
        className="
          flex h-10 shrink-0 items-center gap-1
          rounded-xl border border-slate-200
          bg-white p-1

          lg:order-3 lg:h-11
          lg:bg-slate-50
        "
        role="group"
        aria-label="Product display mode"
      >
        <button
          type="button"
          onClick={() => handleViewChange("grid")}
          aria-label="Grid view"
          aria-pressed={viewMode === "grid"}
          className={`
            flex h-8 w-8 items-center justify-center
            rounded-lg transition-all duration-200
            lg:h-9 lg:w-10

            ${
              viewMode === "grid"
                ? "bg-blue-600 text-white shadow-sm shadow-blue-600/20"
                : "text-slate-500 hover:bg-slate-100 hover:text-slate-800"
            }
          `}
        >
          <LayoutGrid size={17} />
        </button>

        <button
          type="button"
          onClick={() => handleViewChange("list")}
          aria-label="List view"
          aria-pressed={viewMode === "list"}
          className={`
            flex h-8 w-8 items-center justify-center
            rounded-lg transition-all duration-200
            lg:h-9 lg:w-10

            ${
              viewMode === "list"
                ? "bg-blue-600 text-white shadow-sm shadow-blue-600/20"
                : "text-slate-500 hover:bg-slate-100 hover:text-slate-800"
            }
          `}
        >
          <List size={18} />
        </button>
      </div>
    </div>
  );
}
