"use client";

import { useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RefreshCw, Package, AlertCircle, LoaderCircle } from "lucide-react";

import { fetchCategories } from "@/store/thunks/categoryThunks";
import CategoryCard from "./CategoryCard";
import CategorySkeleton from "./CategorySkeleton";

export default function CategoryGrid() {
  const dispatch = useDispatch();

  const allCategories = useSelector(
    (state) => state.categories?.categories || []
  );
  const loading = useSelector((state) => state.categories?.loading ?? false);
  const error = useSelector((state) => state.categories?.error || "");

  useEffect(() => {
    if (!allCategories.length && !loading) {
      dispatch(fetchCategories());
    }
  }, [dispatch, allCategories.length, loading]);

  const { parentCategories, subcategoryCounts } = useMemo(() => {
    const active = (Array.isArray(allCategories) ? allCategories : []).filter(
      (cat) => cat?._id && cat.isActive !== false
    );

    const counts = new Map();
    active.forEach((cat) => {
      if (cat.parentCategory) {
        const parentId =
          typeof cat.parentCategory === "object"
            ? String(cat.parentCategory._id || "")
            : String(cat.parentCategory);
        if (parentId) {
          counts.set(parentId, (counts.get(parentId) || 0) + 1);
        }
      }
    });

    const parents = active.filter((cat) => !cat.parentCategory);

    return {
      parentCategories: parents,
      subcategoryCounts: counts,
    };
  }, [allCategories]);

  const handleRetry = () => {
    dispatch(fetchCategories());
  };

  if (loading && parentCategories.length === 0 && !error) {
    return (
      <div
        className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4 xl:grid-cols-5"
        aria-label="Loading categories"
        aria-busy="true"
      >
        {Array.from({ length: 10 }).map((_, index) => (
          <CategorySkeleton key={`cat-skel-${index}`} />
        ))}
      </div>
    );
  }

  if (error && parentCategories.length === 0) {
    return (
      <div
        className="flex flex-col items-center rounded-2xl border border-red-200 bg-white px-5 py-14 text-center"
        role="alert"
      >
        <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-red-100 bg-red-50 text-red-500">
          <AlertCircle size={24} aria-hidden="true" />
        </div>

        <h3 className="mt-4 text-base font-extrabold text-[#101828]">
          Unable to load categories
        </h3>

        <p className="mt-1.5 max-w-md text-xs text-[#64748B] sm:text-sm">
          {error}
        </p>

        <button
          type="button"
          onClick={handleRetry}
          disabled={loading}
          className="mt-5 inline-flex h-10 items-center gap-2 rounded-xl bg-[#0755E9] px-5 text-xs font-bold text-white transition hover:bg-[#0645C4] disabled:opacity-60 sm:text-sm"
        >
          {loading ? (
            <LoaderCircle size={15} className="animate-spin" />
          ) : (
            <RefreshCw size={15} aria-hidden="true" />
          )}
          {loading ? "Retrying..." : "Try Again"}
        </button>
      </div>
    );
  }

  if (!loading && parentCategories.length === 0) {
    return (
      <div className="flex flex-col items-center rounded-2xl border border-[#E2E8F0] bg-white px-5 py-16 text-center">
        <Package size={40} className="text-slate-300" aria-hidden="true" />
        <h3 className="mt-4 text-base font-extrabold text-[#101828]">
          No categories available
        </h3>
        <p className="mt-1.5 text-sm text-[#64748B]">
          Categories will appear here once added to the catalog.
        </p>
      </div>
    );
  }

  return (
    <div className="relative" aria-busy={loading}>
      {error && (
        <div
          className="mb-4 flex items-center justify-between gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3"
          role="status"
        >
          <p className="text-xs font-medium text-amber-800">
            Unable to refresh categories. Showing loaded categories.
          </p>

          <button
            type="button"
            onClick={handleRetry}
            disabled={loading}
            aria-label="Retry loading categories"
            className="shrink-0 rounded-lg p-2 text-amber-800 hover:bg-amber-100 disabled:opacity-50"
          >
            {loading ? (
              <LoaderCircle size={16} className="animate-spin" />
            ) : (
              <RefreshCw size={16} />
            )}
          </button>
        </div>
      )}

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4 xl:grid-cols-5">
        {parentCategories.map((category, index) => {
          const catId = String(category._id);
          return (
            <CategoryCard
              key={catId || category.slug || index}
              category={category}
              href={`/categories/${catId}`}
              subcategoryCount={subcategoryCounts.get(catId) || 0}
            />
          );
        })}
      </div>
    </div>
  );
}
