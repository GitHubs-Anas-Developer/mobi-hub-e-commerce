
"use client";

import { useReducedMotion } from "motion/react";
import { Check } from "lucide-react";
import { priceRanges } from "./constants/filterConstants";
import { updateMaxPrice, updateMinPrice } from "./utils/filterHelpers";
import { motion } from "motion/react";


export default function PriceOptions({
  minPrice,
  setMinPrice,
  maxPrice,
  setMaxPrice,
  mobile = false,
}) {
  const shouldReduceMotion = useReducedMotion();

  const inputClass = mobile
    ? "w-full min-w-0 bg-transparent text-sm font-bold text-slate-900 outline-none"
    : "w-full min-w-0 bg-transparent text-xs font-bold text-slate-900 outline-none";

  return (
    <>
      <div className="grid grid-cols-2 gap-2">
        <label
          className={`min-w-0 rounded-xl border border-slate-200 bg-slate-50 transition focus-within:border-blue-500 focus-within:bg-white focus-within:ring-2 focus-within:ring-blue-50 ${
            mobile ? "px-3 py-3" : "px-2.5 py-2.5"
          }`}
        >
          <span className="mb-1.5 block text-[10px] font-semibold text-slate-400">
            Minimum Price
          </span>

          <div className="flex items-center gap-1.5">
            <span className="text-sm font-semibold text-slate-500">
              ₹
            </span>

            <input
              type="number"
              min="0"
              step="1"
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
              className={inputClass}
            />
          </div>
        </label>

        <label
          className={`min-w-0 rounded-xl border border-slate-200 bg-slate-50 transition focus-within:border-blue-500 focus-within:bg-white focus-within:ring-2 focus-within:ring-blue-50 ${
            mobile ? "px-3 py-3" : "px-2.5 py-2.5"
          }`}
        >
          <span className="mb-1.5 block text-[10px] font-semibold text-slate-400">
            Maximum Price
          </span>

          <div className="flex items-center gap-1.5">
            <span className="text-sm font-semibold text-slate-500">
              ₹
            </span>

            <input
              type="number"
              min="0"
              step="1"
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
              placeholder="No limit"
              className={inputClass}
            />
          </div>
        </label>
      </div>

      <div className="mt-4">
        <div className="mb-2 flex items-center justify-between">
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Quick Selection
          </p>

          {mobile && (
            <span className="text-[10px] text-slate-400">
              Choose one
            </span>
          )}
        </div>

        <div className="grid grid-cols-2 gap-2">
          {priceRanges.map((range) => {
            const selected =
              minPrice === range.min &&
              maxPrice === range.max;

            return (
              <motion.button
                key={range.label}
                type="button"
                onClick={() => {
                  setMinPrice(range.min);
                  setMaxPrice(range.max);
                }}
                whileTap={
                  shouldReduceMotion
                    ? undefined
                    : { scale: 0.97 }
                }
                className={`flex items-center justify-between gap-2 rounded-xl border px-3 py-3 text-left transition ${
                  selected
                    ? "border-blue-300 bg-blue-50 text-blue-700"
                    : "border-slate-200 bg-white text-slate-600 hover:border-blue-200"
                }`}
              >
                <span className="text-[10px] font-semibold sm:text-[11px]">
                  {range.label}
                </span>

                {selected && (
                  <Check
                    size={14}
                    className="shrink-0 text-blue-600"
                  />
                )}
              </motion.button>
            );
          })}
        </div>
      </div>
    </>
  );
}
