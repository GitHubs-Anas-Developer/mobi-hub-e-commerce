"use client";

import Link from "next/link";
import {
  ArrowRight,
  LockKeyhole,
  ShoppingBag,
  TicketPercent,
  Tag,
  CheckCircle2,
  XCircle,
  X,
  LoaderCircle,
  AlertTriangle,
} from "lucide-react";

import { formatPrice } from "./cart.utils";

export default function CartOrderSummary({
  subtotal = 0,
  totalMrp = 0,
  totalItems = 0,
  hasStockIssue = false,
  isMutating = false,
  couponCode = "",
  appliedCoupon = null,
  couponLoading = false,
  couponError = "",
  couponSuccess = "",
  onCouponCodeChange,
  onApplyCoupon,
  onRemoveCoupon,
}) {
  const safeSubtotal = Math.max(
    0,
    Number.isFinite(Number(subtotal)) ? Number(subtotal) : 0
  );

  const safeMrpTotal = Math.max(
    safeSubtotal,
    Number.isFinite(Number(totalMrp)) ? Number(totalMrp) : safeSubtotal
  );

  const productSavings = Math.max(0, safeMrpTotal - safeSubtotal);

  const safeTotalItems = Math.max(
    0,
    Number.isFinite(Number(totalItems)) ? Math.floor(Number(totalItems)) : 0
  );

  const couponDiscount = appliedCoupon
    ? Math.max(0, Number(appliedCoupon.discountAmount || 0))
    : 0;

  const finalTotal = appliedCoupon
    ? Math.max(0, Number(appliedCoupon.finalAmount ?? safeSubtotal - couponDiscount))
    : safeSubtotal;

  const isCartEmpty = safeTotalItems === 0;
  const isCheckoutBlocked = isCartEmpty || hasStockIssue || isMutating;

  return (
    <section
      aria-labelledby="order-summary-heading"
      className="rounded-2xl border border-[#E2E8F0] bg-white p-5 sm:p-6"
    >
      {/* Header */}
      <div className="flex items-center justify-between gap-3 border-b border-[#E2E8F0] pb-4">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#EFF6FF] text-[#0755E9]">
            <ShoppingBag size={18} aria-hidden="true" />
          </div>

          <div>
            <h2
              id="order-summary-heading"
              className="text-base font-bold tracking-tight text-[#101828]"
            >
              Order Summary
            </h2>
            <p className="text-[11px] text-[#64748B]">
              Verified pricing &amp; promo eligibility
            </p>
          </div>
        </div>

        <span className="rounded-full border border-[#E2E8F0] bg-[#F8FAFC] px-2.5 py-1 text-xs font-bold text-[#101828] tabular-nums">
          {safeTotalItems} {safeTotalItems === 1 ? "item" : "items"}
        </span>
      </div>

      {/* Coupon Code Section (using real backend couponService.applyCoupon) */}
      <div className="border-b border-[#E2E8F0] py-4">
        <div className="mb-2.5 flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 text-xs font-bold text-[#101828]">
            <TicketPercent size={15} className="text-[#0755E9]" aria-hidden="true" />
            <span>Promo Code</span>
          </div>

          {!appliedCoupon && (
            <span className="text-[11px] font-medium text-[#64748B]">
              Optional
            </span>
          )}
        </div>

        {appliedCoupon ? (
          <div className="rounded-xl border border-emerald-200 bg-emerald-50/75 p-3">
            <div className="flex items-start justify-between gap-2">
              <div className="flex min-w-0 items-start gap-2">
                <CheckCircle2
                  size={16}
                  className="mt-0.5 shrink-0 text-emerald-600"
                  aria-hidden="true"
                />
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="text-xs font-bold tracking-wide text-emerald-900">
                      {appliedCoupon?.coupon?.code || couponCode}
                    </span>
                    <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-700">
                      -{formatPrice(couponDiscount)}
                    </span>
                  </div>
                  <p className="mt-0.5 text-[11px] text-emerald-700">
                    {couponSuccess ||
                      "Verified for your cart. Enter this code on the checkout step to redeem."}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={onRemoveCoupon}
                aria-label="Remove coupon"
                className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-emerald-700 transition hover:bg-emerald-100 hover:text-red-600"
              >
                <X size={14} />
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={onApplyCoupon} className="space-y-2">
            <div className="flex gap-2">
              <div className="relative min-w-0 flex-1">
                <Tag
                  size={14}
                  className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#64748B]"
                  aria-hidden="true"
                />
                <input
                  type="text"
                  value={couponCode}
                  onChange={(event) =>
                    onCouponCodeChange?.(event.target.value.toUpperCase())
                  }
                  placeholder="Enter coupon code"
                  disabled={couponLoading || isCartEmpty}
                  aria-label="Coupon code"
                  className="h-10 w-full rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] pl-8.5 pr-3 text-xs font-semibold uppercase tracking-wide text-[#101828] outline-none transition placeholder:normal-case placeholder:tracking-normal placeholder:font-normal placeholder:text-slate-400 focus:border-[#0755E9] focus:bg-white focus:ring-2 focus:ring-[#0755E9]/15 disabled:cursor-not-allowed disabled:opacity-50"
                />
              </div>

              <button
                type="submit"
                disabled={couponLoading || isCartEmpty || !couponCode.trim()}
                className="inline-flex h-10 shrink-0 items-center justify-center gap-1.5 rounded-xl border border-[#0755E9] bg-[#EFF6FF] px-4 text-xs font-bold text-[#0755E9] transition hover:bg-[#0755E9] hover:text-white disabled:cursor-not-allowed disabled:border-[#E2E8F0] disabled:bg-slate-100 disabled:text-slate-400"
              >
                {couponLoading ? (
                  <>
                    <LoaderCircle size={13} className="animate-spin" />
                    <span>Checking</span>
                  </>
                ) : (
                  <span>Apply</span>
                )}
              </button>
            </div>

            {couponError && (
              <p
                role="alert"
                className="flex items-center gap-1.5 text-[11px] font-semibold text-red-600"
              >
                <XCircle size={13} className="shrink-0" aria-hidden="true" />
                <span>{couponError}</span>
              </p>
            )}
          </form>
        )}
      </div>

      {/* Price Breakdown */}
      <div className="space-y-3 border-b border-[#E2E8F0] py-4">
        {productSavings > 0 && (
          <div className="flex items-center justify-between gap-3 text-xs sm:text-sm">
            <span className="text-[#64748B]">Total MRP</span>
            <span className="font-medium text-[#64748B] line-through tabular-nums">
              {formatPrice(safeMrpTotal)}
            </span>
          </div>
        )}

        <div className="flex items-center justify-between gap-3 text-xs sm:text-sm">
          <span className="text-[#64748B]">
            Subtotal ({safeTotalItems}{" "}
            {safeTotalItems === 1 ? "item" : "items"})
          </span>
          <span className="font-semibold text-[#101828] tabular-nums">
            {formatPrice(safeSubtotal)}
          </span>
        </div>

        {productSavings > 0 && (
          <div className="flex items-center justify-between gap-3 text-xs sm:text-sm">
            <span className="text-emerald-700">Product Discount</span>
            <span className="font-bold text-emerald-600 tabular-nums">
              -{formatPrice(productSavings)}
            </span>
          </div>
        )}

        {couponDiscount > 0 && (
          <div className="flex items-center justify-between gap-3 text-xs sm:text-sm">
            <span className="text-emerald-700">
              Coupon ({appliedCoupon?.coupon?.code})
            </span>
            <span className="font-bold text-emerald-600 tabular-nums">
              -{formatPrice(couponDiscount)}
            </span>
          </div>
        )}

        <div className="flex items-center justify-between gap-3 text-xs sm:text-sm">
          <span className="text-[#64748B]">Shipping Fee</span>
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-[11px] font-bold text-emerald-700">
            Free
          </span>
        </div>
      </div>

      {/* Final Estimated Total */}
      <div className="py-4">
        <div className="flex items-baseline justify-between gap-3">
          <div>
            <span className="text-sm font-bold text-[#101828]">
              Estimated Total
            </span>
            <p className="mt-0.5 text-[11px] text-[#64748B]">
              Final total verified at checkout
            </p>
          </div>

          <span className="text-xl font-extrabold tracking-tight text-[#101828] tabular-nums sm:text-2xl">
            {formatPrice(finalTotal)}
          </span>
        </div>

        {productSavings + couponDiscount > 0 && (
          <div className="mt-2.5 rounded-xl border border-emerald-100 bg-emerald-50/70 px-3 py-2 text-center text-[11px] font-semibold text-emerald-700 tabular-nums">
            Total savings on this cart: {formatPrice(productSavings + couponDiscount)}
          </div>
        )}
      </div>

      {/* Stock Warning */}
      {hasStockIssue && (
        <div
          role="alert"
          className="mb-4 flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800"
        >
          <AlertTriangle size={15} className="mt-0.5 shrink-0" aria-hidden="true" />
          <span>
            One or more items exceed available stock or are out of stock. Update or remove them before checking out.
          </span>
        </div>
      )}

      {/* Primary Checkout CTA */}
      {isCheckoutBlocked ? (
        <button
          type="button"
          disabled
          className="flex min-h-12 w-full cursor-not-allowed items-center justify-center gap-2 rounded-xl bg-slate-200 px-4 py-3 text-sm font-bold text-slate-400"
        >
          {isCartEmpty
            ? "Your Cart Is Empty"
            : hasStockIssue
              ? "Resolve Stock Issues First"
              : "Updating Cart..."}
        </button>
      ) : (
        <Link
          href="/checkout"
          className="flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#0755E9] px-4 py-3 text-sm font-bold text-white shadow-xs transition hover:bg-[#082B70] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0755E9] focus-visible:ring-offset-2 active:scale-[0.99]"
        >
          <LockKeyhole size={15} aria-hidden="true" />
          <span>Proceed to Checkout</span>
          <ArrowRight size={16} aria-hidden="true" />
        </Link>
      )}

      <Link
        href="/products"
        className="mt-3 flex h-10 w-full items-center justify-center rounded-xl border border-[#E2E8F0] bg-white px-4 text-xs font-bold text-[#101828] transition hover:border-[#0755E9]/40 hover:bg-[#EFF6FF] hover:text-[#0755E9]"
      >
        Continue Shopping
      </Link>

      <div className="mt-4 flex items-center justify-center gap-1.5 text-[11px] font-medium text-[#64748B]">
        <LockKeyhole size={13} className="text-emerald-600" aria-hidden="true" />
        <span>256-bit SSL Encrypted Checkout</span>
      </div>
    </section>
  );
}
