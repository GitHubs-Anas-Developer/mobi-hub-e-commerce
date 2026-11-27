"use client";

import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";

export default function WishlistPromoBanner() {
  return (
    <section
      aria-labelledby="wishlist-promo-title"
      className="mt-8 overflow-hidden rounded-2xl border border-[#E2E8F0] bg-white p-5 sm:mt-10 sm:p-6"
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <div className="inline-flex items-center gap-1.5 rounded-full border border-[#0755E9]/15 bg-[#EFF6FF] px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-[#0755E9]">
            <Sparkles size={12} aria-hidden="true" />
            <span>Discover More</span>
          </div>

          <h2
            id="wishlist-promo-title"
            className="mt-2.5 text-lg font-bold tracking-tight text-[#101828] sm:text-xl"
          >
            Looking for more tech upgrades?
          </h2>

          <p className="mt-1 max-w-xl text-xs leading-relaxed text-[#64748B] sm:text-sm">
            Explore the latest electronics, smart accessories, and trending arrivals across ELENZO.
          </p>
        </div>

        <Link
          href="/products"
          className="inline-flex h-10 shrink-0 items-center justify-center gap-2 self-start rounded-xl bg-[#0755E9] px-5 text-xs font-bold text-white shadow-xs transition hover:bg-[#082B70] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0755E9] focus-visible:ring-offset-2 sm:self-center sm:text-sm"
        >
          <span>Explore Catalog</span>
          <ArrowRight size={15} aria-hidden="true" />
        </Link>
      </div>
    </section>
  );
}
