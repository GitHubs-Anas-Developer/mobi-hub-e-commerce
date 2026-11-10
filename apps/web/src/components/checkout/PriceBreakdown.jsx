
"use client";

const formatPrice = (amount) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(Number(amount) || 0);

export default function PriceBreakdown({
  subtotal = 0,
  shippingFee = 0,
  discount = 0,
  totalAmount = 0,
}) {
  return (
    <div className="space-y-3">
      {/* Subtotal */}
      <div className="flex justify-between text-sm text-slate-600">
        <span>Subtotal</span>
        <span className="font-medium text-slate-900">
          {formatPrice(subtotal)}
        </span>
      </div>

      {/* Shipping */}
      <div className="flex justify-between text-sm text-slate-600">
        <span>Shipping Fee</span>
        <span className="font-medium text-slate-900">
          {Number(shippingFee) === 0
            ? "Free"
            : formatPrice(shippingFee)}
        </span>
      </div>

      {/* Discount */}
      {Number(discount) > 0 && (
        <div className="flex justify-between text-sm text-green-600">
          <span>Discount</span>
          <span className="font-medium">
            -{formatPrice(discount)}
          </span>
        </div>
      )}

      {/* Total */}
      <div className="border-t border-slate-200 pt-4">
        <div className="flex items-center justify-between">
          <span className="font-semibold text-slate-900">
            Total Amount
          </span>

          <span className="text-lg font-bold text-slate-900">
            {formatPrice(totalAmount)}
          </span>
        </div>
      </div>
    </div>
  );
}
