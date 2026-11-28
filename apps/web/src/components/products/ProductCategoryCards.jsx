"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Inter } from "next/font/google";
import { ChevronLeft, ChevronRight } from "lucide-react";

const inter = Inter({ subsets: ["latin"], display: "swap" });

export default function ProductCategoryCards({
  categories = [],
  selectedCategory = "",
  onCategorySelect,
}) {
  const carouselRef = useRef(null);
  const [scrollState, setScrollState] = useState({
    canScrollLeft: false,
    canScrollRight: false,
  });

  const categoryItems = useMemo(() => {
    const validCategories = (Array.isArray(categories) ? categories : [])
      .filter(
        (item) =>
          item?._id && typeof item.name === "string" && item.name.trim()
      )
      .map((item) => ({
        id: String(item._id),
        name: item.name.trim(),
      }));

    return [
      {
        id: "all",
        name: "All Products",
      },
      ...validCategories,
    ];
  }, [categories]);

  const handleCategoryClick = (itemId) => {
    onCategorySelect?.(itemId === "all" ? "" : itemId);
  };

  const updateScrollState = useCallback(() => {
    const carousel = carouselRef.current;
    if (!carousel) return;

    const maxScrollLeft = Math.max(
      0,
      carousel.scrollWidth - carousel.clientWidth,
    );
    const nextScrollState = {
      canScrollLeft: carousel.scrollLeft > 1,
      canScrollRight: maxScrollLeft - carousel.scrollLeft > 1,
    };

    setScrollState((current) =>
      current.canScrollLeft === nextScrollState.canScrollLeft &&
      current.canScrollRight === nextScrollState.canScrollRight
        ? current
        : nextScrollState,
    );
  }, []);

  useEffect(() => {
    const carousel = carouselRef.current;
    if (!carousel) return undefined;

    updateScrollState();
    carousel.addEventListener("scroll", updateScrollState, { passive: true });

    const resizeObserver = new ResizeObserver(updateScrollState);
    resizeObserver.observe(carousel);
    Array.from(carousel.children).forEach((item) => resizeObserver.observe(item));

    return () => {
      carousel.removeEventListener("scroll", updateScrollState);
      resizeObserver.disconnect();
    };
  }, [categoryItems, updateScrollState]);

  const scrollCarousel = (direction) => {
    const carousel = carouselRef.current;
    if (!carousel) return;

    carousel.scrollBy({
      left: direction * Math.min(carousel.clientWidth * 0.75, 360),
      behavior: "smooth",
    });
  };

  const handleCarouselWheel = (event) => {
    const carousel = carouselRef.current;
    if (!carousel || carousel.scrollWidth <= carousel.clientWidth) return;

    // Convert a regular mouse wheel to horizontal movement; trackpads already
    // provide deltaX and remain native.
    if (Math.abs(event.deltaX) < Math.abs(event.deltaY)) {
      carousel.scrollLeft += event.deltaY;
      event.preventDefault();
    }
  };

  if (categoryItems.length <= 1) return null;

  return (
    <section
      className={`${inter.className} mb-5 w-full min-w-0 sm:mb-6`}
      aria-labelledby="shop-category-heading"
    >
      <div className="mb-3.5 flex min-w-0 items-end justify-between gap-3 sm:mb-4">
        <div className="min-w-0">
          <h2
            id="shop-category-heading"
            className="text-xl font-semibold leading-7 tracking-tight text-[#101828] sm:text-2xl"
          >
            Browse Categories
          </h2>
          <p className="mt-1 text-sm leading-5 text-[#64748B]">
            Explore products by category.
          </p>
        </div>
        {(scrollState.canScrollLeft || scrollState.canScrollRight) && (
          <div className="hidden shrink-0 items-center gap-2 sm:flex">
            {scrollState.canScrollLeft && (
              <button
                type="button"
                onClick={() => scrollCarousel(-1)}
                aria-label="Scroll categories left"
                aria-controls="browse-category-list"
                className="flex h-9 w-9 items-center justify-center rounded-full border border-[#E2E8F0] bg-white text-[#344054] transition-colors duration-150 hover:border-[#D7E7FF] hover:bg-[#EFF6FF] hover:text-[#0755E9] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0755E9]/30"
              >
                <ChevronLeft size={18} aria-hidden="true" />
              </button>
            )}
            {scrollState.canScrollRight && (
              <button
                type="button"
                onClick={() => scrollCarousel(1)}
                aria-label="Scroll categories right"
                aria-controls="browse-category-list"
                className="flex h-9 w-9 items-center justify-center rounded-full border border-[#E2E8F0] bg-white text-[#344054] transition-colors duration-150 hover:border-[#D7E7FF] hover:bg-[#EFF6FF] hover:text-[#0755E9] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0755E9]/30"
              >
                <ChevronRight size={18} aria-hidden="true" />
              </button>
            )}
          </div>
        )}
      </div>

      <div
        ref={carouselRef}
        id="browse-category-list"
        onWheel={handleCarouselWheel}
        role="group"
        aria-label="Filter by category"
        className="flex w-full min-w-0 snap-x snap-proximity gap-2 overflow-x-auto overflow-y-hidden overscroll-x-contain scroll-smooth py-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:gap-2.5"
      >
        {categoryItems.map((item) => {
          const isSelected =
            item.id === "all"
              ? !selectedCategory
              : String(selectedCategory) === item.id;

          return (
            <button
              key={item.id}
              type="button"
              onClick={() => handleCategoryClick(item.id)}
              aria-label={`Select ${item.name}`}
              aria-pressed={isSelected}
              className={`inline-flex h-10 w-auto min-w-fit shrink-0 snap-start items-center justify-center rounded-full border px-4 text-sm font-medium transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0755E9]/30 ${
                isSelected
                  ? "border-[#D7E7FF] bg-[#EFF6FF] text-[#0755E9]"
                  : "border-[#E2E8F0] bg-white text-[#344054] hover:border-[#D7E7FF] hover:bg-[#F8FAFC] hover:text-[#0755E9]"
              }`}
            >
              {item.name}
            </button>
          );
        })}
      </div>
    </section>
  );
}
