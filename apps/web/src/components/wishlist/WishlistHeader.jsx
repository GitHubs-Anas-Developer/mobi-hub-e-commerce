"use client";

import { useState } from "react";
import Link from "next/link";
import { Heart, ArrowLeft, Trash2 } from "lucide-react";
import Breadcrumb from "@/components/common/Breadcrumb";

export default function WishlistHeader({
  totalItems = 0,
  isMutating = false,
  onClearWishlist,
}) {
  const [confirmClear, setConfirmClear] = useState(false);

  const count = Number(totalItems);
  const safeTotalItems = Number.isFinite(count)
    ? Math.max(0, Math.floor(count))
    : 0;

  const handleConfirmClear = async () => {
    setConfirmClear(false);
    await onClearWishlist?.();
  };

  return (
    <header className="mb-5 sm:mb-6">
      <Breadcrumb items={[{ label: "My Wishlist" }]} className="mb-4" />

      <div className="flex flex-col gap-4 rounded-2xl border border-[#E2E8F0] bg-white px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6 sm:py-5">
        <div className="flex min-w-0 items-center gap-3.5 sm:gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-[#0755E9]/15 bg-[#EFF6FF] text-[#0755E9] sm:h-14 sm:w-14 sm:rounded-2xl">
            <Heart size={24} strokeWidth={1.9} aria-hidden="true" />
          </div>

          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2.5">
              <h1 className="text-xl font-bold tracking-tight text-[#101828] sm:text-2xl lg:text-[28px]">
                My Wishlist
              </h1>

              <span
                aria-live="polite"
                className="inline-flex items-center rounded-full border border-[#0755E9]/15 bg-[#EFF6FF] px-3 py-0.5 text-xs font-bold text-[#0755E9] tabular-nums"
              >
                {safeTotalItems} {safeTotalItems === 1 ? "Item" : "Items"}
              </span>
            </div>

            <p className="mt-1 text-xs leading-relaxed text-[#64748B] sm:text-sm">
              Keep track of your favourite gadgets and move them straight to your cart whenever you&apos;re ready.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 self-start sm:self-center">
          {safeTotalItems > 1 && onClearWishlist && (
            confirmClear ? (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleConfirmClear}
                  disabled={isMutating}
                  className="inline-flex h-10 items-center rounded-xl bg-red-600 px-3.5 text-xs font-bold text-white transition hover:bg-red-700 disabled:opacity-50"
                >
                  Confirm Clear
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmClear(false)}
                  disabled={isMutating}
                  className="inline-flex h-10 items-center rounded-xl border border-[#E2E8F0] bg-white px-3 text-xs font-semibold text-[#64748B] transition hover:bg-slate-50"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setConfirmClear(true)}
                disabled={isMutating}
                className="inline-flex h-10 items-center gap-1.5 rounded-xl border border-[#E2E8F0] bg-white px-3.5 text-xs font-semibold text-[#64748B] transition hover:border-red-200 hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-45"
              >
                <Trash2 size={14} aria-hidden="true" />
                <span>Clear All</span>
              </button>
            )
          )}

          <Link
            href="/products"
            className="inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-xl border border-[#E2E8F0] bg-white px-4 text-xs font-bold text-[#101828] transition hover:border-[#0755E9]/40 hover:bg-[#EFF6FF] hover:text-[#0755E9] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0755E9] focus-visible:ring-offset-2 sm:text-[13px]"
          >
            <ArrowLeft size={15} aria-hidden="true" />
            <span>Continue Shopping</span>
          </Link>
        </div>
      </div>
    </header>
  );
}
