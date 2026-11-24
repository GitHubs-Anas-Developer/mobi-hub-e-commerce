
"use client";

import { useState } from "react";
import { Check } from "lucide-react";

export default function BrandOptions({
  brands,
  brand,
  setBrand,
  mobile = false,
}) {
  const [showAll, setShowAll] = useState(false);

  const visibleBrands = showAll
    ? brands
    : brands.slice(0, 6);

  return (
    <>
      {brands.length > 0 ? (
        <div className="grid grid-cols-2 gap-2">
          {["", ...visibleBrands].map((item) => {
            const selected = brand === item;

            return mobile ? (
              <button
                key={item || "all-brands-mobile"}
                type="button"
                onClick={() => setBrand(item)}
                aria-pressed={selected}
                className={`flex min-w-0 items-center justify-between gap-2 rounded-xl border px-3 py-3 text-left transition ${
                  selected
                    ? "border-blue-300 bg-blue-50 text-blue-700"
                    : "border-slate-200 bg-white text-slate-600"
                }`}
              >
                <span
                  className={`truncate text-[11px] ${
                    selected ? "font-bold" : "font-semibold"
                  }`}
                >
                  {item || "All Brands"}
                </span>

                {selected && (
                  <Check
                    size={14}
                    className="shrink-0 text-blue-600"
                  />
                )}
              </button>
            ) : (
              <label
                key={item || "all-brands"}
                className={`flex min-w-0 cursor-pointer items-center gap-2 rounded-lg border px-2.5 py-2.5 transition ${
                  selected
                    ? "border-blue-200 bg-blue-50 text-blue-700"
                    : "border-slate-200 bg-white text-slate-600 hover:border-blue-200"
                }`}
              >
                <input
                  type="radio"
                  name="product-brand-filter"
                  checked={selected}
                  onChange={() => setBrand(item)}
                  className="h-3.5 w-3.5 shrink-0 accent-blue-600"
                />

                <span className="truncate text-[10px] font-semibold">
                  {item || "All Brands"}
                </span>
              </label>
            );
          })}
        </div>
      ) : (
        <p className="text-xs text-slate-400">
          No brands available
        </p>
      )}

      {brands.length > 6 && (
        <button
          type="button"
          onClick={() => setShowAll((value) => !value)}
          className="mt-3 flex items-center gap-1 text-xs font-bold text-blue-600"
        >
          {showAll ? "Show less" : "View all brands"}

          {showAll ? (
            "Show less"
          ) : null}
        </button>
      )}
    </>
  );
}
