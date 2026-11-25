
"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import { useDispatch, useSelector } from "react-redux";
import { toast } from "sonner";
import { motion, useReducedMotion } from "motion/react";

import { RefreshCw } from "lucide-react";

import {
  fetchCart,
  updateCartItem,
  removeCartItem,
  clearCart,
} from "@/store/thunks/cartThunks";

import CartHeader from "./CartHeader";
import CartItemsList from "./CartItemsList";
import CartOrderSummary from "./CartOrderSummary";
import CartMobileCheckoutBar from "./CartMobileCheckoutBar";
import CartTrustInfo from "./CartTrustInfo";
import EmptyCart from "./EmptyCart";

import {
  getItemPrice,
  getItemStock,
} from "./cart.utils";

import RecentlyViewed from "../recently-viewed/RecentlyViewed";

// Loading Skeleton
import CartSkeleton from "@/components/loading/skeletons/CartSkeleton";

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

function getSafeNumber(value, fallback = 0) {
  const number = Number(value);

  return Number.isFinite(number)
    ? number
    : fallback;
}

// ========================================
// ERROR COMPONENT
// ========================================

function CartError({ message, onRetry }) {
  const shouldReduceMotion = useReducedMotion();

  return (
    <motion.div
      initial={
        shouldReduceMotion
          ? false
          : { opacity: 0, y: 15 }
      }
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: shouldReduceMotion ? 0 : 0.35,
      }}
      className="flex min-h-[45vh] flex-col items-center justify-center rounded-2xl border border-slate-200 bg-white px-5 py-12 text-center"
    >
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-red-50">
        <RefreshCw
          size={25}
          className="text-red-500"
        />
      </div>

      <h2 className="mt-4 text-lg font-bold text-slate-900">
        Unable to load your cart
      </h2>

      <p className="mt-2 max-w-sm text-sm text-slate-500">
        {message ||
          "Something went wrong while loading your cart."}
      </p>

      <button
        type="button"
        onClick={onRetry}
        className="mt-5 inline-flex items-center gap-2 rounded-xl bg-[#0755e9] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#0645c4] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0755e9] focus-visible:ring-offset-2 active:scale-[0.98]"
      >
        <RefreshCw size={16} />
        Try Again
      </button>
    </motion.div>
  );
}

// ========================================
// CART PAGE CONTENT
// ========================================

