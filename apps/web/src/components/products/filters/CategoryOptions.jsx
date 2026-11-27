"use client";

import { useState } from "react";
import { Check, ChevronDown, ChevronUp } from "lucide-react";

export default function CategoryOptions({
  categories = [],
  category = "",
  setCategory,
  mobile = false,
}) {
  const [showAll, setShowAll] = useState(false);

  const visibleCategories = showAll ? categories : categories.slice(0, 6);

  const items = [{ _id: "", name: "All Categories" }, ...visibleCategories];

  const handleToggle = (id) => {
    if (!id) {
      setCategory("");
      return;
    }
    setCategory(String(category) === String(id) ? "" : id);
  };

  if (mobile) {
    return (
      <>
        <div className="flex flex-wrap gap-2">
          {items.map((item) => {
            const selected = String(category) === String(item._id);

            return (
              <button
                key={item._id || "all-categories-mobile"}
                type="button"
                aria-pressed={selected}
                onClick={() => handleToggle(item._id)}
                className={`inline-flex items-center gap-1.5 rounded-xl border px-3 py-2 text-xs font-semibold transition active:scale-[0.98] ${
                  selected
                    ? "border-[#0755E9] bg-[#0755E9] text-white shadow-xs"
                    : "border-[#E2E8F0] bg-[#F8FAFC] text-[#101828] hover:border-[#0755E9]/40"
                }`}
              >
                {selected && <Check size={13} strokeWidth={2.5} />}
                <span>{item.name}</span>
              </button>
            );
          })}
        </div>

        {categories.length > 6 && (
          <button
            type="button"
            onClick={() => setShowAll((value) => !value)}
            className="mt-3 flex items-center gap-1 text-xs font-semibold text-[#0755E9]"
          >
            {showAll
              ? "Show fewer categories"
              : `Show all ${categories.length} categories`}
            {showAll ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>
        )}
      </>
    );
  }

  return (
    <>
      <div className="space-y-1">
        {items.map((item) => {
          const selected = String(category) === String(item._id);

          return (
            <label
              key={item._id || "all-categories"}
              className={`flex cursor-pointer items-center gap-2.5 rounded-xl px-2.5 py-2 transition ${
                selected
                  ? "bg-[#EFF6FF] text-[#082B70]"
                  : "text-[#101828] hover:bg-[#F8FAFC]"
              }`}
            >
              <input
                type="checkbox"
                checked={selected}
                onChange={() => handleToggle(item._id)}
                className="sr-only"
              />

              <span
                aria-hidden="true"
                className={`flex h-4 w-4 shrink-0 items-center justify-center rounded border transition ${
                  selected
                    ? "border-[#0755E9] bg-[#0755E9] text-white"
                    : "border-[#CBD5E1] bg-white"
                }`}
              >
                {selected && <Check size={11} strokeWidth={3} />}
              </span>

              <span
                className={`flex-1 truncate text-xs ${
                  selected ? "font-bold text-[#082B70]" : "font-medium text-[#64748B]"
                }`}
              >
                {item.name}
              </span>
            </label>
          );
        })}
      </div>

      {categories.length > 6 && (
        <button
          type="button"
          onClick={() => setShowAll((value) => !value)}
          className="mt-2.5 flex items-center gap-1 text-xs font-semibold text-[#0755E9] transition hover:text-[#082B70]"
        >
          {showAll ? "Show less" : `View all (${categories.length})`}
          {showAll ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </button>
      )}
    </>
  );
}
