
"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  Search,
  SlidersHorizontal,
  X,
  ChevronLeft,
  ChevronRight,
  Package,
} from "lucide-react";

import productService from "@/services/productService";
import categoryService from "@/services/categoryService";

const LIMIT = 12;

function formatPrice(price) {
  return `₹${Number(price || 0).toLocaleString("en-IN")}`;
}

function ProductCard({ product }) {
  const activeVariants = (product.variants || []).filter(
    (variant) => variant.isActive !== false,
  );

  const lowestPrice =
    activeVariants.length > 0
      ? Math.min(...activeVariants.map((variant) => Number(variant.sellingPrice || 0)))
      : Number(product.basePrice || 0);

  const highestMrp =
    activeVariants.length > 0
      ? Math.max(...activeVariants.map((variant) => Number(variant.mrp || 0)))
      : lowestPrice;

  const discount =
    highestMrp > lowestPrice
      ? Math.round(((highestMrp - lowestPrice) / highestMrp) * 100)
      : 0;

  const image = product.thumbnail?.url || product.images?.[0]?.url;

  return (
    <article className="group overflow-hidden rounded-xl border border-[#E2E8F0] bg-white transition hover:-translate-y-1 hover:shadow-lg">
      <Link href={`/products/${product.slug}`} className="block">
        <div className="relative flex aspect-square items-center justify-center overflow-hidden bg-[#F1F5F9]">
          {image ? (
            <img
              src={image}
              alt={product.name}
              className="h-full w-full object-contain p-5 transition duration-300 group-hover:scale-105"
            />
          ) : (
            <Package size={48} className="text-slate-300" />
          )}

          {discount > 0 && (
            <span className="absolute left-3 top-3 rounded-md bg-red-600 px-2 py-1 text-xs font-bold text-white">
              {discount}% OFF
            </span>
          )}
        </div>

        <div className="p-4">
          <p className="mb-1 text-xs font-medium text-slate-500">
            {product.brand || "MOBI HUB"}
          </p>

          <h3 className="line-clamp-2 min-h-10 text-sm font-semibold text-[#0F172A]">
            {product.name}
          </h3>

          <div className="mt-3 flex flex-wrap items-center gap-2">
            <span className="text-lg font-bold text-[#0F172A]">
              {formatPrice(lowestPrice)}
            </span>

            {highestMrp > lowestPrice && (
              <span className="text-xs text-slate-400 line-through">
                {formatPrice(highestMrp)}
              </span>
            )}
          </div>

          <p className="mt-2 text-xs font-medium text-green-600">
            {Number(product.totalStock || 0) > 0
              ? "In Stock"
              : "Out of Stock"}
          </p>
        </div>
      </Link>
    </article>
  );
}

function ProductSkeleton() {
  return (
    <div className="animate-pulse overflow-hidden rounded-xl border border-slate-200">
      <div className="aspect-square bg-slate-200" />
      <div className="space-y-3 p-4">
        <div className="h-3 w-1/3 rounded bg-slate-200" />
        <div className="h-4 w-full rounded bg-slate-200" />
        <div className="h-5 w-1/2 rounded bg-slate-200" />
      </div>
    </div>
  );
}

