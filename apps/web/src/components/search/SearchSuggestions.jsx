"use client";

import { useEffect, useRef } from "react";
import { CornerDownLeft, Layers3, Tag, ArrowUp, ArrowDown } from "lucide-react";

import SearchProductItem from "./SearchProductItem";
import SearchRecentSearches from "./SearchRecentSearches";
import SearchPopularSearches from "./SearchPopularSearches";
import SearchEmptyState from "./SearchEmptyState";

export default function SearchSuggestions({
  listboxId,
  variant = "desktop",
  query = "",
  products = [],
  brands = [],
  categories = [],
  recentSearches = [],
  popularSearches = [],
  loading = false,
  error = null,
  activeIndex = -1,
  onSelectSearch,
  onSelectProduct,
  onSelectBrand,
  onSelectCategory,
  onClearRecent,
}) {
  const optionRefs = useRef([]);

  useEffect(() => {
    if (activeIndex >= 0 && optionRefs.current[activeIndex]) {
      optionRefs.current[activeIndex].scrollIntoView({
        block: "nearest",
      });
    }
  }, [activeIndex]);

  const trimmed = query.trim();
  const showRecent = trimmed.length < 2;
  const hasSuggestions =
    products.length > 0 || brands.length > 0 || categories.length > 0;

  let optionCursor = 0;

  const isMobileInline = variant === "mobile";

  return (
    <div
      id={listboxId}
      role="listbox"
      aria-label="Search suggestions"
      className={
        isMobileInline
          ? "mt-3 overflow-hidden rounded-2xl border border-[#E2E8F0] bg-white p-3"
          : "absolute left-0 right-0 top-full z-[60] mt-2 max-h-[75vh] overflow-y-auto overscroll-contain rounded-2xl border border-[#E2E8F0] bg-white p-3 shadow-xl shadow-[#101828]/10"
      }
    >
      {showRecent ? (
        <>
          <SearchRecentSearches
            searches={recentSearches}
            onSelect={onSelectSearch}
            onClearAll={onClearRecent}
          />

          <SearchPopularSearches
            searches={popularSearches}
            onSelect={onSelectSearch}
          />

          {recentSearches.length === 0 && popularSearches.length === 0 && (
            <SearchEmptyState loading={false} hasQuery={false} />
          )}
        </>
      ) : loading || error || !hasSuggestions ? (
        <>
          <SearchEmptyState
            loading={loading}
            error={error}
            hasQuery={!loading && !error}
            query={trimmed}
          />

          {!loading && trimmed && (
            <button
              ref={(el) => {
                optionRefs.current[0] = el;
              }}
              id={`${listboxId}-opt-0`}
              type="button"
              role="option"
              aria-selected={activeIndex === 0}
              onClick={() => onSelectSearch?.(trimmed)}
              className={`mt-2 flex w-full items-center justify-between gap-2 rounded-xl border px-3.5 py-2.5 text-sm font-bold transition ${
                activeIndex === 0
                  ? "border-[#0755E9] bg-[#0755E9] text-white"
                  : "border-[#0755E9]/20 bg-[#EFF6FF] text-[#0755E9] hover:bg-[#0755E9] hover:text-white"
              }`}
            >
              <span className="truncate">
                Search catalog for &ldquo;{trimmed}&rdquo;
              </span>
              <CornerDownLeft size={15} className="shrink-0" />
            </button>
          )}
        </>
      ) : (
        <>
          {/* Matching Products */}
          {products.length > 0 && (
            <section className="mb-3">
              <div className="mb-1.5 flex items-center justify-between px-2">
                <h3 className="text-[11px] font-bold uppercase tracking-wider text-[#64748B]">
                  Products
                </h3>
                <span className="text-[11px] font-semibold text-[#64748B] tabular-nums">
                  {products.length}
                </span>
              </div>

              <div className="space-y-1">
                {products.map((product) => {
                  const idx = optionCursor++;
                  return (
                    <SearchProductItem
                      key={product._id || product.slug || idx}
                      id={`${listboxId}-opt-${idx}`}
                      optionRef={(el) => {
                        optionRefs.current[idx] = el;
                      }}
                      product={product}
                      active={activeIndex === idx}
                      onClick={() => onSelectProduct?.(product)}
                    />
                  );
                })}
              </div>
            </section>
          )}

          {/* Matching Categories */}
          {categories.length > 0 && (
            <section className="mb-3">
              <div className="mb-1.5 flex items-center gap-1.5 px-2">
                <Layers3
                  size={12}
                  className="text-[#64748B]"
                  aria-hidden="true"
                />
                <h3 className="text-[11px] font-bold uppercase tracking-wider text-[#64748B]">
                  Categories
                </h3>
              </div>

              <div className="space-y-1">
                {categories.map((category) => {
                  const idx = optionCursor++;
                  const isActive = activeIndex === idx;
                  return (
                    <button
                      ref={(el) => {
                        optionRefs.current[idx] = el;
                      }}
                      id={`${listboxId}-opt-${idx}`}
                      key={category._id || category.name}
                      type="button"
                      role="option"
                      aria-selected={isActive}
                      onClick={() => onSelectCategory?.(category)}
                      className={`flex w-full items-center justify-between gap-2 rounded-xl border px-3 py-2 text-left text-sm transition ${
                        isActive
                          ? "border-[#0755E9]/35 bg-[#EFF6FF] font-bold text-[#082B70]"
                          : "border-transparent font-medium text-[#101828] hover:border-[#E2E8F0] hover:bg-[#F8FAFC]"
                      }`}
                    >
                      <span className="truncate">{category.name}</span>
                      <span className="shrink-0 rounded-md border border-[#E2E8F0] bg-white px-2 py-0.5 text-[10px] font-bold uppercase text-[#64748B]">
                        Category
                      </span>
                    </button>
                  );
                })}
              </div>
            </section>
          )}

          {/* Matching Brands */}
          {brands.length > 0 && (
            <section className="mb-3">
              <div className="mb-1.5 flex items-center gap-1.5 px-2">
                <Tag size={12} className="text-[#64748B]" aria-hidden="true" />
                <h3 className="text-[11px] font-bold uppercase tracking-wider text-[#64748B]">
                  Brands
                </h3>
              </div>

              <div className="space-y-1">
                {brands.map((brandName, bIdx) => {
                  const idx = optionCursor++;
                  const isActive = activeIndex === idx;
                  return (
                    <button
                      ref={(el) => {
                        optionRefs.current[idx] = el;
                      }}
                      id={`${listboxId}-opt-${idx}`}
                      key={`${brandName}-${bIdx}`}
                      type="button"
                      role="option"
                      aria-selected={isActive}
                      onClick={() => onSelectBrand?.(brandName)}
                      className={`flex w-full items-center justify-between gap-2 rounded-xl border px-3 py-2 text-left text-sm transition ${
                        isActive
                          ? "border-[#0755E9]/35 bg-[#EFF6FF] font-bold text-[#082B70]"
                          : "border-transparent font-medium text-[#101828] hover:border-[#E2E8F0] hover:bg-[#F8FAFC]"
                      }`}
                    >
                      <span className="truncate">{brandName}</span>
                      <span className="shrink-0 rounded-md border border-[#E2E8F0] bg-white px-2 py-0.5 text-[10px] font-bold uppercase text-[#64748B]">
                        Brand
                      </span>
                    </button>
                  );
                })}
              </div>
            </section>
          )}

          {/* View All Results */}
          {(() => {
            const viewAllIdx = optionCursor++;
            const isActive = activeIndex === viewAllIdx;

            return (
              <button
                ref={(el) => {
                  optionRefs.current[viewAllIdx] = el;
                }}
                id={`${listboxId}-opt-${viewAllIdx}`}
                type="button"
                role="option"
                aria-selected={isActive}
                onClick={() => onSelectSearch?.(trimmed)}
                className={`mt-2 flex w-full items-center justify-between gap-2 rounded-xl border px-3.5 py-2.5 text-sm font-bold transition ${
                  isActive
                    ? "border-[#0755E9] bg-[#0755E9] text-white"
                    : "border-[#0755E9]/20 bg-[#EFF6FF] text-[#0755E9] hover:bg-[#0755E9] hover:text-white"
                }`}
              >
                <span className="truncate">
                  View all results for &ldquo;{trimmed}&rdquo;
                </span>
                <CornerDownLeft size={16} className="shrink-0" />
              </button>
            );
          })()}

          {/* Keyboard Navigation Hint */}
          {!isMobileInline && (
            <div className="mt-3 flex items-center justify-center gap-4 border-t border-[#E2E8F0] pt-2.5 text-[11px] font-medium text-[#64748B]">
              <span className="inline-flex items-center gap-1">
                <ArrowUp size={11} aria-hidden="true" />
                <ArrowDown size={11} aria-hidden="true" />
                Navigate
              </span>
              <span className="inline-flex items-center gap-1">
                <CornerDownLeft size={11} aria-hidden="true" />
                Select
              </span>
              <span>Esc Close</span>
            </div>
          )}
        </>
      )}
    </div>
  );
}
