"use client";

import { ShoppingBag, ShieldCheck, Receipt } from "lucide-react";

import CheckoutCartItems from "./CheckoutCartItems";
import CouponSection from "./CouponSection";
import PriceBreakdown from "./PriceBreakdown";

export default function OrderSummary({
  cartItems = [],
  totalItems = 0,
  subtotal = 0,
  shippingFee = 0,
  discount = 0,
  totalAmount = 0,
  appliedCoupon,
  couponCode = "",
  couponLoading = false,
  couponError = "",
  couponSuccess = "",
  onCouponCodeChange,
  onApplyCoupon,
  onRemoveCoupon,
}) {
  return (
    <aside
      aria-labelledby="checkout-summary-heading"
      className="overflow-hidden rounded-2xl border border-[#E2E8F0] bg-white"
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[#E2E8F0] px-5 py-4">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#EFF6FF] text-[#0755E9]">
            <ShoppingBag size={18} aria-hidden="true" />
          </div>

          <div>
            <h2
              id="checkout-summary-heading"
              className="text-base font-bold text-[#101828]"
            >
              Order Summary
            </h2>
            <p className="text-[11px] text-[#64748B]">
              Review items &amp; payable amount
            </p>
          </div>
        </div>

        <span className="rounded-full border border-[#E2E8F0] bg-[#F8FAFC] px-2.5 py-1 text-xs font-bold text-[#101828] tabular-nums">
          {totalItems} {totalItems === 1 ? "Item" : "Items"}
        </span>
      </div>

      {/* Items List */}
      <div className="p-5">
        <CheckoutCartItems cartItems={cartItems} />
      </div>

      {/* Promo Code */}
      <div className="px-5">
        <CouponSection
          appliedCoupon={appliedCoupon}
          couponCode={couponCode}
          couponLoading={couponLoading}
          couponError={couponError}
          couponSuccess={couponSuccess}
          onCouponCodeChange={onCouponCodeChange}
          onApplyCoupon={onApplyCoupon}
          onRemoveCoupon={onRemoveCoupon}
        />
      </div>

      {/* Price Details */}
      <div className="p-5">
        <div className="mb-3 flex items-center gap-1.5">
          <Receipt size={15} className="text-[#0755E9]" aria-hidden="true" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-[#64748B]">
            Price Breakdown
          </h3>
        </div>

        <PriceBreakdown
          subtotal={subtotal}
          shippingFee={shippingFee}
          discount={discount}
          totalAmount={totalAmount}
        />
      </div>

      <div className="mx-5 mb-5 flex items-start gap-2 rounded-xl border border-[#E2E8F0] bg-[#EFF6FF]/70 p-3">
        <ShieldCheck
          size={15}
          className="mt-0.5 shrink-0 text-[#0755E9]"
          aria-hidden="true"
        />
        <p className="text-[11px] leading-relaxed text-[#64748B]">
          Product stock, coupon validity, and order totals are verified directly by ELENZO before order placement.
        </p>
      </div>
    </aside>
  );
}
