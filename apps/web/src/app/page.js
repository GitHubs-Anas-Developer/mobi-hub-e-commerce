"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  ArrowRight,
  ShieldCheck,
  Truck,
  Headphones,
  RefreshCw,
  Package,
  Heart,
  Plus,
  Star,
  ChevronRight,
} from "lucide-react";

import productService from "@/services/productService";
import categoryService from "@/services/categoryService";

function formatPrice(price) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(price || 0);
}

function ProductCard({ product }) {
  const imageUrl = product.thumbnail?.url || product.images?.[0]?.url;

  const discount =
    product.variants?.length > 0
      ? Math.max(
          ...product.variants.map((variant) =>
            variant.mrp > 0
              ? Math.round(
                  ((variant.mrp - variant.sellingPrice) / variant.mrp) * 100,
                )
              : 0,
          ),
        )
      : 0;

  return (
    <Link
      href={`/products/${product.slug}`}
      className="group flex flex-col overflow-hidden rounded-xl bg-white p-2 transition-shadow hover:shadow-md sm:p-3"
    >
      <div className="relative aspect-square overflow-hidden rounded-lg bg-[#F8FAFC]">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={product.name}
            className="h-full w-full object-contain mix-blend-multiply transition duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <Package size={40} className="text-slate-300" />
          </div>
        )}

        {/* Top Left Discount Tag */}
        {discount > 0 && (
          <span className="absolute left-2 top-2 rounded-[4px] bg-[#DC2626] px-1.5 py-0.5 text-[10px] font-bold tracking-tight text-white sm:text-xs">
            -{discount}%
          </span>
        )}

        {/* Top Right Wishlist Button */}
        <button
          onClick={(e) => {
            e.preventDefault();
            // Wishlist logic here
          }}
          className="absolute right-2 top-2 rounded-full bg-white p-1.5 text-slate-400 shadow-sm transition hover:text-[#DC2626]"
        >
          <Heart size={14} className="sm:h-4 sm:w-4" />
        </button>
      </div>

      <div className="mt-3 flex flex-1 flex-col">
        {/* Rating Section */}
        {product.ratings?.count > 0 ? (
          <div className="mb-1 flex items-center gap-1 text-[10px] sm:text-xs">
            <Star size={12} className="fill-[#F59E0B] text-[#F59E0B]" />
            <span className="font-bold text-[#0F172A]">
              {product.ratings.average?.toFixed(1)}
            </span>
            <span className="text-slate-400">({product.ratings.count})</span>
          </div>
        ) : (
          <div className="mb-1 h-4" /> // Spacer if no ratings
        )}

        {/* Product Name */}
        <h3 className="line-clamp-2 min-h-[32px] text-xs font-semibold leading-tight text-[#0F172A] sm:text-sm">
          {product.name}
        </h3>

        {/* Stock / Brand Status (Optional based on data) */}
        {product.brand && (
          <p className="mt-1 text-[10px] text-slate-500 sm:text-xs">
            {product.brand}
          </p>
        )}

        {/* Price & Add to Cart */}
        <div className="mt-auto pt-3 flex items-end justify-between">
          <div className="flex flex-col">
            <span className="text-sm font-bold text-[#0F172A] sm:text-base">
              {formatPrice(product.basePrice)}
            </span>
            <span className="text-[10px] font-medium text-emerald-600 sm:text-xs">
              In Stock
            </span>
          </div>

          <button
            onClick={(e) => {
              e.preventDefault();
              // Add to cart logic here
            }}
            className="flex h-7 w-7 items-center justify-center rounded-[6px] bg-[#1D4ED8] text-white transition hover:bg-blue-700 sm:h-8 sm:w-8"
          >
            <Plus size={16} />
          </button>
        </div>
      </div>
    </Link>
  );
}

