
"use client";

import { useState } from "react";
import {
  MessageSquareText,
  SlidersHorizontal,
  Star,
  LoaderCircle,
} from "lucide-react";
import { toast } from "sonner";

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

  // Create Review
  const handleCreateReview = async (event) => {
    event.preventDefault();

    if (!isAuthenticated) {
      onRequireLogin?.();
      return;
    }

    if (!productId) {
      toast.error("Product information is missing.");
      return;
    }

    try {
      setSubmitting(true);

      await reviewService.createReview({
        productId,
        rating: form.rating,
        title: form.title.trim(),
        comment: form.comment.trim(),
      });

      setForm({ ...INITIAL_REVIEW_FORM });

      await Promise.all([
        fetchMyReview(),
        refreshReviews(1),
      ]);

      toast.success(REVIEW_MESSAGES.SUBMIT_SUCCESS);
    } catch (err) {
      toast.error(
        err.response?.data?.message ||
          REVIEW_MESSAGES.SUBMIT_ERROR
      );
    } finally {
      setSubmitting(false);
    }
  };

  // Update Review
  const handleUpdateReview = async (reviewData) => {
    try {
      setUpdating(true);

      await updateMyReview({
        rating: reviewData.rating,
        title: reviewData.title.trim(),
        comment: reviewData.comment.trim(),
      });

      await Promise.all([
        fetchMyReview(),
        refreshReviews(page),
      ]);

      toast.success(REVIEW_MESSAGES.UPDATE_SUCCESS);
    } catch (err) {
      toast.error(
        err.response?.data?.message ||
          REVIEW_MESSAGES.UPDATE_ERROR
      );

      throw err;
    } finally {
      setUpdating(false);
    }
  };

  // Delete Review
  const handleDeleteReview = async () => {
    try {
      setDeleting(true);

      await deleteMyReview();

      await Promise.all([
        fetchMyReview(),
        refreshReviews(1),
      ]);

      toast.success(REVIEW_MESSAGES.DELETE_SUCCESS);
    } catch (err) {
      toast.error(
        err.response?.data?.message ||
          REVIEW_MESSAGES.DELETE_ERROR
      );

      throw err;
    } finally {
      setDeleting(false);
    }
  };

  // Pagination
  const handlePageChange = (nextPage) => {
    if (
      nextPage < 1 ||
      nextPage > pagination.totalPages ||
      nextPage === page
    ) {
      return;
    }

    setPage(nextPage);
  };

  // Sort
  const handleSortChange = (event) => {
    setSort(event.target.value);
    setPage(1);
  };

  // Rating Filter
  const handleRatingFilterChange = (event) => {
    setRatingFilter(event.target.value);
    setPage(1);
  };

  return (
    <section
      id="product-reviews"
      className="mt-14 space-y-8 border-t border-[#E2E8F0] pt-9 sm:mt-16 sm:pt-10"
    >
      {/* Section Heading */}
      <div className="flex items-center gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-[#0755e9]">
          <MessageSquareText size={21} />
        </div>

        <div>
          <h2 className="text-xl font-bold tracking-tight text-[#101828] sm:text-2xl">
            Customer Reviews
          </h2>

          <p className="mt-1 text-xs text-slate-500 sm:text-sm">
            Real feedback and experiences from our customers.
          </p>
        </div>
      </div>

      {/* Rating Summary */}
      <div className="rounded-2xl  border-slate-100 bg-slate-50/60  sm:p-6">
        <ReviewSummary ratingInfo={ratingInfo} />
      </div>

      {/* My Review / Create Review */}
      <div className="space-y-5">
        {isAuthenticated ? (
          myReviewLoading ? (
            <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-5">
              <LoaderCircle
                size={20}
                className="animate-spin text-[#0755e9]"
              />

              <p className="text-sm text-slate-500">
                Loading your review...
              </p>
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
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
              <div className="mb-5">
                <h3 className="text-lg font-bold text-[#101828]">
                  Write a Review
                </h3>

                <p className="mt-1 text-sm text-slate-500">
                  Share your experience and help other customers.
                </p>
              </div>

              <ReviewForm
                form={form}
                setForm={setForm}
                onSubmit={handleCreateReview}
                submitting={submitting}
              />
            </div>
          )
        ) : (
          <div className="rounded-2xl border border-blue-100 bg-blue-50/50 p-5 text-center sm:p-7">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-white text-[#0755e9] shadow-sm">
              <Star size={22} />
            </div>

            <h3 className="mt-3 text-base font-bold text-[#101828]">
              Share Your Experience
            </h3>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-600">
              {REVIEW_MESSAGES.LOGIN_REQUIRED}
            </p>

            <button
              type="button"
              onClick={onRequireLogin}
              className="mt-5 inline-flex min-h-11 items-center justify-center rounded-xl bg-[#0755e9] px-6 py-2.5 text-sm font-bold text-white transition hover:bg-[#0645c4] active:scale-[0.98]"
            >
              Login to Review
            </button>
          </div>
        )}
      </div>

      {/* All Customer Reviews */}
      <div className="border-t border-slate-100 pt-7">
        {/* Header */}
        <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h3 className="text-lg font-bold text-[#101828]">
              All Customer Reviews
            </h3>

            <p className="mt-1 text-sm text-slate-500">
              {pagination.total || 0} customer reviews
            </p>
          </div>

          {/* Filters */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {/* Sort Filter */}
            <div className="flex min-h-11 items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 transition focus-within:border-[#0755e9] focus-within:ring-2 focus-within:ring-blue-50">
              <SlidersHorizontal
                size={17}
                className="shrink-0 text-slate-500"
              />

              <select
                value={sort}
                onChange={handleSortChange}
                disabled={loading}
                aria-label="Sort reviews"
                className="w-full min-w-0 cursor-pointer bg-transparent py-2 text-sm font-medium text-slate-700 outline-none disabled:opacity-60"
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
            <div className="flex min-h-11 items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 transition focus-within:border-[#0755e9] focus-within:ring-2 focus-within:ring-blue-50">
              <Star
                size={17}
                className="shrink-0 text-amber-500"
              />

              <select
                value={ratingFilter}
                onChange={handleRatingFilterChange}
                disabled={loading}
                aria-label="Filter reviews by rating"
                className="w-full min-w-0 cursor-pointer bg-transparent py-2 text-sm font-medium text-slate-700 outline-none disabled:opacity-60"
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

        {/* Review List */}
        <ReviewList
          reviews={reviews}
          loading={loading}
          error={reviewsError}
        />

        {/* Pagination */}
        {!loading &&
          !reviewsError &&
          pagination.totalPages > 1 && (
            <div className="mt-7">
              <ReviewPagination
                page={page}
                totalPages={pagination.totalPages}
                onPageChange={handlePageChange}
                disabled={loading}
              />
            </div>
          )}
      </div>
    </section>
  );
}
