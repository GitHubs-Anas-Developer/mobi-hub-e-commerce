"use client";

import {
  Suspense,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useSearchParams } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "sonner";
import { X, AlertCircle, RefreshCw } from "lucide-react";

import productService from "@/services/productService";
import categoryService from "@/services/categoryService";
import { fetchCart, addToCart } from "@/store/thunks/cartThunks";
import {
  fetchWishlist,
  addToWishlist,
  removeFromWishlist,
} from "@/store/thunks/wishlistThunks";
import { BRAND_NAME, BRAND_SEARCH_EVENT } from "@/config/brand";

import ProductsHeader from "@/components/products/ProductsHeader";
import ShopBanner from "@/components/products/ProductsBanner";
import ProductCategoryCards from "@/components/products/ProductCategoryCards";
import SubCategoryTabs from "@/components/products/SubCategoryTabs";
import ProductFilters from "@/components/products/ProductFilters";
import ProductToolbar from "@/components/products/toolbar/ProductToolbar";
import ProductGrid from "@/components/products/ProductGrid";
import ProductError from "@/components/products/ProductError";
import ProductPagination from "@/components/products/ProductPagination";
import ProductsPageSkeleton from "@/components/loading/skeletons/ProductsPageSkeleton";
import Breadcrumb from "@/components/common/Breadcrumb";
import CategoryDepartmentNav from "@/components/categories/CategoryDepartmentNav";
import RecentlyViewed from "@/components/recently-viewed/RecentlyViewed";
import MiniCartDrawer from "@/components/cart/MiniCartDrawer";

const PAGE_SIZE = 12;

const ALLOWED_SORTS = new Set([
  "newest",
  "oldest",
  "price-low-high",
  "price-high-low",
  "nameAZ",
  "nameZA",
]);

const getProductList = (response) => {
  if (Array.isArray(response?.data?.products)) return response.data.products;
  if (Array.isArray(response?.products)) return response.products;
  if (Array.isArray(response?.data)) return response.data;
  if (Array.isArray(response)) return response;
  return [];
};

const getPaginationInfo = (response, currentPage, itemCount) => {
  const meta =
    response?.data?.pagination || response?.pagination || {};
  const total = Number(meta.total ?? response?.total ?? itemCount) || 0;
  const limit = Number(meta.limit) || PAGE_SIZE;
  const totalPages = Math.max(
    1,
    Number(meta.totalPages) || Math.ceil(total / limit) || 1
  );

  return {
    total,
    page: Number(meta.page) || currentPage,
    limit,
    totalPages,
  };
};

const getCategoryList = (response) => {
  if (Array.isArray(response?.data)) return response.data;
  if (Array.isArray(response?.categories)) return response.categories;
  if (Array.isArray(response?.data?.categories)) return response.data.categories;
  if (Array.isArray(response)) return response;
  return [];
};

const getParentId = (cat) => {
  if (!cat?.parentCategory) return "";
  return typeof cat.parentCategory === "object"
    ? String(cat.parentCategory._id || cat.parentCategory.id || "")
    : String(cat.parentCategory);
};

const getWishlistProductId = (item) => {
  if (typeof item === "string") return item;
  if (!item || typeof item !== "object") return "";
  const ref = item.product ?? item.productId;
  if (typeof ref === "string") return ref;
  if (ref && typeof ref === "object") return ref._id ?? ref.id ?? "";
  return item._id ?? item.id ?? "";
};

