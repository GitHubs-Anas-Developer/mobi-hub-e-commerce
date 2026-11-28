"use client";

import { useEffect, useMemo, useRef } from "react";
import Link from "next/link";
import { useDispatch, useSelector } from "react-redux";

import { fetchCategories } from "@/store/thunks/categoryThunks";

export default function HomeCategoryNav() {
  const dispatch = useDispatch();
  const categoryRequestStarted = useRef(false);

  const categories = useSelector(
    (state) => state.categories?.categories || []
  );
  const loading = useSelector(
    (state) => state.categories?.loading || false
  );

  useEffect(() => {
    if (categories.length || categoryRequestStarted.current) return;

    // Other category surfaces may already own an in-flight request.
    if (loading) {
      categoryRequestStarted.current = true;
      return;
    }

    categoryRequestStarted.current = true;
    dispatch(fetchCategories());
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
      aria-label="Shop categories"
      aria-busy={loading}
      className="w-full border-b border-[#E2E8F0] bg-white"
    >
      <div className="flex w-full items-center gap-3 py-3 pl-4 pr-4 sm:pl-6 sm:pr-6 lg:pl-16 lg:pr-6">
        {/* Scrollable Category Strip */}
        <div className="flex min-w-0 flex-1 items-center gap-2 overflow-x-auto overscroll-x-contain py-1 scroll-smooth [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <Link
            href="/products"
            className="inline-flex h-9 shrink-0 items-center rounded-full border border-[#D7E7FF] bg-[#EFF6FF] px-4 text-sm font-medium text-[#0755E9] transition-colors duration-150 hover:bg-[#E4EFFF] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0755E9]/30"
          >
            All Gadgets
          </Link>

          <Link
            href="/products?isNewArrival=true&sort=newest"
            className="inline-flex h-9 shrink-0 items-center rounded-full px-4 text-sm font-medium text-[#344054] transition-colors duration-150 hover:bg-[#F8FAFC] hover:text-[#0755E9] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0755E9]/30"
          >
            New Arrivals
          </Link>

          {loading && parentCategories.length === 0 ? (
            <div
              className="flex items-center gap-2"
              role="status"
              aria-label="Loading categories"
            >
              {Array.from({ length: 5 }).map((_, index) => (
                <div
                  key={index}
                  className="h-8 w-24 shrink-0 animate-pulse rounded-full bg-slate-100 motion-reduce:animate-none"
                />
              ))}
            </div>
          ) : (
            parentCategories.map((category) => (
              <Link
                key={category._id}
                href={`/products?category=${category._id}`}
                className="inline-flex h-9 shrink-0 items-center whitespace-nowrap rounded-full px-4 text-sm font-medium text-[#344054] transition-colors duration-150 hover:bg-[#F8FAFC] hover:text-[#0755E9] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0755E9]/30"
              >
                {category.name}
              </Link>
            ))
          )}
        </div>

        {/* Desktop View All Categories */}
        <Link
          href="/categories"
          className="hidden h-9 shrink-0 items-center whitespace-nowrap rounded-full border border-[#E2E8F0] bg-[#F8FAFC] px-4 text-sm font-medium text-[#344054] transition-colors duration-150 hover:border-[#D7E7FF] hover:bg-[#EFF6FF] hover:text-[#0755E9] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0755E9]/30 md:inline-flex"
        >
          All Categories
        </Link>
      </div>
    </nav>
  );
}

