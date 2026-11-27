"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "sonner";
import { AlertCircle, RefreshCw } from "lucide-react";

import {
  fetchCart,
  updateCartItem,
  removeCartItem,
  clearCart,
} from "@/store/thunks/cartThunks";
import couponService from "@/services/couponService";

import CartHeader from "./CartHeader";
import CartItemsList from "./CartItemsList";
import CartOrderSummary from "./CartOrderSummary";
import CartMobileCheckoutBar from "./CartMobileCheckoutBar";
import CartTrustInfo from "./CartTrustInfo";
import EmptyCart from "./EmptyCart";
import {
  getItemPrice,
  getItemMrp,
  getItemStock,
} from "./cart.utils";

import RecentlyViewed from "../recently-viewed/RecentlyViewed";
import CartSkeleton from "@/components/loading/skeletons/CartSkeleton";

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

function getSafeNumber(value, fallback = 0) {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
}

function CartError({ message, onRetry }) {
  return (
    <div
      role="alert"
      className="flex min-h-[45vh] flex-col items-center justify-center rounded-2xl border border-red-200 bg-white px-5 py-14 text-center"
    >
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-red-100 bg-red-50 text-red-500">
        <AlertCircle size={28} aria-hidden="true" />
      </div>

      <h1 className="mt-4 text-lg font-bold tracking-tight text-[#101828]">
        Unable to load your shopping cart
      </h1>

      <p className="mt-2 max-w-md text-xs leading-relaxed text-[#64748B] sm:text-sm">
        {message || "Something went wrong while fetching your cart items."}
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

export default function CartPageContent() {
  const dispatch = useDispatch();

  const cartState = useSelector((state) => state.cart || {});
  const items = useMemo(
    () => (Array.isArray(cartState.items) ? cartState.items : []),
    [cartState.items]
  );

  const isLoading = cartState.isLoading ?? cartState.loading ?? false;
  const isMutating = cartState.isMutating ?? false;

  const [fetchError, setFetchError] = useState("");
  const [activeItemId, setActiveItemId] = useState("");
  const [isClearing, setIsClearing] = useState(false);

  // Coupon preview state (backed by existing /coupons/apply API)
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponLoading, setCouponLoading] = useState(false);
  const [couponError, setCouponError] = useState("");
  const [couponSuccess, setCouponSuccess] = useState("");

  const loadCart = useCallback(async () => {
    setFetchError("");
    try {
      await dispatch(fetchCart()).unwrap();
    } catch (error) {
      setFetchError(
        getErrorMessage(error, "Unable to load your cart.")
      );
    }
  }, [dispatch]);

  useEffect(() => {
    loadCart();
  }, [loadCart]);

  const totalItems = useMemo(() => {
    return items.reduce((sum, item) => {
      return sum + Math.max(0, getSafeNumber(item?.quantity));
    }, 0);
  }, [items]);

  const { subtotal, totalMrp, hasStockIssue } = useMemo(() => {
    let sub = 0;
    let mrp = 0;
    let stockIssue = false;

    items.forEach((item) => {
      const price = Math.max(0, getSafeNumber(getItemPrice(item)));
      const itemMrp = Math.max(price, getSafeNumber(getItemMrp(item)));
      const quantity = Math.max(0, getSafeNumber(item?.quantity));
      const stock = getSafeNumber(getItemStock(item));

      if (stock <= 0 || quantity > stock) {
        stockIssue = true;
      }

      sub += price * quantity;
      mrp += itemMrp * quantity;
    });

    return {
      subtotal: sub,
      totalMrp: mrp,
      hasStockIssue: stockIssue,
    };
  }, [items]);

  // Clear stale coupon if cart becomes empty
  useEffect(() => {
    if (items.length === 0 && appliedCoupon) {
      setAppliedCoupon(null);
      setCouponCode("");
      setCouponSuccess("");
      setCouponError("");
    }
  }, [items.length, appliedCoupon]);

  const revalidateAppliedCouponIfNeeded = useCallback(
    async (codeToCheck) => {
      if (!codeToCheck) return;
      try {
        const response = await couponService.applyCoupon(codeToCheck);
        const couponData = response?.data || response;
        if (couponData?.coupon) {
          setAppliedCoupon(couponData);
          setCouponError("");
        } else {
          setAppliedCoupon(null);
        }
      } catch (err) {
        setAppliedCoupon(null);
        setCouponSuccess("");
        setCouponError(
          getErrorMessage(
            err,
            "Applied coupon is no longer eligible after cart update."
          )
        );
      }
    },
    []
  );

  const handleQuantityChange = async (item, quantity) => {
    const itemId = item?._id;

    if (!itemId || activeItemId || isClearing || isMutating) {
      return;
    }

    const safeQuantity = Number(quantity);
    if (!Number.isInteger(safeQuantity) || safeQuantity < 1) {
      return;
    }

    const stock = getSafeNumber(getItemStock(item));
    if (safeQuantity > stock) {
      toast.error("Maximum available stock reached.");
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

      toast.success("Cart updated successfully.");

      if (appliedCoupon?.coupon?.code) {
        await revalidateAppliedCouponIfNeeded(appliedCoupon.coupon.code);
      }
    } catch (error) {
      toast.error(getErrorMessage(error, "Failed to update quantity."));
    } finally {
      setActiveItemId("");
    }
  };

  const handleRemove = async (itemId) => {
    if (!itemId || activeItemId || isClearing || isMutating) {
      return;
    }

    setActiveItemId(itemId);

    try {
      const updated = await dispatch(removeCartItem(itemId)).unwrap();
      toast.success("Item removed from cart.");

      const remaining = Array.isArray(updated?.items) ? updated.items : [];
      if (remaining.length > 0 && appliedCoupon?.coupon?.code) {
        await revalidateAppliedCouponIfNeeded(appliedCoupon.coupon.code);
      } else {
        setAppliedCoupon(null);
        setCouponSuccess("");
      }
    } catch (error) {
      toast.error(getErrorMessage(error, "Failed to remove item."));
    } finally {
      setActiveItemId("");
    }
  };

  const handleClear = async () => {
    if (items.length === 0 || isClearing || activeItemId || isMutating) {
      return;
    }

    setIsClearing(true);

    try {
      await dispatch(clearCart()).unwrap();
      setAppliedCoupon(null);
      setCouponCode("");
      setCouponError("");
      setCouponSuccess("");
      toast.success("Cart cleared.");
    } catch (error) {
      toast.error(getErrorMessage(error, "Failed to clear cart."));
    } finally {
      setIsClearing(false);
    }
  };

  const handleApplyCoupon = async (event) => {
    event?.preventDefault();

    const code = couponCode.trim().toUpperCase();
    if (!code) {
      setCouponError("Please enter a promo code.");
      return;
    }

    setCouponLoading(true);
    setCouponError("");
    setCouponSuccess("");

    try {
      const response = await couponService.applyCoupon(code);
      const couponData = response?.data || response;

      if (
        !couponData?.coupon ||
        typeof couponData.discountAmount !== "number" ||
        typeof couponData.finalAmount !== "number"
      ) {
        throw new Error("Invalid coupon response from server.");
      }

      setAppliedCoupon(couponData);
      setCouponCode(couponData.coupon.code);
      setCouponSuccess(
        `Promo ${couponData.coupon.code} verified! Re-enter this code on checkout to redeem.`
      );
      toast.success(`Coupon ${couponData.coupon.code} applied!`);
    } catch (error) {
      setAppliedCoupon(null);
      setCouponSuccess("");
      setCouponError(
        getErrorMessage(error, "Unable to apply promo code.")
      );
    } finally {
      setCouponLoading(false);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode("");
    setCouponError("");
    setCouponSuccess("");
    toast.success("Coupon removed.");
  };

  const totalSavings =
    Math.max(0, totalMrp - subtotal) +
    (appliedCoupon ? Math.max(0, Number(appliedCoupon.discountAmount || 0)) : 0);

  const finalEstimatedTotal = appliedCoupon
    ? Math.max(0, Number(appliedCoupon.finalAmount ?? subtotal))
    : subtotal;

  if (isLoading && items.length === 0) {
    return (
      <main className="min-h-screen w-full bg-[#F8FAFC] pb-24 lg:pb-12">
        <div className="mx-auto w-full max-w-[1440px] px-4 py-5 sm:px-6 sm:py-6 lg:px-8">
          <CartSkeleton />
        </div>
      </main>
    );
  }

  if (fetchError && items.length === 0) {
    return (
      <main className="min-h-screen w-full bg-[#F8FAFC] pb-24 lg:pb-12">
        <div className="mx-auto w-full max-w-[1440px] px-4 py-5 sm:px-6 sm:py-6 lg:px-8">
          <CartError message={fetchError} onRetry={loadCart} />

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
    <main className="min-h-screen w-full bg-[#F8FAFC] pb-40 lg:pb-24 xl:pb-12">
      <div className="mx-auto w-full max-w-[1440px] px-4 py-5 sm:px-6 sm:py-6 lg:px-8">
        <CartHeader totalItems={totalItems} />

        {items.length === 0 ? (
          <EmptyCart />
        ) : (
          <>
            <div className="grid grid-cols-1 items-start gap-5 lg:grid-cols-[minmax(0,1fr)_380px] lg:gap-7">
              <CartItemsList
                items={items}
                activeItemId={activeItemId}
                isMutating={
                  isMutating || Boolean(activeItemId) || isClearing
                }
                onQuantityChange={handleQuantityChange}
                onRemove={handleRemove}
                onClear={handleClear}
              />

              <aside className="lg:sticky lg:top-24">
                <CartOrderSummary
                  subtotal={subtotal}
                  totalMrp={totalMrp}
                  totalItems={totalItems}
                  hasStockIssue={hasStockIssue}
                  isMutating={
                    isMutating || Boolean(activeItemId) || isClearing
                  }
                  couponCode={couponCode}
                  appliedCoupon={appliedCoupon}
                  couponLoading={couponLoading}
                  couponError={couponError}
                  couponSuccess={couponSuccess}
                  onCouponCodeChange={(val) => {
                    setCouponCode(val);
                    if (couponError) setCouponError("");
                  }}
                  onApplyCoupon={handleApplyCoupon}
                  onRemoveCoupon={handleRemoveCoupon}
                />

                <CartTrustInfo />
              </aside>
            </div>

            <CartMobileCheckoutBar
              totalAmount={finalEstimatedTotal}
              totalItems={totalItems}
              savings={totalSavings}
              hasStockIssue={hasStockIssue}
              isMutating={isMutating || Boolean(activeItemId) || isClearing}
            />
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
  );
}
