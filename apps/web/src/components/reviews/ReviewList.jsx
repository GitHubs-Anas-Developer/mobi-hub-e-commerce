
"use client";

import { Loader2, MessageSquare } from "lucide-react";
import ReviewCard from "./ReviewCard";

export default function ReviewList({
  reviews = [],
  loading = false,
  error = "",
}) {
  // Loading state
  if (loading) {
    return (
      <div className="flex min-h-40 items-center justify-center rounded-2xl border border-slate-200 bg-white">
        <div className="flex flex-col items-center gap-3">
          <Loader2
            size={26}
            className="animate-spin text-[#0755e9]"
          />

          <p className="text-sm font-medium text-slate-500">
            Loading customer reviews...
          </p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div
        role="alert"
        className="rounded-xl border border-red-100 bg-red-50 px-4 py-4"
      >
        <p className="text-sm font-medium text-red-600">
          {error}
        </p>
      </div>
    );
  }

  // Empty state
  if (!reviews.length) {
    return (
      <div className="flex min-h-64 flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50/60 px-5 py-10 text-center">
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
    );
  }

  // Reviews list
  return (
    <div className="space-y-4">
      {reviews.map((review) => (
        <div
          key={review._id}
          className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition-colors duration-200 hover:border-blue-100 sm:p-5"
        >
          <ReviewCard review={review} />
        </div>
      ))}
    </div>
  );
}
