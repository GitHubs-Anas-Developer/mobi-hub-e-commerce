import RatingDistribution from "./RatingDistribution";
import RatingStars from "./RatingStars";

export default function ReviewSummary({ ratingInfo = {} }) {
  const averageRating = Number(ratingInfo.averageRating ?? 0);
  const totalReviews = Number(ratingInfo.totalReviews ?? 0);

  const distribution = ratingInfo.ratingDistribution ?? {};

  return (
    <div className="grid grid-cols-1 gap-6 rounded-xl border border-slate-200 bg-white p-5 sm:grid-cols-2">
      <div className="flex flex-col items-center justify-center text-center">
        <p className="text-5xl font-bold tracking-tight text-slate-900">
          {averageRating.toFixed(1)}
        </p>

        <div className="mt-2">
          <RatingStars rating={averageRating} size={20} />
        </div>

        <p className="mt-2 text-sm text-slate-500">
          Based on {totalReviews} {totalReviews === 1 ? "review" : "reviews"}
        </p>
      </div>

      <div className="flex flex-col justify-center">
        <RatingDistribution
          distribution={distribution}
          total={totalReviews}
        />
      </div>
    </div>
  );
}
