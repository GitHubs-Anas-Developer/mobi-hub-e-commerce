
"use client";

import { use, useCallback, useEffect, useState } from "react";
import Link from "next/link";

import {
  ChevronRight,
  Home,
  Package,
  RefreshCw,
} from "lucide-react";

import categoryService from "@/services/categoryService";

import CategoryCard from "@/components/categories/CategoryCard";
import CategorySkeleton from "@/components/categories/CategorySkeleton";

export default function SubcategoryPageClient({ params }) {
  // Resolve Next.js runtime params inside Suspense
  const { categoryId } = use(params);

  const [category, setCategory] = useState(null);
  const [subcategories, setSubcategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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

      const categoryResult =
        categoryResponse?.data?.data ??
        categoryResponse?.data ??
        categoryResponse;

      const subcategoryResult =
        subcategoryResponse?.data?.data ??
        subcategoryResponse?.data ??
        subcategoryResponse;

      setCategory(categoryResult);

      const data = Array.isArray(subcategoryResult)
        ? subcategoryResult
        : Array.isArray(subcategoryResult?.categories)
          ? subcategoryResult.categories
          : [];

      setSubcategories(data);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to load subcategories. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }, [categoryId]);

  useEffect(() => {
    if (categoryId) {
      fetchSubcategories();
    }
  }, [categoryId, fetchSubcategories]);

  return (
    <main className="min-h-screen bg-[#F8FAFC]">
      <div className="mx-auto w-full px-4 py-6 sm:px-6 sm:py-10 lg:px-8">

        {/* Breadcrumb */}
        <nav className="mb-6 flex flex-wrap items-center gap-2 text-xs font-medium text-slate-400 sm:text-sm">
          <Link
            href="/"
            aria-label="Home"
            className="transition-colors hover:text-[#0755E9]"
          >
            <Home size={15} />
          </Link>

          <ChevronRight size={14} />

          <Link
            href="/categories"
            className="transition-colors hover:text-[#0755E9]"
          >
            All Categories
          </Link>

          <ChevronRight size={14} />

          <span className="font-semibold text-[#0755E9]">
            {category?.name || "Subcategories"}
          </span>
        </nav>

        {/* Header */}
        <section className="rounded-2xl bg-gradient-to-r from-[#082B70] to-[#0755E9] p-6 text-white sm:p-10">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-blue-200">
            Explore Collection
          </p>

          <h1 className="mt-3 text-2xl font-bold sm:text-3xl">
            {category?.name || "Explore Categories"}
          </h1>

          <p className="mt-2 max-w-xl text-sm leading-6 text-blue-100">
            Choose a subcategory to discover products from our collection.
          </p>
        </section>

        {/* Subcategories */}
        <section className="mt-10">
          <div className="mb-6">
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#0755E9]">
              Browse Collection
            </p>

            <h2 className="mt-2 text-xl font-bold text-[#101828] sm:text-2xl">
              Subcategories
            </h2>

            <p className="mt-2 text-sm text-slate-500">
              Select a subcategory to view available products.
            </p>
          </div>

          {loading ? (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-5 lg:grid-cols-4 xl:grid-cols-5">
              {Array.from({ length: 8 }).map((_, index) => (
                <CategorySkeleton key={index} />
              ))}
            </div>
          ) : error ? (
            <div className="rounded-2xl border border-red-100 bg-red-50 p-8 text-center">
              <p className="text-sm text-red-600">{error}</p>

              <button
                type="button"
                onClick={fetchSubcategories}
                className="mt-4 inline-flex items-center gap-2 rounded-xl bg-[#0755E9] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#0645C4]"
              >
                <RefreshCw size={15} />
                Try Again
              </button>
            </div>
          ) : subcategories.length > 0 ? (
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
            <div className="rounded-2xl border border-dashed border-slate-200 bg-white py-16 text-center">
              <Package
                size={40}
                className="mx-auto text-slate-300"
              />

              <h3 className="mt-4 font-bold text-slate-800">
                No subcategories available
              </h3>

              <p className="mt-2 text-sm text-slate-500">
                Please explore another category.
              </p>

              <Link
                href="/categories"
                className="mt-5 inline-block rounded-xl bg-[#0755E9] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#0645C4]"
              >
                Browse Categories
              </Link>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
