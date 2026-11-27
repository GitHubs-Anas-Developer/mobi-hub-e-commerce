"use client";

import { useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import Link from "next/link";
import { ArrowRight, Layers3, ShoppingBag } from "lucide-react";

import { fetchCategories } from "@/store/thunks/categoryThunks";
import CategoryCard from "@/components/categories/CategoryCard";
import CategorySkeleton from "@/components/categories/CategorySkeleton";

export default function AboutCategoriesShowcase() {
  const dispatch = useDispatch();

  const allCategories = useSelector(
    (state) => state.categories?.categories || []
  );
  const loading = useSelector((state) => state.categories?.loading ?? false);

  useEffect(() => {
    if (!allCategories.length && !loading) {
      dispatch(fetchCategories());
    }
  }, [dispatch, allCategories.length, loading]);

  const { parentCategories, subCountMap } = useMemo(() => {
    const active = (Array.isArray(allCategories) ? allCategories : []).filter(
      (cat) => cat?._id && cat.isActive !== false
    );

    const counts = new Map();
    active.forEach((cat) => {
      if (cat.parentCategory) {
        const pid =
          typeof cat.parentCategory === "object"
            ? String(cat.parentCategory._id || "")
            : String(cat.parentCategory);
        if (pid) counts.set(pid, (counts.get(pid) || 0) + 1);
      }
    });

    return {
      parentCategories: active.filter((cat) => !cat.parentCategory).slice(0, 5),
      subCountMap: counts,
    };
  }, [allCategories]);

  if (!loading && parentCategories.length === 0) {
    return (
      <div className="flex flex-col items-center justify-between gap-4 rounded-2xl border border-[#E2E8F0] bg-[#F8FAFC] p-6 text-center sm:flex-row sm:text-left">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#EFF6FF] text-[#0755E9]">
            <Layers3 size={20} />
          </div>
          <div>
            <h3 className="text-sm font-extrabold text-[#101828]">
              Explore Our Live Catalog
            </h3>
            <p className="mt-0.5 text-xs text-[#64748B]">
              Browse gadgets, electronics, and accessories directly in our shop.
            </p>
          </div>
        </div>

        <Link
          href="/products"
          className="inline-flex h-10 shrink-0 items-center gap-2 rounded-xl bg-[#0755E9] px-5 text-xs font-bold text-white transition hover:bg-[#0645C4]"
        >
          <ShoppingBag size={14} />
          Explore Products
          <ArrowRight size={14} />
        </Link>
      </div>
    );
  }

  return (
    <div>
      {loading && parentCategories.length === 0 ? (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-5">
          {Array.from({ length: 5 }).map((_, index) => (
            <CategorySkeleton key={index} />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-5">
          {parentCategories.map((category) => {
            const catId = String(category._id);
            return (
              <CategoryCard
                key={catId}
                category={category}
                href={`/categories/${catId}`}
                subcategoryCount={subCountMap.get(catId) || 0}
                compact
              />
            );
          })}
        </div>
      )}

      <div className="mt-6 flex flex-wrap items-center justify-center gap-3 sm:justify-start">
        <Link
          href="/products"
          className="inline-flex h-11 items-center gap-2 rounded-xl bg-[#0755E9] px-5 text-xs font-bold text-white transition hover:bg-[#0645C4] sm:text-sm"
        >
          <ShoppingBag size={15} />
          Explore Products
          <ArrowRight size={15} />
        </Link>

        <Link
          href="/categories"
          className="inline-flex h-11 items-center gap-2 rounded-xl border border-[#E2E8F0] bg-white px-5 text-xs font-bold text-[#101828] transition hover:border-[#0755E9]/40 hover:bg-[#EFF6FF] hover:text-[#0755E9] sm:text-sm"
        >
          <Layers3 size={15} />
          View All Categories
        </Link>
      </div>
    </div>
  );
}

