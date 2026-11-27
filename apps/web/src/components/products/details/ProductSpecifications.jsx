"use client";

import { SlidersHorizontal } from "lucide-react";

export default function ProductSpecifications({
  specifications = [],
  embedded = false,
}) {
  const validSpecs = Array.isArray(specifications)
    ? specifications.filter((item) => {
        const [key, value] = Array.isArray(item)
          ? item
          : [item?.key, item?.value];
        return key != null && value != null && String(key).trim() !== "" && String(value).trim() !== "";
      })
    : [];

  if (validSpecs.length === 0) {
    return null;
  }

  const content = (
    <div className="overflow-hidden rounded-2xl border border-[#E2E8F0] bg-white">
      <div className="hidden grid-cols-3 border-b border-[#E2E8F0] bg-[#F8FAFC] px-5 py-3 sm:grid">
        <span className="text-xs font-bold uppercase tracking-wider text-[#64748B]">
          Specification
        </span>
        <span className="col-span-2 text-xs font-bold uppercase tracking-wider text-[#64748B]">
          Details
        </span>
      </div>

      <div className="divide-y divide-[#E2E8F0]">
        {validSpecs.map((item, index) => {
          const [key, value] = Array.isArray(item)
            ? item
            : [item?.key, item?.value];

          return (
            <div
              key={`${key}-${index}`}
              className={`grid grid-cols-1 gap-1 px-4 py-3.5 transition-colors hover:bg-[#EFF6FF]/40 sm:grid-cols-3 sm:gap-4 sm:px-5 ${
                index % 2 === 0 ? "bg-white" : "bg-[#F8FAFC]/70"
              }`}
            >
              <span className="text-xs font-semibold text-[#64748B] sm:text-sm sm:text-[#101828]">
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
  );

  if (embedded) {
    return content;
  }

  return (
    <section aria-labelledby="product-specifications-heading">
      <div className="mb-5 flex items-center gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#EFF6FF] text-[#0755E9]">
          <SlidersHorizontal size={20} strokeWidth={1.8} />
        </div>

        <div>
          <h2
            id="product-specifications-heading"
            className="text-lg font-bold tracking-tight text-[#101828] sm:text-xl"
          >
            Technical Specifications
          </h2>
          <p className="mt-0.5 text-xs text-[#64748B]">
            Detailed hardware &amp; configuration overview
          </p>
        </div>
      </div>

      {content}
    </section>
  );
}
