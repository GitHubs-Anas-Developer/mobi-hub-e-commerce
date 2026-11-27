"use client";

import { useMemo } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

export default function ProductPagination({
  pagination,
  page,
  setPage,
  currentPage,
  totalPages,
  onPageChange,
}) {
  const safeCurrentPage = Number(currentPage ?? page) || 1;
  const safeTotalPages =
    Number(totalPages ?? pagination?.totalPages) || 1;
  const handlePageChange = onPageChange ?? setPage;

  const pages = useMemo(() => {
    const items = [];

    for (let index = 1; index <= safeTotalPages; index += 1) {
      const isEdge = index === 1 || index === safeTotalPages;
      const isNearCurrent = Math.abs(index - safeCurrentPage) <= 1;

      if (isEdge || isNearCurrent) {
        items.push(index);
      } else if (items[items.length - 1] !== "...") {
        items.push("...");
      }
    }

    return items;
  }, [safeCurrentPage, safeTotalPages]);

  if (safeTotalPages <= 1) return null;

  const isFirst = safeCurrentPage <= 1;
  const isLast = safeCurrentPage >= safeTotalPages;

  return (
    <nav
      aria-label="Product pagination"
      className="mt-8 flex flex-col items-center justify-between gap-3 rounded-2xl border border-[#E2E8F0] bg-white px-4 py-3 sm:mt-10 sm:flex-row"
    >
      <p className="text-xs font-medium text-[#64748B] tabular-nums">
        Page{" "}
        <span className="font-bold text-[#101828]">{safeCurrentPage}</span> of{" "}
        <span className="font-bold text-[#101828]">{safeTotalPages}</span>
      </p>

      <div className="flex flex-wrap items-center justify-center gap-1.5">
        <button
          type="button"
          onClick={() => !isFirst && handlePageChange?.(safeCurrentPage - 1)}
          disabled={isFirst}
          aria-label="Previous page"
          className="inline-flex h-9 items-center gap-1 rounded-xl border border-[#E2E8F0] bg-white px-3 text-xs font-semibold text-[#101828] transition hover:border-[#0755E9]/40 hover:bg-[#EFF6FF] hover:text-[#0755E9] disabled:cursor-not-allowed disabled:opacity-45"
        >
          <ChevronLeft size={15} />
          <span className="hidden sm:inline">Previous</span>
        </button>

        {pages.map((item, index) =>
          item === "..." ? (
            <span
              key={`ellipsis-${index}`}
              className="px-2 text-xs font-bold text-slate-400"
            >
              ...
            </span>
          ) : (
            <button
              key={`page-${item}`}
              type="button"
              onClick={() => handlePageChange?.(item)}
              aria-label={`Page ${item}`}
              aria-current={item === safeCurrentPage ? "page" : undefined}
              className={`inline-flex h-9 min-w-9 items-center justify-center rounded-xl px-3 text-xs font-bold tabular-nums transition ${
                item === safeCurrentPage
                  ? "bg-[#0755E9] text-white shadow-xs"
                  : "border border-[#E2E8F0] bg-white text-[#64748B] hover:border-[#0755E9]/40 hover:bg-[#EFF6FF] hover:text-[#0755E9]"
              }`}
            >
              {item}
            </button>
          )
        )}

        <button
          type="button"
          onClick={() => !isLast && handlePageChange?.(safeCurrentPage + 1)}
          disabled={isLast}
          aria-label="Next page"
          className="inline-flex h-9 items-center gap-1 rounded-xl border border-[#E2E8F0] bg-white px-3 text-xs font-semibold text-[#101828] transition hover:border-[#0755E9]/40 hover:bg-[#EFF6FF] hover:text-[#0755E9] disabled:cursor-not-allowed disabled:opacity-45"
        >
          <span className="hidden sm:inline">Next</span>
          <ChevronRight size={15} />
        </button>
      </div>
    </nav>
  );
}
