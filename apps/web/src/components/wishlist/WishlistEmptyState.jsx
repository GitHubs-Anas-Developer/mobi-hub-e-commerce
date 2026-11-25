
"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { Heart, ArrowRight, ShoppingBag, Sparkles } from "lucide-react";

export default function WishlistEmptyState({
  shouldReduceMotion = false,
}) {
  return (
    <motion.section
      initial={shouldReduceMotion ? false : { opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: shouldReduceMotion ? 0 : 0.35 }}
      aria-labelledby="wishlist-empty-title"
      className="flex min-h-[380px] flex-col items-center justify-center rounded-2xl border border-slate-200 bg-white px-5 py-12 text-center shadow-sm sm:min-h-[430px] sm:px-8"
    >
      <div className="relative flex h-24 w-24 items-center justify-center rounded-full bg-blue-50">
        <div className="absolute inset-2 rounded-full border border-blue-100" />

        <Heart
          size={42}
          strokeWidth={1.5}
          className="relative text-[#0755e9]"
        />

        <span className="absolute -right-1 top-1 flex h-8 w-8 items-center justify-center rounded-full border-4 border-white bg-[#0755e9] text-white">
          <Sparkles size={13} />
        </span>
      </div>

      <span className="mt-7 text-xs font-bold uppercase tracking-[0.18em] text-[#0755e9]">
        Your collection starts here
      </span>

      <h2
        id="wishlist-empty-title"
        className="mt-2 text-xl font-extrabold tracking-tight text-[#101828] sm:text-2xl"
      >
        Your wishlist is empty
      </h2>

      <p className="mt-3 max-w-sm text-sm leading-6 text-slate-500">
        Save the products you love and keep all your favourite gadgets in one place.
      </p>

      <Link
        href="/products"
        className="mt-7 inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-[#0755e9] px-6 py-3 text-sm font-bold text-white shadow-md shadow-blue-200 transition hover:bg-[#0645c4] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0755e9] focus-visible:ring-offset-2 active:scale-[0.98]"
      >
        <ShoppingBag size={17} />
        Explore Products
        <ArrowRight size={17} />
      </Link>

      <p className="mt-4 text-xs text-slate-400">
        Find something you will love at Mobi Hub.
      </p>
    </motion.section>
  );
}
