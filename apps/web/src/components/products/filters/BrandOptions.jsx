"use client";

import { useState } from "react";
import { Check, ChevronDown, ChevronUp } from "lucide-react";

export default function BrandOptions({
  brands = [],
  brand = "",
  setBrand,
  mobile = false,
}) {
  const [showAll, setShowAll] = useState(false);

  if (brands.length === 0) {
    return (
      <p className="rounded-xl bg-[#F8FAFC] px-3 py-2.5 text-xs text-[#64748B]">
        No brands available for this view
      </p>
    );
  }

  const visibleBrands = showAll ? brands : brands.slice(0, 6);
  const items = ["", ...visibleBrands];

  const handleToggle = (value) => {
    if (!value) {
      setBrand("");
      return;
    }
    setBrand(brand === value ? "" : value);
  };

  if (mobile) {
    return (
      <>
        <div className="flex flex-wrap gap-2">
          {items.map((item) => {
            const selected = brand === item;

            return (
              <button
                key={item || "all-brands-mobile"}
                type="button"
                aria-pressed={selected}
                onClick={() => handleToggle(item)}
                className={`inline-flex items-center gap-1.5 rounded-xl border px-3 py-2 text-xs font-semibold transition active:scale-[0.98] ${
                  selected
                    ? "border-[#0755E9] bg-[#0755E9] text-white shadow-xs"
                    : "border-[#E2E8F0] bg-[#F8FAFC] text-[#101828] hover:border-[#0755E9]/40"
                }`}
              >
                {selected && <Check size={13} strokeWidth={2.5} />}
                <span>{item || "All Brands"}</span>
              </button>
            );
          })}
        </div>

        {brands.length > 6 && (
          <button
            type="button"
            onClick={() => setShowAll((value) => !value)}
            className="mt-3 flex items-center gap-1 text-xs font-semibold text-[#0755E9]"
          >
            {showAll ? "Show less" : `View all ${brands.length} brands`}
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
          const selected = brand === item;

          return (
            <label
              key={item || "all-brands"}
              className={`flex cursor-pointer items-center gap-2.5 rounded-xl px-2.5 py-2 transition ${
                selected
                  ? "bg-[#EFF6FF] text-[#082B70]"
                  : "text-[#101828] hover:bg-[#F8FAFC]"
              }`}
            >
              <input
                type="checkbox"
                checked={selected}
                onChange={() => handleToggle(item)}
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
                {item || "All Brands"}
              </span>
            </label>
          );
        })}
      </div>

      {brands.length > 6 && (
        <button
          type="button"
          onClick={() => setShowAll((value) => !value)}
          className="mt-2.5 flex items-center gap-1 text-xs font-semibold text-[#0755E9] transition hover:text-[#082B70]"
        >
          {showAll ? "Show less" : `View all (${brands.length})`}
          {showAll ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </button>
      )}
    </>
  );
}
