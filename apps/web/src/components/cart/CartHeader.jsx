
"use client";

import Link from "next/link";
import { ShoppingBag, ArrowLeft } from "lucide-react";

export default function CartHeader({ totalItems = 0 }) {
  const count = Number(totalItems);

  const safeTotalItems = Number.isFinite(count)
    ? Math.max(0, Math.floor(count))
    : 0;

  return (
    <header className="mb-7">
      <div className="flex flex-col gap-5 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between sm:p-7">

        {/* TITLE */}
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[#0755e9] text-white shadow-lg shadow-blue-200 sm:h-16 sm:w-16">
            <ShoppingBag size={29} strokeWidth={1.8} />
          </div>

          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-2xl font-extrabold tracking-tight text-[#101828] sm:text-3xl">
                Shopping Cart
              </h1>

              <span
                aria-live="polite"
                className="rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-[#0755e9]"
              >
                {safeTotalItems}{" "}
                {safeTotalItems === 1 ? "Item" : "Items"}
              </span>
            </div>

            <p className="mt-1 text-sm text-slate-500">
              Review your selected products before checkout.
            </p>
          </div>
        </div>

      </div>
    </header>
  );
}
