
"use client";

import { motion } from "framer-motion";

import {
  ShoppingBag,
  Package,
  ShieldCheck,
  Receipt,
  Tag,
} from "lucide-react";

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
    <aside className="h-fit overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-100 px-5 py-5">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-[#0755E9]">
            <ShoppingBag size={20} />
          </div>

          <div>
            <h2 className="text-base font-bold text-[#101828]">
              Order Summary
            </h2>

            <p className="mt-1 text-xs text-slate-500">
              Review your order details
            </p>
          </div>
        </div>

        <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1.5 text-xs font-bold text-[#0755E9]">
          <Package size={13} />
          {totalItems} Items
        </span>
      </div>

      {/* Cart Items */}
      <div className="p-4 sm:p-5">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-sm font-bold text-[#101828]">
            Your Products
          </h3>

          <span className="text-xs text-slate-400">
            {cartItems.length} Products
          </span>
        </div>

        <CheckoutCartItems cartItems={cartItems} />
      </div>

      {/* Coupon Section */}
      <div className="px-4 sm:px-5">
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

      {/* Price Breakdown */}
      <div className="p-4 sm:p-5">
        <div className="mb-4 flex items-center gap-2">
          <Receipt size={17} className="text-[#0755E9]" />

          <h3 className="text-sm font-bold text-[#101828]">
            Price Details
          </h3>
        </div>

        <PriceBreakdown
          subtotal={subtotal}
          shippingFee={shippingFee}
          discount={discount}
          totalAmount={totalAmount}
        />
      </div>

      {/* Server Validation Notice */}
      <div className="mx-4 mb-4 flex items-start gap-2.5 rounded-xl border border-blue-100 bg-blue-50/70 p-3 sm:mx-5 sm:mb-5">
        <ShieldCheck
          size={17}
          className="mt-0.5 shrink-0 text-[#0755E9]"
        />

        <p className="text-[11px] leading-5 text-slate-600">
          Final order amount, coupon eligibility, stock availability
          and shipping charges will be validated securely by the
          server when your order is placed.
        </p>
      </div>
    </aside>
  );
}
