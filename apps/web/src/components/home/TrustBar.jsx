"use client";

import {
  BadgeCheck,
  RefreshCw,
  ShieldCheck,
  Truck,
} from "lucide-react";

const benefits = [
  {
    id: 1,
    title: "Fast Delivery Across India",
    description: "Reliable delivery to your doorstep",
    icon: Truck,
  },
  {
    id: 2,
    title: "Secure Payments",
    description: "Trusted Razorpay and COD options",
    icon: ShieldCheck,
  },
  {
    id: 3,
    title: "Easy Returns",
    description: "7-day return support on eligible orders",
    icon: RefreshCw,
  },
  {
    id: 4,
    title: "Genuine Products",
    description: "Authentic tech from trusted brands",
    icon: BadgeCheck,
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
              <Icon size={19} strokeWidth={1.9} aria-hidden="true" />
            </div>

            <div className="min-w-0">
              <h3 className="text-xs font-semibold leading-snug text-[#101828] sm:text-sm">
                {title}
              </h3>
              <p className="mt-1 text-[11px] leading-4 text-[#64748B] sm:text-xs">
                {description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
