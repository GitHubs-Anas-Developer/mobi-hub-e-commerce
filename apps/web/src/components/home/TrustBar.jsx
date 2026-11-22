
"use client";

import { motion, useReducedMotion } from "motion/react";

import {
  Truck,
  ShieldCheck,
  RotateCcw,
  BadgeCheck,
  Headset,
} from "lucide-react";

const benefits = [
  {
    id: 1,
    title: "Free Delivery",
    description: "Above ₹999",
    icon: Truck,
  },
  {
    id: 2,
    title: "Secure Payment",
    description: "100% Safe & Encrypted",
    icon: ShieldCheck,
  },
  {
    id: 3,
    title: "Easy Returns",
    description: "7 Days Hassle-Free",
    icon: RotateCcw,
  },
  {
    id: 4,
    title: "Genuine Products",
    description: "Original & Branded",
    icon: BadgeCheck,
  },
  {
    id: 5,
    title: "24/7 Support",
    description: "We're Always Here",
    icon: Headset,
  },
];

export default function TrustBar() {
  const shouldReduceMotion = useReducedMotion();

  return (
    <section className="w-full px-4 py-5 sm:px-6 sm:py-6 lg:px-8">
      <div className="mx-auto grid w-full grid-cols-2 overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm sm:grid-cols-6 lg:grid-cols-5">

        {benefits.map((benefit, index) => {
          const Icon = benefit.icon;

          return (
            <motion.div
              key={benefit.id}
              initial={
                shouldReduceMotion
                  ? false
                  : { opacity: 0, y: 12 }
              }
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{
                duration: shouldReduceMotion ? 0 : 0.4,
                ease: "easeOut",
                delay: shouldReduceMotion ? 0 : index * 0.06,
              }}
              className={`
                group relative flex min-h-[88px] items-center justify-center gap-2.5
                px-2 py-4 transition-colors duration-200
                hover:bg-blue-50/60
                border-r border-b border-slate-100

                [&:nth-child(2n)]:border-r-0
                [&:nth-child(5)]:border-b-0

                sm:col-span-2
                sm:[&:nth-child(2n)]:border-r
                sm:[&:nth-child(3n)]:border-r-0
                sm:[&:nth-child(4)]:border-b-0
                sm:[&:nth-child(5)]:border-b-0

                lg:col-span-1
                lg:border-b-0
                lg:border-r
                lg:[&:nth-child(2n)]:border-r
                lg:[&:nth-child(3n)]:border-r
                lg:[&:nth-child(5)]:border-r-0
                lg:px-3
                xl:px-5
              `}
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-[#0755E9] transition-colors duration-200 group-hover:bg-[#0755E9] group-hover:text-white sm:h-11 sm:w-11">
                <Icon
                  size={24}
                  strokeWidth={1.8}
                  className="sm:h-[26px] sm:w-[26px]"
                />
              </div>

              <div className="min-w-0">
                <h3 className="text-[11px] font-bold tracking-tight text-[#101828] sm:text-sm">
                  {benefit.title}
                </h3>

                <p className="mt-1 text-[10px] font-medium leading-tight text-slate-500 sm:text-xs">
                  {benefit.description}
                </p>
              </div>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}