export default function ProductsPage() {
  const searchParams = useSearchParams();

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [category, setCategory] = useState(searchParams.get("category") || "");
  const [brand, setBrand] = useState(searchParams.get("brand") || "");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [sort, setSort] = useState(searchParams.get("sort") || "newest");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({
    total: 0,
    totalPages: 1,
    hasNextPage: false,
    hasPrevPage: false,
  });

  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    setSearch(searchParams.get("search") || "");
    setCategory(searchParams.get("category") || "");
    setBrand(searchParams.get("brand") || "");
    setSort(searchParams.get("sort") || "newest");
    setPage(1);
  }, [searchParams]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await categoryService.getCategories();
        setCategories(response.data || []);
      } catch (err) {
        console.error("Failed to load categories:", err);
      }
    };

    fetchCategories();
  }, []);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const params = {
        page,
        limit: LIMIT,
        sort,
      };

      if (search.trim()) params.search = search.trim();
      if (category) params.category = category;
      if (brand) params.brand = brand;
      if (minPrice !== "") params.minPrice = minPrice;
      if (maxPrice !== "") params.maxPrice = maxPrice;

      const response = await productService.getProducts(params);

      const fetchedProducts = response.data || [];

      setProducts(fetchedProducts);
      setPagination(
        response.pagination || {
          total: fetchedProducts.length,
          totalPages: 1,
          hasNextPage: false,
          hasPrevPage: false,
        },
      );
    } catch (err) {
      setError(
        err.response?.data?.message || "Unable to load products. Please try again.",
      );
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, [page, sort, search, category, brand, minPrice, maxPrice]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  useEffect(() => {
    if (!products.length) return;

    const productBrands = products
      .map((product) => product.brand)
      .filter(Boolean);

    setBrands((previous) =>
      [...new Set([...previous, ...productBrands])].sort(),
    );
  }, [products]);

  const rootCategories = useMemo(
    () => categories.filter((item) => !item.parentCategory),
    [categories],
  );

  const applyFilters = (event) => {
    event.preventDefault();
    setPage(1);
    fetchProducts();
    setShowFilters(false);
  };

  const clearFilters = () => {
    setSearch("");
    setCategory("");
    setBrand("");
    setMinPrice("");
    setMaxPrice("");
    setSort("newest");
    setPage(1);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8">
          <p className="text-sm font-medium text-[#1D4ED8]">MOBI HUB STORE</p>
          <h1 className="mt-2 text-3xl font-extrabold text-[#0F172A]">
            All Products
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            Explore our collection of quality tech accessories.
          </p>
        </div>

        <div className="mb-6 flex flex-col gap-3 sm:flex-row">
          <form
            onSubmit={applyFilters}
            className="flex flex-1 items-center rounded-lg border border-[#E2E8F0] bg-white px-3"
          >
            <Search size={19} className="shrink-0 text-slate-400" />
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search products..."
              className="w-full bg-transparent px-3 py-3 text-sm outline-none"
            />
            <button
              type="submit"
              className="rounded-md bg-[#1D4ED8] px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
            >
              Search
            </button>
          </form>

          <button
            type="button"
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center justify-center gap-2 rounded-lg border border-[#E2E8F0] bg-white px-5 py-3 text-sm font-semibold text-[#0F172A] lg:hidden"
          >
            <SlidersHorizontal size={18} />
            Filters
          </button>

          <select
            value={sort}
            onChange={(event) => {
              setSort(event.target.value);
              setPage(1);
            }}
            className="rounded-lg border border-[#E2E8F0] bg-white px-4 py-3 text-sm outline-none"
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="priceLowToHigh">Price: Low to High</option>
            <option value="priceHighToLow">Price: High to Low</option>
            <option value="nameAZ">Name: A to Z</option>
            <option value="nameZA">Name: Z to A</option>
          </select>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[240px_1fr]">
          <aside
            className={`${showFilters ? "block" : "hidden"} h-fit rounded-xl border border-[#E2E8F0] bg-white p-5 lg:block`}
          >
            <div className="mb-5 flex items-center justify-between">
              <h2 className="font-bold text-[#0F172A]">Filters</h2>
              <button
                type="button"
                onClick={clearFilters}
                className="text-xs font-semibold text-[#1D4ED8] hover:underline"
              >
                Clear All
              </button>
            </div>

            <form onSubmit={applyFilters} className="space-y-6">
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Category
                </label>
                <select
                  value={category}
                  onChange={(event) => setCategory(event.target.value)}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-blue-500"
                >
                  <option value="">All Categories</option>
                  {rootCategories.map((item) => (
                    <option key={item._id} value={item._id}>
                      {item.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Brand
                </label>
                <select
                  value={brand}
                  onChange={(event) => setBrand(event.target.value)}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-blue-500"
                >
                  <option value="">All Brands</option>
                  {brands.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Price Range
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="number"
                    min="0"
                    value={minPrice}
                    onChange={(event) => setMinPrice(event.target.value)}
                    placeholder="Min ₹"
                    className="min-w-0 rounded-lg border border-slate-200 px-2 py-2.5 text-sm outline-none focus:border-blue-500"
                  />
                  <input
                    type="number"
                    min="0"
                    value={maxPrice}
                    onChange={(event) => setMaxPrice(event.target.value)}
                    placeholder="Max ₹"
                    className="min-w-0 rounded-lg border border-slate-200 px-2 py-2.5 text-sm outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full rounded-lg bg-[#1D4ED8] px-4 py-3 text-sm font-semibold text-white hover:bg-blue-700"
              >
                Apply Filters
              </button>
            </form>
          </aside>

          <section>
            <div className="mb-5 flex items-center justify-between">
              <p className="text-sm text-slate-500">
                {loading
                  ? "Loading products..."
                  : `${pagination.total || products.length} products found`}
              </p>
            </div>

            {loading ? (
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-4">
                {Array.from({ length: LIMIT }).map((_, index) => (
                  <ProductSkeleton key={index} />
                ))}
              </div>
            ) : error ? (
              <div className="rounded-xl border border-red-200 bg-red-50 p-8 text-center">
                <p className="font-semibold text-red-700">{error}</p>
                <button
                  type="button"
                  onClick={fetchProducts}
                  className="mt-4 rounded-lg bg-red-600 px-5 py-2 text-sm font-semibold text-white"
                >
                  Try Again
                </button>
              </div>
            ) : products.length === 0 ? (
              <div className="rounded-xl border border-dashed border-slate-300 bg-white px-5 py-16 text-center">
                <Package size={42} className="mx-auto text-slate-300" />
                <h2 className="mt-4 text-lg font-bold text-[#0F172A]">
                  No products found
                </h2>
                <p className="mt-2 text-sm text-slate-500">
                  Try changing your search or filters.
                </p>
                <button
                  type="button"
                  onClick={clearFilters}
                  className="mt-5 text-sm font-semibold text-[#1D4ED8] hover:underline"
                >
                  Clear Filters
                </button>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-4">
                  {products.map((product) => (
                    <ProductCard key={product._id} product={product} />
                  ))}
                </div>

                <div className="mt-8 flex items-center justify-center gap-4">
                  <button
                    type="button"
                    disabled={!pagination.hasPrevPage}
                    onClick={() => setPage((current) => current - 1)}
                    className="flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    <ChevronLeft size={17} />
                    Previous
                  </button>

                  <span className="text-sm font-medium text-slate-600">
                    Page {pagination.page || page} of {pagination.totalPages || 1}
                  </span>

                  <button
                    type="button"
                    disabled={!pagination.hasNextPage}
                    onClick={() => setPage((current) => current + 1)}
                    className="flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    Next
                    <ChevronRight size={17} />
                  </button>
                </div>
              </>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
