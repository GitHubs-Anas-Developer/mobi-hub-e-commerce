
"use client";

import Link from "next/link";

import {
  ArrowRight,
  LockKeyhole,
  ShoppingBag,
} from "lucide-react";

import { formatPrice } from "./cart.utils";

// ========================================
// CART ORDER SUMMARY
// ========================================

export default function CartOrderSummary({
  subtotal = 0,
  totalItems = 0,
}) {
  // ========================================
  // SAFE VALUES
  // ========================================

  const safeSubtotal = Math.max(
    0,
    Number.isFinite(Number(subtotal))
      ? Number(subtotal)
      : 0
  );

  const safeTotalItems = Math.max(
    0,
    Number.isFinite(Number(totalItems))
      ? Number(totalItems)
      : 0
  );

  const isCartEmpty = safeTotalItems === 0;

  // ========================================
  // RENDER
  // ========================================

  return (
    <section
      aria-labelledby="order-summary-heading"
      className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6"
    >
      {/* HEADER */}

      <div>
        <div className="flex items-center gap-2">
          <ShoppingBag
            size={19}
            className="text-[#0755e9]"
          />

          <h2
            id="order-summary-heading"
            className="text-lg font-bold text-[#101828]"
          >
            Order Summary
          </h2>
        </div>

        <p className="mt-1 text-xs text-slate-400">
          Review your order details
        </p>
      </div>

      {/* PRICE DETAILS */}

      <div className="mt-6 space-y-4 border-b border-slate-100 pb-5">

        {/* SUBTOTAL */}

        <div className="flex justify-between gap-3 text-sm">
          <span className="text-slate-500">
            Subtotal ({safeTotalItems}{" "}
            {safeTotalItems === 1 ? "item" : "items"})
          </span>

          <span className="font-semibold text-slate-800">
            {formatPrice(safeSubtotal)}
          </span>
        </div>

        {/* SHIPPING */}

        <div className="flex items-start justify-between gap-3 text-sm">
          <span className="text-slate-500">
            Shipping
          </span>

          <span className="max-w-[150px] text-right text-xs font-semibold leading-relaxed text-slate-500">
            Calculated at checkout
          </span>
        </div>

        {/* DISCOUNT */}

        <div className="flex justify-between gap-3 text-sm">
          <span className="text-slate-500">
            Discount
          </span>

          <span className="font-medium text-slate-400">
            —
          </span>
        </div>
      </div>

      {/* ESTIMATED TOTAL */}

      <div className="flex items-center justify-between gap-3 py-5">
        <div>
          <span className="text-sm font-bold text-[#101828]">
            Estimated Total
          </span>

          <p className="mt-1 text-[10px] text-slate-400">
            Excluding shipping and discounts
          </p>
        </div>

        <span className="text-xl font-extrabold tracking-tight text-[#101828]">
          {formatPrice(safeSubtotal)}
        </span>
      </div>

      {/* CHECKOUT BUTTON */}

      {isCartEmpty ? (
        <button
          type="button"
          disabled
          className="flex min-h-12 w-full cursor-not-allowed items-center justify-center gap-2 rounded-xl bg-slate-200 px-4 py-3 text-sm font-bold text-slate-400"
        >
          Your Cart Is Empty
        </button>
      ) : (
        <Link
          href="/checkout"
          className="
            flex min-h-12 w-full
            items-center justify-center gap-2
            rounded-xl bg-[#0755e9]
            px-4 py-3 text-sm font-bold text-white
            shadow-sm
            transition-all duration-200
            hover:bg-[#0645c4]
            hover:shadow-md
            focus-visible:outline-none
            focus-visible:ring-2
            focus-visible:ring-[#0755e9]
            focus-visible:ring-offset-2
            active:scale-[0.99]
          "
        >
          Proceed to Checkout

          <ArrowRight size={17} />
        </Link>
      )}

      {/* SECURITY INFO */}

      <div className="mt-4 flex items-center justify-center gap-2 text-[11px] font-medium text-slate-400">
        <LockKeyhole
          size={13}
          className="text-green-600"
        />

        Secure checkout
      </div>

      {/* CHECKOUT NOTE */}

      <p className="mt-3 text-center text-[10px] leading-relaxed text-slate-400">
        Final shipping charges and order total will be
        confirmed during checkout.
      </p>
    </section>
  );
}
