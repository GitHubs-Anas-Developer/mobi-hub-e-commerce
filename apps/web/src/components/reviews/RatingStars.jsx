
"use client";

import { Star } from "lucide-react";
import { normalizeRating } from "@/utils/reviewHelpers";

export default function RatingStars({
  rating = 0,
  size = 16,
}) {
  const normalizedRating = Math.min(
    5,
    Math.max(0, Number(normalizeRating(rating)) || 0)
  );

  const percentage = (normalizedRating / 5) * 100;

  return (
    <div
      className="inline-flex items-center gap-0.5"
      role="img"
      aria-label={`${normalizedRating.toFixed(1)} out of 5 stars`}
    >
      {[1, 2, 3, 4, 5].map((value) => {
        const fillPercentage = Math.min(
          100,
          Math.max(0, (normalizedRating - (value - 1)) * 100)
        );

        return (
          <span
            key={value}
            className="relative inline-flex shrink-0"
            style={{
              width: size,
              height: size,
            }}
          >
            {/* Empty star */}
            <Star
              size={size}
              strokeWidth={1.8}
              aria-hidden="true"
              className="absolute inset-0 text-slate-300"
            />

            {/* Filled star */}
            <span
              className="absolute inset-0 overflow-hidden"
              style={{
                width: `${fillPercentage}%`,
              }}
            >
              <Star
                size={size}
                strokeWidth={1.8}
                aria-hidden="true"
                className="max-w-none fill-amber-400 text-amber-400"
              />
            </span>
          </span>
        );
      })}
    </div>
  );
}
