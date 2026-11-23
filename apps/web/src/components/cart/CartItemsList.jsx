
"use client";

import Link from "next/link";

import {
  ArrowLeft,
  ShoppingCart,
} from "lucide-react";

import CartItemCard from "./CartItemCard";

// ========================================
// HELPERS
// ========================================

function getSafeQuantity(quantity) {
  const value = Number(quantity);

  return Number.isFinite(value) && value > 0
    ? value
    : 0;
}

// ========================================
// CART ITEMS LIST
// ========================================

export default function CartItemsList({
  items = [],
  isMutating = false,
  onQuantityChange,
  onRemove,
  onClear,
}) {
  // ========================================
  // SAFE ITEMS
  // ========================================

  const cartItems = Array.isArray(items)
    ? items.filter((item) => item?._id)
    : [];

  // ========================================
  // TOTAL QUANTITY
  // ========================================

  const totalItems = cartItems.reduce(
    (sum, item) =>
      sum + getSafeQuantity(item?.quantity),
    0
  );

  // ========================================
  // RENDER
  // ========================================

  return (
    <section
      aria-labelledby="cart-products-heading"
      className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
    >
      {/* ==================================
          HEADER
      ================================== */}

      <div className="flex items-center justify-between gap-3 border-b border-slate-100 px-4 py-4 sm:px-6">
        <div>
          <h2
            id="cart-products-heading"
            className="text-base font-bold text-[#101828] sm:text-lg"
          >
            Your Products
          </h2>

          <p
            aria-live="polite"
            className="mt-0.5 text-xs text-slate-400"
          >
            {totalItems}{" "}
            {totalItems === 1 ? "item" : "items"}{" "}
            selected
          </p>
        </div>

        {/* CLEAR CART */}

        <button
          type="button"
          onClick={onClear}
          disabled={
            isMutating || cartItems.length === 0
          }
          className="
            shrink-0 rounded-lg px-2 py-2
            text-xs font-semibold text-slate-500
            transition-colors
            hover:bg-red-50 hover:text-red-600
            focus-visible:outline-none
            focus-visible:ring-2
            focus-visible:ring-red-500
            disabled:cursor-not-allowed
            disabled:opacity-40
          "
        >
          Clear Cart
        </button>
      </div>

      {/* ==================================
          CART PRODUCTS
      ================================== */}

      <div className="px-4 sm:px-6">
        {cartItems.length > 0 ? (
          cartItems.map((item) => (
            <CartItemCard
              key={item._id}
              item={item}
              isMutating={isMutating}
              onQuantityChange={onQuantityChange}
              onRemove={onRemove}
            />
          ))
        ) : (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-slate-100">
              <ShoppingCart
                size={25}
                className="text-slate-400"
              />
            </div>

            <h3 className="mt-4 text-sm font-bold text-slate-800">
              Your cart is empty
            </h3>

            <p className="mt-1 text-xs text-slate-500">
              Add products to continue shopping.
            </p>
          </div>
        )}
      </div>

      {/* ==================================
          FOOTER
      ================================== */}

      <div className="border-t border-slate-100 bg-slate-50/70 px-4 py-3 sm:px-6">
        <Link
          href="/products"
          className="
            inline-flex min-h-9 items-center gap-2
            rounded-md text-xs font-semibold
            text-[#0755e9]
            transition-colors
            hover:text-[#0645c4]
            hover:underline
            focus-visible:outline-none
            focus-visible:ring-2
            focus-visible:ring-[#0755e9]
            focus-visible:ring-offset-2
          "
        >
          <ArrowLeft size={14} />
          Add more products
        </Link>
      </div>
    </section>
  );
}