function ProductsListingContent({ categoryId = "" }) {
  const dispatch = useDispatch();
  const searchParams = useSearchParams();

  const isAuthenticated = useSelector(
    (state) => state.auth?.isAuthenticated ?? false
  );

  const wishlistState = useSelector((state) => state.wishlist);
  const wishlistProducts = useMemo(() => {
    const items =
      wishlistState?.items ||
      wishlistState?.wishlist?.products ||
      wishlistState?.products ||
      [];
    return Array.isArray(items) ? items : [];
  }, [wishlistState]);

  const wishlistIsMutating = Boolean(wishlistState?.loading);

  // ========================================
  // CATALOG STATE
  // ========================================
  const [allCategories, setAllCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [knownBrands, setKnownBrands] = useState([]);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: PAGE_SIZE,
    totalPages: 1,
  });

  const [category, setCategory] = useState(categoryId || "");
  const [subCategory, setSubCategory] = useState("");
  const [brand, setBrand] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("newest");
  const [isFeatured, setIsFeatured] = useState(false);
  const [isNewArrival, setIsNewArrival] = useState(false);
  const [page, setPage] = useState(1);

  const [viewMode, setViewMode] = useState("grid");
  const [showFilters, setShowFilters] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [addingProductId, setAddingProductId] = useState(null);
  const [miniCartOpen, setMiniCartOpen] = useState(false);

  const requestIdRef = useRef(0);

  // ========================================
  // LOAD CATEGORIES + INITIAL WISHLIST/CART
  // ========================================
  useEffect(() => {
    let cancelled = false;

    const loadCategories = async () => {
      try {
        const res = await categoryService.getCategories();
        if (!cancelled) {
          setAllCategories(getCategoryList(res));
        }
      } catch (err) {
        console.error("Failed to fetch categories:", err);
      }
    };

    loadCategories();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      dispatch(fetchWishlist());
      dispatch(fetchCart());
    }
  }, [dispatch, isAuthenticated]);

  // ========================================
  // SYNC URL QUERY PARAMS & ROUTE CATEGORY
  // ========================================
  const searchParamsKey = searchParams.toString();

  useEffect(() => {
    const syncStateFromUrl = () => {
      const params = new URLSearchParams(searchParamsKey);

      const urlSearch = params.get("search") || "";
      const urlBrand = params.get("brand") || "";
      const urlMinPrice = params.get("minPrice") || "";
      const urlMaxPrice = params.get("maxPrice") || "";
      const urlSort = params.get("sort") || "newest";
      const urlFeatured = params.get("isFeatured") === "true";
      const urlNewArrival = params.get("isNewArrival") === "true";
      const urlCategory = params.get("category") || "";
      const urlSubCategory = params.get("subCategory") || "";
      const urlPage = Math.max(1, Number(params.get("page")) || 1);

      let nextCategory = categoryId || urlCategory;
      let nextSubCategory = urlSubCategory;

      if (categoryId && allCategories.length > 0) {
        const matched = allCategories.find(
          (item) => String(item._id) === String(categoryId)
        );
        const parentId = getParentId(matched);
        if (parentId) {
          nextCategory = parentId;
          nextSubCategory = String(categoryId);
        }
      }

      setCategory(nextCategory);
      setSubCategory(nextSubCategory);
      setBrand(urlBrand);
      setMinPrice(urlMinPrice);
      setMaxPrice(urlMaxPrice);
      setSearch(urlSearch);
      setSort(ALLOWED_SORTS.has(urlSort) ? urlSort : "newest");
      setIsFeatured(urlFeatured);
      setIsNewArrival(urlNewArrival);
      setPage(urlPage);
    };

    queueMicrotask(syncStateFromUrl);
  }, [searchParamsKey, categoryId, allCategories]);

  // Listen for Navbar global search events when already on /products
  useEffect(() => {
    const handleSearchEvent = (event) => {
      const term =
        typeof event?.detail === "string"
          ? event.detail.trim()
          : event?.detail?.search?.trim() || "";
      setSearch(term);
      setPage(1);
    };

    window.addEventListener(BRAND_SEARCH_EVENT, handleSearchEvent);
    return () => {
      window.removeEventListener(BRAND_SEARCH_EVENT, handleSearchEvent);
    };
  }, []);

  const syncBrowserUrl = useCallback(
    (overrides = {}) => {
      if (typeof window === "undefined") return;

      const nextState = {
        category,
        subCategory,
        brand,
        minPrice,
        maxPrice,
        search,
        sort,
        isFeatured,
        isNewArrival,
        page,
        ...overrides,
      };

      const params = new URLSearchParams();

      if (!categoryId && nextState.category) {
        params.set("category", String(nextState.category));
      }
      if (nextState.subCategory) {
        params.set("subCategory", String(nextState.subCategory));
      }
      if (nextState.brand) {
        params.set("brand", String(nextState.brand));
      }
      if (nextState.minPrice !== "") {
        params.set("minPrice", String(nextState.minPrice));
      }
      if (nextState.maxPrice !== "") {
        params.set("maxPrice", String(nextState.maxPrice));
      }
      if (nextState.search && String(nextState.search).trim()) {
        params.set("search", String(nextState.search).trim());
      }
      if (nextState.sort && nextState.sort !== "newest") {
        params.set("sort", nextState.sort);
      }
      if (nextState.isFeatured) {
        params.set("isFeatured", "true");
      }
      if (nextState.isNewArrival) {
        params.set("isNewArrival", "true");
      }
      if (Number(nextState.page) > 1) {
        params.set("page", String(nextState.page));
      }

      const qs = params.toString();
      const nextUrl = qs
        ? `${window.location.pathname}?${qs}`
        : window.location.pathname;
      window.history.replaceState(null, "", nextUrl);
    },
    [
      category,
      categoryId,
      subCategory,
      brand,
      minPrice,
      maxPrice,
      search,
      sort,
      isFeatured,
      isNewArrival,
      page,
    ]
  );

  // ========================================
  // DERIVED CATEGORIES, SUBCATEGORIES, BRANDS
  // ========================================
  const rootCategories = useMemo(
    () => allCategories.filter((item) => !getParentId(item)),
    [allCategories]
  );

  const subCategories = useMemo(() => {
    if (!category) return [];
    return allCategories.filter(
      (item) => getParentId(item) === String(category)
    );
  }, [allCategories, category]);

  const selectedCategory = useMemo(
    () =>
      allCategories.find((item) => String(item._id) === String(category)) ||
      null,
    [allCategories, category]
  );

  const selectedSubCategory = useMemo(
    () =>
      allCategories.find((item) => String(item._id) === String(subCategory)) ||
      null,
    [allCategories, subCategory]
  );

  const brands = useMemo(() => {
    const set = new Set(knownBrands);
    products.forEach((item) => {
      const name = String(item?.brand || "").trim();
      if (name) set.add(name);
    });
    if (brand) set.add(brand);
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [knownBrands, products, brand]);

  // ========================================
  // FETCH PRODUCTS
  // ========================================
  const fetchProducts = useCallback(async () => {
    const requestId = ++requestIdRef.current;

    try {
      setLoading(true);
      setError("");

      const params = {
        page,
        limit: PAGE_SIZE,
        sort,
      };

      const activeCategory = subCategory || category;
      if (activeCategory) params.category = activeCategory;
      if (brand) params.brand = brand;
      if (minPrice !== "") params.minPrice = minPrice;
      if (maxPrice !== "") params.maxPrice = maxPrice;
      if (search.trim()) params.search = search.trim();
      if (isFeatured) params.isFeatured = true;
      if (isNewArrival) params.isNewArrival = true;

      const response = await productService.getProducts(params);

      if (requestId !== requestIdRef.current) return;

      const loadedProducts = getProductList(response);
      setProducts(loadedProducts);
      setPagination(getPaginationInfo(response, page, loadedProducts.length));

      const discoveredBrands = loadedProducts
        .map((item) => String(item?.brand || "").trim())
        .filter(Boolean);

      if (discoveredBrands.length > 0) {
        setKnownBrands((prev) =>
          Array.from(new Set([...prev, ...discoveredBrands]))
        );
      }
    } catch (err) {
      if (requestId !== requestIdRef.current) return;

      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Unable to load products. Please try again."
      );
    } finally {
      if (requestId === requestIdRef.current) {
        setLoading(false);
      }
    }
  }, [
    page,
    sort,
    category,
    subCategory,
    brand,
    minPrice,
    maxPrice,
    search,
    isFeatured,
    isNewArrival,
  ]);

  useEffect(() => {
    queueMicrotask(() => {
      fetchProducts();
    });

    return () => {
      requestIdRef.current += 1;
    };
  }, [fetchProducts]);

  // ========================================
  // HANDLERS
  // ========================================
  const handleCategoryChange = (nextCatId) => {
    const next = nextCatId || "";
    setCategory(next);
    setSubCategory("");
    setPage(1);
    syncBrowserUrl({ category: next, subCategory: "", page: 1 });
  };

  const handleSubCategoryChange = (nextSubId) => {
    const next = nextSubId || "";
    setSubCategory(next);
    setPage(1);
    syncBrowserUrl({ subCategory: next, page: 1 });
  };

  const handleApplyFilters = ({
    category: nextCategory,
    brand: nextBrand,
    minPrice: nextMinPrice,
    maxPrice: nextMaxPrice,
  }) => {
    const nextSub = nextCategory !== category ? "" : subCategory;
    if (nextCategory !== category) {
      setSubCategory("");
    }
    setCategory(nextCategory || "");
    setBrand(nextBrand || "");
    setMinPrice(nextMinPrice || "");
    setMaxPrice(nextMaxPrice || "");
    setPage(1);
    syncBrowserUrl({
      category: nextCategory || "",
      subCategory: nextSub,
      brand: nextBrand || "",
      minPrice: nextMinPrice || "",
      maxPrice: nextMaxPrice || "",
      page: 1,
    });
  };

  const handleClearSearch = useCallback(() => {
    setSearch("");
    setPage(1);
    syncBrowserUrl({ search: "", page: 1 });
    if (typeof window !== "undefined") {
      window.dispatchEvent(
        new CustomEvent(BRAND_SEARCH_EVENT, {
          detail: { search: "" },
        })
      );
    }
  }, [syncBrowserUrl]);

  const handleClearAllFilters = () => {
    const baseCategory = categoryId || "";
    setCategory(baseCategory);
    setSubCategory("");
    setBrand("");
    setMinPrice("");
    setMaxPrice("");
    setSearch("");
    setIsFeatured(false);
    setIsNewArrival(false);
    setSort("newest");
    setPage(1);
    syncBrowserUrl({
      category: baseCategory,
      subCategory: "",
      brand: "",
      minPrice: "",
      maxPrice: "",
      search: "",
      sort: "newest",
      isFeatured: false,
      isNewArrival: false,
      page: 1,
    });
    if (typeof window !== "undefined") {
      window.dispatchEvent(
        new CustomEvent(BRAND_SEARCH_EVENT, {
          detail: { search: "" },
        })
      );
    }
  };

  const handleSortChange = (nextSort) => {
    setSort(nextSort);
    setPage(1);
    syncBrowserUrl({ sort: nextSort, page: 1 });
  };

  const handlePageChange = (nextPage) => {
    setPage(nextPage);
    syncBrowserUrl({ page: nextPage });
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  // ========================================
  // CART & WISHLIST MUTATIONS
  // ========================================
  const wishlistedIds = useMemo(
    () =>
      new Set(
        wishlistProducts
          .map(getWishlistProductId)
          .filter(Boolean)
          .map(String)
      ),
    [wishlistProducts]
  );

  const handleAddToCart = async (product, selectedVariant) => {
    if (!product?._id) return;

    const variantId =
      selectedVariant?._id || product.variants?.[0]?._id || "";

    if (!variantId) {
      toast.error("Please open product details to choose a variant.");
      return;
    }

    try {
      setAddingProductId(String(product._id));

      await dispatch(
        addToCart({
          productId: product._id,
          variantId,
          quantity: 1,
        })
      ).unwrap();

      toast.success(`${product.name || "Product"} added to cart`);
      setMiniCartOpen(true);
    } catch (err) {
      const message =
        typeof err === "string"
          ? err
          : err?.message || "Unable to add item to cart";
      toast.error(message);
    } finally {
      setAddingProductId(null);
    }
  };

  const handleWishlistToggle = async (product) => {
    const productId = product?._id || product?.id;
    if (!productId) return;

    const normalizedId = String(productId);
    const alreadyWishlisted = wishlistedIds.has(normalizedId);

    try {
      if (alreadyWishlisted) {
        await dispatch(removeFromWishlist(productId)).unwrap();
        toast.success("Removed from wishlist");
      } else {
        await dispatch(addToWishlist(productId)).unwrap();
        toast.success("Saved to wishlist");
      }
    } catch (err) {
      const message =
        typeof err === "string"
          ? err
          : err?.message || "Please sign in to manage your wishlist";
      toast.error(message);
    }
  };

  // ========================================
  // HEADER & BREADCRUMB METADATA
  // ========================================
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (category) count += 1;
    if (brand) count += 1;
    if (minPrice !== "" || maxPrice !== "") count += 1;
    return count;
  }, [category, brand, minPrice, maxPrice]);

  const activeChips = useMemo(() => {
    const chips = [];

    if (search.trim()) {
      chips.push({
        key: "search",
        label: `Search: "${search.trim()}"`,
        onRemove: handleClearSearch,
      });
    }

    if (selectedCategory) {
      chips.push({
        key: "category",
        label: `Category: ${selectedCategory.name}`,
        onRemove: () => {
          setCategory("");
          setSubCategory("");
          setPage(1);
          syncBrowserUrl({ category: "", subCategory: "", page: 1 });
        },
      });
    }

    if (selectedSubCategory) {
      chips.push({
        key: "subCategory",
        label: `Subcategory: ${selectedSubCategory.name}`,
        onRemove: () => {
          setSubCategory("");
          setPage(1);
          syncBrowserUrl({ subCategory: "", page: 1 });
        },
      });
    }

    if (brand) {
      chips.push({
        key: "brand",
        label: `Brand: ${brand}`,
        onRemove: () => {
          setBrand("");
          setPage(1);
          syncBrowserUrl({ brand: "", page: 1 });
        },
      });
    }

    if (minPrice !== "" || maxPrice !== "") {
      const priceLabel = `Price: ${minPrice ? `₹${minPrice}` : "₹0"} – ${
        maxPrice ? `₹${maxPrice}` : "Any"
      }`;
      chips.push({
        key: "price",
        label: priceLabel,
        onRemove: () => {
          setMinPrice("");
          setMaxPrice("");
          setPage(1);
          syncBrowserUrl({ minPrice: "", maxPrice: "", page: 1 });
        },
      });
    }

    if (isFeatured) {
      chips.push({
        key: "featured",
        label: "Featured Tech",
        onRemove: () => {
          setIsFeatured(false);
          setPage(1);
          syncBrowserUrl({ isFeatured: false, page: 1 });
        },
      });
    }

    if (isNewArrival) {
      chips.push({
        key: "newArrival",
        label: "New Arrivals",
        onRemove: () => {
          setIsNewArrival(false);
          setPage(1);
          syncBrowserUrl({ isNewArrival: false, page: 1 });
        },
      });
    }

    return chips;
  }, [
    search,
    selectedCategory,
    selectedSubCategory,
    brand,
    minPrice,
    maxPrice,
    isFeatured,
    isNewArrival,
    handleClearSearch,
    syncBrowserUrl,
  ]);

  const breadcrumbItems = search
    ? [
        { label: "Products", href: "/products" },
        { label: `Search: "${search}"` },
      ]
    : selectedSubCategory
      ? [
          categoryId
            ? { label: "Categories", href: "/categories" }
            : { label: "Products", href: "/products" },
          ...(selectedCategory
            ? [
                {
                  label: selectedCategory.name,
                  href: categoryId
                    ? `/categories/${selectedCategory._id}`
                    : `/categories/${selectedCategory._id}/products`,
                },
              ]
            : []),
          { label: selectedSubCategory.name },
        ]
      : selectedCategory
        ? [
            categoryId
              ? { label: "Categories", href: "/categories" }
              : { label: "Products", href: "/products" },
            { label: selectedCategory.name },
          ]
        : isFeatured
          ? [
              { label: "Products", href: "/products" },
              { label: "Featured Products" },
            ]
          : isNewArrival
            ? [
                { label: "Products", href: "/products" },
                { label: "New Arrivals" },
              ]
            : [{ label: "Products" }];

  const headerTitle = search
    ? `Search results for "${search}"`
    : selectedSubCategory?.name ||
      selectedCategory?.name ||
      (isFeatured
        ? "Featured Electronics & Tech"
        : isNewArrival
          ? "Latest Tech & New Arrivals"
          : "All Gadgets & Electronics");

  const headerDescription = search
    ? `Showing electronics, gadgets, and accessories matching "${search}" at ${BRAND_NAME}.`
    : selectedSubCategory?.description ||
      selectedCategory?.description ||
      `Browse genuine smartphones, audio, accessories, and everyday technology at ${BRAND_NAME}.`;

  const discoveredCategories = useMemo(() => {
    const map = new Map();
    products.forEach((item) => {
      const cat = item?.category;
      if (cat && typeof cat === "object" && cat._id && cat.name) {
        map.set(String(cat._id), { _id: String(cat._id), name: cat.name });
      }
    });
    return Array.from(map.values()).slice(0, 6);
  }, [products]);

  return (
    <>
      <main className="min-h-screen w-full bg-[#F8FAFC] pb-24 xl:pb-12">
        <div className="mx-auto w-full max-w-[1440px] px-4 py-5 sm:px-6 sm:py-6 lg:px-8">
          <Breadcrumb items={breadcrumbItems} className="mb-4" />

          <ProductsHeader
            total={pagination.total}
            title={headerTitle}
            description={headerDescription}
            isSearch={Boolean(search)}
            isFeatured={isFeatured}
            isNewArrival={isNewArrival}
            activeCategoryLabel={
              selectedSubCategory?.name || selectedCategory?.name || ""
            }
            discoveredCategories={discoveredCategories}
            onClearSearch={handleClearSearch}
            onSelectDiscoveredCategory={handleCategoryChange}
          />

          {!search && <ShopBanner />}

          {loading && products.length === 0 && !error && allCategories.length === 0 ? (
            <ProductsPageSkeleton />
          ) : (
            <>
              {categoryId ? (
                <CategoryDepartmentNav
                  categories={rootCategories}
                  activeCategoryId={category}
                  routeMode="products"
                />
              ) : (
                <ProductCategoryCards
                  categories={rootCategories}
                  selectedCategory={category}
                  onCategorySelect={handleCategoryChange}
                />
              )}

              {subCategories.length > 0 && (
                <SubCategoryTabs
                  subCategories={subCategories}
                  selectedSubCategory={subCategory}
                  onSelect={handleSubCategoryChange}
                />
              )}

              {/* Sidebar + Catalog Layout */}
              <div className="grid grid-cols-1 items-start gap-5 lg:grid-cols-[272px_minmax(0,1fr)] xl:gap-6">
                <ProductFilters
                  categories={rootCategories}
                  brands={brands}
                  category={category}
                  brand={brand}
                  minPrice={minPrice}
                  maxPrice={maxPrice}
                  onApply={handleApplyFilters}
                  onClear={handleClearAllFilters}
                  showFilters={showFilters}
                  onClose={() => setShowFilters(false)}
                />

                <section className="min-w-0" aria-label="Product results">
                  <ProductToolbar
                    total={pagination.total}
                    shownCount={products.length}
                    page={page}
                    pageSize={PAGE_SIZE}
                    loading={loading}
                    sort={sort}
                    setSort={handleSortChange}
                    viewMode={viewMode}
                    setViewMode={setViewMode}
                    onFilterClick={() => setShowFilters(true)}
                    activeFilterCount={activeFilterCount}
                  />

                  {/* Active Filter Chips */}
                  {activeChips.length > 0 && (
                    <div className="mb-4 flex flex-wrap items-center gap-2 rounded-2xl border border-[#E2E8F0] bg-white px-3.5 py-2.5 sm:px-4">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-[#64748B]">
                        Active Filters:
                      </span>

                      {activeChips.map((chip) => (
                        <button
                          key={chip.key}
                          type="button"
                          onClick={chip.onRemove}
                          className="inline-flex items-center gap-1.5 rounded-full border border-[#0755E9]/20 bg-[#EFF6FF] px-3 py-1 text-xs font-semibold text-[#082B70] transition hover:border-[#0755E9]/45 hover:bg-blue-100"
                        >
                          <span>{chip.label}</span>
                          <X size={13} aria-hidden="true" />
                        </button>
                      ))}

                      <button
                        type="button"
                        onClick={handleClearAllFilters}
                        className="ml-auto text-xs font-bold text-[#0755E9] transition hover:text-[#082B70]"
                      >
                        Clear all
                      </button>
                    </div>
                  )}

                  {/* Partial Error Banner (when stale products remain visible) */}
                  {error && products.length > 0 && (
                    <div
                      role="status"
                      className="mb-4 flex items-center justify-between gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3"
                    >
                      <div className="flex items-center gap-2 text-xs font-semibold text-amber-800">
                        <AlertCircle size={16} className="shrink-0" />
                        <span>{error}</span>
                      </div>

                      <button
                        type="button"
                        onClick={fetchProducts}
                        className="inline-flex shrink-0 items-center gap-1 rounded-lg bg-white px-3 py-1.5 text-xs font-bold text-amber-900 shadow-xs hover:bg-amber-100"
                      >
                        <RefreshCw size={13} />
                        Retry
                      </button>
                    </div>
                  )}

                  {/* Full Error vs Product Grid */}
                  {error && products.length === 0 ? (
                    <ProductError message={error} onRetry={fetchProducts} />
                  ) : (
                    <>
                      <ProductGrid
                        products={products}
                        loading={loading}
                        viewMode={viewMode}
                        search={search}
                        hasActiveFilters={activeChips.length > 0}
                        onClearFilters={handleClearAllFilters}
                        onAddToCart={handleAddToCart}
                        onWishlistToggle={handleWishlistToggle}
                        wishlistedProducts={wishlistProducts}
                        addingProductId={addingProductId}
                        wishlistIsMutating={wishlistIsMutating}
                      />

                      <ProductPagination
                        pagination={pagination}
                        page={page}
                        setPage={handlePageChange}
                      />
                    </>
                  )}
                </section>
              </div>
            </>
          )}

          <section
            className="mt-12 sm:mt-14"
            aria-label="Recently viewed products"
          >
            <RecentlyViewed title="Recently Viewed Products" limit={10} />
          </section>
        </div>
      </main>

      <MiniCartDrawer
        isOpen={miniCartOpen}
        onClose={() => setMiniCartOpen(false)}
      />
    </>
  );
}

function ProductsPageFallback() {
  return (
    <main className="min-h-screen w-full bg-[#F8FAFC]">
      <div className="mx-auto w-full max-w-[1440px] px-4 py-6 sm:px-6 lg:px-8">
        <div className="mb-4 h-4 w-40 animate-pulse rounded bg-slate-200" />
        <div className="mb-6 rounded-2xl border border-[#E2E8F0] bg-white p-5">
          <div className="h-5 w-32 animate-pulse rounded-full bg-[#EFF6FF]" />
          <div className="mt-3 h-7 w-64 animate-pulse rounded bg-slate-200" />
          <div className="mt-2 h-4 w-80 max-w-full animate-pulse rounded bg-slate-100" />
        </div>
        <ProductsPageSkeleton />
      </div>
    </main>
  );
}

export default function ProductsPage({ categoryId = "" }) {
  return (
    <Suspense fallback={<ProductsPageFallback />}>
      <ProductsListingContent categoryId={categoryId} />
    </Suspense>
  );
}
