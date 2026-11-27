"use client";

import { Truck, ShieldCheck, Headset, BadgeCheck } from "lucide-react";

const features = [
  {
    icon: BadgeCheck,
    title: "100% Genuine Tech",
    description: "Official warranty products verified by ELENZO",
  },
  {
    icon: Truck,
    title: "Free Standard Shipping",
    description: "Reliable nationwide delivery across India",
  },
  {
    icon: ShieldCheck,
    title: "Secure Payments",
    description: "Razorpay & Cash on Delivery checkout protection",
  },
  {
    icon: Headset,
    title: "Dedicated Support",
    description: "Fast order & warranty assistance whenever needed",
  },
];

export default function CartTrustInfo() {
  return (
    <section
      aria-label="ELENZO shopping guarantees"
      className="mt-4 overflow-hidden rounded-2xl border border-[#E2E8F0] bg-white px-4"
    >
      {features.map(({ icon: Icon, title, description }, index) => (
        <div
          key={title}
          className={`flex items-center gap-3.5 py-3.5 ${
            index !== features.length - 1 ? "border-b border-[#E2E8F0]" : ""
          }`}
        >
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#EFF6FF] text-[#0755E9]">
            <Icon size={18} strokeWidth={1.9} aria-hidden="true" />
          </div>

          <div className="min-w-0">
            <h3 className="text-xs font-bold text-[#101828]">{title}</h3>
            <p className="mt-0.5 text-[11px] leading-snug text-[#64748B]">
              {description}
            </p>
          </div>
        </div>
      ))}
    </section>
  );
}
