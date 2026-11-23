
"use client";

import Link from "next/link";

import {
  ArrowLeft,
  ShoppingBag,
  ChevronRight,
} from "lucide-react";

export default function CartHeader({
  totalItems = 0,
}) {
  const itemCount = Math.max(
    0,
    Number.isFinite(Number(totalItems))
      ? Number(totalItems)
      : 0
  );

  return (
    <header className="mb-8">

      {/* BREADCRUMB */}

      <nav
        aria-label="Breadcrumb"
        className="mb-6 flex items-center gap-2 text-xs font-medium text-slate-400"
      >
        <Link
          href="/"
          className="transition-colors hover:text-[#0755e9] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0755e9] focus-visible:ring-offset-2 rounded-sm"
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
          Shopping Cart
        </span>
      </nav>

      {/* HEADER CONTENT */}

      <div className="flex flex-col justify-between gap-5 border-b border-slate-200 pb-6 sm:flex-row sm:items-center">

        {/* TITLE */}

        <div className="flex items-start gap-4">

          {/* CART ICON */}

          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-[#0755e9]">
            <ShoppingBag
              size={23}
              strokeWidth={1.8}
              aria-hidden="true"
            />
          </div>

          {/* TITLE AND DESCRIPTION */}

          <div className="min-w-0">

            <div className="flex flex-wrap items-center gap-3">

              <h1 className="text-2xl font-extrabold tracking-tight text-[#101828] sm:text-3xl">
                Shopping Cart
              </h1>

              {/* ITEM COUNT */}

              <span
                aria-live="polite"
                className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600"
              >
                {itemCount}{" "}
                {itemCount === 1 ? "Item" : "Items"}
              </span>
            </div>

            <p className="mt-2 text-sm leading-relaxed text-slate-500">
              Review your selected products before checkout.
            </p>
          </div>
        </div>

        {/* CONTINUE SHOPPING */}

        <Link
          href="/products"
          className="
            inline-flex min-h-11 w-fit shrink-0
            items-center justify-center gap-2
            rounded-xl border border-slate-200
            bg-white px-4 py-2.5
            text-sm font-semibold text-slate-700
            transition-all duration-200
            hover:border-[#0755e9]
            hover:bg-blue-50
            hover:text-[#0755e9]
            focus-visible:outline-none
            focus-visible:ring-2
            focus-visible:ring-[#0755e9]
            focus-visible:ring-offset-2
            active:scale-[0.98]
          "
        >
          <ArrowLeft
            size={16}
            aria-hidden="true"
          />

          Continue Shopping
        </Link>
      </div>
    </header>
  );
}
