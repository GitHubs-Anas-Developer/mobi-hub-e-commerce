"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "motion/react";
import { ArrowRight, Sparkles, Zap } from "lucide-react";

export default function WishlistPromoBanner() {
  const shouldReduceMotion = useReducedMotion();

  return (
    <motion.section
      initial={shouldReduceMotion ? false : { opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="relative mb-7 overflow-hidden rounded-2xl bg-gradient-to-r from-[#071B49] to-[#0755E9] px-5 py-6 text-white sm:px-8 sm:py-7"
    >
      <div className="pointer-events-none absolute -right-10 -top-20 h-56 w-56 rounded-full border border-white/10" />

      <div className="pointer-events-none absolute -right-4 -top-12 h-40 w-40 rounded-full bg-blue-300/10 blur-2xl" />

      <div className="relative z-10 flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
        <div className="max-w-xl">
          <div className="mb-3 inline-flex items-center gap-2 text-xs font-bold tracking-wider text-blue-200">
            <Sparkles size={15} />
            EXPLORE MORE FROM MOBI HUB
          </div>

          <h2 className="text-xl font-extrabold sm:text-2xl">
            Find something you&apos;ll love.
          </h2>

          <p className="mt-2 text-sm leading-6 text-blue-100/85">
            Discover the latest gadgets and accessories for your everyday needs.
          </p>
        </div>

        <Link
          href="/products"
          className="inline-flex w-fit shrink-0 items-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-bold text-[#0755E9] transition hover:bg-blue-50"
        >
          Explore Collection
          <ArrowRight size={17} />
        </Link>
      </div>

      <div className="pointer-events-none absolute bottom-4 right-8 hidden rotate-12 text-white/10 sm:block">
        <Zap size={72} />
      </div>
    </motion.section>
  );
}