"use client";

import { use, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import Link from "next/link";
import Image from "next/image";
import { toast } from "sonner";
import {
  ArrowLeft,
  ArrowRight,
  AlertCircle,
  RefreshCw,
  Package,
  Layers3,
  LoaderCircle,
  X,
} from "lucide-react";

import {
  fetchCategories,
  fetchCategoryById,
  fetchSubCategories,
} from "@/store/thunks/categoryThunks";
import { fetchCart, addToCart } from "@/store/thunks/cartThunks";
import {
  fetchWishlist,
  addToWishlist,
  removeFromWishlist,
} from "@/store/thunks/wishlistThunks";
import productService from "@/services/productService";
import { BRAND_NAME } from "@/config/brand";

import Breadcrumb from "@/components/common/Breadcrumb";
import CategoryDepartmentNav from "./CategoryDepartmentNav";
import SubcategoryNavSection from "./SubcategoryNavSection";
import {
  CategoryDetailsSkeleton,
  SubcategoryStripSkeleton,
} from "./CategorySkeleton";
import { getCategoryImageUrl } from "./CategoryCard";
import SubCategoryTabs from "@/components/products/SubCategoryTabs";
import ProductFilters from "@/components/products/ProductFilters";
import ProductToolbar from "@/components/products/toolbar/ProductToolbar";
import ProductGrid from "@/components/products/ProductGrid";
import ProductError from "@/components/products/ProductError";
import ProductPagination from "@/components/products/ProductPagination";
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
  const meta = response?.data?.pagination || response?.pagination || {};
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

export default function SubcategoryPageClient({
  params,
  categoryId: directId,
}) {
  const resolvedParams = params ? use(params) : null;
  const categoryId = String(directId || resolvedParams?.categoryId || "");

  const dispatch = useDispatch();
  const searchParams = useSearchParams();

  const allCategories = useSelector(
    (state) => state.categories?.categories || []
  );
  const selectedCategory = useSelector(
    (state) => state.categories?.selectedCategory
  );
  const detailLoading = useSelector(
    (state) => state.categories?.detailLoading ?? false
  );
  const subCategories = useSelector(
    (state) => state.categories?.subCategories || []
  );
  const subCategoriesLoading = useSelector(
    (state) => state.categories?.subCategoriesLoading ?? false
  );
  const categoryError = useSelector((state) => state.categories?.error || "");

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

  // Filter / listing state
  const searchParamsKey = searchParams.toString();
  const initialQuery = useMemo(
    () => new URLSearchParams(searchParamsKey),
    [searchParamsKey]
  );

  const [selectedSubFilter, setSelectedSubFilter] = useState(
    initialQuery.get("subCategory") || ""
  );
  const [brand, setBrand] = useState(initialQuery.get("brand") || "");
  const [minPrice, setMinPrice] = useState(initialQuery.get("minPrice") || "");
  const [maxPrice, setMaxPrice] = useState(initialQuery.get("maxPrice") || "");
  const [sort, setSort] = useState(() => {
    const s = initialQuery.get("sort") || "newest";
    return ALLOWED_SORTS.has(s) ? s : "newest";
  });
  const [page, setPage] = useState(
    Math.max(1, Number(initialQuery.get("page")) || 1)
  );
  const [viewMode, setViewMode] = useState("grid");
  const [showFilters, setShowFilters] = useState(false);

  const [products, setProducts] = useState([]);
  const [knownBrands, setKnownBrands] = useState([]);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: PAGE_SIZE,
    totalPages: 1,
  });
  const [productsLoading, setProductsLoading] = useState(Boolean(categoryId));
  const [productsError, setProductsError] = useState("");

  const [heroImageError, setHeroImageError] = useState(false);
  const [addingProductId, setAddingProductId] = useState(null);
  const [miniCartOpen, setMiniCartOpen] = useState(false);

  const productReqIdRef = useRef(0);

  // Load Redux category details, subcategories & full tree
  useEffect(() => {
    if (!allCategories.length) {
      dispatch(fetchCategories());
    }
  }, [dispatch, allCategories.length]);

  useEffect(() => {
    if (!categoryId) return;
    dispatch(fetchCategoryById(categoryId));
    dispatch(fetchSubCategories(categoryId));
  }, [dispatch, categoryId]);

  useEffect(() => {
    if (isAuthenticated) {
      dispatch(fetchWishlist());
      dispatch(fetchCart());
    }
  }, [dispatch, isAuthenticated]);

  const activeCategory = useMemo(() => {
    if (
      selectedCategory?._id &&
      String(selectedCategory._id) === categoryId
    ) {
      return selectedCategory;
    }
    return (
      allCategories.find((item) => String(item._id) === categoryId) || null
    );
  }, [selectedCategory, allCategories, categoryId]);

  const parentId = getParentId(activeCategory);
  const isChildCategory = Boolean(parentId);

  const parentCategoryObj = useMemo(() => {
    if (!parentId) return null;
    if (
      activeCategory?.parentCategory &&
      typeof activeCategory.parentCategory === "object"
    ) {
      return activeCategory.parentCategory;
    }
    return (
      allCategories.find((item) => String(item._id) === parentId) || null
    );
  }, [parentId, activeCategory, allCategories]);

  // Sibling subcategories when viewing a child category
  const siblingCategories = useMemo(() => {
    if (!parentId) return [];
    return allCategories.filter(
      (cat) => cat?._id && cat.isActive !== false && getParentId(cat) === parentId
    );
  }, [allCategories, parentId]);

  // Subcategories when viewing a root category
  const effectiveSubcategories = useMemo(() => {
    if (isChildCategory) return [];
    if (Array.isArray(subCategories) && subCategories.length > 0) {
      return subCategories.filter((cat) => cat?._id && cat.isActive !== false);
    }
    return allCategories.filter(
      (cat) =>
        cat?._id && cat.isActive !== false && getParentId(cat) === categoryId
    );
  }, [isChildCategory, subCategories, allCategories, categoryId]);

  const syncBrowserUrl = useCallback(
    (overrides = {}) => {
      if (typeof window === "undefined") return;
      const next = {
        subCategory: selectedSubFilter,
        brand,
        minPrice,
        maxPrice,
        sort,
        page,
        ...overrides,
      };
      const params = new URLSearchParams();
      if (next.subCategory) params.set("subCategory", next.subCategory);
      if (next.brand) params.set("brand", next.brand);
      if (next.minPrice !== "") params.set("minPrice", String(next.minPrice));
      if (next.maxPrice !== "") params.set("maxPrice", String(next.maxPrice));
      if (next.sort && next.sort !== "newest") params.set("sort", next.sort);
      if (Number(next.page) > 1) params.set("page", String(next.page));

      const qs = params.toString();
      const targetUrl = qs
        ? `${window.location.pathname}?${qs}`
        : window.location.pathname;
      window.history.replaceState(null, "", targetUrl);
    },
    [selectedSubFilter, brand, minPrice, maxPrice, sort, page]
  );

  // Load products belonging to current category (or inline subcategory filter)
  const loadCategoryProducts = useCallback(() => {
    if (!categoryId) return;
    const reqId = ++productReqIdRef.current;

    const targetCategory =
      !isChildCategory && selectedSubFilter ? selectedSubFilter : categoryId;

    const queryParams = {
      category: targetCategory,
      page,
      limit: PAGE_SIZE,
      sort,
    };
    if (brand) queryParams.brand = brand;
    if (minPrice !== "") queryParams.minPrice = minPrice;
    if (maxPrice !== "") queryParams.maxPrice = maxPrice;

    productService
      .getProducts(queryParams)
      .then((response) => {
        if (reqId !== productReqIdRef.current) return;
        const list = getProductList(response);
        setProducts(list);
        setPagination(getPaginationInfo(response, page, list.length));
        setProductsError("");

        const foundBrands = list
          .map((item) => String(item?.brand || "").trim())
          .filter(Boolean);
        if (foundBrands.length > 0) {
          setKnownBrands((prev) =>
            Array.from(new Set([...prev, ...foundBrands]))
          );
        }
      })
      .catch((err) => {
        if (reqId !== productReqIdRef.current) return;
        setProductsError(
          err?.response?.data?.message ||
            err?.message ||
            "Unable to load category products."
        );
      })
      .finally(() => {
        if (reqId === productReqIdRef.current) {
          setProductsLoading(false);
        }
      });
  }, [
    categoryId,
    isChildCategory,
    selectedSubFilter,
    page,
    sort,
    brand,
    minPrice,
    maxPrice,
  ]);

  useEffect(() => {
    queueMicrotask(() => {
      setProductsLoading(true);
      loadCategoryProducts();
    });
    return () => {
      productReqIdRef.current += 1;
    };
  }, [loadCategoryProducts]);

  const brands = useMemo(() => {
    const set = new Set(knownBrands);
    products.forEach((item) => {
      const name = String(item?.brand || "").trim();
      if (name) set.add(name);
    });
    if (brand) set.add(brand);
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [knownBrands, products, brand]);

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

  // Filter / Listing Handlers
  const handleSubFilterSelect = useCallback(
    (nextSubId) => {
      setSelectedSubFilter(nextSubId || "");
      setPage(1);
      syncBrowserUrl({ subCategory: nextSubId || "", page: 1 });
    },
    [syncBrowserUrl]
  );

  const handleApplyFilters = ({
    brand: nextBrand,
    minPrice: nextMinPrice,
    maxPrice: nextMaxPrice,
  }) => {
    setBrand(nextBrand || "");
    setMinPrice(nextMinPrice || "");
    setMaxPrice(nextMaxPrice || "");
    setPage(1);
    syncBrowserUrl({
      brand: nextBrand || "",
      minPrice: nextMinPrice || "",
      maxPrice: nextMaxPrice || "",
      page: 1,
    });
  };

  const handleClearFilters = () => {
    setSelectedSubFilter("");
    setBrand("");
    setMinPrice("");
    setMaxPrice("");
    setSort("newest");
    setPage(1);
    syncBrowserUrl({
      subCategory: "",
      brand: "",
      minPrice: "",
      maxPrice: "",
      sort: "newest",
      page: 1,
    });
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
      toast.error(
        typeof err === "string"
          ? err
          : err?.message || "Unable to add item to cart"
      );
    } finally {
      setAddingProductId(null);
    }
  };

  const handleWishlistToggle = async (product) => {
    const productId = product?._id || product?.id;
    if (!productId) return;

    const alreadyWishlisted = wishlistedIds.has(String(productId));
    try {
      if (alreadyWishlisted) {
        await dispatch(removeFromWishlist(productId)).unwrap();
        toast.success("Removed from wishlist");
      } else {
        await dispatch(addToWishlist(productId)).unwrap();
        toast.success("Saved to wishlist");
      }
    } catch (err) {
      toast.error(
        typeof err === "string"
          ? err
          : err?.message || "Please sign in to manage your wishlist"
      );
    }
  };

  const handleRetryCategory = () => {
    dispatch(fetchCategories());
    dispatch(fetchCategoryById(categoryId));
    dispatch(fetchSubCategories(categoryId));
    setProductsLoading(true);
    loadCategoryProducts();
  };

  const activeFilterCount =
    (brand ? 1 : 0) + (minPrice !== "" || maxPrice !== "" ? 1 : 0);

  const selectedSubObj = useMemo(
    () =>
      effectiveSubcategories.find(
        (item) => String(item._id) === String(selectedSubFilter)
      ) || null,
    [effectiveSubcategories, selectedSubFilter]
  );

  const activeChips = useMemo(() => {
    const chips = [];
    if (selectedSubObj) {
      chips.push({
        key: "subCategory",
        label: `Subcategory: ${selectedSubObj.name}`,
        onRemove: () => handleSubFilterSelect(""),
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
      chips.push({
        key: "price",
        label: `Price: ${minPrice ? `₹${minPrice}` : "₹0"} – ${
          maxPrice ? `₹${maxPrice}` : "Any"
        }`,
        onRemove: () => {
          setMinPrice("");
          setMaxPrice("");
          setPage(1);
          syncBrowserUrl({ minPrice: "", maxPrice: "", page: 1 });
        },
      });
    }
    return chips;
  }, [
    selectedSubObj,
    brand,
    minPrice,
    maxPrice,
    handleSubFilterSelect,
    syncBrowserUrl,
  ]);

  // Loading Category Details State
  if ((detailLoading || !activeCategory) && !categoryError) {
    return (
      <main className="min-h-screen w-full bg-[#F8FAFC] px-4 py-5 pb-24 sm:px-6 sm:py-6 lg:px-8 xl:pb-12">
        <CategoryDetailsSkeleton />
      </main>
    );
  }

  // Category Not Found or Error State
  if (categoryError && !activeCategory) {
    const isNotFound = /not found|invalid/i.test(String(categoryError));

    return (
      <main className="min-h-screen w-full bg-[#F8FAFC] px-4 py-10 pb-24 sm:px-6 lg:px-8 xl:pb-12">
        <div className="mx-auto max-w-lg rounded-2xl border border-[#E2E8F0] bg-white p-8 text-center shadow-xs">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-red-200 bg-red-50 text-red-600">
            {isNotFound ? <Layers3 size={28} /> : <AlertCircle size={28} />}
          </div>

          <h1 className="mt-4 text-xl font-extrabold text-[#101828]">
            {isNotFound ? "Category not found" : "Unable to load category"}
          </h1>

          <p className="mt-2 text-sm leading-6 text-[#64748B]">
            {categoryError}
          </p>

          <div className="mt-6 flex flex-wrap justify-center gap-3">
            {!isNotFound && (
              <button
                type="button"
                onClick={handleRetryCategory}
                disabled={detailLoading}
                className="inline-flex h-10 items-center gap-2 rounded-xl bg-[#0755E9] px-5 text-sm font-bold text-white transition hover:bg-[#0645C4] disabled:opacity-60"
              >
                {detailLoading ? (
                  <LoaderCircle size={16} className="animate-spin" />
                ) : (
                  <RefreshCw size={15} />
                )}
                Try Again
              </button>
            )}

            <Link
              href="/categories"
              className={`inline-flex h-10 items-center gap-2 rounded-xl px-5 text-sm font-bold transition ${
                isNotFound
                  ? "bg-[#0755E9] text-white hover:bg-[#0645C4]"
                  : "border border-[#E2E8F0] bg-white text-[#101828] hover:border-[#0755E9]/40 hover:bg-[#EFF6FF] hover:text-[#0755E9]"
              }`}
            >
              <ArrowLeft size={15} />
              Explore Categories
            </Link>
          </div>
        </div>
      </main>
    );
  }

  const categoryName = activeCategory?.name || "Category";
  const categoryImage = !heroImageError
    ? getCategoryImageUrl(activeCategory)
    : "";

  const breadcrumbItems = isChildCategory
    ? [
        { label: "Categories", href: "/categories" },
        ...(parentCategoryObj
          ? [
              {
                label: parentCategoryObj.name || "Department",
                href: `/categories/${parentId}`,
              },
            ]
          : []),
        { label: categoryName },
      ]
    : [{ label: "Categories", href: "/categories" }, { label: categoryName }];

  return (
    <>
      <main className="min-h-screen w-full bg-[#F8FAFC] pb-24 xl:pb-12">
        <div className="mx-auto w-full max-w-[1440px] px-4 py-5 sm:px-6 sm:py-6 lg:px-8">
          <Breadcrumb items={breadcrumbItems} className="mb-4" />

          {/* Quick Category Department Strip */}
          <CategoryDepartmentNav
            categories={allCategories}
            activeCategoryId={isChildCategory ? parentId : categoryId}
            routeMode="details"
          />

          {/* Category Showcase Header */}
          <header className="mb-6 rounded-2xl border border-[#E2E8F0] bg-white p-5 shadow-xs sm:p-6">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex min-w-0 items-center gap-4">
                <div className="relative flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-[#E2E8F0] bg-[#F8FAFC] p-2 sm:h-20 sm:w-20">
                  {categoryImage ? (
                    <Image
                      src={categoryImage}
                      alt={categoryName}
                      fill
                      sizes="80px"
                      unoptimized
                      onError={() => setHeroImageError(true)}
                      className="object-contain p-2"
                    />
                  ) : (
                    <Layers3
                      size={28}
                      className="text-[#0755E9]"
                      aria-hidden="true"
                    />
                  )}
                </div>

                <div className="min-w-0">
                  <div className="mb-1.5 flex flex-wrap items-center gap-2">
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-[#0755E9]/15 bg-[#EFF6FF] px-3 py-0.5 text-[11px] font-bold uppercase tracking-wider text-[#0755E9]">
                      <Layers3 size={12} aria-hidden="true" />
                      {isChildCategory
                        ? parentCategoryObj?.name
                          ? `${parentCategoryObj.name} · Subcategory`
                          : "Subcategory"
                        : "Department Collection"}
                    </span>

                    <span className="rounded-full border border-[#E2E8F0] bg-[#F8FAFC] px-2.5 py-0.5 text-[11px] font-bold text-[#101828] tabular-nums">
                      {pagination.total}{" "}
                      {pagination.total === 1 ? "Product" : "Products"}
                    </span>
                  </div>

                  <h1 className="break-words text-2xl font-extrabold tracking-tight text-[#101828] sm:text-3xl">
                    {categoryName}
                  </h1>

                  <p className="mt-1 max-w-2xl text-xs leading-relaxed text-[#64748B] sm:text-sm">
                    {activeCategory?.description ||
                      `Browse curated electronics and accessories in ${categoryName} at ${BRAND_NAME}.`}
                  </p>
                </div>
              </div>

              <div className="flex shrink-0 flex-wrap items-center gap-2.5">
                {isChildCategory && parentId ? (
                  <Link
                    href={`/categories/${parentId}`}
                    className="inline-flex h-10 items-center gap-1.5 rounded-xl border border-[#E2E8F0] bg-white px-4 text-xs font-bold text-[#101828] transition hover:border-[#0755E9]/40 hover:bg-[#EFF6FF] hover:text-[#0755E9]"
                  >
                    <ArrowLeft size={14} />
                    <span>All {parentCategoryObj?.name || "Parent"}</span>
                  </Link>
                ) : (
                  <Link
                    href="/categories"
                    className="inline-flex h-10 items-center gap-1.5 rounded-xl border border-[#E2E8F0] bg-white px-4 text-xs font-bold text-[#101828] transition hover:border-[#0755E9]/40 hover:bg-[#EFF6FF] hover:text-[#0755E9]"
                  >
                    <ArrowLeft size={14} />
                    <span>All Categories</span>
                  </Link>
                )}

                <Link
                  href={`/categories/${categoryId}/products`}
                  className="inline-flex h-10 items-center gap-2 rounded-xl bg-[#0755E9] px-4 text-xs font-bold text-white transition hover:bg-[#0645C4]"
                >
                  <span>Full Shop View</span>
                  <ArrowRight size={14} />
                </Link>
              </div>
            </div>
          </header>

          {/* Subcategories / Child Category Navigation */}
          {subCategoriesLoading &&
          !isChildCategory &&
          effectiveSubcategories.length === 0 ? (
            <section className="mb-6 rounded-2xl border border-[#E2E8F0] bg-white p-4 sm:p-6">
              <div className="mb-4 h-5 w-44 animate-pulse rounded bg-slate-200" />
              <SubcategoryStripSkeleton count={5} />
            </section>
          ) : (
            <SubcategoryNavSection
              parentCategory={parentCategoryObj}
              currentCategoryId={categoryId}
              subcategories={effectiveSubcategories}
              siblingCategories={siblingCategories}
              isChildCategory={isChildCategory}
              title={`Subcategories in ${categoryName}`}
              subtitle="Select a specialized collection to explore products"
            />
          )}

          {/* Inline Child Category Filter Tabs when viewing a Parent Category */}
          {!isChildCategory && effectiveSubcategories.length > 0 && (
            <SubCategoryTabs
              subCategories={effectiveSubcategories}
              selectedSubCategory={selectedSubFilter}
              onSelect={handleSubFilterSelect}
            />
          )}

          {/* Category Product Listing + Filter Sidebar */}
          <div className="grid grid-cols-1 items-start gap-5 lg:grid-cols-[272px_minmax(0,1fr)] xl:gap-6">
            <ProductFilters
              categories={effectiveSubcategories}
              brands={brands}
              category={selectedSubFilter}
              brand={brand}
              minPrice={minPrice}
              maxPrice={maxPrice}
              onApply={({
                category: nextSub,
                brand: nextBrand,
                minPrice: nextMin,
                maxPrice: nextMax,
              }) => {
                if (!isChildCategory && nextSub !== selectedSubFilter) {
                  setSelectedSubFilter(nextSub || "");
                }
                handleApplyFilters({
                  brand: nextBrand,
                  minPrice: nextMin,
                  maxPrice: nextMax,
                });
                if (!isChildCategory && nextSub !== selectedSubFilter) {
                  syncBrowserUrl({
                    subCategory: nextSub || "",
                    brand: nextBrand || "",
                    minPrice: nextMin || "",
                    maxPrice: nextMax || "",
                    page: 1,
                  });
                }
              }}
              onClear={handleClearFilters}
              showFilters={showFilters}
              onClose={() => setShowFilters(false)}
            />

            <section
              className="min-w-0"
              aria-label={`Products in ${categoryName}`}
            >
              <ProductToolbar
                total={pagination.total}
                shownCount={products.length}
                page={page}
                pageSize={PAGE_SIZE}
                loading={productsLoading}
                sort={sort}
                setSort={handleSortChange}
                viewMode={viewMode}
                setViewMode={setViewMode}
                onFilterClick={() => setShowFilters(true)}
                activeFilterCount={
                  activeFilterCount + (selectedSubFilter ? 1 : 0)
                }
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
                    onClick={handleClearFilters}
                    className="ml-auto text-xs font-bold text-[#0755E9] transition hover:text-[#082B70]"
                  >
                    Clear all
                  </button>
                </div>
              )}

              {/* Products Error vs Empty vs Grid */}
              {productsError && products.length === 0 ? (
                <ProductError
                  message={productsError}
                  onRetry={() => {
                    setProductsLoading(true);
                    loadCategoryProducts();
                  }}
                />
              ) : !productsLoading && products.length === 0 ? (
                <div className="flex min-h-[300px] flex-col items-center justify-center rounded-2xl border border-[#E2E8F0] bg-white px-6 py-12 text-center">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-[#0755E9]/15 bg-[#EFF6FF] text-[#0755E9]">
                    <Package size={26} aria-hidden="true" />
                  </div>
                  <h3 className="mt-4 text-base font-extrabold text-[#101828]">
                    {activeChips.length > 0
                      ? "No products match these filters"
                      : `No products in ${categoryName} yet`}
                  </h3>
                  <p className="mt-1.5 max-w-md text-xs leading-relaxed text-[#64748B] sm:text-sm">
                    {activeChips.length > 0
                      ? "Try resetting your active brand, subcategory, or price filters to view available items."
                      : "Products are regularly updated across ELENZO departments."}
                  </p>
                  <div className="mt-5 flex flex-wrap justify-center gap-3">
                    {activeChips.length > 0 && (
                      <button
                        type="button"
                        onClick={handleClearFilters}
                        className="inline-flex h-10 items-center gap-2 rounded-xl bg-[#0755E9] px-5 text-xs font-bold text-white transition hover:bg-[#0645C4]"
                      >
                        Reset Filters
                      </button>
                    )}
                    <Link
                      href="/categories"
                      className="inline-flex h-10 items-center gap-2 rounded-xl border border-[#E2E8F0] bg-white px-5 text-xs font-bold text-[#101828] transition hover:border-[#0755E9]/40 hover:bg-[#EFF6FF] hover:text-[#0755E9]"
                    >
                      Explore Other Categories
                    </Link>
                  </div>
                </div>
              ) : (
                <>
                  <ProductGrid
                    products={products}
                    loading={productsLoading}
                    viewMode={viewMode}
                    hasActiveFilters={activeChips.length > 0}
                    onClearFilters={handleClearFilters}
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