export default function CartPageContent() {
  const dispatch = useDispatch();

  const shouldReduceMotion = useReducedMotion();

  // ========================================
  // REDUX STATE
  // ========================================

  const cartState = useSelector(
    (state) => state.cart || {}
  );

  const items = Array.isArray(cartState.items)
    ? cartState.items
    : [];

  const isLoading =
    cartState.isLoading ??
    cartState.loading ??
    false;

  const isMutating =
    cartState.isMutating ?? false;

  // ========================================
  // LOCAL STATE
  // ========================================

  const [fetchError, setFetchError] = useState("");

  const [activeItemId, setActiveItemId] =
    useState("");

  const [isClearing, setIsClearing] =
    useState(false);

  // ========================================
  // ANIMATION CONFIG
  // ========================================

  const getMotionProps = (delay = 0) => ({
    initial: shouldReduceMotion
      ? false
      : { opacity: 0, y: 18 },

    animate: {
      opacity: 1,
      y: 0,
    },

    transition: {
      duration: shouldReduceMotion ? 0 : 0.4,
      delay: shouldReduceMotion ? 0 : delay,
      ease: "easeOut",
    },
  });

  // ========================================
  // FETCH CART
  // ========================================

  const loadCart = useCallback(async () => {
    setFetchError("");

    try {
      await dispatch(fetchCart()).unwrap();
    } catch (error) {
      setFetchError(
        getErrorMessage(
          error,
          "Unable to load your cart."
        )
      );
    }
  }, [dispatch]);

  useEffect(() => {
    loadCart();
  }, [loadCart]);

  // ========================================
  // TOTAL QUANTITY
  // ========================================

  const totalItems = useMemo(() => {
    return items.reduce((sum, item) => {
      const quantity = Math.max(
        0,
        getSafeNumber(item?.quantity)
      );

      return sum + quantity;
    }, 0);
  }, [items]);

  // ========================================
  // SUBTOTAL
  // ========================================

  const subtotal = useMemo(() => {
    return items.reduce((sum, item) => {
      const price = Math.max(
        0,
        getSafeNumber(getItemPrice(item))
      );

      const quantity = Math.max(
        0,
        getSafeNumber(item?.quantity)
      );

      return sum + price * quantity;
    }, 0);
  }, [items]);

  // ========================================
  // UPDATE QUANTITY
  // ========================================

  const handleQuantityChange = async (
    item,
    quantity
  ) => {
    const itemId = item?._id;

    if (
      !itemId ||
      activeItemId ||
      isClearing ||
      isMutating
    ) {
      return;
    }

    const safeQuantity = Number(quantity);

    if (
      !Number.isInteger(safeQuantity) ||
      safeQuantity < 1
    ) {
      return;
    }

    const stock = getSafeNumber(
      getItemStock(item)
    );

    if (safeQuantity > stock) {
      toast.error(
        "Maximum available stock reached."
      );

      return;
    }

    if (safeQuantity === Number(item.quantity)) {
      return;
    }

    setActiveItemId(itemId);

    try {
      await dispatch(
        updateCartItem({
          itemId,
          quantity: safeQuantity,
        })
      ).unwrap();

      toast.success(
        "Cart updated successfully."
      );
    } catch (error) {
      toast.error(
        getErrorMessage(
          error,
          "Failed to update cart."
        )
      );
    } finally {
      setActiveItemId("");
    }
  };

  // ========================================
  // REMOVE PRODUCT
  // ========================================

  const handleRemove = async (itemId) => {
    if (
      !itemId ||
      activeItemId ||
      isClearing ||
      isMutating
    ) {
      return;
    }

    setActiveItemId(itemId);

    try {
      await dispatch(
        removeCartItem(itemId)
      ).unwrap();

      toast.success(
        "Product removed from cart."
      );
    } catch (error) {
      toast.error(
        getErrorMessage(
          error,
          "Failed to remove product."
        )
      );
    } finally {
      setActiveItemId("");
    }
  };

  // ========================================
  // CLEAR CART
  // ========================================

  const handleClear = async () => {
    if (
      items.length === 0 ||
      isClearing ||
      activeItemId ||
      isMutating
    ) {
      return;
    }

    const confirmed = window.confirm(
      "Are you sure you want to remove all items from your cart?"
    );

    if (!confirmed) {
      return;
    }

    setIsClearing(true);

    try {
      await dispatch(clearCart()).unwrap();

      toast.success(
        "Cart cleared successfully."
      );
    } catch (error) {
      toast.error(
        getErrorMessage(
          error,
          "Failed to clear cart."
        )
      );
    } finally {
      setIsClearing(false);
    }
  };

  // ========================================
  // RETRY
  // ========================================

  const handleRetry = () => {
    loadCart();
  };

  // ========================================
  // LOADING UI
  // ========================================

  if (isLoading && items.length === 0) {
    return (
      <main className="min-h-screen">
        <div className="mx-auto w-full px-4 py-6 sm:px-6 lg:px-8 lg:py-10">
          <CartSkeleton />
        </div>
      </main>
    );
  }

  // ========================================
  // ERROR UI
  // ========================================

  if (fetchError && items.length === 0) {
    return (
      <main className="min-h-screen">
        <div className="mx-auto w-full px-4 py-6 sm:px-6 lg:px-8 lg:py-10">
          <CartError
            message={fetchError}
            onRetry={handleRetry}
          />

          <motion.section
            {...getMotionProps(0.15)}
            className="mt-12 sm:mt-16"
          >
            <RecentlyViewed
              title="Recently Viewed Products"
              limit={5}
            />
          </motion.section>
        </div>
      </main>
    );
  }

  // ========================================
  // MAIN UI
  // ========================================

  return (
    <main className="min-h-screen lg:pb-12">
      <div className="mx-auto w-full px-4 py-6 sm:px-6 lg:px-8 lg:py-10">

        {/* CART HEADER */}

        <motion.div {...getMotionProps(0)}>
          <CartHeader
            totalItems={totalItems}
          />
        </motion.div>

        {/* EMPTY CART */}

        {items.length === 0 ? (
          <EmptyCart
            shouldReduceMotion={shouldReduceMotion}
          />
        ) : (
          <>
            {/* CART CONTENT */}

            <motion.div
              {...getMotionProps(0.1)}
              className="grid grid-cols-1 items-start gap-5 lg:grid-cols-[minmax(0,1fr)_360px] lg:gap-7"
            >
              {/* CART PRODUCTS */}

              <CartItemsList
                items={items}
                isMutating={
                  isMutating ||
                  Boolean(activeItemId) ||
                  isClearing
                }
                onQuantityChange={
                  handleQuantityChange
                }
                onRemove={handleRemove}
                onClear={handleClear}
              />

              {/* ORDER SUMMARY */}

              <aside className="lg:sticky lg:top-24">
                <CartOrderSummary
                  subtotal={subtotal}
                  totalItems={totalItems}
                />

                <CartTrustInfo />
              </aside>
            </motion.div>

            {/* MOBILE CHECKOUT BAR */}

            <motion.div
              {...getMotionProps(0.2)}
            >
              <CartMobileCheckoutBar
                subtotal={subtotal}
                totalItems={totalItems}
              />
            </motion.div>
          </>
        )}

        {/* RECENTLY VIEWED */}

        <motion.section
          {...getMotionProps(
            items.length === 0 ? 0.15 : 0.25
          )}
          className="mt-12 sm:mt-16"
        >
          <RecentlyViewed
            title="Recently Viewed Products"
            limit={5}
          />
        </motion.section>
      </div>
    </main>
  );
}
