
"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";

export default function ProductPagination({
  pagination,
  page,
  setPage,
}) {
  const currentPage = pagination?.page || page || 1;
  const totalPages = pagination?.totalPages || 1;

  if (totalPages <= 1) return null;

  return (
    <div className="mt-8 flex items-center justify-center gap-4">
      {/* Previous */}
      <button
        type="button"
        disabled={!pagination?.hasPrevPage}
        onClick={() => setPage((current) => current - 1)}
        className="flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-blue-300 hover:text-blue-600 disabled:cursor-not-allowed disabled:opacity-40"
      >
        <ChevronLeft size={17} />
        Previous
      </button>

      {/* Page Information */}
      <span className="text-sm font-medium text-slate-600">
        Page {currentPage} of {totalPages}
      </span>

      {/* Next */}
      <button
        type="button"
        disabled={!pagination?.hasNextPage}
        onClick={() => setPage((current) => current + 1)}
        className="flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-blue-300 hover:text-blue-600 disabled:cursor-not-allowed disabled:opacity-40"
      >
        Next
        <ChevronRight size={17} />
      </button>
    </div>
  );
}
