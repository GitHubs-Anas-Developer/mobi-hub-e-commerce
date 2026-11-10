
"use client";

import { useState } from "react";

import {
  SlidersHorizontal,
  Star,
} from "lucide-react";

import ReviewSummary from "./ReviewSummary";
import MyReview from "./MyReview";
import ReviewForm from "./ReviewForm";
import ReviewList from "./ReviewList";
import ReviewPagination from "./ReviewPagination";

import useProductReviews from "@/hooks/useProductReviews";
import useMyProductReview from "@/hooks/useMyProductReview";

import reviewService from "@/services/reviewService";

import {
  INITIAL_REVIEW_FORM,
  REVIEW_MESSAGES,
  REVIEW_SORT_OPTIONS,
  REVIEW_RATING_FILTERS,
} from "@/constants/review.constants";

export default function ReviewSection({
  productId,
  isAuthenticated,
  onRequireLogin,
}) {
  const [form, setForm] = useState({ ...INITIAL_REVIEW_FORM });

  const [submitting, setSubmitting] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const [sort, setSort] = useState("newest");
  const [ratingFilter, setRatingFilter] = useState("all");

  const {
    reviews,
    ratingInfo,
    pagination,
    page,
    setPage,
    loading,
    error: reviewsError,
    refreshReviews,
  } = useProductReviews(productId, {
    sort,
    rating: ratingFilter,
  });

  const {
    myReview,
    loading: myReviewLoading,
    updateMyReview,
    deleteMyReview,
    fetchMyReview,
  } = useMyProductReview(productId, isAuthenticated);

  // Create review
  const handleCreateReview = async (event) => {
    event.preventDefault();

    if (!isAuthenticated) {
      onRequireLogin?.();
      return;
    }

    if (!productId) {
      setError("Product information is missing.");
      return;
    }

    try {
      setSubmitting(true);
      setError("");
      setMessage("");

      await reviewService.createReview({
        productId,
        rating: form.rating,
        title: form.title.trim(),
        comment: form.comment.trim(),
      });

      setForm({ ...INITIAL_REVIEW_FORM });

      setMessage(REVIEW_MESSAGES.SUBMIT_SUCCESS);

      await Promise.all([
        fetchMyReview(),
        refreshReviews(1),
      ]);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          REVIEW_MESSAGES.SUBMIT_ERROR
      );
    } finally {
      setSubmitting(false);
    }
  };

  // Update review
  const handleUpdateReview = async (reviewData) => {
    try {
      setUpdating(true);
      setError("");
      setMessage("");

      await updateMyReview({
        rating: reviewData.rating,
        title: reviewData.title.trim(),
        comment: reviewData.comment.trim(),
      });

      await refreshReviews(page);

      setMessage(REVIEW_MESSAGES.UPDATE_SUCCESS);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          REVIEW_MESSAGES.UPDATE_ERROR
      );

      throw err;
    } finally {
      setUpdating(false);
    }
  };

  // Delete review
  const handleDeleteReview = async () => {
    try {
      setDeleting(true);
      setError("");
      setMessage("");

      await deleteMyReview();

      await refreshReviews(1);

      setMessage(REVIEW_MESSAGES.DELETE_SUCCESS);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          REVIEW_MESSAGES.DELETE_ERROR
      );

      throw err;
    } finally {
      setDeleting(false);
    }
  };

  // Page change
  const handlePageChange = (nextPage) => {
    if (
      nextPage < 1 ||
      nextPage > pagination.totalPages
    ) {
      return;
    }

    setPage(nextPage);
  };

  // Sorting change
  const handleSortChange = (event) => {
    setSort(event.target.value);
    setPage(1);
  };

  // Rating filter change
  const handleRatingFilterChange = (event) => {
    setRatingFilter(event.target.value);
    setPage(1);
  };

  return (
    <section
      className="mt-12 space-y-8"
      id="product-reviews"
    >
      {/* Section Header */}
      <div>
        <h2 className="text-2xl font-bold text-slate-900">
          Customer Reviews
        </h2>

        <p className="mt-1 text-sm text-slate-500">
          See what customers think about this product.
        </p>
      </div>

      {/* Rating Summary */}
      <ReviewSummary ratingInfo={ratingInfo} />

      {/* Success Message */}
      {message && (
        <p
          role="status"
          aria-live="polite"
          className="rounded-lg bg-green-50 px-4 py-3 text-sm text-green-700"
        >
          {message}
        </p>
      )}

      {/* Action Error */}
      {error && (
        <p
          role="alert"
          className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600"
        >
          {error}
        </p>
      )}

      {/* Customer Review Management */}
      {isAuthenticated ? (
        <div className="space-y-5">
          {myReviewLoading ? (
            <div className="py-5 text-sm text-slate-500">
              Loading your review...
            </div>
          ) : myReview ? (
            <MyReview
              review={myReview}
              onUpdate={handleUpdateReview}
              onDelete={handleDeleteReview}
              updating={updating}
              deleting={deleting}
            />
          ) : (
            <div className="rounded-xl border border-slate-200 bg-white p-5">
              <h3 className="text-lg font-semibold text-slate-900">
                Write a Review
              </h3>

              <p className="mt-1 text-sm text-slate-500">
                Share your experience with this product.
              </p>

              <ReviewForm
                form={form}
                setForm={setForm}
                onSubmit={handleCreateReview}
                submitting={submitting}
              />
            </div>
          )}
        </div>
      ) : (
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-5 text-center">
          <p className="text-sm text-slate-600">
            {REVIEW_MESSAGES.LOGIN_REQUIRED}
          </p>

          <button
            type="button"
            onClick={onRequireLogin}
            className="mt-3 rounded-lg bg-blue-700 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-800"
          >
            Login to Review
          </button>
        </div>
      )}

      {/* Public Reviews */}
      <div>
        <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-lg font-semibold text-slate-900">
              All Customer Reviews
            </h3>

            <p className="mt-1 text-sm text-slate-500">
              {pagination.total || 0} customer reviews
            </p>
          </div>

          {/* Sorting and Rating Filters */}
          <div className="flex flex-col gap-3 sm:flex-row">
            {/* Sort */}
            <div className="flex items-center gap-2">
              <SlidersHorizontal
                size={18}
                className="shrink-0 text-slate-500"
              />

              <select
                value={sort}
                onChange={handleSortChange}
                disabled={loading}
                aria-label="Sort reviews"
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:opacity-60 sm:w-auto"
              >
                {REVIEW_SORT_OPTIONS.map((option) => (
                  <option
                    key={option.value}
                    value={option.value}
                  >
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Rating Filter */}
            <div className="flex items-center gap-2">
              <Star
                size={18}
                className="shrink-0 text-amber-500"
              />

              <select
                value={ratingFilter}
                onChange={handleRatingFilterChange}
                disabled={loading}
                aria-label="Filter reviews by rating"
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:opacity-60 sm:w-auto"
              >
                {REVIEW_RATING_FILTERS.map((option) => (
                  <option
                    key={option.value}
                    value={option.value}
                  >
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <ReviewList
          reviews={reviews}
          loading={loading}
          error={reviewsError}
        />

        {/* Pagination */}
        {!loading &&
          !reviewsError &&
          pagination.totalPages > 1 && (
            <ReviewPagination
              page={page}
              totalPages={pagination.totalPages}
              onPageChange={handlePageChange}
              disabled={loading}
            />
          )}
      </div>
    </section>
  );
}
