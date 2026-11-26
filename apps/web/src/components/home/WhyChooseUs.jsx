
"use client";

import { motion, useReducedMotion } from "motion/react";

import {
  ShieldCheck,
  Truck,
  Headphones,
  RefreshCw,
} from "lucide-react";

const benefits = [
  {
    id: 1,
    icon: ShieldCheck,
    title: "Quality Products",
    description: "Carefully selected accessories",
  },
  {
    id: 2,
    icon: Truck,
    title: "Fast Delivery",
    description: "Quick and reliable delivery",
  },
  {
    id: 3,
    icon: Headphones,
    title: "Customer Support",
    description: "We're here to help",
  },
  {
    id: 4,
    icon: RefreshCw,
    title: "Easy Returns",
    description: "Hassle-free returns",
  },
];

export default function WhyChooseUs() {
  const shouldReduceMotion = useReducedMotion();

  const initialState = shouldReduceMotion
    ? false
    : { opacity: 0, y: 14 };

  const transition = {
    duration: shouldReduceMotion ? 0 : 0.4,
    ease: "easeOut",
  };

  return (
    <section className="w-full min-w-0">
      <motion.div
        initial={initialState}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.15 }}
        transition={transition}
        className="w-full"
      >
        {/* Main Container */}
        <div className="overflow-hidden rounded-xl border border-blue-100/80 bg-gradient-to-br from-blue-50 via-white to-slate-50 px-3 py-6 sm:rounded-2xl sm:px-6 sm:py-8 lg:px-10 lg:py-9">

          {/* Section Header */}
          <div className="mb-5 text-center sm:mb-7">
            <span className="mb-2 inline-flex items-center rounded-full border border-blue-100 bg-blue-50 px-2.5 py-1 text-[9px] font-bold uppercase tracking-wider text-[#0755e9] sm:text-[10px]">
              The ELEZIO Difference
            </span>

            <h2 className="text-lg font-extrabold tracking-tight text-slate-900 sm:text-xl lg:text-2xl">
              Why Choose ELEZIO?
            </h2>

            <p className="mx-auto mt-1.5 max-w-lg text-[11px] leading-relaxed text-slate-500 sm:text-xs">
              A better shopping experience for your everyday tech needs.
            </p>
          </div>

          {/* Benefits Grid */}
          <div className="grid grid-cols-2 gap-2.5 sm:gap-3.5 lg:grid-cols-4 lg:gap-4">
            {benefits.map((item, index) => {
              const Icon = item.icon;

              return (
                <motion.div
                  key={item.id}
                  initial={initialState}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.2 }}
                  transition={{
                    ...transition,
                    delay: shouldReduceMotion
                      ? 0
                      : index * 0.06,
                  }}
                  whileHover={
                    shouldReduceMotion
                      ? undefined
                      : { y: -3 }
                  }
                  className="group flex min-w-0 flex-col items-center rounded-lg border border-slate-100 bg-white px-2 py-4 text-center shadow-sm transition-all duration-300 hover:border-blue-200 hover:shadow-md hover:shadow-blue-100/50 sm:rounded-xl sm:px-3 sm:py-5"
                >
                  {/* Icon */}
                  <div className="mb-2.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-[#0755e9] transition-colors duration-300 group-hover:bg-[#0755e9] group-hover:text-white sm:mb-3 sm:h-11 sm:w-11">
                    <Icon
                      size={20}
                      strokeWidth={1.8}
                    />
                  </div>

                  {/* Title */}
                  <h3 className="text-[11px] font-bold tracking-tight text-slate-900 sm:text-xs lg:text-sm">
                    {item.title}
                  </h3>

                  {/* Description */}
                  <p className="mt-1 max-w-[190px] text-[9px] leading-relaxed text-slate-500 sm:text-[10px] lg:text-[11px]">
                    {item.description}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </motion.div>
    </section>
  );
}
