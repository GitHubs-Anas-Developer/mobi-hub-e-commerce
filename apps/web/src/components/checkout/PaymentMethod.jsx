"use client";

import {
  CreditCard,
  Wallet,
  CheckCircle2,
  ShieldCheck,
  Smartphone,
  Banknote,
} from "lucide-react";

const paymentMethods = [
  {
    id: "razorpay",
    name: "Online Payment (Razorpay)",
    description:
      "Instant checkout via UPI, Credit/Debit Cards, and Net Banking.",
    badge: "Recommended",
    icon: CreditCard,
    features: [
      { label: "UPI", icon: Smartphone },
      { label: "Cards", icon: CreditCard },
      { label: "Net Banking", icon: Wallet },
    ],
  },
  {
    id: "cod",
    name: "Cash on Delivery (COD)",
    description:
      "Pay in cash or UPI upon delivery of your order at your doorstep.",
    badge: null,
    icon: Banknote,
    features: [],
  },
];

export default function PaymentMethod({
  selectedPaymentMethod = "razorpay",
  onSelectPaymentMethod,
  disabled = false,
}) {
  return (
    <section
      aria-labelledby="checkout-payment-heading"
      className="rounded-2xl border border-[#E2E8F0] bg-white p-5 sm:p-6"
    >
      <div className="mb-5 flex items-center gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#EFF6FF] text-[#0755E9]">
          <CreditCard size={19} aria-hidden="true" />
        </div>

        <div>
          <h2
            id="checkout-payment-heading"
            className="text-base font-bold text-[#101828] sm:text-lg"
          >
            Payment Method
          </h2>
          <p className="text-xs text-[#64748B]">
            Choose how you would like to complete your payment
          </p>
        </div>
      </div>

      <div className="space-y-3">
        {paymentMethods.map((method) => {
          const selected = selectedPaymentMethod === method.id;
          const Icon = method.icon;

          return (
            <label
              key={method.id}
              className={`relative flex items-start gap-3 rounded-2xl border p-4 transition-all duration-150 sm:gap-4 sm:p-5 ${
                disabled
                  ? "cursor-not-allowed opacity-60"
                  : "cursor-pointer"
              } ${
                selected
                  ? "border-[#0755E9] bg-[#EFF6FF]/65 ring-1 ring-[#0755E9]"
                  : "border-[#E2E8F0] bg-white hover:border-[#0755E9]/45 hover:bg-[#F8FAFC]"
              }`}
            >
              <div className="pt-1">
                <input
                  type="radio"
                  name="paymentMethod"
                  value={method.id}
                  checked={selected}
                  disabled={disabled}
                  onChange={() => onSelectPaymentMethod?.(method.id)}
                  className="h-4 w-4 cursor-pointer accent-[#0755E9]"
                />
              </div>

              <div
                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
                  selected
                    ? "bg-[#0755E9] text-white"
                    : "border border-[#E2E8F0] bg-[#F8FAFC] text-[#64748B]"
                }`}
              >
                <Icon size={19} aria-hidden="true" />
              </div>

              <div className="min-w-0 flex-1 pr-6">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-sm font-bold text-[#101828] sm:text-base">
                    {method.name}
                  </h3>

                  {method.badge && (
                    <span className="rounded-md bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700">
                      {method.badge}
                    </span>
                  )}
                </div>

                <p className="mt-1 text-xs leading-relaxed text-[#64748B] sm:text-sm">
                  {method.description}
                </p>

                {method.features.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {method.features.map((feature) => {
                      const FeatureIcon = feature.icon;

                      return (
                        <span
                          key={feature.label}
                          className="inline-flex items-center gap-1.5 rounded-lg border border-[#E2E8F0] bg-white px-2.5 py-1 text-[11px] font-semibold text-[#101828]"
                        >
                          <FeatureIcon
                            size={12}
                            className="text-[#0755E9]"
                            aria-hidden="true"
                          />
                          {feature.label}
                        </span>
                      );
                    })}
                  </div>
                )}
              </div>

              {selected && (
                <div className="absolute right-4 top-4 text-[#0755E9]">
                  <CheckCircle2 size={18} aria-hidden="true" />
                </div>
              )}
            </label>
          );
        })}
      </div>

      <div className="mt-4 flex items-center gap-2.5 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] px-3.5 py-2.5">
        <ShieldCheck size={16} className="shrink-0 text-[#0755E9]" aria-hidden="true" />
        <p className="text-xs text-[#64748B]">
          Online payments are verified securely through Razorpay before marking an order as paid.
        </p>
      </div>
    </section>
  );
}
