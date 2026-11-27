"use client";

import { Search, AlertCircle } from "lucide-react";
import SearchSkeleton from "@/components/loading/skeletons/SearchSkeleton";

export default function SearchEmptyState({
  loading = false,
  error = null,
  hasQuery = false,
  query = "",
}) {
  if (loading) {
    return <SearchSkeleton count={4} />;
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center px-4 py-8 text-center">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-red-200 bg-red-50 text-red-600">
          <AlertCircle size={20} aria-hidden="true" />
        </div>
        <p className="mt-3 text-sm font-bold text-[#101828]">
          Unable to load suggestions
        </p>
        <p className="mt-1 text-xs text-[#64748B]">{error}</p>
      </div>
    );
  }

  if (hasQuery) {
    return (
      <div className="flex flex-col items-center justify-center px-4 py-8 text-center">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] text-[#64748B]">
          <Search size={20} aria-hidden="true" />
        </div>
        <p className="mt-3 text-sm font-bold text-[#101828]">
          No quick suggestions for &ldquo;{query.trim()}&rdquo;
        </p>
        <p className="mt-1 text-xs text-[#64748B]">
          Press Enter or click Search to view full catalog matches.
        </p>
      </div>
    );
  }

  return (
    <div className="px-4 py-6 text-center">
      <p className="text-sm font-semibold text-[#101828]">
        Search ELENZO Catalog
      </p>
      <p className="mt-1 text-xs text-[#64748B]">
        Type at least 2 characters for product, brand, and category suggestions.
      </p>
    </div>
  );
}
