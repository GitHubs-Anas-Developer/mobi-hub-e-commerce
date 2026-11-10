
"use client";

const paymentMethods = [
  {
    id: "razorpay",
    name: "Online Payment",
    description: "Pay securely using UPI, Cards, Net Banking and more.",
    badge: "Recommended",
  },
  {
    id: "cod",
    name: "Cash on Delivery",
    description: "Pay when your order is delivered.",
    badge: null,
  },
];

export default function PaymentMethod({
  selectedPaymentMethod = "razorpay",
  onSelectPaymentMethod,
  disabled = false,
}) {
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-6">
      <h2 className="text-lg font-semibold text-slate-900">
        Payment Method
      </h2>

      <p className="mt-1 text-sm text-slate-500">
        Choose how you would like to pay for your order.
      </p>

      <div className="mt-5 space-y-3">
        {paymentMethods.map((method) => {
          const selected =
            selectedPaymentMethod === method.id;

          return (
            <label
              key={method.id}
              className={`flex cursor-pointer gap-3 rounded-lg border p-4 transition ${
                selected
                  ? "border-blue-600 bg-blue-50"
                  : "border-slate-200 hover:border-blue-300"
              } ${
                disabled
                  ? "cursor-not-allowed opacity-60"
                  : ""
              }`}
            >
              <input
                type="radio"
                name="paymentMethod"
                value={method.id}
                checked={selected}
                onChange={() =>
                  onSelectPaymentMethod?.(method.id)
                }
                disabled={disabled}
                className="mt-1 h-4 w-4 shrink-0 accent-blue-600"
              />

              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-semibold text-slate-900">
                    {method.name}
                  </span>

                  {method.badge && (
                    <span className="rounded bg-green-50 px-2 py-1 text-xs font-medium text-green-700">
                      {method.badge}
                    </span>
                  )}

                  {selected && (
                    <span className="rounded bg-blue-100 px-2 py-1 text-xs font-medium text-blue-700">
                      Selected
                    </span>
                  )}
                </div>

                <p className="mt-1 text-sm text-slate-500">
                  {method.description}
                </p>
              </div>
            </label>
          );
        })}
      </div>
    </section>
  );
}
