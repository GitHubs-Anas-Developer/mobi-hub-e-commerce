
"use client";

import { useEffect, useState } from "react";

import {
  AnimatePresence,
  motion,
  useReducedMotion,
} from "motion/react";

import {
  SlidersHorizontal,
  X,
  RotateCcw,
  ChevronDown,
  ChevronUp,
  Check,
  Tag,
  Layers3,
  IndianRupee,
  ArrowRight,
} from "lucide-react";

// ========================================
// CONSTANTS
// ========================================

const priceRanges = [
  { label: "Under ₹500", min: "", max: "500" },
  { label: "₹500 – ₹1,000", min: "500", max: "1000" },
  { label: "₹1,000 – ₹5,000", min: "1000", max: "5000" },
  { label: "Above ₹5,000", min: "5000", max: "" },
];

// ========================================
// PRICE HANDLERS
// ========================================

function updateMinPrice(
  value,
  maxPrice,
  setMinPrice,
  setMaxPrice
) {
  if (value === "") {
    setMinPrice("");
    return;
  }

  const number = Math.max(0, Number(value));

  setMinPrice(String(number));

  if (
    maxPrice !== "" &&
    number > Number(maxPrice)
  ) {
    setMaxPrice(String(number));
  }
}

function updateMaxPrice(
  value,
  minPrice,
  setMinPrice,
  setMaxPrice
) {
  if (value === "") {
    setMaxPrice("");
    return;
  }

  const number = Math.max(0, Number(value));

  setMaxPrice(String(number));

  if (
    minPrice !== "" &&
    number < Number(minPrice)
  ) {
    setMinPrice(String(number));
  }
}

// ========================================
// DESKTOP ACCORDION
// ========================================

function FilterAccordion({
  title,
  subtitle,
  icon: Icon,
  count,
  defaultOpen = true,
  children,
}) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const shouldReduceMotion = useReducedMotion();

  return (
    <section className="border-b border-slate-100 py-4 last:border-b-0">

      <button
        type="button"
        onClick={() => setIsOpen((value) => !value)}
        aria-expanded={isOpen}
        className="flex w-full items-center justify-between gap-3 text-left"
      >
        <div className="flex min-w-0 items-center gap-3">

          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
            <Icon size={17} strokeWidth={1.8} />
          </div>

          <div className="min-w-0">
            <h3 className="text-sm font-bold text-slate-900">
              {title}
            </h3>

            <p className="mt-0.5 text-[10px] text-slate-400">
              {subtitle}
            </p>
          </div>

          {count > 0 && (
            <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-blue-50 px-1.5 text-[10px] font-bold text-blue-600">
              {count}
            </span>
          )}

        </div>

        <motion.span
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{
            duration: shouldReduceMotion ? 0 : 0.2,
          }}
          className="shrink-0 text-slate-400"
        >
          <ChevronDown size={17} />
        </motion.span>

      </button>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={
              shouldReduceMotion
                ? false
                : { height: 0, opacity: 0 }
            }
            animate={{ height: "auto", opacity: 1 }}
            exit={{
              height: shouldReduceMotion ? "auto" : 0,
              opacity: shouldReduceMotion ? 1 : 0,
            }}
            transition={{
              duration: shouldReduceMotion ? 0 : 0.25,
              ease: "easeInOut",
            }}
            className="overflow-hidden"
          >
            <div className="pt-4">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </section>
  );
}

// ========================================
// DESKTOP FILTER PANEL
// ========================================

