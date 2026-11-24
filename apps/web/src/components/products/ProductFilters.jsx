
"use client";

import { useEffect, useMemo, useState } from "react";

import {
  AnimatePresence,
  motion,
  useReducedMotion,
} from "motion/react";
import DesktopFilterPanel from "./filters/panels/DesktopFilterPanel";
import MobileFilterPanel from "./filters/panels/MobileFilterPanel";



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
  const shouldReduceMotion = useReducedMotion();

  // Draft filter state
  const [draftCategory, setDraftCategory] = useState(category);
  const [draftBrand, setDraftBrand] = useState(brand);
  const [draftMinPrice, setDraftMinPrice] = useState(minPrice);
  const [draftMaxPrice, setDraftMaxPrice] = useState(maxPrice);

  // Normalize incoming categories
  const safeCategories = useMemo(
    () =>
      Array.isArray(categories)
        ? categories.filter((item) => item?._id)
        : [],
    [categories]
  );

  // Normalize incoming brands
  const safeBrands = useMemo(
    () =>
      Array.isArray(brands)
        ? [
            ...new Set(
              brands
                .map((item) =>
                  typeof item === "string" ? item : item?.name
                )
                .filter(Boolean)
            ),
          ]
        : [],
    [brands]
  );

  // Sync draft state when applied filters change
  useEffect(() => {
    setDraftCategory(category || "");
    setDraftBrand(brand || "");

    setDraftMinPrice(
      minPrice === null || minPrice === undefined
        ? ""
        : String(minPrice)
    );

    setDraftMaxPrice(
      maxPrice === null || maxPrice === undefined
        ? ""
        : String(maxPrice)
    );
  }, [category, brand, minPrice, maxPrice]);

  // Lock background scrolling when mobile drawer is open
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

  // Apply selected filters
  const handleApply = () => {
    onApply?.({
      category: draftCategory,
      brand: draftBrand,
      minPrice: draftMinPrice,
      maxPrice: draftMaxPrice,
    });

    onClose?.();
  };

  // Reset draft filters
  const handleReset = () => {
    setDraftCategory("");
    setDraftBrand("");
    setDraftMinPrice("");
    setDraftMaxPrice("");
  };

  // Shared props for desktop and mobile panels
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
  };

  return (
    <>
      {/* Desktop Sidebar */}
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
        className="
          hidden min-w-0 overflow-hidden
          rounded-2xl border border-slate-200
          bg-white shadow-sm
          lg:sticky lg:top-24 lg:flex
          lg:max-h-[calc(100vh-7rem)] lg:flex-col
        "
      >
        <DesktopFilterPanel {...panelProps} />
      </motion.aside>

      {/* Mobile Bottom Sheet */}
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
              className="
                absolute inset-x-0 bottom-0
                flex max-h-[94dvh] min-h-[70dvh]
                flex-col overflow-hidden
                rounded-t-[28px] bg-white shadow-2xl
              "
            >
              <MobileFilterPanel {...panelProps} />
            </motion.aside>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
