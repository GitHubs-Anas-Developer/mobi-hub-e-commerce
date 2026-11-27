"use client";

import { Clock, ArrowUpRight, Trash2 } from "lucide-react";

export default function SearchRecentSearches({
  searches = [],
  onSelect,
  onClearAll,
}) {
  if (!Array.isArray(searches) || searches.length === 0) return null;

  return (
    <section className="mb-3">
      <div className="mb-2 flex items-center justify-between gap-2 px-2">
        <div className="flex items-center gap-1.5">
          <Clock size={14} className="text-[#64748B]" aria-hidden="true" />
          <h3 className="text-[11px] font-bold uppercase tracking-wider text-[#64748B]">
            Recent Searches
          </h3>
        </div>

        {onClearAll && (
          <button
            type="button"
            onClick={onClearAll}
            className="inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[11px] font-semibold text-[#64748B] transition hover:bg-red-50 hover:text-red-600"
          >
            <Trash2 size={11} aria-hidden="true" />
            Clear
          </button>
        )}
      </div>

      <div className="space-y-1">
        {searches.map((item, index) => (
          <button
            key={`${item}-${index}`}
            type="button"
            onClick={() => onSelect?.(item)}
            className="group flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-sm font-medium text-[#101828] transition hover:bg-[#EFF6FF] hover:text-[#0755E9]"
          >
            <span className="flex min-w-0 items-center gap-2.5">
              <Clock
                size={14}
                className="shrink-0 text-[#64748B] group-hover:text-[#0755E9]"
                aria-hidden="true"
              />
              <span className="truncate">{item}</span>
            </span>

            <ArrowUpRight
              size={14}
              aria-hidden="true"
              className="shrink-0 text-[#64748B] opacity-0 transition group-hover:text-[#0755E9] group-hover:opacity-100"
            />
          </button>
        ))}
      </div>
    </section>
  );
}
