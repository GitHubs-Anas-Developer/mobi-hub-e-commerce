"use client";

import {
  SlidersHorizontal,
  RotateCcw,
  ArrowRight,
  Layers3,
  Tag,
  IndianRupee,
} from "lucide-react";

import FilterAccordion from "../FilterAccordion";
import CategoryOptions from "../CategoryOptions";
import BrandOptions from "../BrandOptions";
import PriceOptions from "../PriceOptions";
import { getActiveFilterCount } from "../utils/filterHelpers";

export default function DesktopFilterPanel({
  categories,
  brands,
  category,
  setCategory,
  brand,
  setBrand,
  minPrice,
  setMinPrice,
  maxPrice,
  setMaxPrice,
  onApply,
  onClear,
  hasPendingChanges = false,
}) {
  const activeCount = getActiveFilterCount({
    category,
    brand,
    minPrice,
    maxPrice,
  });

  return (
    <div className="flex min-h-0 flex-1 flex-col bg-white">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[#E2E8F0] px-4 py-3.5">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#EFF6FF] text-[#0755E9]">
            <SlidersHorizontal size={16} aria-hidden="true" />
          </div>

          <div>
            <h2 className="text-sm font-bold tracking-tight text-[#101828]">
              Filters
            </h2>
            <p className="text-[11px] text-[#64748B]">
              Refine product catalog
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {activeCount > 0 && (
            <span className="rounded-full bg-[#EFF6FF] px-2 py-0.5 text-[11px] font-bold text-[#0755E9] tabular-nums">
              {activeCount}
            </span>
          )}

          {activeCount > 0 && (
            <button
              type="button"
              onClick={onClear}
              className="text-xs font-semibold text-[#64748B] transition hover:text-red-600"
            >
              Reset
            </button>
          )}
        </div>
      </div>

      {/* Scrollable Filter Sections */}
      <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain [scrollbar-width:thin]">
        <FilterAccordion
          title="Category"
          icon={Layers3}
          active={Boolean(category)}
        >
          <CategoryOptions
            categories={categories}
            category={category}
            setCategory={setCategory}
          />
        </FilterAccordion>

        <FilterAccordion
          title="Brand"
          icon={Tag}
          active={Boolean(brand)}
        >
          <BrandOptions
            brands={brands}
            brand={brand}
            setBrand={setBrand}
          />
        </FilterAccordion>

        <FilterAccordion
          title="Price Range"
          icon={IndianRupee}
          active={minPrice !== "" || maxPrice !== ""}
        >
          <PriceOptions
            minPrice={minPrice}
            setMinPrice={setMinPrice}
            maxPrice={maxPrice}
            setMaxPrice={setMaxPrice}
          />
        </FilterAccordion>
      </div>

      {/* Footer Actions */}
      <div className="border-t border-[#E2E8F0] bg-[#F8FAFC] p-3.5">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onClear}
            disabled={activeCount === 0}
            className="flex h-10 flex-1 items-center justify-center gap-1.5 rounded-xl border border-[#E2E8F0] bg-white px-3 text-xs font-semibold text-[#64748B] transition hover:border-slate-300 hover:text-[#101828] disabled:cursor-not-allowed disabled:opacity-50"
          >
            <RotateCcw size={13} />
            Reset
          </button>

          <button
            type="button"
            onClick={onApply}
            className={`flex h-10 flex-[1.5] items-center justify-center gap-1.5 rounded-xl px-3 text-xs font-bold text-white transition active:scale-[0.98] ${
              hasPendingChanges
                ? "bg-[#0755E9] shadow-sm shadow-[#0755E9]/25 hover:bg-[#082B70]"
                : "bg-[#0755E9] hover:bg-[#082B70]"
            }`}
          >
            Apply
            <ArrowRight size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}