function ProductSection({ title, subtitle, products, loading, error }) {
  return (
    <section className="py-8">
      <div className="mb-4 flex items-end justify-between px-2 sm:px-0">
        <div>
          <h2 className="text-lg font-bold tracking-tight text-[#0F172A] sm:text-xl">
            {title}
          </h2>
          {subtitle && (
            <p className="mt-1 text-xs text-slate-500 sm:text-sm">{subtitle}</p>
          )}
        </div>

        <Link
          href="/products"
          className="flex shrink-0 items-center text-[11px] font-semibold text-slate-500 transition hover:text-[#1D4ED8] sm:text-sm"
        >
          View All <ChevronRight size={14} className="ml-0.5" />
        </Link>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 sm:gap-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <div
              key={index}
              className="animate-pulse overflow-hidden rounded-xl bg-white p-3 shadow-sm border border-slate-100"
            >
              <div className="aspect-square rounded-lg bg-slate-100" />
              <div className="mt-3 space-y-2">
                <div className="h-3 w-1/3 rounded bg-slate-100" />
                <div className="h-4 w-full rounded bg-slate-100" />
                <div className="h-5 w-1/2 rounded bg-slate-100" />
              </div>
            </div>
          ))}
        </div>
      ) : error ? (
        <p className="rounded-lg bg-red-50 p-4 text-sm text-red-600">{error}</p>
      ) : products.length === 0 ? (
        <p className="rounded-lg bg-slate-50 p-6 text-center text-sm text-slate-500">
          No products available right now.
        </p>
      ) : (
        <div className="grid grid-cols-2 gap-3 bg-slate-50 p-3 rounded-xl sm:grid-cols-3 lg:grid-cols-4 sm:gap-4 sm:bg-transparent sm:p-0">
          {products.map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      )}
    </section>
  );
}

