
"use client";

import { useMemo, useRef } from "react";
import Image from "next/image";
import { motion, useReducedMotion } from "motion/react";

import {
  LayoutGrid,
  Package,
  ArrowRight,
  Check,
} from "lucide-react";

// ========================================
// CATEGORY IMAGE HELPER
// ========================================

const getCategoryImage = (item) => {
  if (typeof item?.image === "string") {
    return item.image;
  }

  return (
    item?.image?.url ||
    item?.image?.secure_url ||
    item?.thumbnail?.url ||
    (typeof item?.thumbnail === "string"
      ? item.thumbnail
      : "") ||
    item?.images?.[0]?.url ||
    (typeof item?.images?.[0] === "string"
      ? item.images[0]
      : "") ||
    ""
  );
};

// ========================================
// PRODUCT CATEGORY CARDS
// ========================================

export default function ProductCategoryCards({
  categories = [],
  selectedCategory = "",
  onCategorySelect,
}) {
  const shouldReduceMotion = useReducedMotion();

  const scrollRef = useRef(null);

  const dragState = useRef({
    isDragging: false,
    startX: 0,
    scrollLeft: 0,
    moved: false,
  });

  // ========================================
  // CATEGORY DATA
  // ========================================

  const categoryItems = useMemo(() => {
    const validCategories = categories
      .filter((item) => item?._id)
      .map((item) => ({
        id: String(item._id),
        name: item.name || "Category",
        image: getCategoryImage(item),
      }));

    return [
      {
        id: "all",
        name: "All Products",
        image: null,
      },
      ...validCategories,
    ];
  }, [categories]);

  // ========================================
  // MOUSE DRAG START
  // ========================================

  const handleMouseDown = (event) => {
    if (event.button !== 0) return;

    const container = scrollRef.current;

    if (!container) return;

    dragState.current = {
      isDragging: true,
      startX: event.clientX,
      scrollLeft: container.scrollLeft,
      moved: false,
    };
  };

  // ========================================
  // MOUSE DRAG MOVE
  // ========================================

  const handleMouseMove = (event) => {
    const container = scrollRef.current;
    const state = dragState.current;

    if (!container || !state.isDragging) return;

    const distance = event.clientX - state.startX;

    if (Math.abs(distance) > 5) {
      state.moved = true;
    }

    if (state.moved) {
      event.preventDefault();

      container.scrollLeft =
        state.scrollLeft - distance;
    }
  };

  // ========================================
  // MOUSE DRAG END
  // ========================================

  const handleMouseUp = () => {
    dragState.current.isDragging = false;
  };

  // ========================================
  // PREVENT CLICK AFTER DRAG
  // ========================================

  const handleCategoryClick = (event, categoryId) => {
    if (dragState.current.moved) {
      event.preventDefault();
      event.stopPropagation();

      dragState.current.moved = false;
      return;
    }

    onCategorySelect?.(
      categoryId === "all" ? "" : categoryId
    );
  };

  // ========================================
  // RENDER
  // ========================================

  return (
    <section
      className="w-full min-w-0 py-6 sm:py-8"
      aria-labelledby="shop-category-heading"
    >
      {/* SECTION HEADER */}

      <div className="mb-6 flex items-end justify-between gap-3">
        <div>
          <div className="mb-2 flex items-center gap-2">
            <span className="h-1 w-7 rounded-full bg-[#0755e9]" />

            <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#0755e9]">
              Discover
            </span>
          </div>

          <h2
            id="shop-category-heading"
            className="text-xl font-extrabold tracking-tight text-slate-950 sm:text-2xl"
          >
            Shop by Category
          </h2>

          <p className="mt-1 text-xs text-slate-500 sm:text-sm">
            Find the perfect accessories for your devices
          </p>
        </div>

        <div className="hidden items-center gap-1 text-xs font-semibold text-slate-400 sm:flex">
          Swipe to explore
          <ArrowRight size={15} />
        </div>
      </div>

      {/* CATEGORY SCROLLER */}

      <div
        ref={scrollRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        className="
          -mx-1 flex gap-4 overflow-x-auto px-1 pb-4
          overscroll-x-contain scroll-smooth
          cursor-grab active:cursor-grabbing
          select-none
          [scrollbar-width:thin]
          [&::-webkit-scrollbar]:h-1
          [&::-webkit-scrollbar-thumb]:rounded-full
          [&::-webkit-scrollbar-thumb]:bg-slate-300
          sm:gap-6
        "
      >
        {categoryItems.map((item, index) => {
          const isAll = item.id === "all";

          const isSelected = isAll
            ? !selectedCategory
            : String(selectedCategory) === item.id;

          return (
            <motion.button
              key={item.id}
              type="button"
              onClick={(event) =>
                handleCategoryClick(event, item.id)
              }
              aria-label={`Select ${item.name}`}
              aria-pressed={isSelected}
              initial={
                shouldReduceMotion
                  ? false
                  : { opacity: 0, y: 12 }
              }
              whileInView={{
                opacity: 1,
                y: 0,
              }}
              viewport={{
                once: true,
                amount: 0.2,
              }}
              transition={{
                duration: shouldReduceMotion ? 0 : 0.35,
                delay: shouldReduceMotion
                  ? 0
                  : Math.min(index * 0.04, 0.2),
              }}
              whileTap={
                shouldReduceMotion
                  ? undefined
                  : { scale: 0.95 }
              }
              className="
                group flex w-[92px] shrink-0
                flex-col items-center text-center
                sm:w-[112px]
              "
            >
              {/* IMAGE CIRCLE */}

              <div
                className={`
                  relative flex aspect-square w-full
                  items-center justify-center rounded-full
                  border-2 p-1 transition-all duration-300
                  ${
                    isSelected
                      ? "border-[#0755e9] bg-blue-50 shadow-lg shadow-blue-100"
                      : "border-transparent bg-slate-100 group-hover:border-blue-200 group-hover:bg-blue-50"
                  }
                `}
              >
                <div
                  className={`
                    relative flex h-full w-full
                    items-center justify-center overflow-hidden
                    rounded-full
                    ${
                      isAll
                        ? "bg-gradient-to-br from-[#0755e9] to-[#082b70]"
                        : "bg-white"
                    }
                  `}
                >
                  {isAll ? (
                    <LayoutGrid
                      size={34}
                      strokeWidth={1.6}
                      className="text-white sm:h-10 sm:w-10"
                    />
                  ) : item.image ? (
                    <Image
                      src={item.image}
                      alt={item.name}
                      fill
                      draggable={false}
                      sizes="(max-width: 640px) 92px, 112px"
                      className="
                        pointer-events-none
                        object-contain p-2
                        transition-transform duration-500
                        group-hover:scale-110
                      "
                    />
                  ) : (
                    <Package
                      size={34}
                      strokeWidth={1.5}
                      className="text-slate-300 sm:h-10 sm:w-10"
                    />
                  )}
                </div>

                {/* SELECTED CHECK */}

                {isSelected && (
                  <span className="absolute -right-0.5 -top-0.5 z-10 flex h-6 w-6 items-center justify-center rounded-full border-2 border-white bg-[#0755e9] text-white shadow-md">
                    <Check size={13} strokeWidth={3} />
                  </span>
                )}
              </div>

              {/* CATEGORY NAME */}

              <span
                className={`
                  mt-3 min-h-9 w-full line-clamp-2
                  text-xs font-bold leading-5
                  transition-colors sm:text-sm
                  ${
                    isSelected
                      ? "text-[#0755e9]"
                      : "text-slate-700 group-hover:text-[#0755e9]"
                  }
                `}
              >
                {item.name}
              </span>

              {/* ACTIVE INDICATOR */}

              <span
                className={`
                  mt-1 h-1 rounded-full
                  transition-all duration-300
                  ${
                    isSelected
                      ? "w-7 bg-[#0755e9]"
                      : "w-0 bg-transparent"
                  }
                `}
              />
            </motion.button>
          );
        })}
      </div>
    </section>
  );
}
