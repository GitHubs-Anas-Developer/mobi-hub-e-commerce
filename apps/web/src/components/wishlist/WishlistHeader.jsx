
"use client";

import { Heart, Sparkles } from "lucide-react";

export default function WishlistHeader({ totalItems = 0 }) {
  const count = Number(totalItems);
  const safeTotalItems = Number.isFinite(count)
    ? Math.max(0, Math.floor(count))
    : 0;

  return (
    <header className="mb-7">
      <div className="flex flex-col gap-5 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between sm:p-7">
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[#0755e9] text-white shadow-lg shadow-blue-200 sm:h-16 sm:w-16">
            <Heart size={29} strokeWidth={1.8} />
          </div>

          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-2xl font-extrabold tracking-tight text-[#101828] sm:text-3xl">
                My Wishlist
              </h1>

              <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-[#0755e9]">
                {safeTotalItems} {safeTotalItems === 1 ? "Item" : "Items"}
              </span>
            </div>

            <p className="mt-1 text-sm text-slate-500">
              Your favourite products, saved in one place.
            </p>
          </div>
        </div>

        <div className="hidden items-center gap-2 rounded-xl bg-slate-50 px-4 py-3 text-sm font-medium text-slate-600 sm:flex">
          <Sparkles size={17} className="text-[#0755e9]" />
          Your personal collection
        </div>
      </div>
    </header>
  );
}
