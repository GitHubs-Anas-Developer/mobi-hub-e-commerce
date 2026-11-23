
"use client";

import Link from "next/link";
import { motion } from "motion/react";
import {
  Heart,
  ArrowRight,
  ShoppingBag,
} from "lucide-react";

export default function WishlistEmptyState({
  shouldReduceMotion = false,
}) {
  const animationProps = shouldReduceMotion
    ? {}
    : {
        initial: { opacity: 0, y: 20 },
        animate: { opacity: 1, y: 0 },
        transition: {
          duration: 0.4,
          ease: "easeOut",
        },
      };

  return (
    <motion.section
      {...animationProps}
      aria-labelledby="wishlist-empty-title"
      className="flex min-h-[400px] flex-col items-center justify-center rounded-2xl border border-slate-200 bg-white px-5 py-14 text-center shadow-sm sm:min-h-[440px] sm:px-8"
    >
      {/* Empty Wishlist Icon */}
      <motion.div
        animate={
          shouldReduceMotion
            ? undefined
            : { y: [0, -7, 0] }
        }
        transition={
          shouldReduceMotion
            ? undefined
            : {
                duration: 2.5,
                repeat: Infinity,
                ease: "easeInOut",
              }
        }
        className="relative flex h-24 w-24 items-center justify-center rounded-full bg-blue-50"
      >
        <div className="absolute inset-2 rounded-full border border-blue-100" />

        <Heart
          size={42}
          strokeWidth={1.6}
          className="relative text-[#0755e9]"
          aria-hidden="true"
        />
      </motion.div>

      {/* Content */}
      <h2
        id="wishlist-empty-title"
        className="mt-7 text-xl font-extrabold tracking-tight text-[#101828] sm:text-2xl"
      >
        Your wishlist is empty
      </h2>

      <p className="mt-3 max-w-sm text-sm leading-6 text-slate-500">
        You haven&apos;t saved any products yet.
        Explore our collection and save your favourite
        tech products here.
      </p>

      {/* Action */}
      <Link
        href="/products"
        className="mt-7 inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-[#0755e9] px-6 py-3 text-sm font-bold text-white shadow-sm transition-all hover:bg-[#0645c4] hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0755e9] focus-visible:ring-offset-2 active:scale-[0.98]"
      >
        <ShoppingBag size={17} aria-hidden="true" />
        Explore Products
        <ArrowRight size={17} aria-hidden="true" />
      </Link>

      <p className="mt-4 text-xs text-slate-400">
        Discover something you&apos;ll love at Mobi Hub.
      </p>
    </motion.section>
  );
}
