
"use client";

import { useCallback, useEffect, useState } from "react";
import {
  RefreshCw,
  Package,
  AlertCircle,
  LoaderCircle,
} from "lucide-react";

import categoryService from "@/services/categoryService";
import CategoryCard from "./CategoryCard";
import CategorySkeleton from "./CategorySkeleton";

function getCategoryData(response) {
  if (Array.isArray(response)) return response;
  if (Array.isArray(response?.data)) return response.data;
  if (Array.isArray(response?.categories)) return response.categories;
  if (Array.isArray(response?.results)) return response.results;

  if (Array.isArray(response?.data?.categories)) {
    return response.data.categories;
  }

  return [];
}


export default function CategoryGrid() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchCategories = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const response = await categoryService.getCategories({
        parentCategory: "null",
      });

      setCategories(getCategoryData(response));
    } catch (err) {
      console.error("Category fetch error:", err);

      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Unable to load categories. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  // Initial loading only
  if (loading && categories.length === 0 && !error) {
    return <CategorySkeleton/>
  }

  // Error when no existing categories are available
  if (error && categories.length === 0) {
    return (
      <div
        className="flex flex-col items-center rounded-2xl border border-red-100 bg-red-50 px-5 py-12 text-center"
        role="alert"
      >
        <AlertCircle
          size={36}
          className="text-red-400"
          aria-hidden="true"
        />

        <h3 className="mt-4 font-bold text-slate-800">
          Something went wrong
        </h3>

        <p className="mt-2 max-w-md text-sm text-slate-500">
          {error}
        </p>

        <button
          type="button"
          onClick={fetchCategories}
          disabled={loading}
          className="mt-5 inline-flex items-center gap-2 rounded-xl bg-[#0755E9] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#0645C4] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0755E9] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? (
            <LoaderCircle size={16} className="animate-spin" />
          ) : (
            <RefreshCw size={15} aria-hidden="true" />
          )}
          {loading ? "Retrying..." : "Try Again"}
        </button>
      </div>
    );
  }

  if (!categories.length && !loading) {
    return (
      <div className="flex flex-col items-center rounded-2xl border border-dashed border-slate-200 bg-slate-50/50 px-5 py-16 text-center">
        <Package
          size={40}
          className="text-slate-300"
          aria-hidden="true"
        />

        <h3 className="mt-4 font-bold text-slate-800">
          No categories available
        </h3>

        <p className="mt-2 text-sm text-slate-500">
          Categories will appear here once added.
        </p>
      </div>
    );
  }

  return (
    <div
      className="relative"
      aria-busy={loading}
    >
      {error && (
        <div
          className="mb-4 flex items-center justify-between gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3"
          role="status"
        >
          <p className="text-xs font-medium text-amber-800">
            Unable to refresh categories. Showing previously loaded categories.
          </p>

          <button
            type="button"
            onClick={fetchCategories}
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

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-5 lg:grid-cols-4 xl:grid-cols-5">
        {categories.map((category, index) => (
          <CategoryCard
            key={category._id || category.slug || index}
            category={category}
            index={index}
          />
        ))}
      </div>
    </div>
  );
}
