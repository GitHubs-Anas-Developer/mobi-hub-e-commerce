
"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";

export default function ReviewPagination({
  page = 1,
  totalPages = 1,
  onPageChange,
  disabled = false,
}) {
  if (totalPages <= 1) return null;

  return (
    <nav
      className="mt-6 flex items-center justify-center gap-4"
      aria-label="Review pagination"
    >
      <button
        type="button"
        onClick={() => onPageChange?.(page - 1)}
        disabled={disabled || page <= 1}
        className="inline-flex items-center gap-1 rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
      >
        <ChevronLeft size={16} />
        Previous
      </button>

      <span className="text-sm font-medium text-slate-600">
        Page {page} of {totalPages}
      </span>

      <button
        type="button"
        onClick={() => onPageChange?.(page + 1)}
        disabled={disabled || page >= totalPages}
        className="inline-flex items-center gap-1 rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
      >
        Next
        <ChevronRight size={16} />
      </button>
    </nav>
  );
}
