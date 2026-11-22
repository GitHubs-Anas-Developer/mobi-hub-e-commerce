
"use client";

import { useId, useMemo } from "react";
import { motion, useReducedMotion } from "motion/react";

export default function SubCategoryTabs({
  subCategories = [],
  selectedSubCategory = "",
  onSelect,
}) {
  const shouldReduceMotion = useReducedMotion();
  const activeLayoutId = useId();

  // Prepare tabs
  const tabs = useMemo(
    () => [
      {
        _id: "",
        name: "All",
      },
      ...subCategories.filter((item) => item?._id),
    ],
    [subCategories]
  );

  // No subcategories available
  if (!subCategories.length) return null;

  return (
    <section
      className="mb-6 w-full min-w-0"
      aria-label="Filter by subcategory"
    >
      {/* Subcategory Navigation */}
      <div
        className="
          flex w-full items-center gap-2
          overflow-x-auto overscroll-x-contain
          scroll-smooth px-1 py-1
          [scrollbar-width:none]
          [&::-webkit-scrollbar]:hidden
          sm:gap-2.5
        "
      >
        {tabs.map((item) => {
          const isSelected =
            selectedSubCategory === item._id;

          return (
            <motion.button
              key={item._id || "all"}
              type="button"
              onClick={() => onSelect?.(item._id)}
              aria-pressed={isSelected}
              initial={false}
              whileHover={
                shouldReduceMotion
                  ? undefined
                  : { y: -2 }
              }
              whileTap={
                shouldReduceMotion
                  ? undefined
                  : { scale: 0.96 }
              }
              transition={{
                duration: shouldReduceMotion ? 0 : 0.2,
              }}
              className={`
                relative flex min-h-9 shrink-0
                items-center justify-center overflow-hidden
                rounded-full border px-4 py-2
                text-xs font-semibold outline-none
                transition-colors duration-200
                focus-visible:ring-2
                focus-visible:ring-blue-500
                focus-visible:ring-offset-2
                sm:min-h-10 sm:px-5 sm:text-[13px]
                ${
                  isSelected
                    ? "border-blue-600 text-white"
                    : "border-slate-200 bg-white text-slate-600 hover:border-blue-300 hover:bg-blue-50 hover:text-blue-600"
                }
              `}
            >
              {/* Animated Active Background */}
              {isSelected && (
                <motion.span
                  layoutId={activeLayoutId}
                  className="absolute inset-0 rounded-full bg-blue-600"
                  transition={
                    shouldReduceMotion
                      ? { duration: 0 }
                      : {
                          type: "spring",
                          stiffness: 450,
                          damping: 35,
                        }
                  }
                />
              )}

              {/* Tab Label */}
              <span className="relative z-10 whitespace-nowrap">
                {item.name || "Subcategory"}
              </span>
            </motion.button>
          );
        })}
      </div>
    </section>
  );
}
