
"use client";

import { use, useCallback, useEffect, useState } from "react";
import Link from "next/link";

import {
  ArrowLeft,
  Package,
  RefreshCw,
} from "lucide-react";

import categoryService from "@/services/categoryService";

import Breadcrumb from "@/components/common/Breadcrumb";
import CategoryCard from "@/components/categories/CategoryCard";
import CategorySkeleton from "@/components/categories/CategorySkeleton";
import RecentlyViewed from "@/components/recently-viewed/RecentlyViewed";

// Extract category response data
function getCategoryResult(response) {
  return (
    response?.data?.data ??
    response?.data ??
    response
  );
}

// Extract subcategory array
function getSubcategoryData(response) {
  const result = getCategoryResult(response);

  if (Array.isArray(result)) return result;
  if (Array.isArray(result?.categories)) return result.categories;
  if (Array.isArray(result?.results)) return result.results;

  return [];
}

export default function SubcategoryPageClient({ params }) {
  const { categoryId } = use(params);

  const [category, setCategory] = useState(null);
  const [subcategories, setSubcategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Fetch category and subcategories
  const fetchSubcategories = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const [categoryResponse, subcategoryResponse] =
        await Promise.all([
          categoryService.getCategoryById(categoryId),
          categoryService.getCategories({
            parentCategory: categoryId,
          }),
        ]);

      setCategory(getCategoryResult(categoryResponse));
      setSubcategories(getSubcategoryData(subcategoryResponse));
    } catch (err) {
      console.error("Subcategory fetch error:", err);

      setError(
        err?.response?.data?.message ||
          "Unable to load subcategories. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }, [categoryId]);

  // Initial fetch
  useEffect(() => {
    if (categoryId) {
      fetchSubcategories();
    }
  }, [categoryId, fetchSubcategories]);

  const categoryName = category?.name || "Explore Categories";

  return (
    <main className="min-h-screen bg-white">
      <div className="mx-auto w-full px-4 py-5 sm:px-6 sm:py-8 lg:px-8">

        {/* BREADCRUMB */}
        <Breadcrumb
          items={[
            { label: "Categories", href: "/categories" },
            { label: categoryName },
          ]}
          className="mb-7"
        />

        {/* CATEGORY HEADER */}
        <section className="relative overflow-hidden rounded-3xl border border-[#E7EEFA] px-5 py-7 sm:px-8 sm:py-10 lg:px-12 lg:py-12">
          <div className="pointer-events-none absolute -right-20 -top-24 h-64 w-64 rounded-full bg-blue-100/70 blur-3xl" />

          <div className="relative z-10 max-w-2xl">
            <Link
              href="/categories"
              className="inline-flex items-center gap-2 text-xs font-semibold text-[#0755E9] transition hover:gap-3"
            >
              <ArrowLeft size={15} />
              All Categories
            </Link>

            <p className="mt-6 text-[10px] font-bold uppercase tracking-[0.2em] text-[#0755E9] sm:text-xs">
              Discover ELEZIO
            </p>

            <h1 className="mt-3 text-2xl font-extrabold tracking-tight text-[#101828] sm:text-3xl lg:text-4xl">
              {categoryName}
            </h1>

            <p className="mt-3 max-w-lg text-sm leading-6 text-slate-500 sm:text-base">
              Explore our collection and find the right accessories
              for your everyday technology needs.
            </p>

            <div className="mt-6 flex items-center gap-2 text-xs font-semibold text-slate-500">
              <span className="h-1.5 w-1.5 rounded-full bg-[#0755E9]" />
              Explore our collection
            </div>
          </div>
        </section>

        {/* SUBCATEGORIES */}
        <section
          className="mt-10 sm:mt-14"
          aria-labelledby="subcategory-heading"
        >
          <div className="mb-6 flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#0755E9]">
                Browse Collection
              </p>

              <h2
                id="subcategory-heading"
                className="mt-2 text-xl font-extrabold tracking-tight text-[#101828] sm:text-2xl"
              >
                Explore Subcategories
              </h2>

              <p className="mt-2 text-sm text-slate-500">
                Select a category to discover available products.
              </p>
            </div>

            {!loading && !error && subcategories.length > 0 && (
              <span className="text-xs font-semibold text-slate-400">
                {subcategories.length} Collections
              </span>
            )}
          </div>

          {/* LOADING STATE */}
          {loading ? (
            <div
              className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-5 lg:grid-cols-4 xl:grid-cols-5"
              aria-busy="true"
              aria-label="Loading subcategories"
            >
              {Array.from({ length: 8 }).map((_, index) => (
                <CategorySkeleton key={index} />
              ))}
            </div>
          ) : error ? (
            /* ERROR STATE */
            <div
              className="rounded-2xl border border-red-100 bg-red-50/70 px-5 py-12 text-center"
              role="alert"
            >
              <Package
                size={38}
                className="mx-auto text-red-300"
              />

              <h3 className="mt-4 font-bold text-slate-800">
                Unable to load subcategories
              </h3>

              <p className="mt-2 text-sm text-slate-500">
                {error}
              </p>

              <button
                type="button"
                onClick={fetchSubcategories}
                disabled={loading}
                className="mt-5 inline-flex items-center gap-2 rounded-xl bg-[#0755E9] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#0645C4] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0755E9] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <RefreshCw size={15} />
                Try Again
              </button>
            </div>
          ) : subcategories.length > 0 ? (
            /* CATEGORY GRID */
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-5 lg:grid-cols-4 xl:grid-cols-5">
              {subcategories.map((subcategory, index) => (
                <CategoryCard
                  key={subcategory._id}
                  category={subcategory}
                  index={index}
                  href={`/categories/${subcategory._id}/products`}
                />
              ))}
            </div>
          ) : (
            /* EMPTY STATE */
            <div className="rounded-2xl border border-dashed border-slate-200 bg-[#FAFBFD] px-5 py-16 text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50">
                <Package
                  size={32}
                  className="text-[#0755E9]"
                />
              </div>

              <h3 className="mt-5 font-bold text-[#101828]">
                No subcategories available
              </h3>

              <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-slate-500">
                There are currently no subcategories here.
                Please explore our other collections.
              </p>

              <Link
                href="/categories"
                className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[#0755E9] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#0645C4]"
              >
                Browse Categories
                <ArrowLeft size={16} />
              </Link>
            </div>
          )}
        </section>

        {/* RECENTLY VIEWED PRODUCTS */}
        <section
          className="mt-14 border-t border-slate-100 pt-10 sm:mt-20 sm:pt-14"
          aria-label="Recently viewed products"
        >
          <RecentlyViewed
            title="Recently Viewed Products"
            limit={5}
          />
        </section>

      </div>
    </main>
  );
}
