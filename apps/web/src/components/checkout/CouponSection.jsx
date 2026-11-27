"use client";

import {
  TicketPercent,
  CheckCircle2,
  XCircle,
  Tag,
  X,
  LoaderCircle,
} from "lucide-react";

export default function CouponSection({
  appliedCoupon,
  couponCode = "",
  couponLoading = false,
  couponError = "",
  couponSuccess = "",
  onCouponCodeChange,
  onApplyCoupon,
  onRemoveCoupon,
}) {
  const appliedCode =
    appliedCoupon?.coupon?.code || appliedCoupon?.code || couponCode;

  return (
    <div className="border-y border-[#E2E8F0] py-4">
      <div className="mb-2.5 flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 text-xs font-bold text-[#101828]">
          <TicketPercent size={15} className="text-[#0755E9]" aria-hidden="true" />
          <span>Promo Code</span>
        </div>

        {!appliedCoupon && (
          <span className="text-[11px] text-[#64748B]">Optional</span>
        )}
      </div>

      {appliedCoupon ? (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50/80 p-3">
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
                    {appliedCode}
                  </span>
                  <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-700">
                    Applied
                  </span>
                </div>
                <p className="mt-0.5 text-[11px] text-emerald-700">
                  {couponSuccess || "Discount applied to this order."}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onRemoveCoupon}
              disabled={couponLoading}
              aria-label="Remove coupon"
              className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-emerald-700 transition hover:bg-emerald-100 hover:text-red-600 disabled:opacity-50"
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
                disabled={couponLoading}
                aria-label="Coupon code"
                className="h-10 w-full rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] pl-8.5 pr-3 text-xs font-semibold uppercase tracking-wide text-[#101828] outline-none transition placeholder:font-normal placeholder:normal-case placeholder:tracking-normal placeholder:text-slate-400 focus:border-[#0755E9] focus:bg-white focus:ring-2 focus:ring-[#0755E9]/15 disabled:opacity-55"
              />
            </div>

            <button
              type="submit"
              disabled={couponLoading || !couponCode.trim()}
              className="inline-flex h-10 shrink-0 items-center justify-center gap-1.5 rounded-xl border border-[#0755E9] bg-[#EFF6FF] px-4 text-xs font-bold text-[#0755E9] transition hover:bg-[#0755E9] hover:text-white disabled:cursor-not-allowed disabled:border-[#E2E8F0] disabled:bg-slate-100 disabled:text-slate-400"
            >
              {couponLoading ? (
                <>
                  <LoaderCircle size={13} className="animate-spin" />
                  <span>Applying</span>
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
  );
}
