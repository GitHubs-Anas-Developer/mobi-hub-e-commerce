
"use client";

import { useCallback, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import {
  AnimatePresence,
  motion,
  useReducedMotion,
} from "motion/react";

import {
  ShieldCheck,
  Package,
  ShoppingCart,
  RefreshCw,
} from "lucide-react";

import { toast } from "sonner";

import ProtectedRoute from "@/components/auth/ProtectedRoute";
import MiniCartDrawer from "@/components/cart/MiniCartDrawer";

import WishlistHeader from "@/components/wishlist/WishlistHeader";
import WishlistEmptyState from "@/components/wishlist/WishlistEmptyState";
import WishlistProductCard from "@/components/wishlist/WishlistProductCard";
import WishlistPromoBanner from "@/components/wishlist/WishlistPromoBanner";

import RecentlyViewed from "@/components/recently-viewed/RecentlyViewed";

// Loading component
import WishlistSkeleton from "@/components/loading/skeletons/WishlistSkeleton";

import {
  fetchWishlist,
  removeFromWishlist,
} from "@/store/thunks/wishlistThunks";

import { addToCart } from "@/store/thunks/cartThunks";

// ========================================
// HELPERS
// ========================================

function getErrorMessage(error, fallback) {
  if (typeof error === "string") {
    return error;
  }

  return (
    error?.message ||
    error?.error ||
    error?.data?.message ||
    fallback
  );
}

function getProductId(product) {
  return product?._id || product?.id || "";
}

// ========================================
// MOTION VARIANTS
// ========================================

const containerVariants = {
  hidden: {
    opacity: 0,
  },

  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.07,
    },
  },
};

// ========================================
// ERROR COMPONENT
// ========================================

function WishlistError({ message, onRetry }) {
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center px-4 text-center">
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-50">
        <RefreshCw
          size={28}
          className="text-red-500"
        />
      </div>

      <h2 className="text-lg font-bold text-slate-900">
        Unable to load wishlist
      </h2>

      <p className="mt-2 max-w-sm text-sm text-slate-500">
        {message ||
          "Something went wrong while loading your wishlist."}
      </p>

      <button
        type="button"
        onClick={onRetry}
        className="mt-5 inline-flex items-center gap-2 rounded-xl bg-[#0755e9] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#0645c4] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0755e9] focus-visible:ring-offset-2"
      >
        <RefreshCw size={16} />
        Try Again
      </button>
    </div>
  );
}

// ========================================
// WISHLIST PAGE CONTENT
// ========================================

