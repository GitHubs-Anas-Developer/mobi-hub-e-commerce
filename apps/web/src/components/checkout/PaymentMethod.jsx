
"use client";

import { motion } from "framer-motion";

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
    name: "Online Payment",
    description:
      "Pay securely using UPI, Cards, Net Banking and more.",
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
    name: "Cash on Delivery",
    description: "Pay when your order is delivered.",
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
    <section className="rounded-2xl bg-white">
      {/* Heading */}
      <div className="mb-5">
        <h2 className="text-base font-bold text-[#101828] sm:text-lg">
          Payment Method
        </h2>

        <p className="mt-1 text-sm text-slate-500">
          Choose how you would like to pay for your order.
        </p>
      </div>

      {/* Payment Options */}
      <div className="space-y-3">
        {paymentMethods.map((method, index) => {
          const selected =
            selectedPaymentMethod === method.id;

          const Icon = method.icon;

          return (
            <motion.label
              key={method.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.25,
                delay: index * 0.06,
              }}
              className={`relative flex gap-3 overflow-hidden rounded-xl border p-4 transition-all duration-200 sm:gap-4 sm:p-5 ${
                disabled
                  ? "cursor-not-allowed opacity-60"
                  : "cursor-pointer"
              } ${
                selected
                  ? "border-[#0755E9] bg-blue-50/50 shadow-sm shadow-blue-100"
                  : "border-slate-200 bg-white hover:border-blue-200 hover:bg-slate-50/50"
              }`}
            >
              {/* Radio */}
              <div className="pt-1">
                <input
                  type="radio"
                  name="paymentMethod"
                  value={method.id}
                  checked={selected}
                  onChange={() =>
                    onSelectPaymentMethod?.(method.id)
                  }
                  disabled={disabled}
                  className="h-[18px] w-[18px] cursor-pointer accent-[#0755E9]"
                />
              </div>

              {/* Icon */}
              <div
                className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${
                  selected
                    ? "bg-blue-100 text-[#0755E9]"
                    : "bg-slate-100 text-slate-500"
                }`}
              >
                <Icon size={21} />
              </div>

              {/* Content */}
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-sm font-bold text-[#101828] sm:text-base">
                    {method.name}
                  </h3>

                  {method.badge && (
                    <span className="rounded-md bg-green-50 px-2 py-1 text-[10px] font-bold text-green-700">
                      {method.badge}
                    </span>
                  )}

                  {selected && (
                    <span className="rounded-md bg-blue-100 px-2 py-1 text-[10px] font-bold text-[#0755E9]">
                      Selected
                    </span>
                  )}
                </div>

                <p className="mt-1.5 text-xs leading-5 text-slate-500 sm:text-sm">
                  {method.description}
                </p>

                {/* Payment Features */}
                {method.features.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {method.features.map((feature) => {
                      const FeatureIcon = feature.icon;

                      return (
                        <span
                          key={feature.label}
                          className="inline-flex items-center gap-1.5 rounded-md border border-slate-200 bg-white px-2 py-1.5 text-[10px] font-medium text-slate-600"
                        >
                          <FeatureIcon
                            size={12}
                            className="text-[#0755E9]"
                          />
                          {feature.label}
                        </span>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Selected Indicator */}
              {selected && (
                <div className="absolute right-3 top-3 text-[#0755E9]">
                  <CheckCircle2 size={19} />
                </div>
              )}
            </motion.label>
          );
        })}
      </div>

      {/* Security Notice */}
      <div className="mt-4 flex items-center gap-2 rounded-xl border border-blue-100 bg-blue-50/70 px-3 py-3">
        <ShieldCheck
          size={17}
          className="shrink-0 text-[#0755E9]"
        />

        <p className="text-xs leading-5 text-slate-600">
          Your payment information is handled securely.
        </p>
      </div>
    </section>
  );
}
