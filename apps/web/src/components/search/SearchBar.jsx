"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { usePathname, useRouter } from "next/navigation";
import { Search, X, LoaderCircle } from "lucide-react";

import {
  addRecentSearch,
  clearRecentSearches,
  clearSearch,
  setSearchQuery,
} from "@/store/slices/searchSlice";
import { fetchSearchSuggestions } from "@/store/thunks/searchThunks";
import { BRAND_SEARCH_EVENT } from "@/config/brand";
import SearchSuggestions from "./SearchSuggestions";

const RECENT_STORAGE_KEY = "elenzo_recent_searches";

export default function SearchBar({
  onSearchSubmit,
  autoFocus = false,
  variant = "desktop",
}) {
  const dispatch = useDispatch();
  const router = useRouter();
  const pathname = usePathname();
  const listboxId = useId();

  const wrapperRef = useRef(null);
  const inputRef = useRef(null);
  const lastFetchedTermRef = useRef("");
  const hydratedRecentRef = useRef(false);

  const {
    suggestions,
    recentSearches = [],
    popularSearches = [],
    loading = false,
    error = null,
  } = useSelector((state) => state.search || {});

  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(variant === "mobile");
  const [activeIndex, setActiveIndex] = useState(-1);

  const products = useMemo(
    () => (Array.isArray(suggestions?.products) ? suggestions.products : []),
    [suggestions]
  );
  const brands = useMemo(
    () => (Array.isArray(suggestions?.brands) ? suggestions.brands : []),
    [suggestions]
  );
  const categories = useMemo(
    () =>
      Array.isArray(suggestions?.categories) ? suggestions.categories : [],
    [suggestions]
  );

  const trimmedQuery = query.trim();

  // Order must mirror SearchSuggestions optionCursor order
  const selectableItems = useMemo(() => {
    if (trimmedQuery.length < 2) return [];

    const hasSuggestions =
      products.length > 0 || brands.length > 0 || categories.length > 0;

    if (!hasSuggestions) {
      return !loading && trimmedQuery
        ? [{ type: "viewAll", name: trimmedQuery }]
        : [];
    }

    return [
      ...products.map((item) => ({ ...item, type: "product" })),
      ...categories.map((item) => ({ ...item, type: "category" })),
      ...brands.map((item) => ({ name: item, type: "brand" })),
      { type: "viewAll", name: trimmedQuery },
    ];
  }, [trimmedQuery, products, categories, brands, loading]);

  // Hydrate recent searches safely on client only
  useEffect(() => {
    if (hydratedRecentRef.current) return;
    hydratedRecentRef.current = true;

    try {
      const raw = window.localStorage.getItem(RECENT_STORAGE_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        [...parsed].reverse().forEach((term) => {
          if (typeof term === "string" && term.trim()) {
            dispatch(addRecentSearch(term.trim()));
          }
        });
      }
    } catch {
      // Ignore storage access errors
    }
  }, [dispatch]);

  // Persist recent searches whenever list updates
  useEffect(() => {
    if (!hydratedRecentRef.current) return;
    try {
      window.localStorage.setItem(
        RECENT_STORAGE_KEY,
        JSON.stringify(recentSearches.slice(0, 8))
      );
    } catch {
      // Ignore storage quota errors
    }
  }, [recentSearches]);

  // Auto-focus when mobile overlay opens
  useEffect(() => {
    if (!autoFocus) return;
    const timer = setTimeout(() => {
      inputRef.current?.focus();
    }, 60);
    return () => clearTimeout(timer);
  }, [autoFocus]);

  // Keep SearchBar synchronized with /products URL query & custom search events
  useEffect(() => {
    const syncFromUrl = () => {
      if (typeof window === "undefined") return;
      const params = new URLSearchParams(window.location.search);
      const urlSearch = params.get("search") || "";
      if (window.location.pathname === "/products") {
        setQuery(urlSearch);
        dispatch(setSearchQuery(urlSearch));
      }
    };

    queueMicrotask(syncFromUrl);

    const handleSearchEvent = (event) => {
      const next =
        typeof event?.detail === "string"
          ? event.detail
          : event?.detail?.search ?? "";
      setQuery(next);
    };

    window.addEventListener("popstate", syncFromUrl);
    window.addEventListener(BRAND_SEARCH_EVENT, handleSearchEvent);

    return () => {
      window.removeEventListener("popstate", syncFromUrl);
      window.removeEventListener(BRAND_SEARCH_EVENT, handleSearchEvent);
    };
  }, [pathname, dispatch]);

  // Debounced live suggestions avoiding redundant repeated API requests
  useEffect(() => {
    dispatch(setSearchQuery(query));

    if (trimmedQuery.length < 2) {
      if (lastFetchedTermRef.current !== "") {
        lastFetchedTermRef.current = "";
        dispatch(clearSearch());
      }
      return undefined;
    }

    if (trimmedQuery === lastFetchedTermRef.current) {
      return undefined;
    }

    const timer = setTimeout(() => {
      lastFetchedTermRef.current = trimmedQuery;
      dispatch(fetchSearchSuggestions(trimmedQuery));
    }, 280);

    return () => clearTimeout(timer);
  }, [query, trimmedQuery, dispatch]);

  // Close floating dropdown on outside click (desktop variant)
  useEffect(() => {
    if (variant === "mobile") return undefined;

    const handleClickOutside = (event) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setIsOpen(false);
        setActiveIndex(-1);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [variant]);

  const navigateWithParams = (updater) => {
    const params = new URLSearchParams(
      typeof window !== "undefined" && window.location.pathname === "/products"
        ? window.location.search
        : ""
    );

    updater(params);
    params.delete("page");

    const qs = params.toString();
    router.push(qs ? `/products?${qs}` : "/products");
  };

  const searchProducts = (value) => {
    const term = String(value || "").trim();
    if (!term) return;

    dispatch(addRecentSearch(term));
    setQuery(term);
    setActiveIndex(-1);

    if (variant !== "mobile") {
      setIsOpen(false);
    }

    window.dispatchEvent(
      new CustomEvent(BRAND_SEARCH_EVENT, {
        detail: { search: term },
      })
    );

    onSearchSubmit?.();

    navigateWithParams((params) => {
      params.set("search", term);
    });
  };

  const openProduct = (product) => {
    if (!product?.slug) return;
    if (product.name) {
      dispatch(addRecentSearch(product.name));
    }
    setActiveIndex(-1);
    setIsOpen(false);
    onSearchSubmit?.();
    router.push(`/products/${product.slug}`);
  };

  const openBrand = (brandName) => {
    const cleanBrand = String(brandName || "").trim();
    if (!cleanBrand) return;

    dispatch(addRecentSearch(cleanBrand));
    setActiveIndex(-1);
    setIsOpen(false);
    onSearchSubmit?.();

    navigateWithParams((params) => {
      params.delete("search");
      params.set("brand", cleanBrand);
    });
  };

  const openCategory = (categoryItem) => {
    if (categoryItem?.name) {
      dispatch(addRecentSearch(categoryItem.name));
    }
    setActiveIndex(-1);
    setIsOpen(false);
    onSearchSubmit?.();

    if (categoryItem?._id) {
      navigateWithParams((params) => {
        params.delete("search");
        params.delete("subCategory");
        params.set("category", String(categoryItem._id));
      });
    } else if (categoryItem?.name) {
      searchProducts(categoryItem.name);
    }
  };

  const handleClearInput = () => {
    lastFetchedTermRef.current = "";
    setQuery("");
    setActiveIndex(-1);
    dispatch(clearSearch());

    window.dispatchEvent(
      new CustomEvent(BRAND_SEARCH_EVENT, {
        detail: { search: "" },
      })
    );

    if (
      typeof window !== "undefined" &&
      window.location.pathname === "/products"
    ) {
      const params = new URLSearchParams(window.location.search);
      if (params.has("search")) {
        params.delete("search");
        params.delete("page");
        const qs = params.toString();
        router.push(qs ? `/products?${qs}` : "/products");
      }
    }

    inputRef.current?.focus();
    setIsOpen(true);
  };

  const handleClearRecent = () => {
    dispatch(clearRecentSearches());
    try {
      window.localStorage.removeItem(RECENT_STORAGE_KEY);
    } catch {
      // Ignore storage errors
    }
  };

  const handleKeyDown = (event) => {
    if (event.key === "Escape") {
      setIsOpen(false);
      setActiveIndex(-1);
      inputRef.current?.blur();
      return;
    }

    if (event.key === "ArrowDown") {
      event.preventDefault();
      setIsOpen(true);
      if (selectableItems.length === 0) return;
      setActiveIndex((prev) =>
        prev < selectableItems.length - 1 ? prev + 1 : 0
      );
      return;
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();
      if (selectableItems.length === 0) return;
      setActiveIndex((prev) =>
        prev > 0 ? prev - 1 : selectableItems.length - 1
      );
      return;
    }

    if (event.key === "Enter") {
      event.preventDefault();
      if (activeIndex >= 0 && selectableItems[activeIndex]) {
        const selected = selectableItems[activeIndex];
        if (selected.type === "product") {
          openProduct(selected);
        } else if (selected.type === "category") {
          openCategory(selected);
        } else if (selected.type === "brand") {
          openBrand(selected.name);
        } else {
          searchProducts(selected.name || query);
        }
      } else {
        searchProducts(query);
      }
    }
  };

  const showDropdown = isOpen || variant === "mobile";

  return (
    <div ref={wrapperRef} className="relative w-full">
      <form
        role="search"
        onSubmit={(event) => {
          event.preventDefault();
          searchProducts(query);
        }}
        className="relative flex w-full items-center"
      >
        <Search
          size={17}
          aria-hidden="true"
          className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[#64748B]"
        />

        <input
          ref={inputRef}
          type="search"
          value={query}
          onChange={(event) => {
            setQuery(event.target.value);
            setActiveIndex(-1);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder="Search gadgets, phones, audio & brands..."
          autoComplete="off"
          aria-label="Search products"
          role="combobox"
          aria-expanded={showDropdown}
          aria-controls={listboxId}
          aria-activedescendant={
            activeIndex >= 0 ? `${listboxId}-opt-${activeIndex}` : undefined
          }
          aria-autocomplete="list"
          className="h-11 w-full rounded-full border border-[#E2E8F0] bg-[#F8FAFC] pl-10 pr-24 text-sm font-medium text-[#101828] outline-none transition placeholder:font-normal placeholder:text-[#64748B] hover:border-slate-300 focus:border-[#0755E9] focus:bg-white focus:ring-4 focus:ring-[#0755E9]/12 [&::-webkit-search-cancel-button]:hidden"
        />

        <div className="absolute right-1.5 top-1/2 flex -translate-y-1/2 items-center gap-1">
          {loading && trimmedQuery.length >= 2 && (
            <LoaderCircle
              size={15}
              aria-label="Searching"
              className="mr-0.5 animate-spin text-[#0755E9]"
            />
          )}

          {query && (
            <button
              type="button"
              onClick={handleClearInput}
              aria-label="Clear search"
              className="flex h-7 w-7 items-center justify-center rounded-full text-[#64748B] transition hover:bg-slate-200/70 hover:text-[#101828]"
            >
              <X size={15} />
            </button>
          )}

          <button
            type="submit"
            aria-label="Submit search"
            className="inline-flex h-8 items-center justify-center gap-1.5 rounded-full bg-[#0755E9] px-3 text-xs font-bold text-white transition hover:bg-[#0645C4] active:scale-[0.98]"
          >
            <Search size={14} aria-hidden="true" />
            <span className="hidden sm:inline">Search</span>
          </button>
        </div>
      </form>

      {showDropdown && (
        <SearchSuggestions
          listboxId={listboxId}
          variant={variant}
          query={query}
          products={products}
          brands={brands}
          categories={categories}
          recentSearches={recentSearches}
          popularSearches={popularSearches}
          loading={loading}
          error={error}
          activeIndex={activeIndex}
          onSelectSearch={searchProducts}
          onSelectProduct={openProduct}
          onSelectBrand={openBrand}
          onSelectCategory={openCategory}
          onClearRecent={handleClearRecent}
        />
      )}
    </div>
  );
}
