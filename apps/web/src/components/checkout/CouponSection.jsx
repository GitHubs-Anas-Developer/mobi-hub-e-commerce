
"use client";

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
  return (
    <div className="border-b border-slate-200 pb-5">
      <h3 className="mb-3 text-sm font-semibold text-slate-900">
        Apply Coupon
      </h3>

      {appliedCoupon ? (
        <div className="flex items-center justify-between gap-3 rounded-lg border border-green-200 bg-green-50 p-3">
          <div className="min-w-0">
            <p className="text-sm font-semibold text-green-700">
              {appliedCoupon.coupon?.code ||
                appliedCoupon.code ||
                couponCode}
            </p>

            <p className="mt-1 text-xs text-green-600">
              Coupon applied successfully!
            </p>
          </div>

          <button
            type="button"
            onClick={onRemoveCoupon}
            className="shrink-0 text-sm font-semibold text-red-600 hover:text-red-700"
          >
            Remove
          </button>
        </div>
      ) : (
        <form
          onSubmit={onApplyCoupon}
          className="flex gap-2"
        >
          <input
            type="text"
            value={couponCode}
            onChange={(event) =>
              onCouponCodeChange?.(event.target.value.toUpperCase())
            }
            placeholder="Enter coupon code"
            disabled={couponLoading}
            className="min-w-0 flex-1 rounded-lg border border-slate-300 px-3 py-2.5 text-sm uppercase outline-none transition focus:border-blue-600 focus:ring-2 focus:ring-blue-100 disabled:bg-slate-100"
          />

          <button
            type="submit"
            disabled={couponLoading || !couponCode.trim()}
            className="rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {couponLoading ? "Applying..." : "Apply"}
          </button>
        </form>
      )}

      {couponError && (
        <p className="mt-2 text-sm text-red-600">
          {couponError}
        </p>
      )}

      {couponSuccess && (
        <p className="mt-2 text-sm text-green-600">
          {couponSuccess}
        </p>
      )}
    </div>
  );
}
