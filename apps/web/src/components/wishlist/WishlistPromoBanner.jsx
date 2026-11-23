
"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "motion/react";
import {
  ArrowRight,
  Sparkles,
  Zap,
} from "lucide-react";

export default function WishlistPromoBanner() {
  const shouldReduceMotion = useReducedMotion();

  return (
    <motion.section
      initial={shouldReduceMotion ? false : { opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={
        shouldReduceMotion
          ? { duration: 0 }
          : { duration: 0.4, ease: "easeOut" }
      }
      aria-labelledby="wishlist-promo-title"
      className="relative mb-7 overflow-hidden rounded-2xl bg-gradient-to-r from-[#071B49] via-[#083B91] to-[#0755E9] px-5 py-6 text-white shadow-sm sm:px-8 sm:py-8"
    >
      {/* Decorative Elements */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-10 -top-20 h-56 w-56 rounded-full border border-white/10"
      />

      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-4 -top-12 h-40 w-40 rounded-full bg-blue-300/10 blur-2xl"
      />

      <div className="relative z-10 flex flex-col justify-between gap-6 sm:flex-row sm:items-center">
        {/* Content */}
        <div className="max-w-xl">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-[10px] font-bold tracking-wider text-blue-100 sm:text-xs">
            <Sparkles size={14} aria-hidden="true" />
            EXPLORE MORE FROM MOBI HUB
          </div>

          <h2
            id="wishlist-promo-title"
            className="text-xl font-extrabold tracking-tight sm:text-2xl"
          >
            Find something you&apos;ll love.
          </h2>

          <p className="mt-2 max-w-lg text-sm leading-6 text-blue-100/85">
            Discover the latest gadgets and accessories for your everyday needs.
          </p>
        </div>

        {/* CTA */}
        <Link
          href="/products"
          className="group inline-flex min-h-12 w-fit shrink-0 items-center justify-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-bold text-[#0755E9] shadow-sm transition-all hover:bg-blue-50 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#0755E9] active:scale-[0.98]"
        >
          Explore Collection

          <ArrowRight
            size={17}
            className="transition-transform duration-200 group-hover:translate-x-1"
            aria-hidden="true"
          />
        </Link>
      </div>

      {/* Decorative Icon */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute bottom-4 right-8 hidden rotate-12 text-white/10 sm:block"
      >
        <Zap size={72} />
      </div>
    </motion.section>
  );
}
