
"use client";

import { CornerDownLeft } from "lucide-react";

import SearchProductItem from "./SearchProductItem";
import SearchRecentSearches from "./SearchRecentSearches";
import SearchPopularSearches from "./SearchPopularSearches";
import SearchEmptyState from "./SearchEmptyState";

export default function SearchSuggestions({
  query,
  products = [],
  brands = [],
  categories = [],
  recentSearches = [],
  popularSearches = [],
  loading,
  error,
  activeIndex,
  onSelectSearch,
  onSelectProduct,
}) {
  const showRecent = query.trim().length < 2;

  const items = [
    ...products.map((item) => ({
      ...item,
      type: "product",
    })),
    ...brands.map((item) => ({
      name: item,
      type: "brand",
    })),
    ...categories.map((item) => ({
      ...item,
      type: "category",
    })),
  ];

  let itemIndex = 0;

  return (
    <div
      id="search-suggestions"
      className="absolute left-0 right-0 top-full z-[60] mt-3 max-h-[75vh] overflow-y-auto rounded-2xl border border-slate-100 bg-white p-3 shadow-[0_12px_40px_rgba(15,23,42,0.12)]"
    >
      {showRecent ? (
        <>
          <SearchRecentSearches
            searches={recentSearches}
            onSelect={onSelectSearch}
          />

          <SearchPopularSearches
            searches={popularSearches}
            onSelect={onSelectSearch}
          />

          {!recentSearches.length &&
            !popularSearches.length && (
              <SearchEmptyState
                loading={false}
                hasQuery={false}
              />
            )}
        </>
      ) : loading || error || !items.length ? (
        <SearchEmptyState
          loading={loading}
          error={error}
          hasQuery={!loading}
        />
      ) : (
        <>
          {products.length > 0 && (
            <section className="mb-3">
              <h3 className="mb-2 px-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
                Products
              </h3>

              {products.map((product) => {
                const index = itemIndex++;

                return (
                  <SearchProductItem
                    key={product._id}
                    product={product}
                    active={activeIndex === index}
                    onClick={() => onSelectProduct(product)}
                  />
                );
              })}
            </section>
          )}

          {brands.length > 0 && (
            <section className="mb-3">
              <h3 className="mb-2 px-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
                Brands
              </h3>

              {brands.map((brand, index) => {
                const currentIndex = itemIndex++;

                return (
                  <button
                    key={`${brand}-${index}`}
                    type="button"
                    onClick={() => onSelectSearch(brand)}
                    className={`w-full rounded-xl px-3 py-2.5 text-left text-sm transition ${
                      activeIndex === currentIndex
                        ? "bg-blue-50 text-blue-700"
                        : "text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    {brand}
                  </button>
                );
              })}
            </section>
          )}

          {categories.length > 0 && (
            <section className="mb-3">
              <h3 className="mb-2 px-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
                Categories
              </h3>

              {categories.map((category) => {
                const currentIndex = itemIndex++;

                return (
                  <button
                    key={category._id}
                    type="button"
                    onClick={() => onSelectSearch(category.name)}
                    className={`w-full rounded-xl px-3 py-2.5 text-left text-sm transition ${
                      activeIndex === currentIndex
                        ? "bg-blue-50 text-blue-700"
                        : "text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    {category.name}
                  </button>
                );
              })}
            </section>
          )}

          <button
            type="button"
            onClick={() => onSelectSearch(query)}
            className="mt-2 flex w-full items-center justify-between rounded-xl bg-blue-50 px-3 py-3 text-sm font-semibold text-blue-700 transition hover:bg-blue-100"
          >
            <span className="truncate">
              View all results for "{query}"
            </span>

            <CornerDownLeft size={17} className="shrink-0" />
          </button>

          <div className="mt-3 flex items-center justify-center gap-4 border-t border-slate-100 pt-3 text-[11px] text-slate-400">
            <span>↑ ↓ Navigate</span>
            <span>↵ Select</span>
            <span>Esc Close</span>
          </div>
        </>
      )}
    </div>
  );
}
