
"use client";

import { BadgeCheck, UserRound } from "lucide-react";
import RatingStars from "./RatingStars";
import { formatReviewDate } from "@/utils/reviewHelpers";

export default function ReviewCard({ review }) {
  if (!review) return null;

  const reviewerName = review.user?.name || "Customer";

  const initial = reviewerName
    .trim()
    .charAt(0)
    .toUpperCase();

  return (
    <article className="py-1">
      {/* Reviewer information */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          {/* Avatar */}
          <div className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-full bg-blue-50 text-sm font-bold text-[#0755e9]">
            {initial || <UserRound size={20} />}
          </div>

          {/* Name and date */}
          <div className="min-w-0">
            <h4 className="truncate text-sm font-bold text-[#101828]">
              {reviewerName}
            </h4>

            <p className="mt-1 text-xs text-slate-500">
              {formatReviewDate(review.createdAt)}
            </p>
          </div>
        </div>

        {/* Verified purchase */}
        {review.isVerifiedPurchase && (
          <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-green-100 bg-green-50 px-2.5 py-1.5 text-[11px] font-semibold text-green-700">
            <BadgeCheck size={14} />
            Verified Purchase
          </span>
        )}
      </div>

      {/* Rating */}
      <div className="mt-4">
        <RatingStars rating={review.rating} size={17} />
      </div>

      {/* Review title */}
      {review.title && (
        <h3 className="mt-3 text-sm font-bold text-[#101828] sm:text-base">
          {review.title}
        </h3>
      )}

      {/* Review comment */}
      {review.comment && (
        <p className="mt-2 whitespace-pre-line break-words text-sm leading-7 text-slate-600">
          {review.comment}
        </p>
      )}
    </article>
  );
}
