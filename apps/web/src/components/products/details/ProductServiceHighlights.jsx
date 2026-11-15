
"use client";

import {
  Truck,
  ShieldCheck,
  RotateCcw,
  Headphones,
} from "lucide-react";

const highlights = [
  {
    icon: Truck,
    title: "Reliable Delivery",
    description: "Fast & secure delivery",
  },
  {
    icon: ShieldCheck,
    title: "Secure Payment",
    description: "100% safe checkout",
  },
  {
    icon: RotateCcw,
    title: "Easy Returns",
    description: "Hassle-free returns",
  },
  {
    icon: Headphones,
    title: "Customer Support",
    description: "We're here to help",
  },
];

export default function ProductServiceHighlights() {
  return (
    <section className="mt-8 border-t border-[#E2E8F0] pt-6">
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {highlights.map(({ icon: Icon, title, description }) => (
          <div
            key={title}
            className="flex items-start gap-3 rounded-xl border border-slate-100 bg-slate-50/70 p-3 transition-colors duration-200 hover:border-blue-100 hover:bg-blue-50/50"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-100 text-[#0755e9]">
              <Icon size={20} strokeWidth={1.8} />
            </div>

            <div className="min-w-0">
              <h3 className="text-xs font-bold text-[#101828] sm:text-sm">
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
