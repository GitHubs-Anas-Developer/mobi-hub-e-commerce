
"use client";

import {
  Truck,
  ShieldCheck,
  RotateCcw,
  Headphones,
} from "lucide-react";

const highlights = [
  {
    id: "delivery",
    icon: Truck,
    title: "Reliable Delivery",
    description: "Fast & secure delivery",
  },
  {
    id: "payment",
    icon: ShieldCheck,
    title: "Secure Payment",
    description: "Safe checkout experience",
  },
  {
    id: "returns",
    icon: RotateCcw,
    title: "Easy Returns",
    description: "Hassle-free returns",
  },
  {
    id: "support",
    icon: Headphones,
    title: "Customer Support",
    description: "We're here to help",
  },
];

export default function ProductServiceHighlights() {
  return (
    <section
      aria-label="Shopping benefits"
      className="mt-8 border-t border-[#E2E8F0] pt-6"
    >
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-4">
        {highlights.map(({ id, icon: Icon, title, description }) => (
          <div
            key={id}
            className="
              group flex min-w-0 items-start gap-3
              rounded-xl border border-slate-100
              bg-slate-50/70 p-3
              transition-all duration-200
              hover:-translate-y-0.5
              hover:border-blue-100
              hover:bg-blue-50/50
              hover:shadow-sm
            "
          >
            <div
              className="
                flex h-10 w-10 shrink-0 items-center
                justify-center rounded-xl
                bg-blue-100 text-[#0755e9]
                transition-colors duration-200
                group-hover:bg-[#0755e9]
                group-hover:text-white
              "
            >
              <Icon size={20} strokeWidth={1.8} />
            </div>

            <div className="min-w-0">
              <h3 className="text-xs font-bold leading-5 text-[#101828] sm:text-sm">
                {title}
              </h3>

              <p className="mt-1 text-[11px] leading-4 text-slate-500 sm:text-xs">
                {description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
