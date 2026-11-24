
"use client";

import { motion, useReducedMotion } from "motion/react";
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
}) {
  const shouldReduceMotion = useReducedMotion();

  const activeCount = getActiveFilterCount({
    category,
    brand,
    minPrice,
    maxPrice,
  });

  return (
    <div className="flex h-full min-h-0 flex-col bg-white">
      {/* Header */}
      <div className="flex shrink-0 items-center justify-between border-b border-slate-100 px-4 py-4">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600 text-white shadow-sm shadow-blue-600/20">
            <SlidersHorizontal size={17} />
          </div>

          <div>
            <h2 className="text-sm font-extrabold text-slate-900">
              Filters
            </h2>
            <p className="text-[10px] text-slate-400">
              Refine your products
            </p>
          </div>
        </div>

        {activeCount > 0 && (
          <span className="rounded-full bg-blue-50 px-2.5 py-1 text-[10px] font-bold text-blue-600">
            {activeCount} selected
          </span>
        )}
      </div>

      {/* Filter Content */}
      <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4">
        <FilterAccordion
          title="Categories"
          subtitle="Browse by category"
          icon={Layers3}
          count={category ? 1 : 0}
        >
          <CategoryOptions
            categories={categories}
            category={category}
            setCategory={setCategory}
          />
        </FilterAccordion>

        <FilterAccordion
          title="Brands"
          subtitle="Select a brand"
          icon={Tag}
          count={brand ? 1 : 0}
        >
          <BrandOptions
            brands={brands}
            brand={brand}
            setBrand={setBrand}
          />
        </FilterAccordion>

        <FilterAccordion
          title="Price Range"
          subtitle="Set your shopping budget"
          icon={IndianRupee}
          count={minPrice || maxPrice ? 1 : 0}
        >
          <PriceOptions
            minPrice={minPrice}
            setMinPrice={setMinPrice}
            maxPrice={maxPrice}
            setMaxPrice={setMaxPrice}
          />
        </FilterAccordion>
      </div>

      {/* Footer */}
      <div className="shrink-0 border-t border-slate-100 bg-white p-3.5">
        <div className="flex gap-2">
          <button
            type="button"
            onClick={onClear}
            className="flex h-10 flex-1 items-center justify-center gap-1.5 rounded-lg border border-slate-200 text-xs font-bold text-slate-600 transition hover:bg-slate-50"
          >
            <RotateCcw size={13} />
            Reset
          </button>

          <motion.button
            type="button"
            onClick={onApply}
            whileHover={
              shouldReduceMotion ? undefined : { scale: 1.02 }
            }
            whileTap={
              shouldReduceMotion ? undefined : { scale: 0.97 }
            }
            className="flex h-10 flex-[1.4] items-center justify-center gap-1.5 rounded-lg bg-blue-600 text-xs font-bold text-white shadow-sm shadow-blue-600/20 transition hover:bg-blue-700"
          >
            Apply Filters
            <ArrowRight size={14} />
          </motion.button>
        </div>
      </div>
    </div>
  );
}
