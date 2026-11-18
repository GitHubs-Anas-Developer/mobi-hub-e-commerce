
"use client";

import { Clock, ArrowUpRight } from "lucide-react";

export default function SearchRecentSearches({
  searches = [],
  onSelect,
}) {
  if (!searches.length) return null;

  return (
    <section className="mb-4">
      <div className="mb-2 flex items-center gap-2 px-2">
        <Clock size={15} className="text-slate-400" />

        <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-400">
          Recent Searches
        </h3>
      </div>

      <div className="space-y-1">
        {searches.map((item, index) => (
          <button
            key={`${item}-${index}`}
            type="button"
            onClick={() => onSelect(item)}
            className="group flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left text-sm text-slate-700 transition hover:bg-slate-50"
          >
            <span className="flex items-center gap-3">
              <Clock
                size={15}
                className="text-slate-400"
              />
              {item}
            </span>

            <ArrowUpRight
              size={15}
              className="text-slate-300 opacity-0 transition group-hover:opacity-100"
            />
          </button>
        ))}
      </div>
    </section>
  );
}
