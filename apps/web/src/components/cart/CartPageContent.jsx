
"use client";

import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "sonner";

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

export default function CartPageContent() {
  const dispatch = useDispatch();

  const {
    items = [],
    isLoading = false,
    isMutating = false,
  } = useSelector((state) => state.cart || {});

  // Fetch cart
  useEffect(() => {
    dispatch(fetchCart());
  }, [dispatch]);

  // Total quantity
  const totalItems = items.reduce(
    (sum, item) =>
      sum + Number(item?.quantity || 0),
    0
  );

  // Subtotal
  const subtotal = items.reduce(
    (sum, item) =>
      sum +
      getItemPrice(item) * Number(item?.quantity || 0),
    0
  );

  // Get error message from thunk
  const getErrorMessage = (error, fallback) => {
    if (typeof error === "string") return error;

    return (
      error?.message ||
      error?.error ||
      error?.data?.message ||
      fallback
    );
  };

  // Update quantity
  const handleQuantityChange = async (item, quantity) => {
    const stock = getItemStock(item);

    if (quantity < 1) return;

    if (quantity > stock) {
      toast.error("Maximum available stock reached");
      return;
    }

    try {
      await dispatch(
        updateCartItem({
          itemId: item._id,
          quantity,
        })
      ).unwrap();

      toast.success("Cart updated successfully");
    } catch (error) {
      toast.error(
        getErrorMessage(error, "Failed to update cart")
      );
    }
  };

  // Remove product
  const handleRemove = async (itemId) => {
    try {
      await dispatch(removeCartItem(itemId)).unwrap();

      toast.success("Product removed from cart");
    } catch (error) {
      toast.error(
        getErrorMessage(error, "Failed to remove product")
      );
    }
  };

  // Clear cart
  const handleClear = async () => {
    if (
      !window.confirm(
        "Are you sure you want to remove all items from your cart?"
      )
    ) {
      return;
    }

    try {
      await dispatch(clearCart()).unwrap();

      toast.success("Cart cleared successfully");
    } catch (error) {
      toast.error(
        getErrorMessage(error, "Failed to clear cart")
      );
    }
  };

  return (
    <main className="min-h-screen lg:pb-12">
      <div className="mx-auto w-full px-4 py-6 sm:px-6 lg:px-8 lg:py-10">

        {/* Cart Header */}
        <CartHeader totalItems={totalItems} />

        {/* Cart Loading */}
        {isLoading && items.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 bg-white py-24 text-center">
            <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-slate-200 border-t-[#0755e9]" />

            <p className="mt-4 text-sm text-slate-500">
              Loading your cart...
            </p>
          </div>
        ) : items.length === 0 ? (

          /* Empty Cart */
          <EmptyCart />

        ) : (

          /* Cart Content */
          <>
            <div className="grid grid-cols-1 items-start gap-5 lg:grid-cols-[minmax(0,1fr)_360px] lg:gap-7">

              {/* Cart Products */}
              <CartItemsList
                items={items}
                isMutating={isMutating}
                onQuantityChange={handleQuantityChange}
                onRemove={handleRemove}
                onClear={handleClear}
              />

              {/* Order Summary */}
              <aside className="lg:sticky lg:top-24">
                <CartOrderSummary
                  subtotal={subtotal}
                  totalItems={totalItems}
                />

                <CartTrustInfo />
              </aside>
            </div>

            {/* Mobile Checkout */}
            <CartMobileCheckoutBar
              subtotal={subtotal}
              totalItems={totalItems}
            />
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
    </main>
  );
}
