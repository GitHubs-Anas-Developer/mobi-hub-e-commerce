
"use client";

import { SlidersHorizontal } from "lucide-react";

export default function ProductSpecifications({
  specifications = [],
}) {
  if (!Array.isArray(specifications) || specifications.length === 0) {
    return null;
  }

  return (
    <section className="mt-12 border-t border-[#E2E8F0] pt-9 sm:mt-14 sm:pt-10">
      {/* Heading */}
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-[#0755e9]">
          <SlidersHorizontal size={20} strokeWidth={1.8} />
        </div>

        <div>
          <h2 className="text-lg font-bold tracking-tight text-[#101828] sm:text-xl">
            Technical Specifications
          </h2>

          <p className="mt-0.5 text-xs text-slate-500">
            Product features and technical details
          </p>
        </div>
      </div>

      {/* Specifications */}
      <div className="mt-6 overflow-hidden rounded-2xl border border-[#E2E8F0]">
        {/* Table header */}
        <div className="hidden grid-cols-3 bg-slate-50 px-5 py-3 sm:grid">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Specification
          </span>

          <span className="col-span-2 text-xs font-bold uppercase tracking-wider text-slate-500">
            Details
          </span>
        </div>

        {/* Specification rows */}
        <div className="divide-y divide-slate-100">
          {specifications.map((item, index) => {
            const [key, value] = Array.isArray(item)
              ? item
              : [item?.key, item?.value];

            if (key == null || value == null) return null;

            return (
              <div
                key={`${key}-${index}`}
                className={`grid grid-cols-1 gap-1.5 px-4 py-4 transition-colors hover:bg-blue-50/40 sm:grid-cols-3 sm:gap-4 sm:px-5 ${
                  index % 2 === 0 ? "bg-white" : "bg-slate-50/60"
                }`}
              >
                <span className="text-xs font-semibold text-slate-500 sm:text-sm sm:text-[#101828]">
                  {String(key)}
                </span>

                <span className="text-sm font-medium leading-6 text-[#101828] sm:col-span-2">
                  {String(value)}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
