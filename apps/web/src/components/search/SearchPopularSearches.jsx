
"use client";

import { TrendingUp } from "lucide-react";

export default function SearchPopularSearches({
  searches = [],
  onSelect,
}) {
  if (!searches.length) return null;

  return (
    <section className="mb-3">
      <div className="mb-3 flex items-center gap-2 px-2">
        <TrendingUp size={15} className="text-slate-400" />

        <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-400">
          Popular Searches
        </h3>
      </div>

      <div className="flex flex-wrap gap-2 px-2">
        {searches.map((item, index) => (
          <button
            key={`${item}-${index}`}
            type="button"
            onClick={() => onSelect(item)}
            className="rounded-full border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-600 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-600"
          >
            {item}
          </button>
        ))}
      </div>
    </section>
  );
}
