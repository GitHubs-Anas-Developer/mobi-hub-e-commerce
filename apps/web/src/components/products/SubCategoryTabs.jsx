"use client";

import { useMemo } from "react";
import { Check } from "lucide-react";

export default function SubCategoryTabs({
  subCategories = [],
  selectedSubCategory = "",
  onSelect,
}) {
  const tabs = useMemo(
    () => [
      { _id: "", name: "All Subcategories" },
      ...(Array.isArray(subCategories) ? subCategories : []).filter(
        (item) => item?._id
      ),
    ],
    [subCategories]
  );

  if (!Array.isArray(subCategories) || subCategories.length === 0) {
    return null;
  }

  return (
    <section
      className="mb-5 w-full min-w-0"
      aria-label="Filter by subcategory"
    >
      <div className="flex w-full items-center gap-2 overflow-x-auto pb-1 overscroll-x-contain scroll-smooth [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:gap-2.5">
        {tabs.map((item) => {
          const isSelected = String(selectedSubCategory || "") === String(item._id || "");

          return (
            <button
              key={item._id || "all-subcategories"}
              type="button"
              onClick={() => onSelect?.(item._id)}
              aria-pressed={isSelected}
              className={`inline-flex h-9 shrink-0 items-center gap-1.5 rounded-full border px-4 text-xs font-semibold transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0755E9] focus-visible:ring-offset-2 sm:h-10 sm:text-[13px] ${
                isSelected
                  ? "border-[#0755E9] bg-[#0755E9] text-white shadow-xs"
                  : "border-[#E2E8F0] bg-white text-[#64748B] hover:border-[#0755E9]/40 hover:bg-[#EFF6FF] hover:text-[#0755E9]"
              }`}
            >
              {isSelected && <Check size={13} strokeWidth={2.5} aria-hidden="true" />}
              <span>{item.name}</span>
            </button>
          );
        })}
      </div>
    </section>
  );
}
