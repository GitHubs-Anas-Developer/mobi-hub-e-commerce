
import { normalizeRating } from "@/utils/reviewHelpers";
import { Star } from "lucide-react";

// import { REVIEW_CONFIG } from "@/features/reviews/constants/review.constants";


export default function RatingSelector({
  rating = 5,
  onChange,
  disabled = false,
}) {
  const selectedRating = normalizeRating(rating);

  return (
    <div
      className="flex items-center gap-1"
      role="group"
      aria-label="Select product rating"
    >
      {[1, 2, 3, 4, 5].map((value) => (
        <button
          key={value}
          type="button"
          disabled={disabled}
          onClick={() => onChange?.(value)}
          aria-label={`Rate ${value} out of 5`}
          aria-pressed={selectedRating === value}
          className="rounded p-1 transition hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Star
            size={26}
            aria-hidden="true"
            className={
              value <= selectedRating
                ? "fill-amber-400 text-amber-400"
                : "text-slate-300"
            }
          />
        </button>
      ))}
    </div>
  );
}
