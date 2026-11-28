"use client";

import { useMemo } from "react";
import Link from "next/link";
import { useDispatch, useSelector } from "react-redux";
import { ArrowUpRight, ChevronRight, Package } from "lucide-react";
import { fetchCategories } from "@/store/thunks/categoryThunks";

function CategoryCardSkeleton() {
  return (
    <div className="flex flex-col overflow-hidden rounded-2xl border border-[#E2E8F0] bg-white p-3 sm:p-4">
      <div className="aspect-square w-full animate-pulse rounded-xl bg-slate-100" />
      <div className="mt-3 h-4 w-3/4 animate-pulse rounded bg-slate-100" />
      <div className="mt-1.5 h-3 w-1/2 animate-pulse rounded bg-slate-100" />
    </div>
  );
}

export default function CategorySection() {
  const dispatch = useDispatch();
  const categories = useSelector(
    (state) => state.categories?.categories || []
  );
  const loading = useSelector(
    (state) => state.categories?.loading || false
  );
  const error = useSelector((state) => state.categories?.error || "");

  const parentCategories = useMemo(
    () =>
      categories
        .filter((cat) => cat?.isActive !== false && !cat.parentCategory)
        .slice(0, 6),
    [categories]
  );

  return (
    <section aria-labelledby="home-categories-heading" className="w-full">
      {/* Header */}
      <div className="mb-5 flex items-end justify-between gap-4 sm:mb-6">
        <div className="min-w-0">
          <span className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#0755E9]">
            Browse Collections
          </span>
          <h2
            id="home-categories-heading"
            className="mt-1 text-xl font-bold tracking-tight text-[#101828] sm:text-2xl"
          >
            Shop by Category
          </h2>
          <p className="mt-1 text-xs text-[#64748B] sm:text-sm">
            Explore curated categories tailored for your devices.
          </p>
        </div>

        <Link
          href="/categories"
          className="inline-flex shrink-0 items-center gap-1 text-xs font-semibold text-[#0755E9] transition hover:text-[#082B70] sm:text-sm"
        >
          View All
          <ChevronRight size={15} />
        </Link>
      </div>

      {/* Loading */}
      {loading && parentCategories.length === 0 ? (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6 lg:gap-4">
          {Array.from({ length: 6 }).map((_, index) => (
            <CategoryCardSkeleton key={index} />
          ))}
        </div>
      ) : error && parentCategories.length === 0 ? (
        <div
          role="alert"
          className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-red-100 bg-red-50 p-4 text-xs text-red-600"
        >
          <span>{String(error)}</span>
          <button
            type="button"
            onClick={() => dispatch(fetchCategories())}
            className="font-semibold text-[#0755E9] underline-offset-2 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0755E9]/30"
          >
            Try again
          </button>
        </div>
      ) : parentCategories.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-[#E2E8F0] bg-[#F8FAFC] py-10 text-center">
          <Package size={28} className="text-slate-400" />
          <p className="mt-2.5 text-sm font-semibold text-[#101828]">
            No categories available
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6 lg:gap-4">
          {parentCategories.map((category) => (
            <Link
              key={category._id}
              href={`/products?category=${category._id}`}
              className="group flex flex-col overflow-hidden rounded-2xl border border-[#E2E8F0] bg-white p-3 transition-all duration-200 hover:-translate-y-0.5 hover:border-[#0755E9]/40 hover:shadow-md sm:p-4"
            >
              <div className="relative flex aspect-square w-full items-center justify-center overflow-hidden rounded-xl bg-[#F8FAFC] p-4 transition-colors group-hover:bg-[#EFF6FF]/60">
                {category.image?.url ? (
                  <img
                    src={category.image.url}
                    alt={category.name || "Category"}
                    loading="lazy"
                    decoding="async"
                    className="h-full w-full object-contain transition-transform duration-300 group-hover:scale-105"
                  />
                ) : (
                  <Package
                    size={36}
                    strokeWidth={1.3}
                    className="text-slate-300"
                  />
                )}

                <span className="absolute bottom-2 right-2 flex h-7 w-7 items-center justify-center rounded-full border border-[#E2E8F0] bg-white text-[#0755E9] opacity-0 shadow-xs transition-all duration-200 group-hover:border-[#0755E9] group-hover:bg-[#0755E9] group-hover:text-white group-hover:opacity-100">
                  <ArrowUpRight size={14} />
                </span>
              </div>

              <div className="mt-3 flex min-w-0 flex-1 flex-col justify-between">
                <h3 className="truncate text-xs font-bold text-[#101828] transition-colors group-hover:text-[#0755E9] sm:text-sm">
                  {category.name}
                </h3>
                <span className="mt-0.5 text-[11px] font-medium text-[#64748B]">
                  Shop collection
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}
