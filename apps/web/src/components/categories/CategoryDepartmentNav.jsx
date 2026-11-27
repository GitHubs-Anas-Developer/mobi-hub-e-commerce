"use client";

import { useMemo } from "react";
import Link from "next/link";
import { LayoutGrid, Layers3 } from "lucide-react";

export default function CategoryDepartmentNav({
  categories = [],
  activeCategoryId = "",
  routeMode = "details",
}) {
  const parentCategories = useMemo(() => {
    return (Array.isArray(categories) ? categories : []).filter(
      (cat) => cat?._id && cat.isActive !== false && !cat.parentCategory
    );
  }, [categories]);

  if (parentCategories.length === 0) return null;

  return (
    <nav
      aria-label="Category departments"
      className="mb-5 w-full overflow-hidden rounded-2xl border border-[#E2E8F0] bg-white px-3 py-2.5 sm:px-4"
    >
      <div className="flex items-center gap-2 overflow-x-auto pb-0.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <Link
          href="/categories"
          className={`inline-flex h-9 shrink-0 items-center gap-1.5 rounded-xl border px-3 text-xs font-bold transition ${
            !activeCategoryId
              ? "border-[#0755E9] bg-[#0755E9] text-white"
              : "border-[#E2E8F0] bg-[#F8FAFC] text-[#101828] hover:border-[#0755E9]/40 hover:bg-[#EFF6FF] hover:text-[#0755E9]"
          }`}
        >
          <LayoutGrid size={13} aria-hidden="true" />
          <span>All Categories</span>
        </Link>

        {parentCategories.map((cat) => {
          const catId = String(cat._id);
          const isActive = String(activeCategoryId) === catId;
          const href =
            routeMode === "products"
              ? `/categories/${catId}/products`
              : `/categories/${catId}`;

          return (
            <Link
              key={catId}
              href={href}
              aria-current={isActive ? "page" : undefined}
              className={`inline-flex h-9 shrink-0 items-center gap-1.5 rounded-xl border px-3.5 text-xs font-bold transition ${
                isActive
                  ? "border-[#0755E9] bg-[#0755E9] text-white shadow-xs"
                  : "border-[#E2E8F0] bg-white text-[#64748B] hover:border-[#0755E9]/40 hover:bg-[#EFF6FF] hover:text-[#0755E9]"
              }`}
            >
              <Layers3 size={13} aria-hidden="true" />
              <span className="whitespace-nowrap">{cat.name}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

