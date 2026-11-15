
"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";

export default function ReviewPagination({
  page = 1,
  totalPages = 1,
  onPageChange,
  disabled = false,
}) {
  if (totalPages <= 1) return null;

  const currentPage = Math.min(
    totalPages,
    Math.max(1, page)
  );

  const getPageNumbers = () => {
    const pages = [];

    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }

      return pages;
    }

    pages.push(1);

    if (currentPage > 3) {
      pages.push("...");
    }

    const start = Math.max(2, currentPage - 1);
    const end = Math.min(totalPages - 1, currentPage + 1);

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    if (currentPage < totalPages - 2) {
      pages.push("...");
    }

    pages.push(totalPages);

    return pages;
  };

  const pageNumbers = getPageNumbers();

  const buttonBase =
    "inline-flex h-10 items-center justify-center rounded-xl border text-sm font-semibold transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-40";

  return (
    <nav
      className="flex flex-wrap items-center justify-center gap-2 sm:gap-3"
      aria-label="Review pagination"
    >
      {/* Previous */}
      <button
        type="button"
        onClick={() => onPageChange?.(currentPage - 1)}
        disabled={disabled || currentPage <= 1}
        aria-label="Go to previous page"
        className={`${buttonBase} gap-1 border-slate-200 bg-white px-3 text-slate-600 hover:border-blue-200 hover:bg-blue-50 hover:text-[#0755e9] sm:px-4`}
      >
        <ChevronLeft size={17} />
        <span className="hidden sm:inline">Previous</span>
      </button>

      {/* Page Numbers */}
      <div className="flex items-center gap-1.5">
        {pageNumbers.map((item, index) => {
          if (item === "...") {
            return (
              <span
                key={`ellipsis-${index}`}
                className="flex h-10 w-7 items-center justify-center text-sm font-medium text-slate-400"
                aria-hidden="true"
              >
                ...
              </span>
            );
          }

          const isActive = item === currentPage;

          return (
            <button
              key={item}
              type="button"
              onClick={() => onPageChange?.(item)}
              disabled={disabled || isActive}
              aria-label={`Go to page ${item}`}
              aria-current={isActive ? "page" : undefined}
              className={`h-10 min-w-10 rounded-xl border px-3 text-sm font-semibold transition-all duration-200 disabled:cursor-default ${
                isActive
                  ? "border-[#0755e9] bg-[#0755e9] text-white shadow-sm shadow-blue-200"
                  : "border-slate-200 bg-white text-slate-600 hover:border-blue-200 hover:bg-blue-50 hover:text-[#0755e9]"
              }`}
            >
              {item}
            </button>
          );
        })}
      </div>

      {/* Next */}
      <button
        type="button"
        onClick={() => onPageChange?.(currentPage + 1)}
        disabled={disabled || currentPage >= totalPages}
        aria-label="Go to next page"
        className={`${buttonBase} gap-1 border-slate-200 bg-white px-3 text-slate-600 hover:border-blue-200 hover:bg-blue-50 hover:text-[#0755e9] sm:px-4`}
      >
        <span className="hidden sm:inline">Next</span>
        <ChevronRight size={17} />
      </button>
    </nav>
  );
}
