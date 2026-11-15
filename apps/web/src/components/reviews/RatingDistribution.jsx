
"use client";

import { Star } from "lucide-react";
import { getRatingPercentage } from "@/utils/reviewHelpers";

export default function RatingDistribution({
  distribution = {},
  total = 0,
}) {
  const totalReviews = Math.max(0, Number(total) || 0);

  return (
    <div
      className="space-y-3.5"
      aria-label="Rating distribution"
    >
      {[5, 4, 3, 2, 1].map((star) => {
        const count = Math.max(
          0,
          Number(
            distribution?.[star] ??
              distribution?.[String(star)] ??
              0
          ) || 0
        );

        const percentage =
          totalReviews > 0
            ? Math.min(
                100,
                Math.max(
                  0,
                  getRatingPercentage(count, totalReviews)
                )
              )
            : 0;

        return (
          <div
            key={star}
            className="grid grid-cols-[38px_1fr_32px] items-center gap-3"
          >
            {/* Star label */}
            <span className="flex items-center gap-1.5 text-sm font-semibold text-slate-600">
              {star}

              <Star
                size={13}
                aria-hidden="true"
                className="fill-amber-400 text-amber-400"
              />
            </span>

            {/* Progress bar */}
            <div
              className="h-2.5 overflow-hidden rounded-full bg-slate-100"
              role="progressbar"
              aria-label={`${star} star reviews`}
              aria-valuenow={Math.round(percentage)}
              aria-valuemin={0}
              aria-valuemax={100}
            >
              <div
                className="h-full rounded-full bg-amber-400 transition-[width] duration-500 ease-out"
                style={{
                  width: `${percentage}%`,
                }}
              />
            </div>

            {/* Review count */}
            <span className="text-right text-xs font-medium tabular-nums text-slate-500">
              {count}
            </span>
          </div>
        );
      })}
    </div>
  );
}
