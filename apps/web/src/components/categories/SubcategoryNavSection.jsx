"use client";

import Link from "next/link";
import { Check, Layers3 } from "lucide-react";

import CategoryCard from "./CategoryCard";

export default function SubcategoryNavSection({
  parentCategory = null,
  currentCategoryId = "",
  subcategories = [],
  siblingCategories = [],
  isChildCategory = false,
  title = "Subcategories",
  subtitle = "",
}) {
  // When viewing a child/subcategory: show sibling & parent compact navigation chips
  if (isChildCategory) {
    const parentId =
      typeof parentCategory === "object"
        ? parentCategory?._id
        : parentCategory;
    const parentName =
      typeof parentCategory === "object" ? parentCategory?.name : "Department";

    if (siblingCategories.length === 0 && !parentId) return null;

    return (
      <section
        className="mb-6 rounded-2xl border border-[#E2E8F0] bg-white p-4 sm:p-5"
        aria-label="Child category navigation"
      >
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Layers3 size={16} className="text-[#0755E9]" aria-hidden="true" />
            <h2 className="text-sm font-extrabold text-[#101828] sm:text-base">
              Browse in {parentName || "Category"}
            </h2>
          </div>

          <span className="text-xs font-semibold text-[#64748B] tabular-nums">
            {siblingCategories.length}{" "}
            {siblingCategories.length === 1 ? "Subcategory" : "Subcategories"}
          </span>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:flex-wrap">
          {parentId && (
            <Link
              href={`/categories/${parentId}`}
              className="inline-flex h-9 shrink-0 items-center gap-1.5 rounded-full border border-[#E2E8F0] bg-[#F8FAFC] px-3.5 text-xs font-bold text-[#101828] transition hover:border-[#0755E9]/40 hover:bg-[#EFF6FF] hover:text-[#0755E9]"
            >
              <span>All {parentName || "Items"}</span>
            </Link>
          )}

          {siblingCategories.map((sub) => {
            const subId = String(sub._id);
            const active = String(currentCategoryId) === subId;

            return (
              <Link
                key={subId}
                href={`/categories/${subId}`}
                aria-current={active ? "page" : undefined}
                className={`inline-flex h-9 shrink-0 items-center gap-1.5 rounded-full border px-3.5 text-xs font-bold transition ${
                  active
                    ? "border-[#0755E9] bg-[#0755E9] text-white shadow-xs"
                    : "border-[#E2E8F0] bg-white text-[#64748B] hover:border-[#0755E9]/40 hover:bg-[#EFF6FF] hover:text-[#0755E9]"
                }`}
              >
                {active && <Check size={13} strokeWidth={2.5} aria-hidden="true" />}
                <span className="whitespace-nowrap">{sub.name}</span>
              </Link>
            );
          })}
        </div>
      </section>
    );
  }

  // Root category with child subcategories -> show cards strip/grid
  if (!Array.isArray(subcategories) || subcategories.length === 0) {
    return null;
  }

  return (
    <section
      className="mb-6 rounded-2xl border border-[#E2E8F0] bg-white p-4 sm:p-6"
      aria-labelledby="subcategories-heading"
    >
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2
            id="subcategories-heading"
            className="text-base font-extrabold tracking-tight text-[#101828] sm:text-lg"
          >
            {title}
          </h2>
          {subtitle && (
            <p className="mt-0.5 text-xs text-[#64748B] sm:text-sm">
              {subtitle}
            </p>
          )}
        </div>

        <span className="rounded-full border border-[#E2E8F0] bg-[#F8FAFC] px-3 py-1 text-xs font-bold text-[#101828] tabular-nums">
          {subcategories.length}{" "}
          {subcategories.length === 1 ? "Subcategory" : "Subcategories"}
        </span>
      </div>

      {/* Horizontal scroll on mobile/tablet, crisp grid on desktop */}
      <div className="flex gap-3 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden lg:grid lg:grid-cols-4 lg:gap-4 lg:overflow-visible xl:grid-cols-5">
        {subcategories.map((subcategory, index) => {
          const subId = subcategory._id || index;
          return (
            <div
              key={subId}
              className="w-[168px] shrink-0 sm:w-[196px] lg:w-auto"
            >
              <CategoryCard
                category={subcategory}
                href={`/categories/${subcategory._id}`}
                compact
              />
            </div>
          );
        })}
      </div>
    </section>
  );
}

