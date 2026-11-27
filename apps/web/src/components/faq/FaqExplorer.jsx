"use client";

import { useEffect, useId, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  Search,
  X,
  Plus,
  Minus,
  SearchX,
  HelpCircle,
} from "lucide-react";

import { FAQ_CATEGORIES, FAQ_ITEMS } from "@/components/info/faqData";

export default function FaqExplorer() {
  const searchParams = useSearchParams();
  const baseId = useId();

  const initialCategory = useMemo(() => {
    const param = String(searchParams?.get("category") || "").toLowerCase();
    const matched = FAQ_CATEGORIES.find(
      (cat) => cat.id === param || cat.label.toLowerCase() === param
    );
    return matched ? matched.id : "all";
  }, [searchParams]);

  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [searchQuery, setSearchQuery] = useState("");
  const [openIds, setOpenIds] = useState(() =>
    FAQ_ITEMS.length > 0 ? new Set([FAQ_ITEMS[0].id]) : new Set()
  );

  // Sync URL ?category= or #returns anchor safely on mount / URL change
  useEffect(() => {
    const hash =
      typeof window !== "undefined"
        ? window.location.hash.replace("#", "").toLowerCase()
        : "";
    const target =
      hash && FAQ_CATEGORIES.some((cat) => cat.id === hash)
        ? hash
        : initialCategory;

    if (target) {
      queueMicrotask(() => setSelectedCategory(target));
    }
  }, [initialCategory]);

  // Populate only categories that actually have FAQs
  const availableCategories = useMemo(() => {
    const populatedIds = new Set(FAQ_ITEMS.map((item) => item.category));
    return FAQ_CATEGORIES.filter(
      (cat) => cat.id === "all" || populatedIds.has(cat.id)
    );
  }, []);

  const filteredFaqs = useMemo(() => {
    const trimmed = searchQuery.trim().toLowerCase();
    return FAQ_ITEMS.filter((item) => {
      const matchesCategory =
        selectedCategory === "all" || item.category === selectedCategory;
      if (!matchesCategory) return false;
      if (!trimmed) return true;
      return (
        item.question.toLowerCase().includes(trimmed) ||
        item.answer.toLowerCase().includes(trimmed)
      );
    });
  }, [selectedCategory, searchQuery]);

  const toggleItem = (id) => {
    setOpenIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleClearSearch = () => {
    setSearchQuery("");
  };

  const handleResetFilters = () => {
    setSearchQuery("");
    setSelectedCategory("all");
  };

  const categoryLabelMap = useMemo(() => {
    const map = {};
    FAQ_CATEGORIES.forEach((c) => {
      map[c.id] = c.label;
    });
    return map;
  }, []);

  return (
    <div className="space-y-6">
      {/* Search Bar Box */}
      <div className="rounded-2xl border border-[#E2E8F0] bg-white p-4 shadow-xs sm:p-5">
        <label htmlFor={`${baseId}-faq-search`} className="sr-only">
          Search frequently asked questions
        </label>

        <div className="relative flex items-center">
          <Search
            size={18}
            aria-hidden="true"
            className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#64748B]"
          />

          <input
            id={`${baseId}-faq-search`}
            type="search"
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            placeholder="Search questions about orders, payments, shipping, returns..."
            className="h-12 w-full rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] pl-11 pr-11 text-sm font-medium text-[#101828] outline-none transition placeholder:font-normal placeholder:text-[#64748B] focus:border-[#0755E9] focus:bg-white focus:ring-3 focus:ring-[#0755E9]/15 [&::-webkit-search-cancel-button]:hidden"
          />

          {searchQuery && (
            <button
              type="button"
              onClick={handleClearSearch}
              aria-label="Clear search query"
              className="absolute right-3 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full text-[#64748B] transition hover:bg-slate-200/70 hover:text-[#101828]"
            >
              <X size={16} />
            </button>
          )}
        </div>

        {/* Category Filter Tabs */}
        <div
          className="mt-4 flex items-center gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:flex-wrap"
          role="tablist"
          aria-label="FAQ categories"
        >
          {availableCategories.map((cat) => {
            const active = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => setSelectedCategory(cat.id)}
                className={`inline-flex h-9 shrink-0 items-center rounded-full border px-4 text-xs font-bold transition ${
                  active
                    ? "border-[#0755E9] bg-[#0755E9] text-white shadow-xs"
                    : "border-[#E2E8F0] bg-[#F8FAFC] text-[#64748B] hover:border-[#0755E9]/40 hover:bg-[#EFF6FF] hover:text-[#0755E9]"
                }`}
              >
                {cat.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Results Count Row */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-1">
        <p className="text-xs font-semibold text-[#64748B]">
          Showing{" "}
          <strong className="text-[#101828] tabular-nums">
            {filteredFaqs.length}
          </strong>{" "}
          {filteredFaqs.length === 1 ? "question" : "questions"}
          {selectedCategory !== "all" && (
            <span> in {categoryLabelMap[selectedCategory]}</span>
          )}
          {searchQuery.trim() && (
            <span> matching &ldquo;{searchQuery.trim()}&rdquo;</span>
          )}
        </p>

        {(searchQuery || selectedCategory !== "all") && (
          <button
            type="button"
            onClick={handleResetFilters}
            className="text-xs font-bold text-[#0755E9] hover:underline"
          >
            Show all topics
          </button>
        )}
      </div>

      {/* FAQ Accordion */}
      {filteredFaqs.length === 0 ? (
        <div className="flex flex-col items-center rounded-2xl border border-[#E2E8F0] bg-white px-6 py-14 text-center shadow-xs">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-[#0755E9]/15 bg-[#EFF6FF] text-[#0755E9]">
            <SearchX size={28} aria-hidden="true" />
          </div>

          <h2 className="mt-4 text-lg font-extrabold text-[#101828]">
            No matching questions found
          </h2>

          <p className="mt-1.5 max-w-md text-xs leading-relaxed text-[#64748B] sm:text-sm">
            We couldn&apos;t find answers matching your filter or search terms. Try
            searching with fewer keywords or switch back to all topics.
          </p>

          <button
            type="button"
            onClick={handleResetFilters}
            className="mt-5 inline-flex h-10 items-center gap-2 rounded-xl bg-[#0755E9] px-5 text-xs font-bold text-white transition hover:bg-[#0645C4] sm:text-sm"
          >
            <X size={14} aria-hidden="true" />
            Clear Search &amp; Filters
          </button>
        </div>
      ) : (
        <div className="space-y-3" id="returns">
          {filteredFaqs.map((item) => {
            const isExpanded = openIds.has(item.id);
            const buttonId = `${baseId}-btn-${item.id}`;
            const panelId = `${baseId}-panel-${item.id}`;

            return (
              <article
                key={item.id}
                className={`overflow-hidden rounded-2xl border transition-colors ${
                  isExpanded
                    ? "border-[#0755E9]/35 bg-white shadow-xs"
                    : "border-[#E2E8F0] bg-white hover:border-[#0755E9]/25"
                }`}
              >
                <h3>
                  <button
                    id={buttonId}
                    type="button"
                    aria-expanded={isExpanded}
                    aria-controls={panelId}
                    onClick={() => toggleItem(item.id)}
                    className="flex w-full items-center justify-between gap-4 px-4 py-4 text-left transition sm:px-6 sm:py-5"
                  >
                    <div className="min-w-0 flex-1 space-y-1">
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-[#0755E9]">
                        <HelpCircle size={11} aria-hidden="true" />
                        {categoryLabelMap[item.category] || item.category}
                      </span>

                      <p
                        className={`text-sm font-extrabold leading-snug sm:text-base ${
                          isExpanded ? "text-[#082B70]" : "text-[#101828]"
                        }`}
                      >
                        {item.question}
                      </p>
                    </div>

                    <span
                      aria-hidden="true"
                      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border transition ${
                        isExpanded
                          ? "border-[#0755E9] bg-[#0755E9] text-white"
                          : "border-[#E2E8F0] bg-[#F8FAFC] text-[#64748B]"
                      }`}
                    >
                      {isExpanded ? <Minus size={16} /> : <Plus size={16} />}
                    </span>
                  </button>
                </h3>

                {isExpanded && (
                  <div
                    id={panelId}
                    role="region"
                    aria-labelledby={buttonId}
                    className="border-t border-[#E2E8F0]/80 bg-[#F8FAFC]/60 px-4 py-4 text-xs leading-relaxed text-[#64748B] sm:px-6 sm:py-5 sm:text-sm sm:leading-7"
                  >
                    {item.answer}
                  </div>
                )}
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}

