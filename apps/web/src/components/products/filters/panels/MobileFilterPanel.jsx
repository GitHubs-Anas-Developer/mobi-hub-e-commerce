"use client";

import {
  SlidersHorizontal,
  X,
  RotateCcw,
  ArrowRight,
  Layers3,
  Tag,
  IndianRupee,
} from "lucide-react";

import CategoryOptions from "../CategoryOptions";
import MobileSection from "../MobileSection";
import BrandOptions from "../BrandOptions";
import PriceOptions from "../PriceOptions";
import { getActiveFilterCount } from "../utils/filterHelpers";

export default function MobileFilterPanel({
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
  onClose,
}) {
  const activeCount = getActiveFilterCount({
    category,
    brand,
    minPrice,
    maxPrice,
  });

  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden rounded-t-[24px] bg-[#F8FAFC]">
      {/* Header */}
      <div className="shrink-0 rounded-t-[24px] border-b border-[#E2E8F0] bg-white px-5 pb-4 pt-3">
        <div className="mx-auto mb-3.5 h-1 w-10 rounded-full bg-slate-300" />

        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#EFF6FF] text-[#0755E9]">
              <SlidersHorizontal size={19} aria-hidden="true" />
            </div>

            <div>
              <h2 className="text-base font-bold tracking-tight text-[#101828]">
                Filter Products
              </h2>
              <p className="text-xs text-[#64748B]">
                Narrow down devices and gadgets
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {activeCount > 0 && (
              <span className="rounded-full bg-[#EFF6FF] px-2.5 py-1 text-[11px] font-bold text-[#0755E9] tabular-nums">
                {activeCount} active
              </span>
            )}

            <button
              type="button"
              onClick={onClose}
              aria-label="Close filters"
              className="flex h-9 w-9 items-center justify-center rounded-full border border-[#E2E8F0] bg-white text-[#64748B] transition hover:bg-slate-100 hover:text-[#101828]"
            >
              <X size={18} />
            </button>
          </div>
        </div>
      </div>

      {/* Scrollable Sections */}
      <div className="min-h-0 flex-1 space-y-3.5 overflow-y-auto overscroll-contain px-4 py-4">
        <MobileSection
          title="Category"
          subtitle="Select a device category"
          icon={Layers3}
        >
          <CategoryOptions
            categories={categories}
            category={category}
            setCategory={setCategory}
            mobile
          />
        </MobileSection>

        <MobileSection
          title="Brand"
          subtitle="Choose your preferred brand"
          icon={Tag}
        >
          <BrandOptions
            brands={brands}
            brand={brand}
            setBrand={setBrand}
            mobile
          />
        </MobileSection>

        <MobileSection
          title="Price Range"
          subtitle="Filter within your budget"
          icon={IndianRupee}
        >
          <PriceOptions
            minPrice={minPrice}
            setMinPrice={setMinPrice}
            maxPrice={maxPrice}
            setMaxPrice={setMaxPrice}
            mobile
          />
        </MobileSection>
      </div>

      {/* Sticky Footer */}
      <div className="shrink-0 border-t border-[#E2E8F0] bg-white px-4 pb-[calc(14px+env(safe-area-inset-bottom))] pt-3">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onClear}
            className="flex h-11 flex-1 items-center justify-center gap-1.5 rounded-xl border border-[#E2E8F0] bg-white text-xs font-bold text-[#64748B] transition hover:bg-slate-50 active:scale-[0.98]"
          >
            <RotateCcw size={14} />
            Reset
          </button>

          <button
            type="button"
            onClick={onApply}
            className="flex h-11 flex-[1.5] items-center justify-center gap-2 rounded-xl bg-[#0755E9] text-xs font-bold text-white shadow-sm shadow-[#0755E9]/25 transition hover:bg-[#082B70] active:scale-[0.98]"
          >
            Show Products
            <ArrowRight size={15} />
          </button>
        </div>
      </div>
    </div>
  );
}
