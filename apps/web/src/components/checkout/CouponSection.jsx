
"use client";

import { motion, AnimatePresence } from "framer-motion";
import {
  TicketPercent,
  CheckCircle2,
  XCircle,
  Tag,
  ArrowRight,
  X,
  Sparkles,
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
    appliedCoupon?.coupon?.code ||
    appliedCoupon?.code ||
    couponCode;

  return (
    <div className="border-b border-slate-100 pb-5">
      {/* Section Heading */}
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-[#0755E9]">
            <TicketPercent size={19} />
          </div>

          <div>
            <h3 className="text-sm font-bold text-[#101828]">
              Offers & Coupons
            </h3>
            <p className="mt-0.5 text-[11px] text-slate-500">
              Save more on your order
            </p>
          </div>
        </div>

        {!appliedCoupon && (
          <span className="flex items-center gap-1 rounded-full bg-blue-50 px-2.5 py-1 text-[10px] font-semibold text-[#0755E9]">
            <Sparkles size={11} />
            Offers
          </span>
        )}
      </div>

      {/* Applied Coupon */}
      <AnimatePresence mode="wait">
        {appliedCoupon ? (
          <motion.div
            key="applied"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="relative overflow-hidden rounded-xl border border-green-200 bg-green-50/70 p-3.5"
          >
            <div className="flex items-center justify-between gap-3">
              <div className="flex min-w-0 items-start gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-green-100 text-green-600">
                  <CheckCircle2 size={20} />
                </div>

                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="truncate text-sm font-bold tracking-wide text-green-800">
                      {appliedCode}
                    </p>

                    <span className="rounded-full bg-green-100 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide text-green-700">
                      Applied
                    </span>
                  </div>

                  <p className="mt-1 text-xs text-green-700">
                    Coupon applied successfully!
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={onRemoveCoupon}
                disabled={couponLoading}
                aria-label="Remove coupon"
                className="flex shrink-0 items-center gap-1 rounded-lg px-2 py-2 text-xs font-semibold text-red-600 transition hover:bg-red-50 hover:text-red-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <X size={14} />
                Remove
              </button>
            </div>
          </motion.div>
        ) : (
          <motion.form
            key="form"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            onSubmit={onApplyCoupon}
            className="space-y-2.5"
          >
            <div className="flex gap-2">
              {/* Coupon Input */}
              <div className="relative min-w-0 flex-1">
                <Tag
                  size={16}
                  className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                />

                <input
                  type="text"
                  value={couponCode}
                  onChange={(event) =>
                    onCouponCodeChange?.(
                      event.target.value.toUpperCase()
                    )
                  }
                  placeholder="Enter coupon code"
                  disabled={couponLoading}
                  aria-label="Coupon code"
                  className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-9 pr-3 text-sm font-semibold uppercase tracking-wider text-[#101828] outline-none transition placeholder:font-normal placeholder:tracking-normal placeholder:text-slate-400 hover:border-slate-300 focus:border-[#0755E9] focus:ring-4 focus:ring-blue-50 disabled:cursor-not-allowed disabled:bg-slate-50"
                />
              </div>

              {/* Apply Button */}
              <button
                type="submit"
                disabled={couponLoading || !couponCode.trim()}
                className="inline-flex shrink-0 items-center justify-center gap-1.5 rounded-xl bg-[#0755E9] px-4 py-3 text-sm font-bold text-white transition hover:bg-[#0645C4] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {couponLoading ? (
                  <>
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                    <span className="hidden sm:inline">
                      Applying
                    </span>
                  </>
                ) : (
                  <>
                    Apply
                    <ArrowRight size={15} />
                  </>
                )}
              </button>
            </div>

            <p className="text-[11px] text-slate-400">
              Enter a valid coupon code to unlock available discounts.
            </p>
          </motion.form>
        )}
      </AnimatePresence>

      {/* Coupon Error */}
      <AnimatePresence>
        {couponError && (
          <motion.div
            initial={{ opacity: 0, height: 0, y: -5 }}
            animate={{ opacity: 1, height: "auto", y: 0 }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-3 flex items-start gap-2 overflow-hidden rounded-lg border border-red-100 bg-red-50 p-3"
            role="alert"
          >
            <XCircle
              size={16}
              className="mt-0.5 shrink-0 text-red-500"
            />

            <p className="text-xs font-medium leading-5 text-red-600">
              {couponError}
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Coupon Success */}
      <AnimatePresence>
        {couponSuccess && !appliedCoupon && (
          <motion.div
            initial={{ opacity: 0, height: 0, y: -5 }}
            animate={{ opacity: 1, height: "auto", y: 0 }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-3 flex items-start gap-2 overflow-hidden rounded-lg border border-green-100 bg-green-50 p-3"
            role="status"
          >
            <CheckCircle2
              size={16}
              className="mt-0.5 shrink-0 text-green-600"
            />

            <p className="text-xs font-medium leading-5 text-green-700">
              {couponSuccess}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
