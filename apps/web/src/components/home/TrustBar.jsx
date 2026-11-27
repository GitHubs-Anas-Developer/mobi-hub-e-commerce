"use client";

import {
  BadgeCheck,
  Headset,
  RefreshCw,
  ShieldCheck,
} from "lucide-react";

const benefits = [
  {
    id: 1,
    title: "Secure Checkout",
    description: "Trusted Razorpay & COD payment options",
    icon: ShieldCheck,
  },
  {
    id: 2,
    title: "Quality Gadgets",
    description: "Curated electronics & smart accessories",
    icon: BadgeCheck,
  },
  {
    id: 3,
    title: "Easy Returns",
    description: "7-day return support on eligible orders",
    icon: RefreshCw,
  },
  {
    id: 4,
    title: "Customer Support",
    description: "Dedicated assistance for every order",
    icon: Headset,
  },
];

export default function TrustBar() {
  return (
    <section aria-label="ELENZO store assurances" className="w-full">
      <div className="grid w-full grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4 lg:gap-4">
        {benefits.map(({ id, title, description, icon: Icon }) => (
          <div
            key={id}
            className="group flex min-w-0 items-center gap-3.5 rounded-2xl border border-[#E2E8F0] bg-[#F8FAFC] p-3.5 transition-colors duration-200 hover:border-[#0755E9]/35 hover:bg-white sm:p-4"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#EFF6FF] text-[#0755E9] transition-colors duration-200 group-hover:bg-[#0755E9] group-hover:text-white">
              <Icon size={19} strokeWidth={1.9} />
            </div>

            <div className="min-w-0">
              <h3 className="truncate text-xs font-bold text-[#101828] sm:text-sm">
                {title}
              </h3>
              <p className="mt-0.5 truncate text-[11px] text-[#64748B] sm:text-xs">
                {description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
