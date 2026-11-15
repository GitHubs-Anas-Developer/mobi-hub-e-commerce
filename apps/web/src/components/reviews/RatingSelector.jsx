
"use client";

import { Star } from "lucide-react";
import { normalizeRating } from "@/utils/reviewHelpers";

export default function RatingSelector({
  rating = 5,
  onChange,
  disabled = false,
}) {
  const selectedRating = Math.min(
    5,
    Math.max(0, Math.round(Number(normalizeRating(rating)) || 0))
  );

  const ratingLabels = {
    1: "Poor",
    2: "Fair",
    3: "Good",
    4: "Very Good",
    5: "Excellent",
  };

  return (
    <div>
      <div
        className="flex items-center gap-1.5"
        role="group"
        aria-label="Select product rating"
      >
        {[1, 2, 3, 4, 5].map((value) => {
          const isSelected = value <= selectedRating;

          return (
            <button
              key={value}
              type="button"
              disabled={disabled}
              onClick={() => onChange?.(value)}
              aria-label={`Rate ${value} out of 5`}
              aria-pressed={selectedRating === value}
              className="rounded-lg p-1.5 transition-all duration-200 hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0755e9] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Star
                size={30}
                strokeWidth={1.8}
                aria-hidden="true"
                className={`transition-colors duration-200 ${
                  isSelected
                    ? "fill-amber-400 text-amber-400"
                    : "text-slate-300 hover:text-amber-300"
                }`}
              />
            </button>
          );
        })}
      </div>

      {selectedRating > 0 && (
        <p className="mt-2 text-xs font-semibold text-slate-600">
          {ratingLabels[selectedRating]}
          <span className="ml-2 font-medium text-slate-400">
            ({selectedRating}/5)
          </span>
        </p>
      )}
    </div>
  );
}
