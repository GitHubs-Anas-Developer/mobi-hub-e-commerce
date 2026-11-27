"use client";

import { useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import Link from "next/link";
import { Layers3, ShoppingBag, ArrowRight } from "lucide-react";

import { fetchCategories } from "@/store/thunks/categoryThunks";

export default function CategoriesPageHeader() {
  const dispatch = useDispatch();

  const categories = useSelector((state) => state.categories?.categories || []);
  const loading = useSelector((state) => state.categories?.loading ?? false);

  useEffect(() => {
    if (!categories.length && !loading) {
      dispatch(fetchCategories());
    }
  }, [dispatch, categories.length, loading]);

  const { parentCount, subCount } = useMemo(() => {
    const active = (Array.isArray(categories) ? categories : []).filter(
      (cat) => cat && cat.isActive !== false
    );
    const parents = active.filter((cat) => !cat.parentCategory);
    const subs = active.filter((cat) => Boolean(cat.parentCategory));

    return {
      parentCount: parents.length,
      subCount: subs.length,
    };
  }, [categories]);

  return (
    <header className="mb-6 rounded-2xl border border-[#E2E8F0] bg-white p-5 shadow-xs sm:p-6">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div className="min-w-0 flex-1">
          <div className="mb-2 inline-flex items-center gap-1.5 rounded-full border border-[#0755E9]/15 bg-[#EFF6FF] px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-[#0755E9]">
            <Layers3 size={13} aria-hidden="true" />
            <span>ELENZO Departments</span>
          </div>

          <h1 className="text-2xl font-extrabold tracking-tight text-[#101828] sm:text-3xl">
            Explore Categories
          </h1>

          <p className="mt-1.5 max-w-2xl text-xs leading-relaxed text-[#64748B] sm:text-sm">
            Discover smartphones, smartwatches, audio gear, charging essentials,
            and gadgets organized across ELENZO departments.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 self-start md:self-center">
          {parentCount > 0 && (
            <div className="flex items-center gap-3 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] px-4 py-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#EFF6FF] text-[#0755E9]">
                <Layers3 size={18} aria-hidden="true" />
              </div>

              <div>
                <p className="text-[11px] font-semibold uppercase tracking-wide text-[#64748B]">
                  Collections
                </p>
                <p className="text-sm font-extrabold text-[#101828] tabular-nums">
                  {parentCount} {parentCount === 1 ? "Category" : "Categories"}
                  {subCount > 0 && (
                    <span className="ml-1.5 text-xs font-semibold text-[#64748B]">
                      · {subCount} Subcategories
                    </span>
                  )}
                </p>
              </div>
            </div>
          )}

          <Link
            href="/products"
            className="inline-flex h-11 items-center gap-2 rounded-xl bg-[#0755E9] px-4 text-xs font-bold text-white transition hover:bg-[#0645C4] sm:text-sm"
          >
            <ShoppingBag size={15} aria-hidden="true" />
            <span>Browse All Products</span>
            <ArrowRight size={14} aria-hidden="true" />
          </Link>
        </div>
      </div>
    </header>
  );
}

