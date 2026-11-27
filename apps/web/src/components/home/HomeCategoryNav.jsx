"use client";

import { useEffect, useMemo } from "react";
import Link from "next/link";
import { useDispatch, useSelector } from "react-redux";
import { Grid2X2, Layers, Package, Sparkles } from "lucide-react";

import { fetchCategories } from "@/store/thunks/categoryThunks";

export default function HomeCategoryNav() {
  const dispatch = useDispatch();

  const categories = useSelector(
    (state) => state.categories?.categories || []
  );
  const loading = useSelector(
    (state) => state.categories?.loading || false
  );

  useEffect(() => {
    if (!categories.length && !loading) {
      dispatch(fetchCategories());
    }
  }, [dispatch, categories.length, loading]);

  const parentCategories = useMemo(
    () =>
      categories.filter(
        (cat) => cat?.isActive !== false && !cat.parentCategory
      ),
    [categories]
  );

  return (
    <nav
      aria-label="Category quick navigation"
      className="w-full border-b border-[#E2E8F0] bg-white"
    >
      <div className="mx-auto flex w-full max-w-[1440px] items-center justify-between gap-3 px-4 py-2.5 sm:px-6 lg:px-8">
        {/* Scrollable Category Strip */}
        <div className="flex min-w-0 flex-1 items-center gap-2 overflow-x-auto py-0.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <Link
            href="/products"
            className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-[#0755E9]/20 bg-[#EFF6FF] px-3.5 py-1.5 text-xs font-semibold text-[#0755E9] transition-colors hover:bg-[#0755E9] hover:text-white"
          >
            <Grid2X2 size={14} />
            All Gadgets
          </Link>

          <Link
            href="/products?isNewArrival=true&sort=newest"
            className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-[#E2E8F0] bg-[#F8FAFC] px-3.5 py-1.5 text-xs font-semibold text-[#101828] transition-colors hover:border-[#0755E9]/40 hover:bg-[#EFF6FF] hover:text-[#0755E9]"
          >
            <Sparkles size={13} className="text-[#0755E9]" />
            New Arrivals
          </Link>

          {loading && parentCategories.length === 0 ? (
            <div className="flex items-center gap-2">
              {Array.from({ length: 5 }).map((_, index) => (
                <div
                  key={index}
                  className="h-8 w-24 shrink-0 animate-pulse rounded-full bg-slate-100"
                />
              ))}
            </div>
          ) : (
            parentCategories.map((category) => (
              <Link
                key={category._id}
                href={`/products?category=${category._id}`}
                className="group inline-flex shrink-0 items-center gap-2 rounded-full border border-[#E2E8F0] bg-white px-3 py-1.5 text-xs font-semibold text-[#101828] transition-colors hover:border-[#0755E9]/40 hover:bg-[#EFF6FF] hover:text-[#0755E9]"
              >
                {category.image?.url ? (
                  <img
                    src={category.image.url}
                    alt=""
                    aria-hidden="true"
                    className="h-4 w-4 shrink-0 rounded-full object-contain"
                  />
                ) : (
                  <Package
                    size={13}
                    className="shrink-0 text-[#64748B] group-hover:text-[#0755E9]"
                  />
                )}
                <span className="whitespace-nowrap">{category.name}</span>
              </Link>
            ))
          )}
        </div>

        {/* Desktop View All Categories */}
        <Link
          href="/categories"
          className="hidden shrink-0 items-center gap-1.5 rounded-full border border-[#E2E8F0] bg-[#F8FAFC] px-3.5 py-1.5 text-xs font-semibold text-[#0755E9] transition-colors hover:border-[#0755E9] hover:bg-[#EFF6FF] md:inline-flex"
        >
          <Layers size={13} />
          All Categories
        </Link>
      </div>
    </nav>
  );
}

