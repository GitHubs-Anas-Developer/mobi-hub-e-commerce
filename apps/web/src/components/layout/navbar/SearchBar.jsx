
"use client";

import { useState } from "react";
import { Search, X } from "lucide-react";
import { useRouter } from "next/navigation";

export default function SearchBar() {
  const [search, setSearch] = useState("");
  const router = useRouter();

  const handleSearch = (e) => {
    e.preventDefault();

    const query = search.trim();

    if (!query) return;

    router.push(`/products?search=${encodeURIComponent(query)}`);
  };

  return (
    <form
      onSubmit={handleSearch}
      role="search"
      className="group flex h-12 w-full items-center rounded-xl border border-slate-200 bg-white p-1 shadow-sm transition-all duration-200 hover:border-slate-300 focus-within:border-blue-500 focus-within:ring-4 focus-within:ring-blue-100/70"
    >
      {/* Search Icon */}
      <div className="flex shrink-0 items-center pl-3 sm:pl-4">
        <Search
          size={20}
          strokeWidth={2}
          className="text-slate-400 transition-colors group-focus-within:text-blue-600"
        />
      </div>

      {/* Search Input */}
      <input
        type="search"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search products, accessories..."
        aria-label="Search products"
        className="h-full min-w-0 flex-1 bg-transparent px-3 text-sm font-medium text-slate-800 outline-none placeholder:font-normal placeholder:text-slate-400 sm:px-4"
      />

      {/* Clear Button */}
      {search && (
        <button
          type="button"
          onClick={() => setSearch("")}
          aria-label="Clear search"
          className="mr-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
        >
          <X size={17} />
        </button>
      )}

      {/* Search Button */}
      <button
        type="submit"
        className="flex h-10 shrink-0 items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 text-sm font-semibold text-white transition hover:bg-blue-700 active:scale-[0.98] sm:px-6"
      >
        <Search size={17} />
        <span className="hidden sm:inline">Search</span>
      </button>
    </form>
  );
}
