
"use client";

import { AnimatePresence, motion } from "motion/react";
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
    <div className="flex h-full min-h-0 flex-col overflow-hidden rounded-t-[28px] bg-slate-50">
      {/* Header */}
      <div className="shrink-0 rounded-t-[28px] border-b border-slate-100 bg-white px-5 pb-4 pt-3">
        <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-slate-300" />

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
              <SlidersHorizontal size={21} />
            </div>

            <div>
              <h2 className="text-lg font-extrabold tracking-tight text-slate-900">
                Filters
              </h2>
              <p className="text-[11px] text-slate-500">
                Find your perfect product
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {activeCount > 0 && (
              <span className="rounded-full bg-blue-50 px-3 py-1.5 text-[10px] font-bold text-blue-600">
                {activeCount} active
              </span>
            )}

            <button
              type="button"
              onClick={onClose}
              aria-label="Close filters"
              className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-slate-600 transition hover:bg-slate-200"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        <AnimatePresence>
          {activeCount > 0 && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="mt-3 flex items-center justify-between rounded-xl bg-blue-50 px-3 py-2.5">
                <span className="text-[11px] font-semibold text-blue-700">
                  {activeCount} filter sections selected
                </span>

                <button
                  type="button"
                  onClick={onClear}
                  className="text-[10px] font-bold text-blue-700 underline underline-offset-2"
                >
                  Clear
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Scrollable Content */}
      <div className="min-h-0 flex-1 space-y-4 overflow-y-auto overscroll-contain px-4 py-4">
        <MobileSection
          title="Categories"
          subtitle="Select your category"
          icon={Layers3}
        >
          <div className="mb-3 text-right text-[10px] font-semibold text-slate-400">
            {categories.length} available
          </div>

          <CategoryOptions
            categories={categories}
            category={category}
            setCategory={setCategory}
            mobile
          />
        </MobileSection>

        <MobileSection
          title="Brands"
          subtitle="Choose your favorite"
          icon={Tag}
        >
          {brand && (
            <div className="mb-3 flex justify-end">
              <span className="rounded-full bg-blue-50 px-2.5 py-1 text-[10px] font-bold text-blue-600">
                Selected
              </span>
            </div>
          )}

          <BrandOptions
            brands={brands}
            brand={brand}
            setBrand={setBrand}
            mobile
          />
        </MobileSection>

        <MobileSection
          title="Price Range"
          subtitle="Set your shopping budget"
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

      {/* Fixed Footer */}
      <div className="shrink-0 border-t border-slate-200 bg-white px-4 pb-[calc(14px+env(safe-area-inset-bottom))] pt-3">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onClear}
            className="flex h-12 flex-1 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-600 transition hover:bg-slate-50 active:scale-[0.98]"
          >
            <RotateCcw size={15} />
            Reset
          </button>

          <motion.button
            type="button"
            onClick={onApply}
            className="flex h-12 flex-[1.5] items-center justify-center gap-2 rounded-xl bg-blue-600 text-xs font-bold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700"
          >
            Show Products
            <ArrowRight size={16} />
          </motion.button>
        </div>

        <p className="mt-2 text-center text-[10px] text-slate-400">
          Apply your preferences to discover products
        </p>
      </div>
    </div>
  );
}
