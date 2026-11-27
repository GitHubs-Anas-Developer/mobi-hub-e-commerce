"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, LayoutGrid, Package, Check } from "lucide-react";

const getCategoryImage = (item) => {
  if (typeof item?.image === "string") {
    return item.image;
  }

  return (
    item?.image?.url ||
    item?.image?.secure_url ||
    item?.thumbnail?.url ||
    (typeof item?.thumbnail === "string" ? item.thumbnail : "") ||
    item?.images?.[0]?.url ||
    (typeof item?.images?.[0] === "string" ? item.images[0] : "") ||
    ""
  );
};

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
    setScrollState({
      canScrollLeft: carousel.scrollLeft > 1,
      canScrollRight: maxScrollLeft - carousel.scrollLeft > 1,
    });
  }, []);

  useEffect(() => {
    const carousel = carouselRef.current;
    if (!carousel) return undefined;

    updateScrollState();
    carousel.addEventListener("scroll", updateScrollState, { passive: true });

    const resizeObserver = new ResizeObserver(updateScrollState);
    resizeObserver.observe(carousel);
    if (carousel.firstElementChild) {
      resizeObserver.observe(carousel.firstElementChild);
    }

    return () => {
      carousel.removeEventListener("scroll", updateScrollState);
      resizeObserver.disconnect();
    };
  }, [categoryItems.length, updateScrollState]);

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
      className="mb-4 w-full min-w-0 rounded-2xl border border-[#E2E8F0] bg-white p-3.5 shadow-[0_8px_28px_rgba(16,24,40,0.035)] sm:mb-5 sm:p-5"
      aria-labelledby="shop-category-heading"
    >
      <div className="mb-3.5 flex min-w-0 items-center justify-between gap-3 sm:mb-4">
        <div className="min-w-0">
          <h2
            id="shop-category-heading"
            className="text-[19px] font-semibold leading-6 tracking-[-0.02em] text-[#101828] sm:text-[23px] sm:leading-7"
          >
            Browse Categories
          </h2>
          <p className="mt-0.5 text-xs leading-5 text-[#64748B]">
            Explore products by category.
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <button
            type="button"
            onClick={() => scrollCarousel(-1)}
            disabled={!scrollState.canScrollLeft}
            aria-label="Scroll categories left"
            className="hidden h-9 w-9 items-center justify-center rounded-full border border-[#E2E8F0] bg-white text-[#0755E9] transition hover:border-[#0755E9]/40 hover:bg-[#EFF6FF] disabled:cursor-not-allowed disabled:opacity-35 sm:flex"
          >
            <ChevronLeft size={18} strokeWidth={2} aria-hidden="true" />
          </button>
          <button
            type="button"
            onClick={() => scrollCarousel(1)}
            disabled={!scrollState.canScrollRight}
            aria-label="Scroll categories right"
            className="hidden h-9 w-9 items-center justify-center rounded-full border border-[#E2E8F0] bg-white text-[#0755E9] transition hover:border-[#0755E9]/40 hover:bg-[#EFF6FF] disabled:cursor-not-allowed disabled:opacity-35 sm:flex"
          >
            <ChevronRight size={18} strokeWidth={2} aria-hidden="true" />
          </button>
        </div>
      </div>

      <div
        ref={carouselRef}
        onWheel={handleCarouselWheel}
        className="flex w-full min-w-0 snap-x snap-mandatory gap-2.5 overflow-x-auto overflow-y-hidden overscroll-x-contain scroll-smooth pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:gap-3"
      >
        {categoryItems.map((item) => {
          const isAll = item.id === "all";
          const isSelected = isAll
            ? !selectedCategory
            : String(selectedCategory) === item.id;

          return (
            <button
              key={item.id}
              type="button"
              onClick={() => handleCategoryClick(item.id)}
              aria-label={`Select ${item.name}`}
              aria-pressed={isSelected}
              className={`group relative flex min-h-[126px] w-[108px] shrink-0 snap-start flex-col items-center justify-center rounded-xl border px-2 py-3 text-center transition-all duration-200 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0755E9] focus-visible:ring-offset-2 sm:min-h-[142px] sm:w-[124px] sm:px-3 sm:py-3.5 lg:w-[136px] ${
                isSelected
                  ? "border-[#0755E9] bg-[#EFF6FF] shadow-[0_4px_14px_rgba(7,85,233,0.10)]"
                  : "border-[#E2E8F0] bg-white hover:-translate-y-0.5 hover:border-[#0755E9]/45 hover:bg-[#F8FAFC] hover:shadow-[0_8px_20px_rgba(16,24,40,0.07)]"
              }`}
            >
              {isSelected && (
                <span className="absolute right-1.5 top-1.5 z-10 flex h-4 w-4 items-center justify-center rounded-full bg-[#0755E9] text-white">
                  <Check size={10} strokeWidth={3} aria-hidden="true" />
                </span>
              )}

              <div
                className={`relative flex h-[60px] w-[60px] shrink-0 items-center justify-center overflow-hidden rounded-xl border transition-colors sm:h-[68px] sm:w-[68px] ${
                  isAll
                    ? "border-[#0755E9] bg-[#0755E9] text-white"
                    : isSelected
                      ? "border-[#0755E9]/20 bg-white"
                      : "border-[#E2E8F0] bg-[#F8FAFC]"
                }`}
              >
                {isAll ? (
                  <LayoutGrid size={24} strokeWidth={1.8} />
                ) : item.image ? (
                  <Image
                    src={item.image}
                    alt={item.name}
                    fill
                    draggable={false}
                    sizes="68px"
                    className="pointer-events-none object-contain p-2 transition-transform duration-300 ease-out group-hover:scale-[1.04]"
                  />
                ) : (
                  <Package size={24} strokeWidth={1.5} className="text-slate-300" />
                )}
              </div>

              <span
                className={`mt-2.5 line-clamp-2 min-h-8 w-full text-[11px] font-semibold leading-[1.25] transition-colors sm:text-xs ${
                  isSelected
                    ? "text-[#082B70]"
                    : "text-[#101828] group-hover:text-[#0755E9]"
                }`}
              >
                {item.name}
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
}
