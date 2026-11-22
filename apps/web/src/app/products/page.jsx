
"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { useDispatch, useSelector } from "react-redux";
import { usePathname, useRouter } from "next/navigation";

import { toast } from "sonner";
import { X, RotateCcw } from "lucide-react";

import productService from "@/services/productService";
import categoryService from "@/services/categoryService";

import {
  fetchCart,
  addToCart,
} from "@/store/thunks/cartThunks";

import {
  fetchWishlist,
  addToWishlist,
  removeFromWishlist,
} from "@/store/thunks/wishlistThunks";

import ProductsHeader from "@/components/products/ProductsHeader";
import ProductCategoryCards from "@/components/products/ProductCategoryCards";
import SubCategoryTabs from "@/components/products/SubCategoryTabs";
import ProductFilters from "@/components/products/ProductFilters";
import ProductToolbar from "@/components/products/ProductToolbar";
import ProductGrid from "@/components/products/ProductGrid";
import ProductPagination from "@/components/products/ProductPagination";
import ShopBanner from "@/components/products/ProductsBanner";

import MiniCartDrawer from "@/components/cart/MiniCartDrawer";
import RecentlyViewed from "@/components/recently-viewed/RecentlyViewed";

// ========================================
// CONSTANTS
// ========================================

const PAGE_SIZE = 12;

const INITIAL_FILTERS = {
  category: "",
  subCategory: "",
  brand: "",
  minPrice: "",
  maxPrice: "",
};

// ========================================
// WISHLIST PRODUCT ID HELPER
// ========================================

const getWishlistProductId = (item) => {
  if (typeof item === "string") {
    return item;
  }

  if (!item || typeof item !== "object") {
    return "";
  }

  const productRef = item.product ?? item.productId;

  if (typeof productRef === "string") {
    return productRef;
  }

  if (productRef && typeof productRef === "object") {
    return productRef._id ?? productRef.id ?? "";
  }

  return item._id ?? item.id ?? "";
};

// ========================================
// PRODUCTS PAGE
// ========================================

