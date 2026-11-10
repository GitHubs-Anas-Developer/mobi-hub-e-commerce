export const formatReviewDate = (date) => {
  if (!date) return "";

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return "";
  }

  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(parsedDate);
};

export const getReviewProductId = (review) => {
  if (!review?.product) return null;

  return String(review.product?._id || review.product);
};

export const normalizeRating = (rating) => {
  const value = Number(rating);

  if (!Number.isFinite(value)) return 0;

  return Math.min(5, Math.max(0, value));
};

export const getRatingPercentage = (count, total) => {
  const reviewCount = Number(count) || 0;
  const totalReviews = Number(total) || 0;

  if (totalReviews <= 0) return 0;

  return (reviewCount / totalReviews) * 100;
};
