
import { BadgeCheck } from "lucide-react";
import RatingStars from "./RatingStars";
import { formatReviewDate } from "@/utils/reviewHelpers";



export default function ReviewCard({ review }) {

  if (!review) return null;

  const reviewerName = review.user?.name || "Customer";

  return (
    <article className="border-b border-slate-200 py-5 last:border-b-0">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="font-semibold text-slate-900">
            {reviewerName}
          </p>

          <p className="mt-1 text-xs text-slate-500">
            {formatReviewDate(review.createdAt)}
          </p>
        </div>

        {review.isVerifiedPurchase && (
          <span className="inline-flex items-center gap-1 rounded-full bg-green-50 px-3 py-1 text-xs font-medium text-green-700">
            <BadgeCheck size={14} />
            Verified Purchase
          </span>
        )}
      </div>

      <div className="mt-3">
        <RatingStars rating={review.rating} />
      </div>

      {review.title && (
        <h4 className="mt-3 font-semibold text-slate-900">
          {review.title}
        </h4>
      )}

      {review.comment && (
        <p className="mt-2 whitespace-pre-line text-sm leading-6 text-slate-600">
          {review.comment}
        </p>
      )}
    </article>
  );
}
