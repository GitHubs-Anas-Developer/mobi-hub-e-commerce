
"use client";

import Image from "next/image";
import { motion, useReducedMotion } from "motion/react";
import { LayoutGrid, Package, ArrowRight } from "lucide-react";

export default function ProductCategoryCards({
  categories = [],
  selectedCategory = "",
  onCategorySelect,
}) {
  const shouldReduceMotion = useReducedMotion();

  const getCategoryImage = (item) => {
    if (typeof item.image === "string") return item.image;

    return (
      item.image?.url ||
      item.thumbnail?.url ||
      (typeof item.thumbnail === "string" ? item.thumbnail : "") ||
      item.images?.[0]?.url ||
      (typeof item.images?.[0] === "string"
        ? item.images[0]
        : "") ||
      ""
    );
  };

  const categoryItems = [
    { id: "all", name: "All Products", image: null },
    ...categories.map((item) => ({
      id: item._id,
      name: item.name || "Category",
      image: getCategoryImage(item),
    })),
  ];

  return (
    <section className="w-full min-w-0 py-4 sm:py-5">
      
      {/* Header */}
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold tracking-tight text-slate-900 sm:text-xl">
            Shop by Category
          </h2>
          <p className="mt-1 text-xs text-slate-500 sm:text-sm">
            Explore our mobile accessories collection
          </p>
        </div>

        <span className="hidden items-center gap-1 text-sm font-semibold text-blue-600 sm:flex">
          Explore <ArrowRight size={16} />
        </span>
      </div>

      {/* Category Slider */}
      <div className="flex gap-3 overflow-x-auto overscroll-x-contain scroll-smooth pb-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:gap-4">

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
              initial={shouldReduceMotion ? false : {
                opacity: 0,
                y: 15,
              }}
              whileInView={{
                opacity: 1,
                y: 0,
              }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{
                duration: shouldReduceMotion ? 0 : 0.4,
                delay: shouldReduceMotion ? 0 : Math.min(index * 0.04, 0.2),
              }}
              whileTap={shouldReduceMotion ? undefined : {
                scale: 0.97,
              }}
              className={`group w-[145px] shrink-0 overflow-hidden rounded-2xl border  text-left transition-all duration-300 sm:w-[175px] lg:w-[190px] ${
                isSelected
                  ? "border-blue-600 shadow-md shadow-blue-100"
                  : "border-slate-200 hover:border-blue-300 hover:shadow-md"
              }`}
            >

              {/* Image */}
              <div className="relative aspect-[5/4] w-full overflow-hidden ">

                {isAll ? (
                  <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100">
                    <LayoutGrid
                      size={42}
                      strokeWidth={1.5}
                      className="text-blue-600"
                    />
                  </div>
                ) : item.image ? (
                  <Image
                    src={item.image}
                    alt={item.name}
                    fill
                    sizes="(max-width: 640px) 145px, 190px"
                    className="object-contain p-2 transition-transform duration-500 group-hover:scale-105"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center">
                    <Package size={38} className="text-slate-400" />
                  </div>
                )}

                {/* Selected Indicator */}
                {isSelected && (
                  <span className="absolute right-2 top-2 flex h-5 w-5 items-center justify-center rounded-full bg-blue-600 text-white shadow-sm">
                    <span className="text-xs">✓</span>
                  </span>
                )}

              </div>

              {/* Category Name */}
              <div className="flex min-h-[52px] items-center justify-between gap-2 px-3 py-2.5">
                <span
                  className={`line-clamp-2 text-xs font-semibold leading-snug sm:text-sm ${
                    isSelected
                      ? "text-blue-600"
                      : "text-slate-800"
                  }`}
                >
                  {item.name}
                </span>

                <ArrowRight
                  size={15}
                  className={`shrink-0 transition-transform duration-300 ${
                    isSelected
                      ? "translate-x-0 text-blue-600"
                      : "text-slate-400 group-hover:translate-x-1 group-hover:text-blue-600"
                  }`}
                />
              </div>

            </motion.button>
          );
        })}

      </div>
    </section>
  );
}
