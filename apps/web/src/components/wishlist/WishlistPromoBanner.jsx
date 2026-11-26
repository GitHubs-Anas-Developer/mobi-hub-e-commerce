
"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "motion/react";
import { ArrowRight, Sparkles, Zap } from "lucide-react";

export default function WishlistPromoBanner() {
  const shouldReduceMotion = useReducedMotion();

  return (
    <motion.section
      initial={shouldReduceMotion ? false : { opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: shouldReduceMotion ? 0 : 0.35 }}
      aria-labelledby="wishlist-promo-title"
      className="relative mb-8 overflow-hidden rounded-2xl bg-gradient-to-br from-[#071B49] via-[#083B91] to-[#0755e9] p-6 text-white shadow-lg shadow-blue-900/10 sm:p-8 lg:p-9"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-16 -top-24 h-72 w-72 rounded-full border border-white/10"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-8 -top-12 h-52 w-52 rounded-full bg-blue-300/10 blur-3xl"
      />

      <div className="relative z-10 flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="max-w-xl">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-[10px] font-bold tracking-wider text-blue-100 sm:text-xs">
            <Sparkles size={14} />
            DISCOVER MORE
          </span>

          <h2
            id="wishlist-promo-title"
            className="mt-4 text-2xl font-extrabold tracking-tight sm:text-3xl"
          >
            Your next favourite gadget is waiting.
          </h2>

          <p className="mt-2 max-w-lg text-sm leading-6 text-blue-100">
            Explore the latest electronics and smart gadgets at ELEZIO.
          </p>

          <Link
            href="/products"
            className="group mt-6 inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-bold text-[#0755e9] shadow-sm transition hover:bg-blue-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#0755e9]"
          >
            Explore Collection
            <ArrowRight
              size={17}
              className="transition-transform group-hover:translate-x-1"
            />
          </Link>
        </div>

        <div className="hidden h-36 w-36 shrink-0 items-center justify-center rounded-full border border-white/15 bg-white/10 text-white/90 sm:flex lg:mr-8">
          <Zap size={65} strokeWidth={1.2} />
        </div>
      </div>
    </motion.section>
  );
}
