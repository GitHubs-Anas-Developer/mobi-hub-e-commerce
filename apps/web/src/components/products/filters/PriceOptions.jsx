"use client";

import { X } from "lucide-react";
import { priceRanges } from "./constants/filterConstants";
import { updateMinPrice, updateMaxPrice } from "./utils/filterHelpers";

export default function PriceOptions({
  minPrice,
  setMinPrice,
  maxPrice,
  setMaxPrice,
  mobile = false,
}) {
  const inputClass = `flex items-center rounded-xl border border-[#E2E8F0] transition focus-within:border-[#0755E9] focus-within:bg-white focus-within:ring-2 focus-within:ring-[#0755E9]/15 ${
    mobile ? "bg-[#F8FAFC] px-3 py-2.5" : "bg-white px-2.5 py-2"
  }`;

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-2.5">
        <div>
          <label className="mb-1 block text-[11px] font-semibold text-[#64748B]">
            Min Price
          </label>
          <div className={inputClass}>
            <span className="mr-1 text-xs font-semibold text-[#64748B]">
              ₹
            </span>
            <input
              type="number"
              min="0"
              inputMode="numeric"
              value={minPrice}
              onChange={(event) =>
                updateMinPrice(
                  event.target.value,
                  maxPrice,
                  setMinPrice,
                  setMaxPrice
                )
              }
              placeholder="0"
              aria-label="Minimum price"
              className="w-full min-w-0 bg-transparent text-xs font-bold text-[#101828] tabular-nums outline-none placeholder:font-normal placeholder:text-slate-400"
            />
          </div>
        </div>

        <div>
          <label className="mb-1 block text-[11px] font-semibold text-[#64748B]">
            Max Price
          </label>
          <div className={inputClass}>
            <span className="mr-1 text-xs font-semibold text-[#64748B]">
              ₹
            </span>
            <input
              type="number"
              min="0"
              inputMode="numeric"
              value={maxPrice}
              onChange={(event) =>
                updateMaxPrice(
                  event.target.value,
                  minPrice,
                  setMinPrice,
                  setMaxPrice
                )
              }
              placeholder="Any"
              aria-label="Maximum price"
              className="w-full min-w-0 bg-transparent text-xs font-bold text-[#101828] tabular-nums outline-none placeholder:font-normal placeholder:text-slate-400"
            />
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-1.5">
        {priceRanges.map((range) => {
          const active =
            String(minPrice) === range.min &&
            String(maxPrice) === range.max;

          return (
            <button
              key={range.label}
              type="button"
              onClick={() => {
                if (active) {
                  setMinPrice("");
                  setMaxPrice("");
                } else {
                  setMinPrice(range.min);
                  setMaxPrice(range.max);
                }
              }}
              className={`rounded-lg border px-2.5 py-1.5 text-[11px] font-semibold transition ${
                active
                  ? "border-[#0755E9] bg-[#EFF6FF] text-[#0755E9]"
                  : "border-[#E2E8F0] bg-[#F8FAFC] text-[#64748B] hover:border-[#0755E9]/35 hover:text-[#101828]"
              }`}
            >
              {range.label}
            </button>
          );
        })}

        {(minPrice !== "" || maxPrice !== "") && (
          <button
            type="button"
            onClick={() => {
              setMinPrice("");
              setMaxPrice("");
            }}
            className="inline-flex items-center gap-1 rounded-lg border border-red-200 bg-red-50 px-2.5 py-1.5 text-[11px] font-semibold text-red-600 transition hover:bg-red-100"
          >
            <X size={12} />
            Clear
          </button>
        )}
      </div>
    </div>
  );
}