function WishlistPageContent() {
  const dispatch = useDispatch();
  const shouldReduceMotion = useReducedMotion();

  // ========================================
  // REDUX STATE
  // ========================================

  const wishlistState = useSelector(
    (state) => state.wishlist
  );

  const products = Array.isArray(
    wishlistState?.products
  )
    ? wishlistState.products
    : [];

  const isLoading =
    wishlistState?.isLoading ??
    wishlistState?.loading ??
    false;

  const isMutating =
    wishlistState?.isMutating ?? false;

  // ========================================
  // LOCAL STATE
  // ========================================

  const [removingId, setRemovingId] = useState("");
  const [addingId, setAddingId] = useState("");

  const [cartDrawerOpen, setCartDrawerOpen] =
    useState(false);

  const [fetchError, setFetchError] = useState("");

  // ========================================
  // FETCH WISHLIST
  // ========================================

  const loadWishlist = useCallback(async () => {
    setFetchError("");

    try {
      await dispatch(fetchWishlist()).unwrap();
    } catch (error) {
      const message = getErrorMessage(
        error,
        "Unable to load your wishlist."
      );

      setFetchError(message);
    }
  }, [dispatch]);

  useEffect(() => {
    loadWishlist();
  }, [loadWishlist]);

  // ========================================
  // REMOVE WISHLIST PRODUCT
  // ========================================

  const handleRemove = async (productId) => {
    if (!productId || removingId) {
      return;
    }

    setRemovingId(productId);

    try {
      await dispatch(
        removeFromWishlist(productId)
      ).unwrap();

      toast.success(
        "Product removed from wishlist."
      );
    } catch (error) {
      toast.error(
        getErrorMessage(
          error,
          "Unable to remove product."
        )
      );
    } finally {
      setRemovingId("");
    }
  };

  // ========================================
  // ADD PRODUCT TO CART
  // ========================================

  const handleAddToCart = async (product) => {
    const productId = getProductId(product);

    if (!productId || addingId) {
      return;
    }

    // Find active variants
    const activeVariants = Array.isArray(
      product?.variants
    )
      ? product.variants.filter(
          (variant) =>
            variant?.isActive !== false
        )
      : [];

    // Select default variant or first active variant
    const selectedVariant =
      activeVariants.find(
        (variant) => variant?.isDefault === true
      ) || activeVariants[0];

    if (!selectedVariant?._id) {
      toast.error(
        "No active variant available for this product."
      );

      return;
    }

    // Stock validation
    const availableStock = Number(
      selectedVariant.stock ?? 0
    );

    if (
      !Number.isFinite(availableStock) ||
      availableStock < 1
    ) {
      toast.error(
        "This product is currently out of stock."
      );

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

      toast.success(
        "Product added to cart."
      );

      setCartDrawerOpen(true);
    } catch (error) {
      toast.error(
        getErrorMessage(
          error,
          "Unable to add product to cart."
        )
      );
    } finally {
      setAddingId("");
    }
  };

  // ========================================
  // RETRY FETCH
  // ========================================

  const handleRetry = () => {
    loadWishlist();
  };

  // ========================================
  // LOADING UI
  // ========================================

  if (isLoading && products.length === 0) {
    return (
      <main className="min-h-screen">
        <div className="mx-auto w-full px-4 py-7 sm:px-6 lg:px-8 lg:py-10">
          <WishlistSkeleton />
        </div>
      </main>
    );
  }

  // ========================================
  // ERROR UI
  // ========================================

  if (fetchError && products.length === 0) {
    return (
      <main className="min-h-screen">
        <WishlistError
          message={fetchError}
          onRetry={handleRetry}
        />
      </main>
    );
  }

  // ========================================
  // MAIN UI
  // ========================================

  return (
    <>
      <motion.main
        initial={
          shouldReduceMotion
            ? false
            : { opacity: 0 }
        }
        animate={{ opacity: 1 }}
        transition={{
          duration: 0.35,
        }}
        className="min-h-screen"
      >
        <div className="mx-auto w-full px-4 py-7 sm:px-6 lg:px-8 lg:py-10">

          {/* WISHLIST HEADER */}

          <WishlistHeader
            totalItems={products.length}
          />

          {/* WISHLIST PROMO BANNER */}

          <WishlistPromoBanner />

          {/* WISHLIST CONTENT */}

          {products.length === 0 ? (
            <WishlistEmptyState
              shouldReduceMotion={
                shouldReduceMotion
              }
            />
          ) : (
            <>
              {/* PRODUCT GRID */}

              <motion.section
                variants={containerVariants}
                initial={
                  shouldReduceMotion
                    ? false
                    : "hidden"
                }
                animate="visible"
                aria-label="Wishlist products"
                className="grid grid-cols-2 gap-3 sm:gap-5 md:grid-cols-3 xl:grid-cols-4"
              >
                <AnimatePresence initial={false}>
                  {products.map((product) => {
                    const productId =
                      getProductId(product);

                    if (!productId) {
                      return null;
                    }

                    return (
                      <WishlistProductCard
                        key={productId}
                        product={product}
                        isMutating={isMutating}
                        isRemoving={
                          removingId === productId
                        }
                        isAdding={
                          addingId === productId
                        }
                        shouldReduceMotion={
                          shouldReduceMotion
                        }
                        onRemove={handleRemove}
                        onAddToCart={handleAddToCart}
                      />
                    );
                  })}
                </AnimatePresence>
              </motion.section>

              {/* TRUST INFORMATION */}

              <motion.div
                initial={
                  shouldReduceMotion
                    ? false
                    : {
                        opacity: 0,
                        y: 12,
                      }
                }
                animate={{
                  opacity: 1,
                  y: 0,
                }}
                transition={{
                  delay: shouldReduceMotion ? 0 : 0.2,
                }}
                className="mt-9 flex flex-wrap items-center justify-center gap-5 border-t border-slate-200 pt-7 text-xs font-medium text-slate-500 sm:gap-10"
              >
                <div className="flex items-center gap-2">
                  <ShieldCheck
                    size={17}
                    className="text-green-600"
                    aria-hidden="true"
                  />

                  <span>
                    Secure Shopping
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <Package
                    size={17}
                    className="text-[#0755e9]"
                    aria-hidden="true"
                  />

                  <span>
                    Quality Products
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <ShoppingCart
                    size={17}
                    className="text-[#0755e9]"
                    aria-hidden="true"
                  />

                  <span>
                    Easy Checkout
                  </span>
                </div>
              </motion.div>
            </>
          )}

          {/* RECENTLY VIEWED */}

          <section className="mt-12 sm:mt-16">
            <RecentlyViewed
              title="Recently Viewed Products"
              limit={5}
            />
          </section>
        </div>
      </motion.main>

      {/* MINI CART DRAWER */}

      <MiniCartDrawer
        isOpen={cartDrawerOpen}
        onClose={() => setCartDrawerOpen(false)}
      />
    </>
  );
}

// ========================================
// PROTECTED WISHLIST PAGE
// ========================================

export default function WishlistPage() {
  return (
    <ProtectedRoute>
      <WishlistPageContent />
    </ProtectedRoute>
  );
}