function DesktopFilterPanel({
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

  const [showAllCategories, setShowAllCategories] =
    useState(false);

  const [showAllBrands, setShowAllBrands] =
    useState(false);

  const activeCount = [
    Boolean(category),
    Boolean(brand),
    Boolean(minPrice || maxPrice),
  ].filter(Boolean).length;

  const visibleCategories = showAllCategories
    ? categories
    : categories.slice(0, 6);

  const visibleBrands = showAllBrands
    ? brands
    : brands.slice(0, 6);

  return (
    <div className="flex h-full min-h-0 flex-col bg-white">

      {/* Desktop Header */}

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

      {/* Desktop Filter Content */}

      <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4">

        {/* Categories */}

        <FilterAccordion
          title="Categories"
          subtitle="Browse by category"
          icon={Layers3}
          count={category ? 1 : 0}
        >

          <div className="space-y-1.5">

            {[
              { _id: "", name: "All Categories" },
              ...visibleCategories,
            ].map((item) => {
              const selected = category === item._id;

              return (
                <label
                  key={item._id || "all-categories"}
                  className={`flex cursor-pointer items-center gap-2.5 rounded-lg px-2.5 py-2.5 transition ${
                    selected
                      ? "bg-blue-50 text-blue-700"
                      : "text-slate-600 hover:bg-slate-50"
                  }`}
                >

                  <input
                    type="radio"
                    name="desktop-product-category"
                    checked={selected}
                    onChange={() => setCategory(item._id)}
                    className="h-4 w-4 accent-blue-600"
                  />

                  <span className={`flex-1 text-xs ${
                    selected ? "font-bold" : "font-medium"
                  }`}>
                    {item.name}
                  </span>

                  {selected && (
                    <Check size={14} className="text-blue-600" />
                  )}

                </label>
              );
            })}

          </div>

          {categories.length > 6 && (
            <button
              type="button"
              onClick={() =>
                setShowAllCategories((value) => !value)
              }
              className="mt-3 flex items-center gap-1 text-xs font-bold text-blue-600"
            >
              {showAllCategories
                ? "Show less"
                : "View all categories"}

              {showAllCategories ? (
                <ChevronUp size={14} />
              ) : (
                <ChevronDown size={14} />
              )}
            </button>
          )}

        </FilterAccordion>

        {/* Brands */}

        <FilterAccordion
          title="Brands"
          subtitle="Select a brand"
          icon={Tag}
          count={brand ? 1 : 0}
        >

          <div className="grid grid-cols-2 gap-2">

            {["", ...visibleBrands].map((item) => {
              const selected = brand === item;

              return (
                <label
                  key={item || "all-brands"}
                  className={`flex min-w-0 cursor-pointer items-center gap-2 rounded-lg border px-2.5 py-2.5 transition ${
                    selected
                      ? "border-blue-200 bg-blue-50 text-blue-700"
                      : "border-slate-200 bg-white text-slate-600 hover:border-blue-200"
                  }`}
                >

                  <input
                    type="radio"
                    name="desktop-product-brand"
                    checked={selected}
                    onChange={() => setBrand(item)}
                    className="h-3.5 w-3.5 shrink-0 accent-blue-600"
                  />

                  <span className="truncate text-[10px] font-semibold">
                    {item || "All Brands"}
                  </span>

                </label>
              );
            })}

          </div>

          {brands.length > 6 && (
            <button
              type="button"
              onClick={() =>
                setShowAllBrands((value) => !value)
              }
              className="mt-3 flex items-center gap-1 text-xs font-bold text-blue-600"
            >
              {showAllBrands
                ? "Show less"
                : "View all brands"}

              {showAllBrands ? (
                <ChevronUp size={14} />
              ) : (
                <ChevronDown size={14} />
              )}
            </button>
          )}

        </FilterAccordion>

        {/* Price */}

        <FilterAccordion
          title="Price Range"
          subtitle="Set your shopping budget"
          icon={IndianRupee}
          count={minPrice || maxPrice ? 1 : 0}
        >

          <div className="grid grid-cols-2 gap-2">

            <label className="min-w-0 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-2.5 focus-within:border-blue-500 focus-within:bg-white focus-within:ring-2 focus-within:ring-blue-50">

              <span className="mb-1 block text-[9px] font-semibold text-slate-400">
                Minimum
              </span>

              <div className="flex items-center gap-1">
                <span className="text-xs text-slate-500">₹</span>

                <input
                  type="number"
                  min="0"
                  value={minPrice}
                  onChange={(event) =>
                    updateMinPrice(
                      event.target.value,
                      maxPrice,
                      setMinPrice,
                      setMaxPrice
                    )
                  }
                  placeholder="0"
                  className="w-full min-w-0 bg-transparent text-xs font-bold text-slate-900 outline-none"
                />
              </div>

            </label>

            <label className="min-w-0 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-2.5 focus-within:border-blue-500 focus-within:bg-white focus-within:ring-2 focus-within:ring-blue-50">

              <span className="mb-1 block text-[9px] font-semibold text-slate-400">
                Maximum
              </span>

              <div className="flex items-center gap-1">
                <span className="text-xs text-slate-500">₹</span>

                <input
                  type="number"
                  min="0"
                  value={maxPrice}
                  onChange={(event) =>
                    updateMaxPrice(
                      event.target.value,
                      minPrice,
                      setMinPrice,
                      setMaxPrice
                    )
                  }
                  placeholder="No limit"
                  className="w-full min-w-0 bg-transparent text-xs font-bold text-slate-900 outline-none"
                />
              </div>

            </label>

          </div>

          <p className="mb-2 mt-4 text-[9px] font-bold uppercase tracking-wider text-slate-400">
            Quick Selection
          </p>

          <div className="grid grid-cols-2 gap-2">

            {priceRanges.map((range) => {
              const selected =
                minPrice === range.min &&
                maxPrice === range.max;

              return (
                <button
                  key={range.label}
                  type="button"
                  onClick={() => {
                    setMinPrice(range.min);
                    setMaxPrice(range.max);
                  }}
                  className={`rounded-lg border px-2 py-2.5 text-left text-[10px] font-semibold transition ${
                    selected
                      ? "border-blue-300 bg-blue-50 text-blue-700"
                      : "border-slate-200 text-slate-600 hover:border-blue-200 hover:bg-blue-50/50"
                  }`}
                >
                  <span className="flex items-center justify-between gap-1">
                    {range.label}

                    {selected && (
                      <Check size={12} className="shrink-0" />
                    )}
                  </span>
                </button>
              );
            })}

          </div>

        </FilterAccordion>

      </div>

      {/* Desktop Footer */}

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

// ========================================
// NEW MOBILE FILTER DESIGN
// ========================================

function MobileFilterPanel({
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
  const shouldReduceMotion = useReducedMotion();

  const [showAllCategories, setShowAllCategories] =
    useState(false);

  const [showAllBrands, setShowAllBrands] =
    useState(false);

  const activeCount = [
    Boolean(category),
    Boolean(brand),
    Boolean(minPrice || maxPrice),
  ].filter(Boolean).length;

  const visibleCategories = showAllCategories
    ? categories
    : categories.slice(0, 6);

  const visibleBrands = showAllBrands
    ? brands
    : brands.slice(0, 6);

  const sectionTransition = {
    duration: shouldReduceMotion ? 0 : 0.35,
    ease: "easeOut",
  };

  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden rounded-t-[28px] bg-slate-50">

      {/* ========================================
          MOBILE HEADER
      ======================================== */}

      <div className="shrink-0 rounded-t-[28px] border-b border-slate-100 bg-white px-5 pb-4 pt-3">

        {/* Drag Handle */}
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

        {/* Active Selection Summary */}

        <AnimatePresence>
          {activeCount > 0 && (
            <motion.div
              initial={
                shouldReduceMotion
                  ? false
                  : { height: 0, opacity: 0 }
              }
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

      {/* ========================================
          MOBILE SCROLL CONTENT
      ======================================== */}

      <div className="min-h-0 flex-1 space-y-4 overflow-y-auto overscroll-contain px-4 py-4">

        {/* CATEGORIES */}

        <motion.section
          initial={
            shouldReduceMotion
              ? false
              : { opacity: 0, y: 14 }
          }
          animate={{ opacity: 1, y: 0 }}
          transition={sectionTransition}
          className="rounded-2xl border border-slate-200/80 bg-white p-4"
        >

          <div className="mb-4 flex items-center justify-between">

            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                <Layers3 size={17} />
              </div>

              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Categories
                </h3>

                <p className="text-[10px] text-slate-400">
                  Select your category
                </p>
              </div>
            </div>

            <span className="text-[10px] font-semibold text-slate-400">
              {categories.length} available
            </span>

          </div>

          <div className="space-y-2">

            {/* All Categories */}

            <button
              type="button"
              onClick={() => setCategory("")}
              aria-pressed={!category}
              className={`flex w-full items-center justify-between rounded-xl border px-3.5 py-3 transition-all ${
                !category
                  ? "border-blue-300 bg-blue-50"
                  : "border-slate-200 bg-white active:bg-slate-50"
              }`}
            >

              <div className="flex items-center gap-3">

                <span className={`flex h-5 w-5 items-center justify-center rounded-full border ${
                  !category
                    ? "border-blue-600 bg-blue-600"
                    : "border-slate-300"
                }`}>
                  {!category && (
                    <span className="h-2 w-2 rounded-full bg-white" />
                  )}
                </span>

                <span className={`text-xs ${
                  !category
                    ? "font-bold text-blue-700"
                    : "font-medium text-slate-700"
                }`}>
                  All Categories
                </span>

              </div>

              {!category && (
                <Check size={16} className="text-blue-600" />
              )}

            </button>

            {/* Category Options */}

            <div className="grid grid-cols-2 gap-2">

              {visibleCategories.map((item, index) => {
                const selected = category === item._id;

                return (
                  <motion.button
                    key={item._id}
                    type="button"
                    onClick={() => setCategory(item._id)}
                    aria-pressed={selected}
                    initial={
                      shouldReduceMotion
                        ? false
                        : { opacity: 0, y: 8 }
                    }
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                      duration: shouldReduceMotion ? 0 : 0.25,
                      delay: shouldReduceMotion
                        ? 0
                        : Math.min(index * 0.035, 0.2),
                    }}
                    className={`flex min-w-0 items-center justify-between gap-2 rounded-xl border px-2.5 py-3 text-left transition-all ${
                      selected
                        ? "border-blue-300 bg-blue-50 text-blue-700"
                        : "border-slate-200 bg-white text-slate-600 active:bg-slate-50"
                    }`}
                  >

                    <span className={`truncate text-[11px] ${
                      selected ? "font-bold" : "font-medium"
                    }`}>
                      {item.name}
                    </span>

                    {selected && (
                      <Check size={14} className="shrink-0 text-blue-600" />
                    )}

                  </motion.button>
                );
              })}

            </div>

          </div>

          {categories.length > 6 && (
            <button
              type="button"
              onClick={() =>
                setShowAllCategories((value) => !value)
              }
              className="mt-3 flex items-center gap-1.5 text-xs font-bold text-blue-600"
            >
              {showAllCategories
                ? "Show less"
                : "View all categories"}

              {showAllCategories ? (
                <ChevronUp size={14} />
              ) : (
                <ChevronDown size={14} />
              )}
            </button>
          )}

        </motion.section>

        {/* BRANDS */}

        <motion.section
          initial={
            shouldReduceMotion
              ? false
              : { opacity: 0, y: 14 }
          }
          animate={{ opacity: 1, y: 0 }}
          transition={{
            ...sectionTransition,
            delay: shouldReduceMotion ? 0 : 0.08,
          }}
          className="rounded-2xl border border-slate-200/80 bg-white p-4"
        >

          <div className="mb-4 flex items-center justify-between">

            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-50 text-violet-600">
                <Tag size={17} />
              </div>

              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Brands
                </h3>

                <p className="text-[10px] text-slate-400">
                  Choose your favorite
                </p>
              </div>
            </div>

            {brand && (
              <span className="rounded-full bg-violet-50 px-2.5 py-1 text-[10px] font-bold text-violet-600">
                Selected
              </span>
            )}

          </div>

          {/* Brand Options */}

          <div className="grid grid-cols-2 gap-2">

            {["", ...visibleBrands].map((item) => {
              const selected = brand === item;

              return (
                <motion.button
                  key={item || "all-brands-mobile"}
                  type="button"
                  onClick={() => setBrand(item)}
                  aria-pressed={selected}
                  whileTap={
                    shouldReduceMotion
                      ? undefined
                      : { scale: 0.97 }
                  }
                  className={`flex min-w-0 items-center justify-between gap-2 rounded-xl border px-3 py-3 text-left transition-all ${
                    selected
                      ? "border-blue-300 bg-blue-50 text-blue-700"
                      : "border-slate-200 bg-white text-slate-600"
                  }`}
                >

                  <span className={`truncate text-[11px] ${
                    selected ? "font-bold" : "font-semibold"
                  }`}>
                    {item || "All Brands"}
                  </span>

                  {selected && (
                    <Check size={14} className="shrink-0 text-blue-600" />
                  )}

                </motion.button>
              );
            })}

          </div>

          {brands.length === 0 && (
            <p className="mt-3 text-xs text-slate-400">
              No brands available
            </p>
          )}

          {brands.length > 6 && (
            <button
              type="button"
              onClick={() =>
                setShowAllBrands((value) => !value)
              }
              className="mt-3 flex items-center gap-1.5 text-xs font-bold text-blue-600"
            >
              {showAllBrands
                ? "Show less"
                : "View all brands"}

              {showAllBrands ? (
                <ChevronUp size={14} />
              ) : (
                <ChevronDown size={14} />
              )}
            </button>
          )}

        </motion.section>

        {/* PRICE RANGE */}

        <motion.section
          initial={
            shouldReduceMotion
              ? false
              : { opacity: 0, y: 14 }
          }
          animate={{ opacity: 1, y: 0 }}
          transition={{
            ...sectionTransition,
            delay: shouldReduceMotion ? 0 : 0.16,
          }}
          className="rounded-2xl border border-slate-200/80 bg-white p-4"
        >

          <div className="mb-4 flex items-center gap-2.5">

            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
              <IndianRupee size={17} />
            </div>

            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Price Range
              </h3>

              <p className="text-[10px] text-slate-400">
                Set your shopping budget
              </p>
            </div>

          </div>

          {/* Min and Max */}

          <div className="grid grid-cols-2 gap-3">

            <label className="min-w-0 rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 transition focus-within:border-blue-500 focus-within:bg-white focus-within:ring-2 focus-within:ring-blue-50">

              <span className="mb-1.5 block text-[10px] font-semibold text-slate-400">
                Minimum Price
              </span>

              <div className="flex items-center gap-1.5">
                <span className="text-sm font-semibold text-slate-500">
                  ₹
                </span>

                <input
                  type="number"
                  min="0"
                  value={minPrice}
                  onChange={(event) =>
                    updateMinPrice(
                      event.target.value,
                      maxPrice,
                      setMinPrice,
                      setMaxPrice
                    )
                  }
                  placeholder="0"
                  className="w-full min-w-0 bg-transparent text-sm font-bold text-slate-900 outline-none"
                />
              </div>

            </label>

            <label className="min-w-0 rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 transition focus-within:border-blue-500 focus-within:bg-white focus-within:ring-2 focus-within:ring-blue-50">

              <span className="mb-1.5 block text-[10px] font-semibold text-slate-400">
                Maximum Price
              </span>

              <div className="flex items-center gap-1.5">
                <span className="text-sm font-semibold text-slate-500">
                  ₹
                </span>

                <input
                  type="number"
                  min="0"
                  value={maxPrice}
                  onChange={(event) =>
                    updateMaxPrice(
                      event.target.value,
                      minPrice,
                      setMinPrice,
                      setMaxPrice
                    )
                  }
                  placeholder="No limit"
                  className="w-full min-w-0 bg-transparent text-sm font-bold text-slate-900 outline-none"
                />
              </div>

            </label>

          </div>

          {/* Quick Price Selection */}

          <div className="mt-5">

            <div className="mb-3 flex items-center justify-between">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Quick Selection
              </p>

              <span className="text-[10px] text-slate-400">
                Choose one
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2">

              {priceRanges.map((range) => {
                const selected =
                  minPrice === range.min &&
                  maxPrice === range.max;

                return (
                  <motion.button
                    key={range.label}
                    type="button"
                    onClick={() => {
                      setMinPrice(range.min);
                      setMaxPrice(range.max);
                    }}
                    whileTap={
                      shouldReduceMotion
                        ? undefined
                        : { scale: 0.97 }
                    }
                    className={`flex items-center justify-between gap-2 rounded-xl border px-3 py-3 text-left transition-all ${
                      selected
                        ? "border-blue-300 bg-blue-50 text-blue-700"
                        : "border-slate-200 bg-white text-slate-600 hover:border-blue-200"
                    }`}
                  >

                    <span className="text-[11px] font-semibold">
                      {range.label}
                    </span>

                    {selected && (
                      <Check size={14} className="shrink-0 text-blue-600" />
                    )}

                  </motion.button>
                );
              })}

            </div>

          </div>

        </motion.section>

      </div>

      {/* ========================================
          MOBILE FIXED FOOTER
      ======================================== */}

      <div className="shrink-0 border-t border-slate-200 bg-white px-4 pb-[calc(14px+env(safe-area-inset-bottom))] pt-3">

        <div className="flex items-center gap-3">

          {/* Reset */}

          <button
            type="button"
            onClick={onClear}
            className="flex h-12 flex-1 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-600 transition hover:bg-slate-50 active:scale-[0.98]"
          >
            <RotateCcw size={15} />
            Reset
          </button>

          {/* Apply */}

          <motion.button
            type="button"
            onClick={onApply}
            whileTap={
              shouldReduceMotion
                ? undefined
                : { scale: 0.97 }
            }
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

// ========================================
// MAIN PRODUCT FILTERS
// ========================================

export default function ProductFilters({
  categories = [],
  brands = [],

  category = "",
  brand = "",

  minPrice = "",
  maxPrice = "",

  onApply,

  showFilters = false,
  onClose,
}) {
  // Draft State
  const [draftCategory, setDraftCategory] = useState(category);
  const [draftBrand, setDraftBrand] = useState(brand);
  const [draftMinPrice, setDraftMinPrice] = useState(minPrice);
  const [draftMaxPrice, setDraftMaxPrice] = useState(maxPrice);

  const shouldReduceMotion = useReducedMotion();

  // Sync applied filters
  useEffect(() => {
    setDraftCategory(category);
    setDraftBrand(brand);
    setDraftMinPrice(minPrice);
    setDraftMaxPrice(maxPrice);
  }, [
    category,
    brand,
    minPrice,
    maxPrice,
  ]);

  // Lock background scroll when mobile drawer opens
  useEffect(() => {
    if (!showFilters) return;

    const previousOverflow = document.body.style.overflow;

    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [showFilters]);

  // Apply filters
  const handleApply = () => {
    onApply?.({
      category: draftCategory,
      brand: draftBrand,
      minPrice: draftMinPrice,
      maxPrice: draftMaxPrice,
    });

    onClose?.();
  };

  // Reset draft only
  const handleReset = () => {
    setDraftCategory("");
    setDraftBrand("");
    setDraftMinPrice("");
    setDraftMaxPrice("");
  };

  const panelProps = {
    categories,
    brands,

    category: draftCategory,
    setCategory: setDraftCategory,

    brand: draftBrand,
    setBrand: setDraftBrand,

    minPrice: draftMinPrice,
    setMinPrice: setDraftMinPrice,

    maxPrice: draftMaxPrice,
    setMaxPrice: setDraftMaxPrice,

    onApply: handleApply,
    onClear: handleReset,
    onClose,
  };

  return (
    <>
      {/* ========================================
          DESKTOP SIDEBAR
      ======================================== */}

      <motion.aside
        initial={
          shouldReduceMotion
            ? false
            : { opacity: 0, x: -14 }
        }
        whileInView={{
          opacity: 1,
          x: 0,
        }}
        viewport={{ once: true }}
        transition={{
          duration: shouldReduceMotion ? 0 : 0.4,
          ease: "easeOut",
        }}
        className="hidden min-w-0 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm lg:sticky lg:top-24 lg:flex lg:max-h-[calc(100vh-7rem)] lg:flex-col"
      >
        <DesktopFilterPanel {...panelProps} />
      </motion.aside>

      {/* ========================================
          MOBILE BOTTOM SHEET
      ======================================== */}

      <AnimatePresence>
        {showFilters && (
          <motion.div
            key="mobile-filter-drawer"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{
              duration: shouldReduceMotion ? 0 : 0.2,
            }}
            className="fixed inset-0 z-[100] lg:hidden"
          >

            {/* Backdrop */}

            <motion.button
              type="button"
              aria-label="Close filters"
              onClick={onClose}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 h-full w-full bg-slate-950/45 backdrop-blur-[2px]"
            />

            {/* Bottom Sheet */}

            <motion.aside
              role="dialog"
              aria-modal="true"
              aria-label="Product filters"
              initial={
                shouldReduceMotion
                  ? false
                  : { y: "100%" }
              }
              animate={{ y: 0 }}
              exit={{
                y: shouldReduceMotion ? 0 : "100%",
              }}
              transition={{
                duration: shouldReduceMotion ? 0 : 0.4,
                ease: [0.22, 1, 0.36, 1],
              }}
              className="absolute inset-x-0 bottom-0 flex max-h-[94dvh] min-h-[70dvh] flex-col overflow-hidden rounded-t-[28px] bg-white shadow-2xl"
            >
              <MobileFilterPanel {...panelProps} />
            </motion.aside>

          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
