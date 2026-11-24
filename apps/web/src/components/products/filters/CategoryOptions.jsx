
"use client";

import { useState } from "react";
import { Check, ChevronDown, ChevronUp } from "lucide-react";

export default function CategoryOptions({
  categories,
  category,
  setCategory,
  mobile = false,
}) {
  const [showAll, setShowAll] = useState(false);

  const visibleCategories = showAll
    ? categories
    : categories.slice(0, 6);

  if (mobile) {
    return (
      <div className="space-y-2">
        <button
          type="button"
          onClick={() => setCategory("")}
          aria-pressed={!category}
          className={`flex w-full items-center justify-between rounded-xl border px-3.5 py-3 transition ${
            !category
              ? "border-blue-300 bg-blue-50"
              : "border-slate-200 bg-white"
          }`}
        >
          <div className="flex items-center gap-3">
            <span
              className={`flex h-5 w-5 items-center justify-center rounded-full border ${
                !category
                  ? "border-blue-600 bg-blue-600"
                  : "border-slate-300"
              }`}
            >
              {!category && (
                <span className="h-2 w-2 rounded-full bg-white" />
              )}
            </span>

            <span
              className={`text-xs ${
                !category
                  ? "font-bold text-blue-700"
                  : "font-medium text-slate-700"
              }`}
            >
              All Categories
            </span>
          </div>

          {!category && (
            <Check size={16} className="text-blue-600" />
          )}
        </button>

        <div className="grid grid-cols-2 gap-2">
          {visibleCategories.map((item) => {
            const selected = category === item._id;

            return (
              <button
                key={item._id}
                type="button"
                onClick={() => setCategory(item._id)}
                aria-pressed={selected}
                className={`flex min-w-0 items-center justify-between gap-2 rounded-xl border px-2.5 py-3 text-left transition ${
                  selected
                    ? "border-blue-300 bg-blue-50 text-blue-700"
                    : "border-slate-200 bg-white text-slate-600"
                }`}
              >
                <span
                  className={`truncate text-[11px] ${
                    selected ? "font-bold" : "font-medium"
                  }`}
                >
                  {item.name}
                </span>

                {selected && (
                  <Check
                    size={14}
                    className="shrink-0 text-blue-600"
                  />
                )}
              </button>
            );
          })}
        </div>

        {categories.length > 6 && (
          <button
            type="button"
            onClick={() => setShowAll((value) => !value)}
            className="mt-2 flex items-center gap-1.5 text-xs font-bold text-blue-600"
          >
            {showAll ? "Show less" : "View all categories"}

            {showAll ? (
              <ChevronUp size={14} />
            ) : (
              <ChevronDown size={14} />
            )}
          </button>
        )}
      </div>
    );
  }

  return (
    <>
      <div className="space-y-1.5">
        {[
          { _id: "", name: "All Categories" },
          ...visibleCategories,
        ].map((item) => {
          const selected = category === item._id;

          return (
            <label
              key={item._id || "all-categories"}
              className={`flex cursor-pointer items-center gap-2.5 rounded-lg px-2.5 py-2.5 transition ${
                selected
                  ? "bg-blue-50 text-blue-700"
                  : "text-slate-600 hover:bg-slate-50"
              }`}
            >
              <input
                type="radio"
                name="product-category-filter"
                checked={selected}
                onChange={() => setCategory(item._id)}
                className="h-4 w-4 accent-blue-600"
              />

              <span
                className={`flex-1 text-xs ${
                  selected ? "font-bold" : "font-medium"
                }`}
              >
                {item.name}
              </span>

              {selected && (
                <Check size={14} className="text-blue-600" />
              )}
            </label>
          );
        })}
      </div>

      {categories.length > 6 && (
        <button
          type="button"
          onClick={() => setShowAll((value) => !value)}
          className="mt-3 flex items-center gap-1 text-xs font-bold text-blue-600"
        >
          {showAll ? "Show less" : "View all categories"}

          {showAll ? (
            <ChevronUp size={14} />
          ) : (
            <ChevronDown size={14} />
          )}
        </button>
      )}
    </>
  );
}
