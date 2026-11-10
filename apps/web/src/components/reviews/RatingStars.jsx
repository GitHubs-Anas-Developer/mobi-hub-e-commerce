
import { Star } from "lucide-react";

import { normalizeRating } from "@/utils/reviewHelpers";

export default function RatingStars({ rating = 0, size = 16 }) {
  const normalizedRating = Math.round(normalizeRating(rating));

  return (
    <div
      className="flex items-center gap-0.5"
      role="img"
      aria-label={`${normalizedRating} out of 5 stars`}
    >
      {[1, 2, 3, 4, 5].map((value) => (
        <Star
          key={value}
          size={size}
          aria-hidden="true"
          className={
            value <= normalizedRating
              ? "fill-amber-400 text-amber-400"
              : "text-slate-300"
          }
        />
      ))}
    </div>
  );
}
