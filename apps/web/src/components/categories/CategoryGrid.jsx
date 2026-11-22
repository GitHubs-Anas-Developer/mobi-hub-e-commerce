
"use client";

import { useCallback, useEffect, useState } from "react";
import { RefreshCw, Package, AlertCircle } from "lucide-react";

import categoryService from "@/services/categoryService";
import CategoryCard from "./CategoryCard";
import CategorySkeleton from "./CategorySkeleton";

function getCategoryData(response) {
  if (Array.isArray(response)) return response;

  if (Array.isArray(response?.data)) return response.data;

  if (Array.isArray(response?.categories)) {
    return response.categories;
  }

  if (Array.isArray(response?.results)) {
    return response.results;
  }

  // Supports API response: { data: { categories: [] } }
  if (Array.isArray(response?.data?.categories)) {
    return response.data.categories;
  }

  return [];
}

function CategoryGridSkeleton() {
  return (
    <div
      className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-5 lg:grid-cols-4 xl:grid-cols-5"
      aria-label="Loading categories"
      aria-busy="true"
    >
      {Array.from({ length: 10 }).map((_, index) => (
        <CategorySkeleton key={index} />
      ))}
    </div>
  );
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

      const data = getCategoryData(response);

      setCategories(data);
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
    let isMounted = true;

    const loadCategories = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await categoryService.getCategories({
          parentCategory: "null",
        });

        if (!isMounted) return;

        setCategories(getCategoryData(response));
      } catch (err) {
        if (!isMounted) return;

        console.error("Category fetch error:", err);

        setError(
          err?.response?.data?.message ||
            err?.message ||
            "Unable to load categories. Please try again."
        );
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadCategories();

    return () => {
      isMounted = false;
    };
  }, []);

  if (loading) {
    return <CategoryGridSkeleton />;
  }

  if (error) {
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
          <RefreshCw size={15} aria-hidden="true" />
          Try Again
        </button>
      </div>
    );
  }

  if (!categories.length) {
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
      className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-5 lg:grid-cols-4 xl:grid-cols-5"
      aria-label="Product categories"
    >
      {categories.map((category, index) => (
        <CategoryCard
          key={category._id || category.slug || index}
          category={category}
          index={index}
        />
      ))}
    </div>
  );
}
