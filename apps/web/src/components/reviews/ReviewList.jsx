
"use client";

import { Loader2, MessageSquare, RefreshCw } from "lucide-react";
import ReviewCard from "./ReviewCard";

export default function ReviewList({
  reviews = [],
  loading = false,
  error = "",
  onRetry,
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">

      {/* Loading State */}
      {loading ? (
        <div
          className="flex min-h-52 flex-col items-center justify-center gap-3"
          role="status"
          aria-live="polite"
        >
          <Loader2
            size={28}
            className="animate-spin text-[#0755e9]"
          />

          <p className="text-sm font-medium text-slate-500">
            Loading customer reviews...
          </p>
        </div>

      ) : error ? (

        /* Error State */
        <div
          className="flex min-h-52 flex-col items-center justify-center text-center"
          role="alert"
        >
          <MessageSquare
            size={28}
            className="text-red-500"
          />

          <h3 className="mt-3 text-base font-semibold text-[#101828]">
            Unable to load reviews
          </h3>

          <p className="mt-2 max-w-sm text-sm leading-6 text-slate-500">
            {error}
          </p>

          {onRetry && (
            <button
              type="button"
              onClick={onRetry}
              className="mt-4 inline-flex items-center gap-2 rounded-lg bg-[#0755e9] px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#0645c4]"
            >
              <RefreshCw size={15} />
              Try again
            </button>
          )}
        </div>

      ) : reviews.length === 0 ? (

        /* Empty State */
        <div className="flex min-h-52 flex-col items-center justify-center px-4 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-blue-50 text-[#0755e9]">
            <MessageSquare size={25} strokeWidth={1.7} />
          </div>

          <h3 className="mt-4 text-base font-bold text-[#101828]">
            No reviews yet
          </h3>

          <p className="mt-2 max-w-sm text-sm leading-6 text-slate-500">
            Be the first to share your experience with this product.
            Your feedback helps other customers make better decisions.
          </p>
        </div>

      ) : (

        /* Reviews List */
        <div className="space-y-5 divide-y divide-slate-100">
          {reviews.map((review) => (
            <article
              key={review._id}
              className="pt-5 first:pt-0"
            >
              <ReviewCard review={review} />
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
