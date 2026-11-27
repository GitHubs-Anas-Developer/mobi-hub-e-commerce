
"use client";

import { Search, X } from "lucide-react";

export default function SearchInput({
  query,
  setQuery,
  onSubmit,
  onFocus,
  onKeyDown,
  inputRef,
  isOpen,
}) {
  return (
    <form onSubmit={onSubmit} className="relative w-full">
      <Search
        size={19}
        className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
      />

      <input
        ref={inputRef}
        type="search"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        onFocus={onFocus}
        onKeyDown={onKeyDown}
        placeholder="Search products, brands..."
        autoComplete="off"
        role="combobox"
        aria-expanded={isOpen}
        aria-controls="search-suggestions"
        aria-autocomplete="list"
        className="h-11 w-full rounded-full border border-slate-200 bg-slate-50 pl-11 pr-11 text-sm text-[#101828] outline-none transition placeholder:text-slate-400 focus:border-[#0755E9] focus:bg-white focus:ring-4 focus:ring-[#0755E9]/10"
      />

      {query && (
        <button
          type="button"
          onClick={() => setQuery("")}
          aria-label="Clear search"
          className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-slate-700"
        >
          <X size={18} />
        </button>
      )}
    </form>
  );
}
