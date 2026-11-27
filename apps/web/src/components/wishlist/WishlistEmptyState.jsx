"use client";

import Link from "next/link";
import { Heart, ArrowRight, ShoppingBag, LayoutGrid } from "lucide-react";

export default function WishlistEmptyState() {
  return (
    <section
      aria-labelledby="wishlist-empty-title"
      className="flex min-h-[380px] flex-col items-center justify-center rounded-2xl border border-[#E2E8F0] bg-white px-5 py-14 text-center sm:min-h-[420px] sm:px-8"
    >
      <div className="flex h-20 w-20 items-center justify-center rounded-2xl border border-[#0755E9]/15 bg-[#EFF6FF] text-[#0755E9]">
        <Heart size={36} strokeWidth={1.6} aria-hidden="true" />
      </div>

      <span className="mt-6 inline-flex items-center rounded-full border border-[#0755E9]/15 bg-[#EFF6FF] px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-[#0755E9]">
        ELENZO Saved Collection
      </span>

      <h2
        id="wishlist-empty-title"
        className="mt-3 text-xl font-bold tracking-tight text-[#101828] sm:text-2xl"
      >
        Your Wishlist Is Empty
      </h2>

      <p className="mt-2 max-w-md text-xs leading-relaxed text-[#64748B] sm:text-sm">
        Save your favourite gadgets, smart accessories, and everyday tech here so you can easily compare and move them to your cart later.
      </p>

      <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
        <Link
          href="/products"
          className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[#0755E9] px-6 text-xs font-bold text-white shadow-xs transition hover:bg-[#082B70] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0755E9] focus-visible:ring-offset-2 active:scale-[0.98] sm:text-sm"
        >
          <ShoppingBag size={16} aria-hidden="true" />
          <span>Browse Products</span>
          <ArrowRight size={16} aria-hidden="true" />
        </Link>

        <Link
          href="/categories"
          className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-[#E2E8F0] bg-white px-5 text-xs font-bold text-[#101828] transition hover:border-[#0755E9]/40 hover:bg-[#EFF6FF] hover:text-[#0755E9] sm:text-sm"
        >
          <LayoutGrid size={16} aria-hidden="true" />
          <span>Explore Categories</span>
        </Link>
      </div>
    </section>
  );
}
