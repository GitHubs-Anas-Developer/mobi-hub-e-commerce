
"use client";

import { Loader2, Search, AlertCircle } from "lucide-react";

export default function SearchEmptyState({
  loading,
  error,
  hasQuery,
}) {
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-10">
        <Loader2 className="mb-3 animate-spin text-blue-600" size={25} />

        <p className="text-sm font-medium text-slate-600">
          Searching products...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-10">
        <AlertCircle size={27} className="mb-3 text-red-400" />

        <p className="text-sm font-medium text-slate-700">
          Unable to search right now
        </p>

        <p className="mt-1 text-xs text-slate-400">
          {error}
        </p>
      </div>
    );
  }

  if (hasQuery) {
    return (
      <div className="flex flex-col items-center justify-center py-10">
        <Search size={28} className="mb-3 text-slate-300" />

        <p className="text-sm font-semibold text-slate-700">
          No results found
        </p>

        <p className="mt-1 text-xs text-slate-400">
          Try another product or brand
        </p>
      </div>
    );
  }

  return (
    <p className="py-6 text-center text-sm text-slate-400">
      Start typing to search products
    </p>
  );
}
