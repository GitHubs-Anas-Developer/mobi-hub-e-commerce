"use client";

import Link from "next/link";
import { Check, ShoppingBag, MapPin, CreditCard, PackageCheck } from "lucide-react";

export default function CheckoutProgress({
  hasSelectedAddress = false,
  isPendingPayment = false,
  isDirectCheckout = false,
  directSlug = "",
}) {
  const steps = [
    {
      id: "cart",
      number: 1,
      label: isDirectCheckout ? "Product" : "Cart",
      href:
        isDirectCheckout && directSlug
          ? `/products/${directSlug}`
          : "/cart",
      icon: ShoppingBag,
      status: "completed",
    },
    {
      id: "delivery",
      number: 2,
      label: "Delivery",
      icon: MapPin,
      status: isPendingPayment || hasSelectedAddress ? "completed" : "current",
    },
    {
      id: "payment",
      number: 3,
      label: "Payment",
      icon: CreditCard,
      status: isPendingPayment || hasSelectedAddress ? "current" : "upcoming",
    },
    {
      id: "confirmation",
      number: 4,
      label: "Confirmation",
      icon: PackageCheck,
      status: "upcoming",
    },
  ];

  return (
    <nav
      aria-label="Checkout progress"
      className="mb-6 rounded-2xl border border-[#E2E8F0] bg-white px-4 py-3.5 sm:px-6"
    >
      <ol className="flex items-center justify-between gap-2">
        {steps.map((step, index) => {
          const Icon = step.icon;
          const isCompleted = step.status === "completed";
          const isCurrent = step.status === "current";

          const content = (
            <div className="flex items-center gap-2 sm:gap-2.5">
              <span
                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border text-xs font-bold transition ${
                  isCompleted
                    ? "border-[#0755E9] bg-[#0755E9] text-white"
                    : isCurrent
                      ? "border-[#0755E9] bg-[#EFF6FF] text-[#0755E9] ring-2 ring-[#0755E9]/15"
                      : "border-[#E2E8F0] bg-[#F8FAFC] text-[#64748B]"
                }`}
              >
                {isCompleted ? (
                  <Check size={14} strokeWidth={2.5} aria-hidden="true" />
                ) : (
                  <Icon size={14} aria-hidden="true" />
                )}
              </span>

              <div className="min-w-0">
                <span className="hidden text-[10px] font-semibold uppercase tracking-wider text-[#64748B] sm:block">
                  Step {step.number}
                </span>
                <span
                  className={`block truncate text-xs font-bold sm:text-sm ${
                    isCurrent
                      ? "text-[#0755E9]"
                      : isCompleted
                        ? "text-[#101828]"
                        : "text-[#64748B]"
                  }`}
                >
                  {step.label}
                </span>
              </div>
            </div>
          );

          return (
            <li
              key={step.id}
              aria-current={isCurrent ? "step" : undefined}
              className="flex min-w-0 flex-1 items-center last:flex-initial"
            >
              {step.href ? (
                <Link
                  href={step.href}
                  className="rounded-lg transition hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0755E9]"
                >
                  {content}
                </Link>
              ) : (
                content
              )}

              {index < steps.length - 1 && (
                <div
                  aria-hidden="true"
                  className={`mx-2 h-0.5 flex-1 rounded-full sm:mx-4 ${
                    isCompleted ? "bg-[#0755E9]" : "bg-[#E2E8F0]"
                  }`}
                />
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

