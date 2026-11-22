
"use client";

import Link from "next/link";
import {
  ArrowLeft,
  Heart,
  ChevronRight,
} from "lucide-react";

export default function WishlistHeader({ totalItems = 0 }) {
  const safeTotalItems = Number.isFinite(Number(totalItems))
    ? Math.max(0, Math.floor(Number(totalItems)))
    : 0;

  return (
    <header className="mb-8">
      {/* Breadcrumb */}
      <nav
        aria-label="Breadcrumb"
        className="mb-5 flex items-center gap-2 text-xs font-medium text-slate-400 sm:mb-6"
      >
        <Link
          href="/"
          className="transition-colors hover:text-[#0755e9] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0755e9] focus-visible:ring-offset-2"
        >
          Home
        </Link>

        <ChevronRight
          size={13}
          aria-hidden="true"
        />

        <span
          aria-current="page"
          className="font-semibold text-slate-700"
        >
          My Wishlist
        </span>
      </nav>

      {/* Header Content */}
      <div className="flex flex-col justify-between gap-5 border-b border-slate-200 pb-6 sm:flex-row sm:items-center">
        <div className="flex items-start gap-3 sm:gap-4">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-[#0755e9] sm:h-12 sm:w-12">
            <Heart
              size={23}
              strokeWidth={1.8}
              aria-hidden="true"
            />
          </div>

          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2.5 sm:gap-3">
              <h1 className="text-2xl font-bold tracking-tight text-[#101828] sm:text-3xl">
                My Wishlist
              </h1>

              <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-[#0755e9]">
                {safeTotalItems}{" "}
                {safeTotalItems === 1 ? "Item" : "Items"}
              </span>
            </div>

            <p className="mt-2 text-sm leading-relaxed text-slate-500">
              Keep your favourite products saved for later.
            </p>
          </div>
        </div>

        <Link
          href="/products"
          className="inline-flex min-h-11 w-fit shrink-0 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition-all hover:border-[#0755e9] hover:bg-blue-50 hover:text-[#0755e9] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0755e9] focus-visible:ring-offset-2 active:scale-[0.98]"
        >
          <ArrowLeft size={16} aria-hidden="true" />
          Continue Shopping
        </Link>
      </div>
    </header>
  );
}
