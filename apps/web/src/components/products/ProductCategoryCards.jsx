
"use client";

import Image from "next/image";
import { motion, useReducedMotion } from "motion/react";

import {
  LayoutGrid,
  Package,
  Check,
} from "lucide-react";

export default function ProductCategoryCards({
  categories = [],
  selectedCategory = "",
  onCategorySelect,
}) {
  const shouldReduceMotion = useReducedMotion();

  // Get category image
  const getCategoryImage = (item) => {
    if (typeof item.image === "string") {
      return item.image;
    }

    return (
      item.image?.url ||
      item.thumbnail?.url ||
      (typeof item.thumbnail === "string"
        ? item.thumbnail
        : "") ||
      item.images?.[0]?.url ||
      (typeof item.images?.[0] === "string"
        ? item.images[0]
        : "") ||
      ""
    );
  };

  // Category Data
  const categoryItems = [
    {
      id: "all",
      name: "All Products",
      image: null,
    },
    ...categories.map((item) => ({
      id: item._id,
      name: item.name || "Category",
      image: getCategoryImage(item),
    })),
  ];

  // Motion Settings
  const cardInitial = shouldReduceMotion
    ? false
    : {
        opacity: 0,
        y: 15,
      };

  const cardTransition = {
    duration: shouldReduceMotion ? 0 : 0.4,
    ease: "easeOut",
  };

  return (
    <section
      className="w-full min-w-0 py-3 "
      aria-label="Shop by category"
    >
      {/* Horizontal Category Slider */}
      <div className="flex w-full min-w-0 items-start gap-4 overflow-x-auto overscroll-x-contain scroll-smooth px-3 pb-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:gap-5 sm:px-4 lg:gap-6 lg:px-5">

        {categoryItems.map((item, index) => {
          const isAll = item.id === "all";

          const isSelected = isAll
            ? !selectedCategory
            : selectedCategory === item.id;

          return (
            <motion.button
              key={item.id}
              type="button"
              onClick={() =>
                onCategorySelect?.(isAll ? "" : item.id)
              }
              aria-label={`Select ${item.name}`}
              aria-pressed={isSelected}
              initial={cardInitial}
              whileInView={{
                opacity: 1,
                y: 0,
              }}
              viewport={{
                once: true,
                amount: 0.3,
              }}
              transition={{
                ...cardTransition,
                delay: shouldReduceMotion
                  ? 0
                  : Math.min(index * 0.05, 0.3),
              }}
              whileHover={
                shouldReduceMotion
                  ? undefined
                  : { y: -3 }
              }
              whileTap={
                shouldReduceMotion
                  ? undefined
                  : { scale: 0.96 }
              }
              className="group flex w-[76px] shrink-0 flex-col items-center gap-2 pt-2 text-center outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-4 sm:w-[88px] lg:w-[96px]"
            >
              {/* Category Image */}
              <div
                className={`relative flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-full transition-all duration-300 sm:h-[72px] sm:w-[72px] lg:h-20 lg:w-20 ${
                  isSelected
                    ? "bg-blue-50 ring-2 ring-blue-600 ring-offset-2"
                    : "bg-slate-100 ring-1 ring-slate-200 group-hover:bg-blue-50 group-hover:ring-blue-300"
                }`}
              >
                {isAll ? (
                  <div
                    className={`flex h-full w-full items-center justify-center rounded-full transition-colors duration-300 ${
                      isSelected
                        ? "bg-blue-600 text-white"
                        : "bg-slate-100 text-slate-500 group-hover:bg-blue-600 group-hover:text-white"
                    }`}
                  >
                    <LayoutGrid
                      size={25}
                      strokeWidth={1.7}
                    />
                  </div>
                ) : item.image ? (
                  <Image
                    src={item.image}
                    alt={item.name}
                    fill
                    sizes="(max-width: 640px) 64px, (max-width: 1024px) 72px, 80px"
                    className="rounded-full object-contain p-2 sm:p-2.5"
                  />
                ) : (
                  <Package
                    size={26}
                    strokeWidth={1.5}
                    className={
                      isSelected
                        ? "text-blue-600"
                        : "text-slate-400"
                    }
                  />
                )}

                {/* Selected Check */}
                {isSelected && (
                  <span className="absolute -right-0.5 -top-0.5 z-10 flex h-5 w-5 items-center justify-center rounded-full border-2 border-white bg-blue-600 text-white shadow-sm">
                    <Check size={11} strokeWidth={3} />
                  </span>
                )}
              </div>

              {/* Category Name */}
              <span
                className={`w-full truncate text-[10px] leading-tight transition-colors sm:text-xs ${
                  isSelected
                    ? "font-bold text-blue-600"
                    : "font-medium text-slate-600 group-hover:text-blue-600"
                }`}
              >
                {item.name}
              </span>

              {/* Active Indicator */}
              <motion.span
                animate={{
                  width: isSelected ? 20 : 0,
                  opacity: isSelected ? 1 : 0,
                }}
                transition={{
                  duration: shouldReduceMotion ? 0 : 0.25,
                }}
                className="h-1 rounded-full bg-blue-600"
              />
            </motion.button>
          );
        })}
      </div>
    </section>
  );
}