export default function Home() {
  const [categories, setCategories] = useState([]);
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [newArrivals, setNewArrivals] = useState([]);

  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [featuredLoading, setFeaturedLoading] = useState(true);
  const [newArrivalsLoading, setNewArrivalsLoading] = useState(true);

  const [categoriesError, setCategoriesError] = useState("");
  const [featuredError, setFeaturedError] = useState("");
  const [newArrivalsError, setNewArrivalsError] = useState("");

  useEffect(() => {
    const fetchHomeData = async () => {
      try {
        const response = await categoryService.getCategories();
        setCategories(response.data || []);
      } catch (error) {
        setCategoriesError(
          error.response?.data?.message || "Failed to load categories.",
        );
      } finally {
        setCategoriesLoading(false);
      }

      try {
        const response = await productService.getProducts({
          isFeatured: true,
          limit: 8,
        });
        setFeaturedProducts(response.data || []);
      } catch (error) {
        setFeaturedError(
          error.response?.data?.message || "Failed to load featured products.",
        );
      } finally {
        setFeaturedLoading(false);
      }

      try {
        const response = await productService.getProducts({
          isNewArrival: true,
          limit: 8,
          sort: "newest",
        });
        setNewArrivals(response.data || []);
      } catch (error) {
        setNewArrivalsError(
          error.response?.data?.message || "Failed to load new arrivals.",
        );
      } finally {
        setNewArrivalsLoading(false);
      }
    };

    fetchHomeData();
  }, []);

  return (
    <div className="min-h-screen bg-white">
      {/* Search / Header Placeholder Area (if needed to match app padding) */}
      <div className="mx-auto max-w-7xl pt-4">
        {/* Categories (Explore Ecosystems Style) */}
        <section className="px-4 sm:px-6 lg:px-8 mt-4">
          <div className="mb-4 flex items-end justify-between">
            <h2 className="text-base font-bold text-[#0F172A] sm:text-lg">
              Explore Ecosystems
            </h2>
            <Link
              href="/categories"
              className="flex shrink-0 items-center text-[11px] font-semibold text-slate-500 transition hover:text-[#1D4ED8] sm:text-sm"
            >
              All Categories <ChevronRight size={14} className="ml-0.5" />
            </Link>
          </div>

          {categoriesLoading ? (
            <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
              {Array.from({ length: 5 }).map((_, index) => (
                <div key={index} className="flex flex-col items-center gap-2">
                  <div className="h-16 w-16 animate-pulse rounded-2xl bg-slate-100" />
                  <div className="h-3 w-12 animate-pulse rounded bg-slate-100" />
                </div>
              ))}
            </div>
          ) : categoriesError ? (
            <p className="text-sm text-red-600">{categoriesError}</p>
          ) : categories.length === 0 ? (
            <p className="text-sm text-slate-500">
              Categories will appear here.
            </p>
          ) : (
            <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide sm:grid sm:grid-cols-6 lg:grid-cols-8">
              {categories
                .filter((category) => !category.parentCategory)
                .slice(0, 8)
                .map((category) => (
                  <Link
                    key={category._id}
                    href={`/products?category=${category._id}`}
                    className="group flex min-w-[72px] flex-col items-center gap-2 text-center"
                  >
                    <div className="flex h-16 w-16 items-center justify-center rounded-[18px] bg-[#F8FAFC] p-3 transition group-hover:bg-[#EFF6FF] group-hover:shadow-sm">
                      {category.image?.url ? (
                        <img
                          src={category.image.url}
                          alt={category.name}
                          className="h-full w-full object-contain mix-blend-multiply"
                        />
                      ) : (
                        <Package size={24} className="text-[#1D4ED8]" />
                      )}
                    </div>
                    <h3 className="text-[11px] font-medium leading-tight text-slate-700 group-hover:text-[#1D4ED8] sm:text-xs">
                      {category.name}
                    </h3>
                  </Link>
                ))}
            </div>
          )}
        </section>

        {/* Hero Banner (App Promo Style) */}
        <section className="px-4 py-6 sm:px-6 lg:px-8">
          <div className="relative flex flex-col justify-between overflow-hidden rounded-2xl bg-[#0F172A] p-6 text-white sm:flex-row sm:items-center sm:p-10">
            {/* Background Accent Gradients */}
            <div className="absolute -left-12 -top-12 h-32 w-32 rounded-full bg-blue-500/20 blur-2xl" />
            <div className="absolute -bottom-16 -right-12 h-48 w-48 rounded-full bg-blue-600/30 blur-3xl" />

            <div className="relative z-10 max-w-sm">
              <div className="mb-3 flex items-center gap-2">
                <span className="rounded bg-[#1D4ED8] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white">
                  Launch Deal
                </span>
              </div>
              <h1 className="text-2xl font-bold leading-tight sm:text-3xl lg:text-4xl">
                Upgrade Your Tech Lifestyle
              </h1>
              <p className="mt-2 text-xs text-slate-300 sm:text-sm lg:mt-3">
                Quality tech accessories & everyday essentials designed for you.
              </p>

              <Link
                href="/products"
                className="mt-5 inline-flex items-center gap-2 rounded-lg bg-[#1D4ED8] px-5 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-600 sm:mt-6"
              >
                Shop Now <ArrowRight size={16} />
              </Link>
            </div>

            <div className="relative z-10 mt-6 hidden sm:block">
              <Package
                size={100}
                strokeWidth={1}
                className="text-blue-400/50"
              />
            </div>
          </div>
        </section>

        {/* Featured Products */}
        <div className="px-4 sm:px-6 lg:px-8">
          <ProductSection
            title="Best Sellers"
            subtitle="Tested and certified lab gear"
            products={featuredProducts}
            loading={featuredLoading}
            error={featuredError}
          />

          <ProductSection
            title="Flash Deals"
            subtitle="Grab them before they are gone"
            products={newArrivals}
            loading={newArrivalsLoading}
            error={newArrivalsError}
          />
        </div>

        {/* Why Choose Us (Clean App-style Features) */}
        <section className="mb-12 px-4 pt-6 sm:px-6 lg:px-8">
          <div className="rounded-2xl bg-[#F8FAFC] px-4 py-8 sm:p-10">
            <div className="grid grid-cols-2 gap-6 sm:grid-cols-4">
              <div className="flex flex-col items-center text-center">
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-[#1D4ED8]">
                  <ShieldCheck size={20} />
                </div>
                <h3 className="text-xs font-bold text-[#0F172A] sm:text-sm">
                  Quality Products
                </h3>
              </div>

              <div className="flex flex-col items-center text-center">
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-[#1D4ED8]">
                  <Truck size={20} />
                </div>
                <h3 className="text-xs font-bold text-[#0F172A] sm:text-sm">
                  Fast Delivery
                </h3>
              </div>

              <div className="flex flex-col items-center text-center">
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-[#1D4ED8]">
                  <Headphones size={20} />
                </div>
                <h3 className="text-xs font-bold text-[#0F172A] sm:text-sm">
                  24/7 Support
                </h3>
              </div>

              <div className="flex flex-col items-center text-center">
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-[#1D4ED8]">
                  <RefreshCw size={20} />
                </div>
                <h3 className="text-xs font-bold text-[#0F172A] sm:text-sm">
                  Easy Returns
                </h3>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
