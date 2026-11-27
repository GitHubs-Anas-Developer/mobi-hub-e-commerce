"use client";

import { useCallback, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "sonner";
import {
  AlertCircle,
  RefreshCw,
  ShieldCheck,
  Package,
  ShoppingCart,
} from "lucide-react";

import ProtectedRoute from "@/components/auth/ProtectedRoute";
import MiniCartDrawer from "@/components/cart/MiniCartDrawer";

import WishlistHeader from "@/components/wishlist/WishlistHeader";
import WishlistEmptyState from "@/components/wishlist/WishlistEmptyState";
import WishlistProductCard from "@/components/wishlist/WishlistProductCard";
import WishlistPromoBanner from "@/components/wishlist/WishlistPromoBanner";

import RecentlyViewed from "@/components/recently-viewed/RecentlyViewed";
import WishlistSkeleton from "@/components/loading/skeletons/WishlistSkeleton";

import {
  fetchWishlist,
  removeFromWishlist,
  clearWishlist,
} from "@/store/thunks/wishlistThunks";
import { addToCart } from "@/store/thunks/cartThunks";

function getErrorMessage(error, fallback) {
  if (typeof error === "string") return error;

  return (
    error?.response?.data?.message ||
    error?.message ||
    error?.error ||
    error?.data?.message ||
    fallback
  );
}

function getProductId(product) {
  return product?._id || product?.id || "";
}

function WishlistError({ message, onRetry }) {
  return (
    <div
      role="alert"
      className="flex min-h-[45vh] flex-col items-center justify-center rounded-2xl border border-red-200 bg-white px-5 py-14 text-center"
    >
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-red-100 bg-red-50 text-red-500">
        <AlertCircle size={28} aria-hidden="true" />
      </div>

      <h1 className="mt-4 text-lg font-bold tracking-tight text-[#101828]">
        Unable to load your wishlist
      </h1>

      <p className="mt-2 max-w-md text-xs leading-relaxed text-[#64748B] sm:text-sm">
        {message || "Something went wrong while fetching your saved items."}
      </p>

      <button
        type="button"
        onClick={onRetry}
        className="mt-6 inline-flex h-10 items-center gap-2 rounded-xl bg-[#0755E9] px-5 text-xs font-bold text-white shadow-xs transition hover:bg-[#082B70] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0755E9] focus-visible:ring-offset-2 sm:text-sm"
      >
        <RefreshCw size={15} />
        Try Again
      </button>
    </div>
  );
}

function WishlistPageContent() {
  const dispatch = useDispatch();

  const wishlistState = useSelector((state) => state.wishlist);

  const products = Array.isArray(wishlistState?.products)
    ? wishlistState.products
    : [];

  const isLoading =
    wishlistState?.isLoading ?? wishlistState?.loading ?? false;

  const isMutating = wishlistState?.isMutating ?? false;

  const [removingId, setRemovingId] = useState("");
  const [addingId, setAddingId] = useState("");
  const [isClearing, setIsClearing] = useState(false);
  const [cartDrawerOpen, setCartDrawerOpen] = useState(false);
  const [fetchError, setFetchError] = useState("");

  const loadWishlist = useCallback(async () => {
    setFetchError("");

    try {
      await dispatch(fetchWishlist()).unwrap();
    } catch (error) {
      setFetchError(
        getErrorMessage(error, "Unable to load your wishlist.")
      );
    }
  }, [dispatch]);

  useEffect(() => {
    loadWishlist();
  }, [loadWishlist]);

  const handleRemove = async (productId) => {
    if (!productId || removingId || isClearing) return;

    setRemovingId(productId);

    try {
      await dispatch(removeFromWishlist(productId)).unwrap();
      toast.success("Product removed from wishlist.");
    } catch (error) {
      toast.error(getErrorMessage(error, "Unable to remove product."));
    } finally {
      setRemovingId("");
    }
  };

  const handleClearWishlist = async () => {
    if (products.length === 0 || isClearing || removingId || addingId) return;

    setIsClearing(true);

    try {
      await dispatch(clearWishlist()).unwrap();
      toast.success("Wishlist cleared.");
    } catch (error) {
      toast.error(getErrorMessage(error, "Unable to clear wishlist."));
    } finally {
      setIsClearing(false);
    }
  };

  const handleAddToCart = async (product) => {
    const productId = getProductId(product);
    if (!productId || addingId || isClearing) return;

    const activeVariants = Array.isArray(product?.variants)
      ? product.variants.filter((variant) => variant?.isActive !== false)
      : [];

    const selectedVariant =
      activeVariants.find((variant) => variant?.isDefault === true) ||
      activeVariants[0];

    if (!selectedVariant?._id) {
      toast.error("Please open the product page to select a variant.");
      return;
    }

    const availableStock = Number(selectedVariant.stock ?? 0);
    if (!Number.isFinite(availableStock) || availableStock < 1) {
      toast.error("This product is currently out of stock.");
      return;
    }

    setAddingId(productId);

    try {
      await dispatch(
        addToCart({
          productId,
          variantId: selectedVariant._id,
          quantity: 1,
        })
      ).unwrap();

      toast.success(`${product.name || "Product"} added to cart.`);
      setCartDrawerOpen(true);
    } catch (error) {
      toast.error(
        getErrorMessage(error, "Unable to add product to cart.")
      );
    } finally {
      setAddingId("");
    }
  };

  if (isLoading && products.length === 0) {
    return (
      <main className="min-h-screen w-full bg-[#F8FAFC] pb-24 xl:pb-12">
        <div className="mx-auto w-full max-w-[1440px] px-4 py-5 sm:px-6 sm:py-6 lg:px-8">
          <WishlistSkeleton />
        </div>
      </main>
    );
  }

  if (fetchError && products.length === 0) {
    return (
      <main className="min-h-screen w-full bg-[#F8FAFC] pb-24 xl:pb-12">
        <div className="mx-auto w-full max-w-[1440px] px-4 py-5 sm:px-6 sm:py-6 lg:px-8">
          <WishlistError message={fetchError} onRetry={loadWishlist} />

          <section
            className="mt-12 sm:mt-14"
            aria-label="Recently viewed products"
          >
            <RecentlyViewed title="Recently Viewed Products" limit={5} />
          </section>
        </div>
      </main>
    );
  }

  return (
    <>
      <main className="min-h-screen w-full bg-[#F8FAFC] pb-24 xl:pb-12">
        <div className="mx-auto w-full max-w-[1440px] px-4 py-5 sm:px-6 sm:py-6 lg:px-8">
          <WishlistHeader
            totalItems={products.length}
            isMutating={
              isMutating || Boolean(removingId) || Boolean(addingId) || isClearing
            }
            onClearWishlist={handleClearWishlist}
          />

          {products.length === 0 ? (
            <WishlistEmptyState />
          ) : (
            <>
              <section
                aria-label="Saved wishlist products"
                className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 xl:grid-cols-4"
              >
                {products.map((product) => {
                  const productId = getProductId(product);
                  if (!productId) return null;

                  return (
                    <div key={productId} className="min-w-0">
                      <WishlistProductCard
                        product={product}
                        isMutating={isMutating || isClearing}
                        isRemoving={String(removingId) === String(productId)}
                        isAdding={String(addingId) === String(productId)}
                        onRemove={handleRemove}
                        onAddToCart={handleAddToCart}
                      />
                    </div>
                  );
                })}
              </section>

              <WishlistPromoBanner />

              {/* Store Assurances Bar */}
              <div className="mt-6 flex flex-wrap items-center justify-center gap-5 rounded-2xl border border-[#E2E8F0] bg-white px-4 py-4 text-xs font-semibold text-[#64748B] sm:gap-10">
                <div className="flex items-center gap-2">
                  <ShieldCheck
                    size={16}
                    className="text-emerald-600"
                    aria-hidden="true"
                  />
                  <span>Secure Shopping</span>
                </div>

                <div className="flex items-center gap-2">
                  <Package
                    size={16}
                    className="text-[#0755E9]"
                    aria-hidden="true"
                  />
                  <span>Genuine Tech Guaranteed</span>
                </div>

                <div className="flex items-center gap-2">
                  <ShoppingCart
                    size={16}
                    className="text-[#0755E9]"
                    aria-hidden="true"
                  />
                  <span>Fast One-Click Cart Transfer</span>
                </div>
              </div>
            </>
          )}

          <section
            className="mt-12 sm:mt-14"
            aria-label="Recently viewed products"
          >
            <RecentlyViewed title="Recently Viewed Products" limit={5} />
          </section>
        </div>
      </main>

      <MiniCartDrawer
        isOpen={cartDrawerOpen}
        onClose={() => setCartDrawerOpen(false)}
      />
    </>
  );
}

export default function WishlistPage() {
  return (
    <ProtectedRoute>
      <WishlistPageContent />
    </ProtectedRoute>
  );
}