export default function ProductsPage() {
  const dispatch = useDispatch();
  const router = useRouter();
  const pathname = usePathname();

  // ========================================
  // REDUX STATE
  // ========================================

  const isAuthenticated = useSelector(
    (state) => state.auth.isAuthenticated
  );

  const cartIsMutating = useSelector(
    (state) => state.cart.isMutating
  );

  const wishlistIsMutating = useSelector(
    (state) => state.wishlist.isMutating
  );

  const wishlistProducts = useSelector(
    (state) => state.wishlist.products || []
  );

  // ========================================
  // LOCAL STATE
  // ========================================

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [addingProductId, setAddingProductId] = useState(null);
  const [cartDrawerOpen, setCartDrawerOpen] = useState(false);

  const [appliedFilters, setAppliedFilters] = useState({
    ...INITIAL_FILTERS,
  });

  const {
    category,
    subCategory,
    brand,
    minPrice,
    maxPrice,
  } = appliedFilters;

  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("newest");
  const [page, setPage] = useState(1);

  const [viewMode, setViewMode] = useState("grid");
  const [showFilters, setShowFilters] = useState(false);

  const [pagination, setPagination] = useState({
    total: 0,
    totalPages: 1,
    hasNextPage: false,
    hasPrevPage: false,
  });

  const requestIdRef = useRef(0);

  // ========================================
  // SEARCH URL + HEADER SEARCH EVENT
  // ========================================

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);

    setSearch(params.get("search") || "");

    const handleSearchUpdate = (event) => {
      const newSearch = event.detail?.search || "";

      setSearch(newSearch);
      setPage(1);
    };

    window.addEventListener(
      "mobi-hub-search",
      handleSearchUpdate
    );

    return () => {
      window.removeEventListener(
        "mobi-hub-search",
        handleSearchUpdate
      );
    };
  }, []);

  // ========================================
  // FETCH CART AND WISHLIST
  // ========================================

  useEffect(() => {
    if (!isAuthenticated) return;

    dispatch(fetchCart());
    dispatch(fetchWishlist());
  }, [dispatch, isAuthenticated]);

  // ========================================
  // LOGIN REDIRECT
  // ========================================

  const requireLogin = useCallback(() => {
    const redirectPath = pathname || "/products";

    router.push(
      `/login?redirect=${encodeURIComponent(redirectPath)}`
    );
  }, [pathname, router]);

  // ========================================
  // FETCH CATEGORIES
  // ========================================

  const fetchCategories = useCallback(async () => {
    try {
      const response = await categoryService.getCategories();

      const data =
        response?.data?.categories ??
        response?.data ??
        [];

      setCategories(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Category fetching error:", err);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

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

      if (category) {
        params.category = category;
      }

      if (subCategory) {
        params.subCategory = subCategory;
      }

      if (brand) {
        params.brand = brand;
      }

      if (search.trim()) {
        params.search = search.trim();
      }

      if (minPrice !== "") {
        params.minPrice = Number(minPrice);
      }

      if (maxPrice !== "") {
        params.maxPrice = Number(maxPrice);
      }

      const response = await productService.getProducts(params);

      // Ignore outdated requests
      if (requestId !== requestIdRef.current) {
        return;
      }

      const data =
        response?.data?.products ??
        response?.data ??
        [];

      setProducts(Array.isArray(data) ? data : []);

      const paginationData =
        response?.pagination ??
        response?.data?.pagination ??
        {};

      const total = Number(paginationData.total ?? 0);

      const totalPages = Math.max(
        1,
        Number(
          paginationData.totalPages ??
          Math.ceil(total / PAGE_SIZE)
        )
      );

      setPagination({
        total,
        totalPages,
        hasNextPage: Boolean(
          paginationData.hasNextPage ?? page < totalPages
        ),
        hasPrevPage: Boolean(
          paginationData.hasPrevPage ?? page > 1
        ),
      });
    } catch (err) {
      if (requestId !== requestIdRef.current) {
        return;
      }

      console.error("Products fetching error:", err);

      setProducts([]);

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
  ]);

  // ========================================
  // PRODUCT FETCH EFFECT
  // ========================================

  useEffect(() => {
    fetchProducts();

    return () => {
      requestIdRef.current += 1;
    };
  }, [fetchProducts]);

  // ========================================
  // WISHLIST IDS
  // ========================================

  const wishlistedIds = useMemo(() => {
    return new Set(
      wishlistProducts
        .map(getWishlistProductId)
        .filter(Boolean)
        .map(String)
    );
  }, [wishlistProducts]);

  // ========================================
  // ADD TO CART
  // ========================================

  const handleAddToCart = async (product, cardVariant) => {
    if (!isAuthenticated) {
      toast.info("Please sign in to continue.");
      requireLogin();
      return;
    }

    if (!product?._id) return;

    if (cartIsMutating || addingProductId) {
      return;
    }

    const activeVariants = (product.variants || []).filter(
      (variant) => variant.isActive !== false
    );

    const selectedVariant =
      cardVariant ||
      activeVariants.find((variant) => variant.isDefault) ||
      activeVariants[0];

    if (!selectedVariant?._id) {
      toast.error("Product option unavailable.", {
        description: "Please select a product option.",
      });

      if (product.slug) {
        router.push(`/products/${product.slug}`);
      }

      return;
    }

    const stock = Number(
      selectedVariant.stock ??
      selectedVariant.quantity ??
      product.stock ??
      product.quantity ??
      0
    );

    if (stock <= 0) {
      toast.error("This product is currently out of stock.");
      return;
    }

    try {
      setAddingProductId(product._id);

      await dispatch(
        addToCart({
          productId: product._id,
          variantId: selectedVariant._id,
          quantity: 1,
        })
      ).unwrap();

      setCartDrawerOpen(true);
    } catch (err) {
      toast.error(
        typeof err === "string"
          ? err
          : err?.message || "Unable to add product to cart."
      );
    } finally {
      setAddingProductId(null);
    }
  };

  // ========================================
  // WISHLIST TOGGLE
  // ========================================

  const handleWishlistToggle = async (product) => {
    if (!isAuthenticated) {
      toast.info("Please sign in to continue.");
      requireLogin();
      return;
    }

    if (!product?._id || wishlistIsMutating) {
      return;
    }

    const alreadyWishlisted = wishlistedIds.has(
      String(product._id)
    );

    try {
      if (alreadyWishlisted) {
        await dispatch(
          removeFromWishlist(product._id)
        ).unwrap();

        toast.success("Removed from wishlist.");
      } else {
        await dispatch(
          addToWishlist(product._id)
        ).unwrap();

        toast.success("Added to wishlist.");
      }
    } catch (err) {
      toast.error(
        typeof err === "string"
          ? err
          : err?.message || "Unable to update wishlist."
      );
    }
  };

  // ========================================
  // SELECTED CATEGORY
  // ========================================

  const selectedCategory = useMemo(
    () =>
      categories.find(
        (item) => item._id === category
      ),
    [categories, category]
  );

  // ========================================
  // SUBCATEGORIES
  // ========================================

  const subCategories = useMemo(
    () =>
      selectedCategory?.subCategories ||
      selectedCategory?.children ||
      [],
    [selectedCategory]
  );

  const selectedSubCategory = useMemo(
    () =>
      subCategories.find(
        (item) => item._id === subCategory
      ),
    [subCategories, subCategory]
  );

  // ========================================
  // BRANDS
  // ========================================

  const brands = useMemo(() => {
    const values = products
      .map((product) => product.brand)
      .filter(Boolean);

    return [...new Set(values)].sort();
  }, [products]);

  // ========================================
  // SEARCH HANDLER
  // ========================================

  const handleSearch = (value) => {
    setSearch(value);
    setPage(1);
  };

  // ========================================
  // CATEGORY HANDLER
  // ========================================

  const handleCategoryChange = (value) => {
    setAppliedFilters((previous) => ({
      ...previous,
      category: value,
      subCategory: "",
    }));

    setPage(1);
  };

  // ========================================
  // SUBCATEGORY HANDLER
  // ========================================

  const handleSubCategoryChange = (value) => {
    setAppliedFilters((previous) => ({
      ...previous,
      subCategory: value,
    }));

    setPage(1);
  };

  // ========================================
  // APPLY FILTERS
  // ========================================

  const handleApplyFilters = (filters) => {
    setAppliedFilters((previous) => {
      const nextCategory =
        filters.category ?? previous.category;

      return {
        ...previous,
        ...filters,
        subCategory:
          nextCategory !== previous.category
            ? ""
            : filters.subCategory ?? previous.subCategory,
      };
    });

    setPage(1);
    setShowFilters(false);
  };

  // ========================================
  // SORT HANDLER
  // ========================================

  const handleSortChange = (value) => {
    setSort(value);
    setPage(1);
  };

  // ========================================
  // REMOVE BRAND
  // ========================================

  const handleRemoveBrand = () => {
    setAppliedFilters((previous) => ({
      ...previous,
      brand: "",
    }));

    setPage(1);
  };

  // ========================================
  // REMOVE PRICE
  // ========================================

  const handleRemovePrice = () => {
    setAppliedFilters((previous) => ({
      ...previous,
      minPrice: "",
      maxPrice: "",
    }));

    setPage(1);
  };

  // ========================================
  // CLEAR ALL FILTERS
  // ========================================

  const handleClearFilters = () => {
    setAppliedFilters({ ...INITIAL_FILTERS });
    setSearch("");
    setSort("newest");
    setPage(1);
    setShowFilters(false);
  };

  // ========================================
  // PAGINATION
  // ========================================

  const handlePageChange = (newPage) => {
    if (
      newPage < 1 ||
      newPage > pagination.totalPages
    ) {
      return;
    }

    setPage(newPage);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  // ========================================
  // ACTIVE FILTER COUNT
  // ========================================

  const activeFilterCount = [
    category,
    subCategory,
    brand,
    minPrice,
    maxPrice,
  ].filter(Boolean).length;

  // ========================================
  // FILTER PROPS
  // ========================================

  const filterProps = {
    categories,
    brands,
    category,
    brand,
    minPrice,
    maxPrice,
    onApply: handleApplyFilters,
    showFilters,
    onClose: () => setShowFilters(false),
  };

  // ========================================
  // RENDER
  // ========================================

  return (
    <>
      <main className="min-h-screen w-full">
        <div className="mx-auto w-full px-3 py-4 sm:px-5 sm:py-6 lg:px-8">

          {/* PRODUCTS HEADER */}

          <ProductsHeader
            total={pagination.total}
          />

          {/* PRODUCTS BANNER */}

          <ShopBanner />

          {/* CATEGORY NAVIGATION */}

          <ProductCategoryCards
            categories={categories}
            selectedCategory={category}
            onCategorySelect={handleCategoryChange}
          />

          {/* SUBCATEGORY NAVIGATION */}

          {subCategories.length > 0 && (
            <SubCategoryTabs
              subCategories={subCategories}
              selectedSubCategory={subCategory}
              onSelect={handleSubCategoryChange}
            />
          )}

          {/* FILTER AND PRODUCTS GRID */}

          <div className="grid w-full min-w-0 grid-cols-1 items-start gap-5 lg:grid-cols-[245px_minmax(0,1fr)] xl:gap-6">

            {/* FILTERS */}

            <ProductFilters
              {...filterProps}
            />

            {/* PRODUCTS SECTION */}

            <section className="w-full min-w-0">

              {/* TOOLBAR */}

              <ProductToolbar
                total={pagination.total}
                sort={sort}
                setSort={handleSortChange}
                viewMode={viewMode}
                setViewMode={setViewMode}
                onFilterClick={() => setShowFilters(true)}
                activeFilterCount={activeFilterCount}
              />

              {/* ACTIVE FILTER CHIPS */}

              {(activeFilterCount > 0 || search) && (
                <div className="mb-4 mt-3 flex flex-wrap items-center gap-2">

                  <span className="text-xs font-semibold text-slate-500">
                    Active:
                  </span>

                  {selectedCategory && (
                    <button
                      type="button"
                      onClick={() => handleCategoryChange("")}
                      className="flex items-center gap-1 rounded-full bg-blue-50 px-3 py-1.5 text-xs font-medium text-blue-700 transition hover:bg-blue-100"
                    >
                      {selectedCategory.name}
                      <X size={13} />
                    </button>
                  )}

                  {subCategory && (
                    <button
                      type="button"
                      onClick={() => handleSubCategoryChange("")}
                      className="flex items-center gap-1 rounded-full bg-blue-50 px-3 py-1.5 text-xs font-medium text-blue-700 transition hover:bg-blue-100"
                    >
                      {selectedSubCategory?.name || "Subcategory"}
                      <X size={13} />
                    </button>
                  )}

                  {brand && (
                    <button
                      type="button"
                      onClick={handleRemoveBrand}
                      className="flex items-center gap-1 rounded-full bg-blue-50 px-3 py-1.5 text-xs font-medium text-blue-700 transition hover:bg-blue-100"
                    >
                      {brand}
                      <X size={13} />
                    </button>
                  )}

                  {search && (
                    <button
                      type="button"
                      onClick={() => handleSearch("")}
                      className="flex items-center gap-1 rounded-full bg-blue-50 px-3 py-1.5 text-xs font-medium text-blue-700 transition hover:bg-blue-100"
                    >
                      {search}
                      <X size={13} />
                    </button>
                  )}

                  {(minPrice || maxPrice) && (
                    <button
                      type="button"
                      onClick={handleRemovePrice}
                      className="flex items-center gap-1 rounded-full bg-blue-50 px-3 py-1.5 text-xs font-medium text-blue-700 transition hover:bg-blue-100"
                    >
                      Price Range
                      <X size={13} />
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={handleClearFilters}
                    className="flex items-center gap-1 px-2 py-1 text-xs font-semibold text-red-500 transition hover:text-red-700"
                  >
                    <RotateCcw size={13} />
                    Clear all
                  </button>
                </div>
              )}

              {/* ERROR STATE */}

              {error ? (
                <div className="rounded-2xl border border-red-100 bg-white px-5 py-12 text-center">

                  <h3 className="text-lg font-bold text-slate-900">
                    Something went wrong
                  </h3>

                  <p className="mt-2 text-sm text-slate-500">
                    {error}
                  </p>

                  <button
                    type="button"
                    onClick={fetchProducts}
                    className="mt-5 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
                  >
                    Try Again
                  </button>
                </div>
              ) : (
                <>
                  {/* PRODUCT GRID */}

                  <div
                    className="w-full min-w-0"
                    aria-busy={loading}
                  >
                    <ProductGrid
                      products={products}
                      loading={loading}
                      viewMode={viewMode}
                      onAddToCart={handleAddToCart}
                      onWishlistToggle={handleWishlistToggle}
                      wishlistedProducts={wishlistProducts}
                      addingProductId={addingProductId}
                      wishlistIsMutating={wishlistIsMutating}
                    />
                  </div>

                  {/* PAGINATION */}

                  {!loading && products.length > 0 && (
                    <div className="mt-7">
                      <ProductPagination
                        currentPage={page}
                        totalPages={pagination.totalPages}
                        onPageChange={handlePageChange}
                      />
                    </div>
                  )}
                </>
              )}
            </section>
          </div>

          {/* RECENTLY VIEWED - OUTSIDE PRODUCTS GRID */}

          <section className="mt-10 w-full">
            <RecentlyViewed
              title="Recently Viewed Products"
              limit={5}
            />
          </section>

        </div>
      </main>

      {/* MINI CART DRAWER */}

      <MiniCartDrawer
        isOpen={cartDrawerOpen}
        onClose={() => setCartDrawerOpen(false)}
      />
    </>
  );
}
