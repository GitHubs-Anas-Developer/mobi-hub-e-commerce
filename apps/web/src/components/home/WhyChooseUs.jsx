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
    : { opacity: 0, y: 25 };

  const transition = shouldReduceMotion
    ? { duration: 0 }
    : {
        duration: 0.55,
        ease: "easeOut",
      };

  return (
    <motion.section
      initial={initialState}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={transition}
      className="w-full min-w-0 px-3 py-8 sm:px-5 sm:py-10 lg:px-8"
    >
      {/* Full Width Container */}
      <div className="w-full min-w-0 overflow-hidden rounded-2xl border border-slate-100 bg-gradient-to-br from-blue-50 via-white to-slate-50 px-4 py-9 sm:px-8 sm:py-12 lg:px-12">

        {/* Section Header */}
        <motion.div
          initial={initialState}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={transition}
          className="mb-8 w-full text-center sm:mb-12"
        >
          <span className="mb-3 inline-flex items-center rounded-full border border-blue-100 bg-blue-50 px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest text-blue-600 sm:text-xs">
            The Mobi Hub Difference
          </span>

          <h2 className="text-xl font-extrabold tracking-tight text-slate-900 sm:text-2xl lg:text-3xl">
            Why Choose Mobi Hub?
          </h2>

          <p className="mx-auto mt-2 max-w-lg text-xs leading-relaxed text-slate-500 sm:text-sm">
            A better shopping experience for your everyday tech needs.
          </p>
        </motion.div>

        {/* Benefits Grid */}
        <div className="grid w-full min-w-0 grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-4 lg:gap-6">

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
                  delay: shouldReduceMotion ? 0 : index * 0.1,
                }}
                className="group flex w-full min-w-0 flex-col items-center rounded-xl border border-slate-100 bg-white px-2 py-6 text-center shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-blue-200 hover:shadow-lg hover:shadow-blue-100/50 sm:px-5 sm:py-8"
              >
                {/* Icon */}
                <div className="mb-4 flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600 transition-all duration-300 group-hover:scale-110 group-hover:bg-blue-600 group-hover:text-white sm:h-14 sm:w-14">
                  <Icon
                    size={24}
                    strokeWidth={1.8}
                  />
                </div>

                {/* Title */}
                <h3 className="text-xs font-bold tracking-tight text-slate-900 sm:text-sm">
                  {item.title}
                </h3>

                {/* Description */}
                <p className="mt-2 max-w-[190px] text-[10px] leading-relaxed text-slate-500 sm:text-xs">
                  {item.description}
                </p>
              </motion.div>
            );
          })}

        </div>
      </div>
    </motion.section>
  );
}