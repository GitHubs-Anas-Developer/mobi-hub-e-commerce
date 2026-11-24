import { ArrowUpDown } from "lucide-react";

const sortOptions = [
  { value: "newest", label: "Newest" },
  { value: "popular", label: "Most Popular" },
  { value: "price-low-high", label: "Price: Low to High" },
  { value: "price-high-low", label: "Price: High to Low" },
  { value: "rating", label: "Top Rated" },
];

export default function ProductSort({
  sort = "newest",
  setSort,
}) {
  return (
    <div className="flex h-10 items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 transition hover:border-blue-300">
      <ArrowUpDown size={15} className="shrink-0 text-slate-400" />

      <select
        value={sort}
        onChange={(e) => setSort(e.target.value)}
        aria-label="Sort products"
        className="h-full min-w-0 cursor-pointer bg-transparent text-xs font-semibold text-slate-700 outline-none"
      >
        {sortOptions.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}