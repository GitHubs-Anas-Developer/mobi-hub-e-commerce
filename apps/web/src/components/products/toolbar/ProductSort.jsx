"use client";

import { ArrowUpDown, ChevronDown } from "lucide-react";

const sortOptions = [
  { value: "newest", label: "Newest First" },
  { value: "price-low-high", label: "Price: Low to High" },
  { value: "price-high-low", label: "Price: High to Low" },
  { value: "nameAZ", label: "Name: A to Z" },
  { value: "nameZA", label: "Name: Z to A" },
];

export default function ProductSort({
  sort = "newest",
  setSort,
}) {
  const validValue = sortOptions.some((opt) => opt.value === sort)
    ? sort
    : "newest";

  return (
    <div className="relative flex h-9 min-w-0 flex-1 items-center rounded-xl border border-[#E2E8F0] bg-white transition hover:border-[#0755E9]/40 focus-within:border-[#0755E9] focus-within:ring-2 focus-within:ring-[#0755E9]/15 sm:h-10 sm:w-[200px] sm:flex-none">
      <ArrowUpDown
        size={14}
        className="pointer-events-none ml-3 shrink-0 text-[#64748B]"
        aria-hidden="true"
      />

      <select
        value={validValue}
        onChange={(event) => setSort?.(event.target.value)}
        aria-label="Sort products"
        className="h-full w-full min-w-0 cursor-pointer appearance-none bg-transparent pl-2 pr-8 text-xs font-semibold text-[#101828] outline-none sm:text-[13px]"
      >
        {sortOptions.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>

      <ChevronDown
        size={14}
        className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-[#64748B]"
        aria-hidden="true"
      />
    </div>
  );
}
