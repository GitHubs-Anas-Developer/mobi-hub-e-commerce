"use client";

import { useMemo, useRef } from "react";
import Image from "next/image";
import { LayoutGrid, Package, ChevronLeft, ChevronRight, Check } from "lucide-react";

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
  const scrollRef = useRef(null);

  const dragState = useRef({
    isDragging: false,
    startX: 0,
    scrollLeft: 0,
    moved: false,
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

  const handleMouseMove = (event) => {
    if (!dragState.current.isDragging) return;
    const container = scrollRef.current;
    if (!container) return;

    const deltaX = event.clientX - dragState.current.startX;
    if (Math.abs(deltaX) > 4) {
      dragState.current.moved = true;
    }
    container.scrollLeft = dragState.current.scrollLeft - deltaX;
  };

  const handleMouseUp = () => {
    dragState.current.isDragging = false;
  };

  const handleCategoryClick = (event, itemId) => {
    if (dragState.current.moved) {
      event.preventDefault();
      dragState.current.moved = false;
      return;
    }
    onCategorySelect?.(itemId === "all" ? "" : itemId);
  };

  const scrollByAmount = (direction) => {
    const container = scrollRef.current;
    if (!container) return;
    container.scrollBy({
      left: direction * 280,
      behavior: "smooth",
    });
  };

  if (categoryItems.length <= 1) return null;

  return (
    <section
      className="mb-5 w-full min-w-0 rounded-2xl border border-[#E2E8F0] bg-white p-4 sm:mb-6 sm:p-5"
      aria-labelledby="shop-category-heading"
    >
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <h2
            id="shop-category-heading"
            className="text-sm font-bold tracking-tight text-[#101828] sm:text-base"
          >
            Browse by Category
          </h2>
          <p className="mt-0.5 text-xs text-[#64748B]">
            Filter products instantly across ELENZO departments
          </p>
        </div>

        <div className="hidden items-center gap-1.5 sm:flex">
          <button
            type="button"
            onClick={() => scrollByAmount(-1)}
            aria-label="Scroll categories left"
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#E2E8F0] bg-white text-[#64748B] transition hover:border-[#0755E9]/40 hover:bg-[#EFF6FF] hover:text-[#0755E9]"
          >
            <ChevronLeft size={16} />
          </button>
          <button
            type="button"
            onClick={() => scrollByAmount(1)}
            aria-label="Scroll categories right"
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#E2E8F0] bg-white text-[#64748B] transition hover:border-[#0755E9]/40 hover:bg-[#EFF6FF] hover:text-[#0755E9]"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      <div
        ref={scrollRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        className="flex cursor-grab select-none gap-2.5 overflow-x-auto pb-1 overscroll-x-contain scroll-smooth active:cursor-grabbing [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:gap-3"
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
              onClick={(event) => handleCategoryClick(event, item.id)}
              aria-label={`Select ${item.name}`}
              aria-pressed={isSelected}
              className={`group relative flex w-[100px] shrink-0 flex-col items-center rounded-xl border p-2.5 text-center transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0755E9] focus-visible:ring-offset-2 sm:w-[116px] sm:p-3 ${
                isSelected
                  ? "border-[#0755E9] bg-[#EFF6FF] shadow-xs"
                  : "border-[#E2E8F0] bg-white hover:border-[#0755E9]/35 hover:bg-[#F8FAFC]"
              }`}
            >
              {isSelected && (
                <span className="absolute right-1.5 top-1.5 z-10 flex h-4 w-4 items-center justify-center rounded-full bg-[#0755E9] text-white">
                  <Check size={10} strokeWidth={3} aria-hidden="true" />
                </span>
              )}

              <div
                className={`relative flex h-14 w-14 items-center justify-center overflow-hidden rounded-xl border transition-colors sm:h-16 sm:w-16 ${
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
                    sizes="64px"
                    className="pointer-events-none object-contain p-2 transition-transform duration-300 group-hover:scale-105"
                  />
                ) : (
                  <Package size={24} strokeWidth={1.5} className="text-slate-300" />
                )}
              </div>

              <span
                className={`mt-2 line-clamp-2 min-h-8 w-full text-[11px] font-semibold leading-tight transition-colors sm:text-xs ${
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
