
"use client";

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
    <aside className="h-fit rounded-xl border border-slate-200 bg-white p-6">
      {/* Header */}
      <div>
        <h2 className="text-lg font-semibold text-slate-900">
          Order Summary
        </h2>

        <p className="mt-1 text-sm text-slate-500">
          {totalItems} items in your cart
        </p>
      </div>

      {/* Cart Items */}
      <div className="mt-5">
        <CheckoutCartItems cartItems={cartItems} />
      </div>

      {/* Coupon Section */}
      <div className="mt-5 border-b border-slate-200 pb-5">
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
      <div className="mt-5">
        <PriceBreakdown
          subtotal={subtotal}
          shippingFee={shippingFee}
          discount={discount}
          totalAmount={totalAmount}
        />
      </div>

      {/* Server Validation Notice */}
      <p className="mt-4 text-xs leading-5 text-slate-500">
        Final order amount, coupon eligibility, stock availability
        and shipping charges will be validated by the server when
        the order is placed.
      </p>
    </aside>
  );
}
