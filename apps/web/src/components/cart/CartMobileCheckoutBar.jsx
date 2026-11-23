
"use client";

import Link from "next/link";
import { ArrowRight, LockKeyhole } from "lucide-react";
import { formatPrice } from "./cart.utils";

export default function CartMobileCheckoutBar({
  subtotal = 0,
  totalItems = 0,
}) {
  const safeSubtotal = Number.isFinite(Number(subtotal))
    ? Math.max(0, Number(subtotal))
    : 0;

  const safeTotalItems = Number.isFinite(Number(totalItems))
    ? Math.max(0, Math.floor(Number(totalItems)))
    : 0;

  const isCartEmpty = safeTotalItems === 0;

  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-200 bg-white/95 px-4 pb-[max(12px,env(safe-area-inset-bottom))] pt-3 shadow-[0_-6px_24px_rgba(15,23,42,0.07)] backdrop-blur-md lg:hidden">
      <div className="mx-auto flex max-w-3xl items-center gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
            Subtotal · {safeTotalItems}{" "}
            {safeTotalItems === 1 ? "item" : "items"}
          </p>

          <p className="mt-0.5 truncate text-lg font-extrabold text-[#101828]">
            {formatPrice(safeSubtotal)}
          </p>
        </div>

        {isCartEmpty ? (
          <button
            type="button"
            disabled
            className="flex min-h-12 flex-1 cursor-not-allowed items-center justify-center gap-2 rounded-xl bg-slate-200 px-4 py-3 text-sm font-bold text-slate-400"
          >
            Checkout
            <ArrowRight size={16} />
          </button>
        ) : (
          <Link
            href="/checkout"
            aria-label="Proceed to checkout"
            className="flex min-h-12 flex-1 items-center justify-center gap-2 rounded-xl bg-[#0755e9] px-4 py-3 text-sm font-bold text-white shadow-sm transition-colors hover:bg-[#0645c4] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0755e9] focus-visible:ring-offset-2 active:scale-[0.98]"
          >
            <LockKeyhole size={15} />
            Checkout
            <ArrowRight size={16} />
          </Link>
        )}
      </div>
    </div>
  );
}
