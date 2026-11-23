
"use client";

import { motion, useReducedMotion } from "motion/react";

import {
  PackageCheck,
  ShieldCheck,
  BadgeCheck,
  Headset,
} from "lucide-react";

const benefits = [
  {
    id: 1,
    title: "Order Updates",
    description: "Stay informed",
    icon: PackageCheck,
  },
  {
    id: 2,
    title: "Secure Checkout",
    description: "Safe payments",
    icon: ShieldCheck,
  },
  {
    id: 3,
    title: "Quality Products",
    description: "Carefully selected",
    icon: BadgeCheck,
  },
  {
    id: 4,
    title: "Customer Support",
    description: "We're here to help",
    icon: Headset,
  },
];

export default function TrustBar() {
  const shouldReduceMotion = useReducedMotion();

  return (
    <section
      aria-label="Mobi Hub shopping benefits"
      className="w-full"
    >
      <div className="grid w-full grid-cols-2 gap-2.5 sm:gap-3 lg:grid-cols-4 lg:gap-4">
        {benefits.map((item, index) => {
          const Icon = item.icon;

          return (
            <motion.div
              key={item.id}
              initial={
                shouldReduceMotion
                  ? false
                  : { opacity: 0, y: 8 }
              }
              whileInView={
                shouldReduceMotion
                  ? undefined
                  : { opacity: 1, y: 0 }
              }
              viewport={{
                once: true,
                amount: 0.3,
              }}
              transition={{
                duration: 0.3,
                delay: shouldReduceMotion
                  ? 0
                  : index * 0.05,
              }}
              whileHover={
                shouldReduceMotion
                  ? undefined
                  : { y: -2 }
              }
              className="
                group flex min-h-[68px] min-w-0
                items-center gap-2
                rounded-xl border border-slate-200/80
                bg-white p-2.5
                shadow-sm
                transition-shadow duration-300
                hover:border-blue-200 hover:shadow-md
                sm:min-h-[76px] sm:gap-3 sm:p-3
              "
            >
              {/* Icon */}
              <div
                className="
                  flex h-8 w-8 shrink-0
                  items-center justify-center
                  rounded-lg bg-[#eff6ff]
                  text-[#0755e9]
                  transition-colors duration-300
                  group-hover:bg-[#0755e9]
                  group-hover:text-white
                  sm:h-9 sm:w-9
                "
              >
                <Icon
                  size={17}
                  strokeWidth={1.8}
                />
              </div>

              {/* Text */}
              <div className="min-w-0">
                <h3 className="truncate text-[11px] font-semibold leading-4 text-[#101828] sm:text-xs">
                  {item.title}
                </h3>

                <p className="mt-0.5 truncate text-[10px] leading-3.5 text-slate-500 sm:text-[11px]">
                  {item.description}
                </p>
              </div>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}
