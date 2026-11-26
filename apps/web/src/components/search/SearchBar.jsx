
"use client";

import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";

import {
  Search,
  X,
  Clock,
  TrendingUp,
  Loader2,
  ArrowUp,
  ArrowDown,
  CornerDownLeft,
} from "lucide-react";

import {
  setSearchQuery,
  clearSearch,
  addRecentSearch,
} from "@/store/slices/searchSlice";

import { fetchSearchSuggestions } from "@/store/thunks/searchThunks";

export default function SearchBar({ onSearchSubmit }) {
  const dispatch = useDispatch();
  const router = useRouter();

  const wrapperRef = useRef(null);
  const inputRef = useRef(null);

  const {
    suggestions,
    recentSearches = [],
    popularSearches = [],
    loading,
  } = useSelector((state) => state.search);

  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);

  const products = suggestions?.products || [];
  const brands = suggestions?.brands || [];
  const categories = suggestions?.categories || [];

  const items = [
    ...products.map((item) => ({ ...item, type: "product" })),
    ...brands.map((item) => ({ name: item, type: "brand" })),
    ...categories.map((item) => ({ ...item, type: "category" })),
  ];

  // ANIMATION VARIANTS
  const dropdownVariants = {
    hidden: {
      opacity: 0,
      y: -8,
      scale: 0.98,
    },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.22,
        ease: [0.22, 1, 0.36, 1],
        when: "beforeChildren",
        staggerChildren: 0.035,
      },
    },
    exit: {
      opacity: 0,
      y: -8,
      scale: 0.98,
      transition: {
        duration: 0.16,
        ease: "easeIn",
      },
    },
  };

  const itemVariants = {
    hidden: {
      opacity: 0,
      y: 8,
    },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.2,
        ease: "easeOut",
      },
    },
  };

  // DEBOUNCED LIVE SEARCH
  useEffect(() => {
    const value = query.trim();

    dispatch(setSearchQuery(query));
    setActiveIndex(-1);

    if (value.length < 2) {
      dispatch(clearSearch());
      return;
    }

    const timer = setTimeout(() => {
      dispatch(fetchSearchSuggestions(value));
    }, 300);

    return () => clearTimeout(timer);
  }, [query, dispatch]);

  // CLOSE WHEN CLICKING OUTSIDE
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(event.target)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // SEARCH PRODUCTS
  const searchProducts = (value) => {
    const searchTerm = value.trim();

    if (!searchTerm) return;

    dispatch(addRecentSearch(searchTerm));

    setQuery(searchTerm);
    setIsOpen(false);

    // Notify ProductsPage immediately
    window.dispatchEvent(
      new CustomEvent("elezio-search", {
        detail: { search: searchTerm },
      })
    );

    onSearchSubmit?.();

    router.push(
      `/products?search=${encodeURIComponent(searchTerm)}`
    );
  };

  // OPEN PRODUCT
  const openProduct = (product) => {
    if (!product?.slug) return;

    dispatch(addRecentSearch(product.name));

    setIsOpen(false);
    onSearchSubmit?.();

    router.push(`/products/${product.slug}`);
  };

  // KEYBOARD NAVIGATION
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

      setActiveIndex((prev) =>
        Math.min(prev + 1, items.length - 1)
      );
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();

      setActiveIndex((prev) =>
        Math.max(prev - 1, 0)
      );
    }

    if (event.key === "Enter") {
      event.preventDefault();

      if (activeIndex >= 0 && items[activeIndex]) {
        const item = items[activeIndex];

        if (item.type === "product") {
          openProduct(item);
        } else {
          searchProducts(item.name);
        }
      } else {
        searchProducts(query);
      }
    }
  };

  // CLEAR INPUT
  const clearInput = () => {
    setQuery("");
    dispatch(clearSearch());
    inputRef.current?.focus();
    setIsOpen(true);
  };

  const showRecent = query.trim().length < 2;

  return (
    <div ref={wrapperRef} className="relative w-full">

      {/* SEARCH INPUT */}
      <form
        onSubmit={(event) => {
          event.preventDefault();
          searchProducts(query);
        }}
        className="relative"
      >
        <Search
          size={19}
          className="
            absolute left-4 top-1/2
            -translate-y-1/2 text-gray-400
            transition-colors duration-200
          "
        />

        <motion.input
          ref={inputRef}
          type="search"
          value={query}
          onChange={(event) => {
            setQuery(event.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder="Search products, brands..."
          autoComplete="off"
          role="combobox"
          aria-expanded={isOpen}
          aria-controls="search-suggestions"
          aria-autocomplete="list"
          whileFocus={{
            scale: 1.005,
            transition: { duration: 0.2 },
          }}
          className="
            h-12 w-full rounded-full
            border border-gray-200
            bg-gray-50 pl-12 pr-12
            text-sm text-gray-900
            outline-none
            transition-all duration-300
            focus:border-blue-500
            focus:bg-white
            focus:ring-4 focus:ring-blue-500/10
          "
        />

        <AnimatePresence>
          {query && (
            <motion.button
              key="clear-search"
              type="button"
              onClick={clearInput}
              aria-label="Clear search"
              initial={{ opacity: 0, scale: 0.7, rotate: -45 }}
              animate={{ opacity: 1, scale: 1, rotate: 0 }}
              exit={{ opacity: 0, scale: 0.7, rotate: 45 }}
              transition={{ duration: 0.18 }}
              className="
                absolute right-4 top-1/2
                -translate-y-1/2
                text-gray-400
                hover:text-gray-700
              "
            >
              <X size={18} />
            </motion.button>
          )}
        </AnimatePresence>
      </form>

      {/* ANIMATED SEARCH SUGGESTIONS */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            key="search-suggestions"
            id="search-suggestions"
            variants={dropdownVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="
              absolute left-0 right-0 top-full z-50 mt-3
              max-h-[75vh] overflow-y-auto
              rounded-2xl border border-gray-100
              bg-white p-3 shadow-xl
              origin-top
            "
          >
            {showRecent ? (
              <>
                {/* RECENT SEARCHES */}
                {recentSearches.length > 0 && (
                  <section className="mb-4">
                    <motion.div
                      variants={itemVariants}
                      className="
                        mb-2 flex items-center gap-2
                        px-2 text-xs font-semibold
                        uppercase tracking-wide text-gray-400
                      "
                    >
                      <Clock size={14} />
                      Recent searches
                    </motion.div>

                    {recentSearches.map((item, index) => (
                      <motion.button
                        key={`${item}-${index}`}
                        variants={itemVariants}
                        type="button"
                        onClick={() => searchProducts(item)}
                        whileHover={{ x: 4 }}
                        whileTap={{ scale: 0.98 }}
                        className="
                          flex w-full items-center gap-3
                          rounded-xl px-3 py-2.5
                          text-left text-sm text-gray-700
                          transition-colors hover:bg-gray-50
                        "
                      >
                        <Clock size={15} className="text-gray-400" />
                        {item}
                      </motion.button>
                    ))}
                  </section>
                )}

                {/* POPULAR SEARCHES */}
                {popularSearches.length > 0 && (
                  <section>
                    <motion.div
                      variants={itemVariants}
                      className="
                        mb-2 flex items-center gap-2
                        px-2 text-xs font-semibold
                        uppercase tracking-wide text-gray-400
                      "
                    >
                      <TrendingUp size={14} />
                      Popular searches
                    </motion.div>

                    {popularSearches.map((item, index) => (
                      <motion.button
                        key={`${item}-${index}`}
                        variants={itemVariants}
                        type="button"
                        onClick={() => searchProducts(item)}
                        whileHover={{ x: 4 }}
                        whileTap={{ scale: 0.98 }}
                        className="
                          block w-full rounded-xl
                          px-3 py-2.5 text-left text-sm
                          text-gray-700
                          transition-colors hover:bg-gray-50
                        "
                      >
                        {item}
                      </motion.button>
                    ))}
                  </section>
                )}

                {recentSearches.length === 0 &&
                  popularSearches.length === 0 && (
                    <motion.p
                      variants={itemVariants}
                      className="px-3 py-5 text-center text-sm text-gray-400"
                    >
                      Start typing to search products
                    </motion.p>
                  )}
              </>
            ) : loading ? (
              /* LOADING */
              <motion.div
                variants={itemVariants}
                className="
                  flex items-center justify-center
                  gap-2 py-8 text-sm text-gray-500
                "
              >
                <Loader2 size={18} className="animate-spin" />
                Searching...
              </motion.div>
            ) : items.length > 0 ? (
              <>
                {/* PRODUCTS */}
                {products.length > 0 && (
                  <section className="mb-3">
                    <motion.p
                      variants={itemVariants}
                      className="
                        mb-2 px-2 text-xs font-semibold
                        uppercase tracking-wide text-gray-400
                      "
                    >
                      Products
                    </motion.p>

                    {products.map((product) => (
                      <motion.button
                        key={product._id}
                        variants={itemVariants}
                        type="button"
                        onClick={() => openProduct(product)}
                        whileHover={{ x: 4, backgroundColor: "#f9fafb" }}
                        whileTap={{ scale: 0.99 }}
                        className="
                          flex w-full items-center gap-3
                          rounded-xl p-2 text-left
                        "
                      >
                        <div className="
                          h-12 w-12 shrink-0 overflow-hidden
                          rounded-lg bg-gray-100
                        ">
                          {product.thumbnail?.url && (
                            <motion.img
                              src={product.thumbnail.url}
                              alt={product.name}
                              whileHover={{ scale: 1.12 }}
                              transition={{ duration: 0.25 }}
                              className="h-full w-full object-contain"
                            />
                          )}
                        </div>

                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium text-gray-800">
                            {product.name}
                          </p>

                          <p className="mt-1 text-sm font-semibold text-blue-600">
                            ₹{product.basePrice}
                          </p>
                        </div>
                      </motion.button>
                    ))}
                  </section>
                )}

                {/* BRANDS */}
                {brands.length > 0 && (
                  <section className="mb-3">
                    <motion.p
                      variants={itemVariants}
                      className="
                        mb-2 px-2 text-xs font-semibold
                        uppercase tracking-wide text-gray-400
                      "
                    >
                      Brands
                    </motion.p>

                    {brands.map((brand, index) => (
                      <motion.button
                        key={`${brand}-${index}`}
                        variants={itemVariants}
                        type="button"
                        onClick={() => searchProducts(brand)}
                        whileHover={{ x: 4 }}
                        whileTap={{ scale: 0.98 }}
                        className="
                          w-full rounded-xl px-3 py-2.5
                          text-left text-sm text-gray-700
                          hover:bg-gray-50
                        "
                      >
                        {brand}
                      </motion.button>
                    ))}
                  </section>
                )}

                {/* CATEGORIES */}
                {categories.length > 0 && (
                  <section className="mb-3">
                    <motion.p
                      variants={itemVariants}
                      className="
                        mb-2 px-2 text-xs font-semibold
                        uppercase tracking-wide text-gray-400
                      "
                    >
                      Categories
                    </motion.p>

                    {categories.map((category) => (
                      <motion.button
                        key={category._id}
                        variants={itemVariants}
                        type="button"
                        onClick={() => searchProducts(category.name)}
                        whileHover={{ x: 4 }}
                        whileTap={{ scale: 0.98 }}
                        className="
                          w-full rounded-xl px-3 py-2.5
                          text-left text-sm text-gray-700
                          hover:bg-gray-50
                        "
                      >
                        {category.name}
                      </motion.button>
                    ))}
                  </section>
                )}

                {/* VIEW ALL RESULTS */}
                <motion.button
                  variants={itemVariants}
                  type="button"
                  onClick={() => searchProducts(query)}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.98 }}
                  className="
                    mt-2 flex w-full items-center
                    justify-between rounded-xl
                    bg-blue-50 px-3 py-3
                    text-sm font-semibold text-blue-700
                    transition-colors hover:bg-blue-100
                  "
                >
                  View all results for "{query}"
                  <CornerDownLeft size={16} />
                </motion.button>
              </>
            ) : (
              /* NO RESULTS */
              <motion.div
                variants={itemVariants}
                className="py-8 text-center"
              >
                <Search
                  size={25}
                  className="mx-auto mb-2 text-gray-300"
                />

                <p className="text-sm font-medium text-gray-700">
                  No results found
                </p>

                <p className="mt-1 text-xs text-gray-400">
                  Try another product or brand
                </p>
              </motion.div>
            )}

            {/* KEYBOARD SHORTCUTS */}
            {items.length > 0 && (
              <motion.div
                variants={itemVariants}
                className="
                  mt-3 flex items-center justify-center
                  gap-4 border-t border-gray-100
                  pt-3 text-[11px] text-gray-400
                "
              >
                <span className="flex items-center gap-1">
                  <ArrowUp size={12} />
                  <ArrowDown size={12} />
                  Navigate
                </span>

                <span className="flex items-center gap-1">
                  <CornerDownLeft size={12} />
                  Select
                </span>

                <span>Esc Close</span>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
