
import { getRatingPercentage } from "@/utils/reviewHelpers";
import { Star } from "lucide-react";


export default function RatingDistribution({
  distribution = {},
  total = 0,
}) {
  return (
    <div
      className="space-y-3"
      aria-label="Rating distribution"
    >
      {[5, 4, 3, 2, 1].map((star) => {
        const count = Number(
          distribution?.[star] ??
            distribution?.[String(star)] ??
            0,
        );

        const percentage = getRatingPercentage(
          count,
          total,
        );

        return (
          <div
            key={star}
            className="flex items-center gap-3 text-sm"
          >
            <span className="flex w-10 shrink-0 items-center gap-1 text-slate-600">
              {star}
              <Star
                size={13}
                aria-hidden="true"
                className="fill-amber-400 text-amber-400"
              />
            </span>

            <div
              className="h-2 flex-1 overflow-hidden rounded-full bg-slate-100"
              role="progressbar"
              aria-label={`${star} star reviews`}
              aria-valuenow={Math.round(percentage)}
              aria-valuemin={0}
              aria-valuemax={100}
            >
              <div
                className="h-full rounded-full bg-amber-400 transition-all duration-300"
                style={{
                  width: `${percentage}%`,
                }}
              />
            </div>

            <span className="w-8 shrink-0 text-right tabular-nums text-slate-500">
              {count}
            </span>
          </div>
        );
      })}
    </div>
  );
}
