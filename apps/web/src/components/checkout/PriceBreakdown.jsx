"use client";

import { ShoppingBag, Truck, Tag, Receipt, CheckCircle2 } from "lucide-react";

const formatPrice = (amount) =>
  `₹${Number(amount || 0).toLocaleString("en-IN", {
    maximumFractionDigits: 2,
  })}`;

export default function PriceBreakdown({
  subtotal = 0,
  shippingFee = 0,
  discount = 0,
  totalAmount = 0,
}) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-3 text-xs sm:text-sm">
        <span className="flex items-center gap-2 text-[#64748B]">
          <ShoppingBag size={14} className="text-[#64748B]" aria-hidden="true" />
          Subtotal
        </span>

        <span className="font-semibold text-[#101828] tabular-nums">
          {formatPrice(subtotal)}
        </span>
      </div>

      <div className="flex items-center justify-between gap-3 text-xs sm:text-sm">
        <span className="flex items-center gap-2 text-[#64748B]">
          <Truck size={14} className="text-[#64748B]" aria-hidden="true" />
          Shipping Fee
        </span>

        {Number(shippingFee) === 0 ? (
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-[11px] font-bold text-emerald-700">
            <CheckCircle2 size={11} aria-hidden="true" />
            Free
          </span>
        ) : (
          <span className="font-semibold text-[#101828] tabular-nums">
            {formatPrice(shippingFee)}
          </span>
        )}
      </div>

      {Number(discount) > 0 && (
        <div className="flex items-center justify-between gap-3 text-xs sm:text-sm">
          <span className="flex items-center gap-2 text-emerald-700">
            <Tag size={14} className="text-emerald-600" aria-hidden="true" />
            Coupon Discount
          </span>

          <span className="font-bold text-emerald-600 tabular-nums">
            -{formatPrice(discount)}
          </span>
        </div>
      )}

      <div className="border-t border-dashed border-[#E2E8F0] pt-3.5">
        <div className="flex items-baseline justify-between gap-3">
          <div>
            <p className="text-sm font-bold text-[#101828]">Payable Total</p>
            <p className="mt-0.5 text-[11px] text-[#64748B]">
              Final amount validated on order confirmation
            </p>
          </div>

          <p className="text-xl font-extrabold tracking-tight text-[#0755E9] tabular-nums sm:text-2xl">
            {formatPrice(totalAmount)}
          </p>
        </div>
      </div>

      {Number(discount) > 0 && (
        <div className="flex items-center gap-2 rounded-xl border border-emerald-100 bg-emerald-50/75 px-3 py-2 text-xs font-semibold text-emerald-700 tabular-nums">
          <Receipt size={14} className="shrink-0" aria-hidden="true" />
          <span>You are saving {formatPrice(discount)} on this order.</span>
        </div>
      )}
    </div>
  );
}
