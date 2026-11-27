"use client";

import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";

import DesktopFilterPanel from "./filters/panels/DesktopFilterPanel";
import MobileFilterPanel from "./filters/panels/MobileFilterPanel";
import { normalizePrice } from "./filters/utils/filterHelpers";

export default function ProductFilters({
  categories = [],
  brands = [],
  category = "",
  brand = "",
  minPrice = "",
  maxPrice = "",
  onApply,
  onClear,
  showFilters = false,
  onClose,
}) {
  const shouldReduceMotion = useReducedMotion();

  const [draftCategory, setDraftCategory] = useState(category || "");
  const [draftBrand, setDraftBrand] = useState(brand || "");
  const [draftMinPrice, setDraftMinPrice] = useState(normalizePrice(minPrice));
  const [draftMaxPrice, setDraftMaxPrice] = useState(normalizePrice(maxPrice));

  useEffect(() => {
    setDraftCategory(category || "");
  }, [category]);

  useEffect(() => {
    setDraftBrand(brand || "");
  }, [brand]);

  useEffect(() => {
    setDraftMinPrice(normalizePrice(minPrice));
  }, [minPrice]);

  useEffect(() => {
    setDraftMaxPrice(normalizePrice(maxPrice));
  }, [maxPrice]);

  useEffect(() => {
    if (!showFilters) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        onClose?.();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [showFilters, onClose]);

  const safeCategories = useMemo(
    () => (Array.isArray(categories) ? categories.filter((c) => c?._id) : []),
    [categories]
  );

  const safeBrands = useMemo(
    () =>
      Array.from(
        new Set(
          (Array.isArray(brands) ? brands : [])
            .map((item) => String(item || "").trim())
            .filter(Boolean)
        )
      ),
    [brands]
  );

  const hasPendingChanges =
    draftCategory !== (category || "") ||
    draftBrand !== (brand || "") ||
    draftMinPrice !== normalizePrice(minPrice) ||
    draftMaxPrice !== normalizePrice(maxPrice);

  const handleApply = () => {
    let min = normalizePrice(draftMinPrice);
    let max = normalizePrice(draftMaxPrice);

    if (min !== "" && max !== "" && Number(min) > Number(max)) {
      const temp = min;
      min = max;
      max = temp;
      setDraftMinPrice(min);
      setDraftMaxPrice(max);
    }

    onApply?.({
      category: draftCategory,
      brand: draftBrand,
      minPrice: min,
      maxPrice: max,
    });

    onClose?.();
  };

  const handleReset = () => {
    setDraftCategory("");
    setDraftBrand("");
    setDraftMinPrice("");
    setDraftMaxPrice("");
    onClear?.();
  };

  const panelProps = {
    categories: safeCategories,
    brands: safeBrands,
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
    hasPendingChanges,
  };

  return (
    <>
      {/* Desktop Sticky Sidebar */}
      <aside className="hidden min-w-0 overflow-hidden rounded-2xl border border-[#E2E8F0] bg-white lg:sticky lg:top-24 lg:flex lg:max-h-[calc(100vh-7rem)] lg:flex-col">
        <DesktopFilterPanel {...panelProps} />
      </aside>

      {/* Mobile Bottom Sheet Drawer */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            key="mobile-filter-drawer"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: shouldReduceMotion ? 0 : 0.2 }}
            className="fixed inset-0 z-[100] lg:hidden"
          >
            <motion.button
              type="button"
              aria-label="Close filters"
              onClick={onClose}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 h-full w-full bg-slate-950/45 backdrop-blur-[2px]"
            />

            <motion.aside
              role="dialog"
              aria-modal="true"
              aria-label="Product filters"
              initial={shouldReduceMotion ? false : { y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: shouldReduceMotion ? 0 : "100%" }}
              transition={{
                duration: shouldReduceMotion ? 0 : 0.35,
                ease: [0.22, 1, 0.36, 1],
              }}
              className="absolute inset-x-0 bottom-0 flex max-h-[90dvh] min-h-[65dvh] flex-col rounded-t-[24px] bg-white shadow-2xl"
            >
              <MobileFilterPanel {...panelProps} />
            </motion.aside>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
