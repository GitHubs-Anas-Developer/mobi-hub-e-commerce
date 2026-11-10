
import { Loader2, MessageSquare } from "lucide-react";
import ReviewCard from "./ReviewCard";


export default function ReviewList({
  reviews = [],
  loading = false,
  error = "",
})

{

  if (loading) {
    return (
      <div className="flex items-center justify-center gap-2 py-10 text-slate-500">
        <Loader2 size={20} className="animate-spin" />
        <span className="text-sm">Loading reviews...</span>
      </div>
    );
  }

  if (error) {
    return (
      <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">
        {error}
      </p>
    );
  }

  if (!reviews.length) {
    return (
      <div className="flex flex-col items-center justify-center py-10 text-center">
        <MessageSquare size={32} className="text-slate-300" />

        <p className="mt-3 font-medium text-slate-700">
          No reviews yet
        </p>

        <p className="mt-1 text-sm text-slate-500">
          Be the first to share your experience with this product.
        </p>
      </div>
    );
  }

  return (
    <div>
      {reviews.map((review) => (
        <ReviewCard key={review._id} review={review} />
      ))}
    </div>
  );
}
