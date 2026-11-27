"use client";

import { AlertCircle, RefreshCw } from "lucide-react";

export default function ProductError({ message, onRetry }) {
  return (
    <div
      role="alert"
      className="flex flex-col items-center justify-center rounded-2xl border border-red-200 bg-white px-6 py-14 text-center"
    >
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-red-100 bg-red-50 text-red-500">
        <AlertCircle size={28} aria-hidden="true" />
      </div>

      <h2 className="mt-4 text-lg font-bold tracking-tight text-[#101828]">
        Unable to load products
      </h2>

      <p className="mt-2 max-w-md text-xs leading-relaxed text-[#64748B] sm:text-sm">
        {message || "Something went wrong while fetching the product catalog. Please try again."}
      </p>

      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="mt-6 inline-flex h-10 items-center gap-2 rounded-xl bg-[#0755E9] px-5 text-xs font-bold text-white shadow-xs transition hover:bg-[#082B70] sm:text-sm"
        >
          <RefreshCw size={15} />
          Try Again
        </button>
      )}
    </div>
  );
}
