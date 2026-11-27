"use client";

import {
  CreditCard,
  Headphones,
  RefreshCw,
  Truck,
} from "lucide-react";

const benefits = [
  {
    id: 1,
    icon: CreditCard,
    title: "Online & COD Payments",
    description:
      "Flexible payment checkout with verified Razorpay online transactions or Cash on Delivery.",
  },
  {
    id: 2,
    icon: Truck,
    title: "Reliable Order Tracking",
    description:
      "Track shipment progress directly from your account from dispatch to doorstep.",
  },
  {
    id: 3,
    icon: RefreshCw,
    title: "7 Days Easy Returns",
    description:
      "Straightforward 7-day return support to make every electronics purchase worry-free.",
  },
  {
    id: 4,
    icon: Headphones,
    title: "Customer Support",
    description:
      "Dedicated support team available for product questions, orders, and assistance.",
  },
];

export default function WhyChooseUs() {
  return (
    <section aria-labelledby="why-elenzo-heading" className="w-full">
      <div className="overflow-hidden rounded-2xl border border-[#E2E8F0] bg-[#EFF6FF]/65 px-5 py-8 sm:px-8 sm:py-10 lg:px-10">
        <div className="mb-6 text-center sm:mb-8">
          <span className="inline-flex items-center rounded-full border border-[#0755E9]/20 bg-white px-3 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-[#0755E9] sm:text-[11px]">
            The ELENZO Promise
          </span>

          <h2
            id="why-elenzo-heading"
            className="mt-2.5 text-xl font-bold tracking-tight text-[#101828] sm:text-2xl"
          >
            Why Shop with ELENZO?
          </h2>

          <p className="mx-auto mt-1.5 max-w-lg text-xs text-[#64748B] sm:text-sm">
            Designed around dependable technology, clear pricing, and trustworthy support.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-4 lg:gap-4">
          {benefits.map(({ id, icon: Icon, title, description }) => (
            <div
              key={id}
              className="group flex flex-col rounded-2xl border border-[#E2E8F0] bg-white p-5 transition-all duration-200 hover:-translate-y-0.5 hover:border-[#0755E9]/35 hover:shadow-md"
            >
              <div className="mb-3.5 flex h-11 w-11 items-center justify-center rounded-xl bg-[#EFF6FF] text-[#0755E9] transition-colors duration-200 group-hover:bg-[#0755E9] group-hover:text-white">
                <Icon size={20} strokeWidth={1.8} />
              </div>

              <h3 className="text-sm font-bold text-[#101828]">
                {title}
              </h3>

              <p className="mt-1.5 text-xs leading-relaxed text-[#64748B]">
                {description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
