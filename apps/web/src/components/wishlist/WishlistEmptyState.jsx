import Link from "next/link";
import { motion } from "motion/react";
import {
  Heart,
  ArrowRight,
} from "lucide-react";

export default function WishlistEmptyState({
  shouldReduceMotion = false,
}) {
  return (
    <motion.section
      initial={shouldReduceMotion ? false : { opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="flex min-h-[420px] flex-col items-center justify-center rounded-2xl border border-slate-200 bg-white px-5 py-14 text-center"
    >
      <motion.div
        animate={
          shouldReduceMotion
            ? {}
            : { y: [0, -7, 0] }
        }
        transition={{
          duration: 2.5,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="flex h-24 w-24 items-center justify-center rounded-full bg-blue-50"
      >
        <Heart
          size={42}
          strokeWidth={1.6}
          className="text-[#0755e9]"
        />
      </motion.div>

      <h2 className="mt-7 text-xl font-extrabold text-[#101828] sm:text-2xl">
        Your wishlist is empty
      </h2>

      <p className="mt-3 max-w-sm text-sm leading-6 text-slate-500">
        You haven&apos;t saved any products yet.
        Explore our collection and save your favourite tech products here.
      </p>

      <Link
        href="/products"
        className="mt-7 inline-flex items-center gap-2 rounded-xl bg-[#0755e9] px-6 py-3.5 text-sm font-bold text-white shadow-sm transition hover:bg-[#0645c4]"
      >
        Explore Products
        <ArrowRight size={17} />
      </Link>
    </motion.section>
  );
}