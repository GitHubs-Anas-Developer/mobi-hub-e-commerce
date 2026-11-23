
"use client";

import {
  ChevronLeft,
  ChevronRight,
  MoreHorizontal,
} from "lucide-react";

export default function ProductPagination({
  pagination,
  page,
  setPage,
}) {
  const currentPage = Math.max(
    1,
    Number(pagination?.page || page || 1)
  );

  const totalPages = Math.max(
    1,
    Number(pagination?.totalPages || 1)
  );

  const hasPrevPage =
    pagination?.hasPrevPage ?? currentPage > 1;

  const hasNextPage =
    pagination?.hasNextPage ?? currentPage < totalPages;

  if (totalPages <= 1) return null;

  // Generate compact page numbers
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
      pages.push("left-ellipsis");
    }

    const start = Math.max(2, currentPage - 1);
    const end = Math.min(totalPages - 1, currentPage + 1);

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    if (currentPage < totalPages - 2) {
      pages.push("right-ellipsis");
    }

    pages.push(totalPages);

    return pages;
  };

  const handlePageChange = (nextPage) => {
    const safePage = Math.min(
      totalPages,
      Math.max(1, nextPage)
    );

    if (safePage !== currentPage) {
      setPage?.(safePage);
    }
  };

  const pageNumbers = getPageNumbers();

  const buttonClass = `
    flex h-9 min-w-9 items-center justify-center
    rounded-lg border text-xs font-bold
    transition-all duration-200
    disabled:cursor-not-allowed disabled:opacity-40
  `;

  return (
    <nav
      aria-label="Product pagination"
      className="
        mt-8 flex flex-wrap items-center
        justify-center gap-2 sm:gap-3
      "
    >
      {/* Previous */}
      <button
        type="button"
        disabled={!hasPrevPage}
        onClick={() => handlePageChange(currentPage - 1)}
        aria-label="Previous page"
        className={`
          ${buttonClass}
          gap-1.5 border-slate-200 bg-white
          px-3 text-slate-600
          hover:border-blue-300 hover:text-blue-600
          sm:px-4
        `}
      >
        <ChevronLeft size={16} />
        <span className="hidden sm:inline">Previous</span>
      </button>

      {/* Page Numbers */}
      <div className="flex items-center gap-1.5">
        {pageNumbers.map((item) => {
          if (typeof item !== "number") {
            return (
              <span
                key={item}
                className="flex h-9 w-5 items-center justify-center text-slate-400"
                aria-hidden="true"
              >
                <MoreHorizontal size={17} />
              </span>
            );
          }

          const isActive = currentPage === item;

          return (
            <button
              key={item}
              type="button"
              onClick={() => handlePageChange(item)}
              aria-label={`Go to page ${item}`}
              aria-current={isActive ? "page" : undefined}
              className={`
                ${buttonClass}
                ${
                  isActive
                    ? "border-blue-600 bg-blue-600 text-white shadow-sm shadow-blue-600/20"
                    : "border-slate-200 bg-white text-slate-600 hover:border-blue-300 hover:bg-blue-50 hover:text-blue-600"
                }
              `}
            >
              {item}
            </button>
          );
        })}
      </div>

      {/* Next */}
      <button
        type="button"
        disabled={!hasNextPage}
        onClick={() => handlePageChange(currentPage + 1)}
        aria-label="Next page"
        className={`
          ${buttonClass}
          gap-1.5 border-slate-200 bg-white
          px-3 text-slate-600
          hover:border-blue-300 hover:text-blue-600
          sm:px-4
        `}
      >
        <span className="hidden sm:inline">Next</span>
        <ChevronRight size={16} />
      </button>
    </nav>
  );
}
