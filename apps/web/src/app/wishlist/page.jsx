
"use client";

import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import {
  AnimatePresence,
  motion,
  useReducedMotion,
} from "motion/react";

import {
  Loader2,
  ShieldCheck,
  Package,
  ShoppingCart,
} from "lucide-react";

import { toast } from "sonner";

import ProtectedRoute from "@/components/auth/ProtectedRoute";
import MiniCartDrawer from "@/components/cart/MiniCartDrawer";

import WishlistHeader from "@/components/wishlist/WishlistHeader";
import WishlistEmptyState from "@/components/wishlist/WishlistEmptyState";
import WishlistProductCard from "@/components/wishlist/WishlistProductCard";


import {
  fetchWishlist,
  removeFromWishlist,
} from "@/store/thunks/wishlistThunks";

import { addToCart } from "@/store/thunks/cartThunks";
import RecentlyViewed from "@/components/recently-viewed/RecentlyViewed";

/* ----------------------------------
   Helpers
---------------------------------- */

function getErrorMessage(error, fallback) {
  if (typeof error === "string") return error;

  return (
    error?.message ||
    error?.error ||
    error?.data?.message ||
    fallback
  );
}

/* ----------------------------------
   Motion Variants
---------------------------------- */

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

/* ----------------------------------
   Wishlist Page Content
---------------------------------- */

function WishlistPageContent() {
  const dispatch = useDispatch();
  const shouldReduceMotion = useReducedMotion();

  const wishlistState = useSelector(
    (state) => state.wishlist
  );

  const products = wishlistState?.products || [];
  const isLoading = wishlistState?.isLoading || false;
  const isMutating = wishlistState?.isMutating || false;

  const [removingId, setRemovingId] = useState("");
  const [addingId, setAddingId] = useState("");
  const [cartDrawerOpen, setCartDrawerOpen] = useState(false);

  /* ----------------------------------
     Fetch Wishlist
  ---------------------------------- */

  useEffect(() => {
    dispatch(fetchWishlist());
  }, [dispatch]);

  /* ----------------------------------
     Remove Wishlist Product
  ---------------------------------- */

  const handleRemove = async (productId) => {
    if (!productId || removingId) return;

    setRemovingId(productId);

    try {
      await dispatch(
        removeFromWishlist(productId)
      ).unwrap();

      toast.success("Product removed from wishlist.");
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

  /* ----------------------------------
     Add Product To Cart
  ---------------------------------- */

  const handleAddToCart = async (product) => {
    if (!product?._id || addingId) return;

    const activeVariants = (
      product.variants || []
    ).filter(
      (variant) => variant.isActive !== false
    );

    const selectedVariant =
      activeVariants.find(
        (variant) => variant.isDefault
      ) || activeVariants[0];

    if (!selectedVariant) {
      toast.error(
        "No active variant available for this product."
      );
      return;
    }

    if (Number(selectedVariant.stock || 0) < 1) {
      toast.error(
        "This product is currently out of stock."
      );
      return;
    }

    setAddingId(product._id);

    try {
      await dispatch(
        addToCart({
          productId: product._id,
          variantId: selectedVariant._id,
          quantity: 1,
        })
      ).unwrap();

      toast.success("Product added to cart.");

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

  /* ----------------------------------
     Loading UI
  ---------------------------------- */

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <motion.div
          animate={
            shouldReduceMotion
              ? {}
              : { rotate: 360 }
          }
          transition={{
            duration: 1,
            repeat: Infinity,
            ease: "linear",
          }}
        >
          <Loader2
            size={34}
            className="text-[#0755e9]"
          />
        </motion.div>
      </div>
    );
  }

  /* ----------------------------------
     Main UI
  ---------------------------------- */

  return (
    <>
      <motion.main
        initial={
          shouldReduceMotion
            ? false
            : { opacity: 0 }
        }
        animate={{ opacity: 1 }}
        transition={{ duration: 0.35 }}
        className="min-h-screen "
      >
        <div className="mx-auto w-full px-4 py-7 sm:px-6 lg:px-8 lg:py-10">

          {/* Wishlist Header */}
          <WishlistHeader
            totalItems={products.length}
          />

          {/* Wishlist Content */}
          {products.length === 0 ? (
            <WishlistEmptyState
              shouldReduceMotion={shouldReduceMotion}
            />
          ) : (
            <>
              {/* Product Grid */}
              <motion.section
                variants={containerVariants}
                initial={
                  shouldReduceMotion
                    ? false
                    : "hidden"
                }
                animate="visible"
                className="grid grid-cols-2 gap-3 sm:gap-5 md:grid-cols-3 xl:grid-cols-4"
              >
                <AnimatePresence initial={false}>
                  {products.map((product) => (
                    <WishlistProductCard
                      key={product._id}
                      product={product}
                      isMutating={isMutating}
                      isRemoving={
                        removingId === product._id
                      }
                      isAdding={
                        addingId === product._id
                      }
                      shouldReduceMotion={
                        shouldReduceMotion
                      }
                      onRemove={handleRemove}
                      onAddToCart={handleAddToCart}
                    />
                  ))}
                </AnimatePresence>
              </motion.section>

              {/* Trust Information */}
              <motion.div
                initial={
                  shouldReduceMotion
                    ? false
                    : { opacity: 0, y: 12 }
                }
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="mt-9 flex flex-wrap items-center justify-center gap-5 border-t border-slate-200 pt-7 text-xs font-medium text-slate-500 sm:gap-10"
              >
                <div className="flex items-center gap-2">
                  <ShieldCheck
                    size={17}
                    className="text-green-600"
                  />
                  Secure Shopping
                </div>

                <div className="flex items-center gap-2">
                  <Package
                    size={17}
                    className="text-[#0755e9]"
                  />
                  Quality Products
                </div>

                <div className="flex items-center gap-2">
                  <ShoppingCart
                    size={17}
                    className="text-[#0755e9]"
                  />
                  Easy Checkout
                </div>
              </motion.div>
            </>
          )}

          {/* Recently Viewed Products */}
          <section className="mt-12 sm:mt-16">
            <RecentlyViewed
              title="Recently Viewed Products"
              limit={5}
            />
          </section>

        </div>
      </motion.main>

      {/* Mini Cart Drawer */}
      <MiniCartDrawer
        isOpen={cartDrawerOpen}
        onClose={() => setCartDrawerOpen(false)}
      />
    </>
  );
}

/* ----------------------------------
   Protected Wishlist Page
---------------------------------- */

export default function WishlistPage() {
  return (
    <ProtectedRoute>
      <WishlistPageContent />
    </ProtectedRoute>
  );
}
