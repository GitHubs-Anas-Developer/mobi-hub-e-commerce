"use client";

import { useMemo, useState } from "react";
import { Inter } from "next/font/google";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { ChevronRight, Package } from "lucide-react";
import { toast } from "sonner";

import { addToCart } from "@/store/thunks/cartThunks";
import {
  addToWishlist,
  removeFromWishlist,
} from "@/store/thunks/wishlistThunks";

import ProductCard from "./ProductCard";
import ProductSkeleton from "./ProductSkeleton";

const inter = Inter({ subsets: ["latin"], display: "swap" });

const getWishlistId = (item) => {
  if (typeof item === "string") return item;
  if (!item || typeof item !== "object") return "";
  const ref = item.product ?? item.productId;
  if (typeof ref === "string") return ref;
  if (ref && typeof ref === "object") return ref._id ?? ref.id ?? "";
  return item._id ?? item.id ?? "";
};

export default function ProductSection({
  eyebrow,
  title,
  subtitle,
  products = [],
  loading = false,
  error = "",
  viewAllHref = "/products",
  showViewAll = true,
  onAddedToCart,
  catalogHeader = false,
}) {
  const dispatch = useDispatch();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const isAuthenticated = useSelector(
    (state) => state.auth?.isAuthenticated ?? false
  );
  const wishlistProducts = useSelector(
    (state) => state.wishlist?.products || []
  );
  const wishlistIsMutating = useSelector(
    (state) => state.wishlist?.isMutating ?? false
  );
  const cartIsMutating = useSelector(
    (state) => state.cart?.isMutating ?? false
  );

  const [addingProductId, setAddingProductId] = useState(null);

  const currentPath = `${pathname || "/"}${
    searchParams.toString() ? `?${searchParams.toString()}` : ""
  }`;

  const wishlistedIds = useMemo(
    () =>
      new Set(wishlistProducts.map(getWishlistId).filter(Boolean).map(String)),
    [wishlistProducts]
  );

  const handleAddToCart = async (product, selectedVariant) => {
    if (!isAuthenticated) {
      toast.info("Please sign in to add items to your bag.");
      router.push(`/login?next=${encodeURIComponent(currentPath)}`);
      return;
    }

    if (!product?._id || cartIsMutating || addingProductId) return;

    const activeVariants = (product.variants || []).filter(
      (v) => v?.isActive !== false
    );
    const variant =
      selectedVariant ||
      activeVariants.find((v) => v.isDefault) ||
      activeVariants[0];

    if (!variant?._id) {
      toast.error("Please select a product option.", {
        description: "Opening product page to choose an option.",
      });
      if (product.slug) router.push(`/products/${product.slug}`);
      return;
    }

    const stock = Number(
      variant.stock ?? product.totalStock ?? product.stock ?? 0
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
          variantId: variant._id,
          quantity: 1,
        })
      ).unwrap();

      if (onAddedToCart) {
        onAddedToCart();
      } else {
        toast.success("Added to shopping bag.");
      }
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

  const handleWishlistToggle = async (product) => {
    if (!isAuthenticated) {
      toast.info("Please sign in to save items to your wishlist.");
      router.push(`/login?next=${encodeURIComponent(currentPath)}`);
      return;
    }

    if (!product?._id || wishlistIsMutating) return;

    const alreadyWishlisted = wishlistedIds.has(String(product._id));

    try {
      if (alreadyWishlisted) {
        await dispatch(removeFromWishlist(product._id)).unwrap();
        toast.success("Removed from wishlist.");
      } else {
        await dispatch(addToWishlist(product._id)).unwrap();
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

  return (
    <section className="w-full">
      {/* Header */}
      {catalogHeader ? (
        <div
          className={`${inter.className} mb-5 flex min-w-0 flex-col items-start gap-4 sm:mb-6 md:flex-row md:items-end md:justify-between`}
        >
          <div className="min-w-0">
            {eyebrow && (
              <span className="inline-flex items-center rounded-full border border-[#D7E7FF] bg-[#EFF6FF] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-[#0755E9]">
                {eyebrow}
              </span>
            )}

            <h2 className="mt-2 text-xl font-semibold leading-tight tracking-tight text-[#101828] sm:text-2xl">
              {title}
            </h2>

            {subtitle && (
              <p className="mt-1.5 max-w-2xl text-sm leading-5 text-[#64748B] sm:text-[15px] sm:leading-6">
                {subtitle}
              </p>
            )}
          </div>

          <div className="flex w-full min-w-0 items-center justify-between gap-4 border-t border-[#E2E8F0] pt-3 md:w-auto md:shrink-0 md:justify-end md:border-t-0 md:pt-0">
            <div
              className="flex items-center gap-2.5"
              role="group"
              aria-label="New arrivals catalog count"
            >
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#EFF6FF] text-[#0755E9]">
                <Package size={17} strokeWidth={1.8} aria-hidden="true" />
              </div>
              <div className="leading-tight">
                <span className="block text-[10px] font-semibold uppercase tracking-[0.14em] text-[#64748B]">
                  Catalog
                </span>
                <span className="mt-0.5 inline-flex items-baseline gap-1">
                  <span
                    className="text-lg font-semibold tabular-nums text-[#0755E9]"
                    aria-live="polite"
                    aria-atomic="true"
                  >
                    {loading || error ? "—" : products.length}
                  </span>
                  <span className="text-xs font-medium text-[#64748B]">
                    products
                  </span>
                </span>
              </div>
            </div>

            {showViewAll && (
              <Link
                href={viewAllHref}
                className="inline-flex h-9 shrink-0 items-center gap-1.5 rounded-full border border-[#E2E8F0] bg-white px-3.5 text-xs font-semibold text-[#0755E9] transition-colors duration-150 hover:border-[#0755E9] hover:bg-[#EFF6FF] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0755E9]/30 sm:text-sm"
              >
                View All
                <ChevronRight size={15} />
              </Link>
            )}
          </div>
        </div>
      ) : (
        <div className="mb-5 flex items-end justify-between gap-4 sm:mb-6">
          <div className="min-w-0">
            {eyebrow && (
              <span className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#0755E9]">
                {eyebrow}
              </span>
            )}

            <h2 className="mt-1 text-xl font-bold tracking-tight text-[#101828] sm:text-2xl">
              {title}
            </h2>

            {subtitle && (
              <p className="mt-1 text-xs text-[#64748B] sm:text-sm">
                {subtitle}
              </p>
            )}
          </div>

          {showViewAll && (
            <Link
              href={viewAllHref}
              className="inline-flex shrink-0 items-center gap-1 rounded-full border border-[#E2E8F0] bg-white px-3.5 py-2 text-xs font-semibold text-[#0755E9] transition hover:border-[#0755E9] hover:bg-[#EFF6FF] sm:text-sm"
            >
              View All
              <ChevronRight size={15} />
            </Link>
          )}
        </div>
      )}

      {/* Loading */}
      {loading ? (
        <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4 lg:gap-5">
          {Array.from({ length: 4 }).map((_, index) => (
            <ProductSkeleton key={index} />
          ))}
        </div>
      ) : error ? (
        <div className="flex items-center gap-3 rounded-2xl border border-red-100 bg-red-50 p-4">
          <Package size={20} className="shrink-0 text-red-500" />
          <p className="text-xs font-medium text-red-600 sm:text-sm">
            {error}
          </p>
        </div>
      ) : products.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-[#E2E8F0] bg-[#F8FAFC] px-4 py-10 text-center">
          <Package size={30} className="mb-2 text-slate-400" />
          <h3 className="text-sm font-semibold text-[#101828]">
            No products available
          </h3>
          <p className="mt-1 text-xs text-[#64748B]">
            Products will appear here once added to the catalogue.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4 lg:gap-5">
          {products.map((product) => (
            <ProductCard
              key={product._id}
              product={product}
              onAddToCart={handleAddToCart}
              onWishlistToggle={handleWishlistToggle}
              isWishlisted={wishlistedIds.has(String(product._id))}
              addingToCart={addingProductId === product._id}
              wishlistIsMutating={wishlistIsMutating}
            />
          ))}
        </div>
      )}
    </section>
  );
}
