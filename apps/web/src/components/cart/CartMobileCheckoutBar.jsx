"use client";

import Link from "next/link";
import { ArrowRight, LockKeyhole } from "lucide-react";
import { formatPrice } from "./cart.utils";

export default function CartMobileCheckoutBar({
  totalAmount = 0,
  totalItems = 0,
  savings = 0,
  hasStockIssue = false,
  isMutating = false,
}) {
  const safeTotal = Number.isFinite(Number(totalAmount))
    ? Math.max(0, Number(totalAmount))
    : 0;

  const safeSavings = Number.isFinite(Number(savings))
    ? Math.max(0, Number(savings))
    : 0;

  const safeTotalItems = Number.isFinite(Number(totalItems))
    ? Math.max(0, Math.floor(Number(totalItems)))
    : 0;

  const isCartEmpty = safeTotalItems === 0;
  const isBlocked = isCartEmpty || hasStockIssue || isMutating;

  return (
    <div className="fixed inset-x-0 bottom-[calc(60px+env(safe-area-inset-bottom))] z-30 border-t border-[#E2E8F0] bg-white/95 px-4 py-2.5 shadow-[0_-6px_20px_rgba(16,24,40,0.08)] backdrop-blur-md lg:hidden">
      <div className="mx-auto flex max-w-3xl items-center justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wide text-[#64748B] tabular-nums">
            <span>
              Total · {safeTotalItems} {safeTotalItems === 1 ? "item" : "items"}
            </span>
            {safeSavings > 0 && (
              <span className="rounded bg-emerald-50 px-1.5 py-0.5 font-bold text-emerald-700 normal-case">
                Saved {formatPrice(safeSavings)}
              </span>
            )}
          </div>

          <p className="mt-0.5 truncate text-lg font-extrabold text-[#101828] tabular-nums">
            {formatPrice(safeTotal)}
          </p>
        </div>

        {isBlocked ? (
          <button
            type="button"
            disabled
            className="flex h-11 min-w-[140px] cursor-not-allowed items-center justify-center gap-1.5 rounded-xl bg-slate-200 px-4 text-xs font-bold text-slate-400"
          >
            {hasStockIssue
              ? "Check Stock"
              : isMutating
                ? "Updating..."
                : "Checkout"}
          </button>
        ) : (
          <Link
            href="/checkout"
            aria-label="Proceed to checkout"
            className="flex h-11 min-w-[148px] items-center justify-center gap-1.5 rounded-xl bg-[#0755E9] px-5 text-xs font-bold text-white shadow-xs transition hover:bg-[#082B70] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0755E9] focus-visible:ring-offset-2 active:scale-[0.98]"
          >
            <LockKeyhole size={14} aria-hidden="true" />
            <span>Checkout</span>
            <ArrowRight size={15} aria-hidden="true" />
          </Link>
        )}
      </div>
    </div>
  );
}
