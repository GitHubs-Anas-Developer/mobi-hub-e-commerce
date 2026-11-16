
"use client";

import { useCallback, useEffect, useState } from "react";
import { RefreshCw, Package } from "lucide-react";

import categoryService from "@/services/categoryService";
import CategoryCard from "./CategoryCard";
import CategorySkeleton from "./CategorySkeleton";

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

      // categoryService returns response.data
      // API returns { success, results, data: [] }
      const data = Array.isArray(response)
        ? response
        : Array.isArray(response?.data)
          ? response.data
          : Array.isArray(response?.categories)
            ? response.categories
            : [];

      setCategories(data);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to load categories. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  if (loading) {
    return (
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-5 lg:grid-cols-4 xl:grid-cols-5">
        {Array.from({ length: 10 }).map((_, index) => (
          <CategorySkeleton key={index} />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center rounded-2xl border border-red-100 bg-red-50 px-5 py-12 text-center">
        <Package size={36} className="text-red-400" />

        <h3 className="mt-4 font-bold text-slate-800">
          Something went wrong
        </h3>

        <p className="mt-2 text-sm text-slate-500">
          {error}
        </p>

        <button
          onClick={fetchCategories}
          className="mt-5 inline-flex items-center gap-2 rounded-xl bg-[#0755E9] px-5 py-3 text-sm font-semibold text-white hover:bg-[#0645C4]"
        >
          <RefreshCw size={15} />
          Try Again
        </button>
      </div>
    );
  }

  if (!categories.length) {
    return (
      <div className="flex flex-col items-center rounded-2xl border border-dashed border-slate-200 py-16 text-center">
        <Package size={40} className="text-slate-300" />

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
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-5 lg:grid-cols-4 xl:grid-cols-5">
      {categories.map((category, index) => (
        <CategoryCard
          key={category._id}
          category={category}
          index={index}
        />
      ))}
    </div>
  );
}
