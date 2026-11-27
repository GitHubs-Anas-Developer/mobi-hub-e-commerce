"use client";

import { Truck, ShieldCheck, RotateCcw, Headphones } from "lucide-react";

const highlights = [
  {
    id: "delivery",
    icon: Truck,
    title: "Fast & Reliable Dispatch",
    description: "Safe pan-India order shipping",
  },
  {
    id: "payment",
    icon: ShieldCheck,
    title: "Secure Checkout",
    description: "Protected Razorpay & COD payments",
  },
  {
    id: "returns",
    icon: RotateCcw,
    title: "Easy Returns",
    description: "Hassle-free support on eligible items",
  },
  {
    id: "support",
    icon: Headphones,
    title: "Dedicated Support",
    description: "Responsive ELENZO customer care",
  },
];

export default function ProductServiceHighlights() {
  return (
    <section
      aria-label="Service highlights"
      className="mt-6 border-t border-[#E2E8F0] pt-5"
    >
      <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 sm:gap-3">
        {highlights.map(({ id, icon: Icon, title, description }) => (
          <div
            key={id}
            className="flex min-w-0 items-center gap-3 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] px-3.5 py-3 transition-colors hover:border-[#0755E9]/35 hover:bg-[#EFF6FF]/50"
          >
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#EFF6FF] text-[#0755E9]">
              <Icon size={18} strokeWidth={1.9} aria-hidden="true" />
            </div>

            <div className="min-w-0">
              <h3 className="text-xs font-bold text-[#101828]">{title}</h3>
              <p className="mt-0.5 truncate text-[11px] text-[#64748B]">
                {description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
