
"use client";

import { useState } from "react";
import {
  Search,
  Star,
  Eye,
  EyeOff,
  RefreshCw,
  Loader2,
  MessageSquare,
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
  X,
} from "lucide-react";

import useAdminReviews from "@/hooks/useAdminReviews";

export default function AdminReviewsPage() {
  const {
    reviews,
    pagination,
    filters,
    setFilters,
    loading,
    error,
    updatingReviewId,
    refreshReviews,
    updateReviewVisibility,
  } = useAdminReviews();

  const [search, setSearch] = useState(filters.search);
  const [actionError, setActionError] = useState("");
  const [actionSuccess, setActionSuccess] = useState("");

  const handleSearch = (value) => {
    setSearch(value);
    setFilters((previous) => ({
      ...previous,
      search: value,
      page: 1,
    }));
  };

  const handleClearSearch = () => {
    setSearch("");
    setFilters((previous) => ({
      ...previous,
      search: "",
      page: 1,
    }));
  };

  const handleFilterChange = (key, value) => {
    setFilters((previous) => ({
      ...previous,
      [key]: value,
      page: key === "page" ? value : 1,
    }));
  };

  const handleVisibilityToggle = async (review) => {
    if (updatingReviewId) return;

    const nextVisibility = !review.isVisible;

    const confirmed = window.confirm(
      `Are you sure you want to ${
        nextVisibility ? "show" : "hide"
      } this review?`,
    );

    if (!confirmed) return;

    try {
      setActionError("");
      setActionSuccess("");

      await updateReviewVisibility(review._id, nextVisibility);

      setActionSuccess(
        nextVisibility
          ? "Review is now visible."
          : "Review has been hidden.",
      );
    } catch (err) {
      setActionError(
        err.response?.data?.message ||
          "Failed to update review visibility.",
      );
    }
  };

  const formatDate = (date) => {
    if (!date) return "—";

    return new Date(date).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const visibleOnPage = reviews.filter(
    (review) => review.isVisible,
  ).length;

  const hiddenOnPage = reviews.filter(
    (review) => !review.isVisible,
  ).length;

  const averageRating =
    reviews.length > 0
      ? (
          reviews.reduce((sum, review) => sum + review.rating, 0) /
          reviews.length
        ).toFixed(1)
      : "0.0";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">
          Reviews
        </h1>

        <p className="mt-1 text-sm text-slate-500">
          Monitor customer feedback and manage product review visibility.
        </p>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-slate-500">
              Total Reviews
            </p>
            <MessageSquare size={20} className="text-blue-600" />
          </div>

          <p className="mt-3 text-2xl font-bold text-slate-900">
            {pagination?.total ?? 0}
          </p>

          <p className="mt-1 text-xs text-slate-400">
            Reviews matching current filters
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-slate-500">
              Visible Reviews
            </p>
            <Eye size={20} className="text-green-600" />
          </div>

          <p className="mt-3 text-2xl font-bold text-green-600">
            {visibleOnPage}
          </p>

          <p className="mt-1 text-xs text-slate-400">
            On current page
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-slate-500">
              Hidden Reviews
            </p>
            <EyeOff size={20} className="text-red-600" />
          </div>

          <p className="mt-3 text-2xl font-bold text-red-600">
            {hiddenOnPage}
          </p>

          <p className="mt-1 text-xs text-slate-400">
            On current page
          </p>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="space-y-4 rounded-xl border border-slate-200 bg-white p-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative w-full flex-1">
            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <input
              type="search"
              value={search}
              onChange={(event) => handleSearch(event.target.value)}
              placeholder="Search customer, product or review..."
              className="w-full rounded-lg border border-slate-300 py-2.5 pl-10 pr-10 text-sm outline-none transition focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
            />

            {search && (
              <button
                type="button"
                onClick={handleClearSearch}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
                aria-label="Clear search"
              >
                <X size={16} />
              </button>
            )}
          </div>

          <button
            type="button"
            onClick={refreshReviews}
            disabled={loading}
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
          >
            <RefreshCw
              size={16}
              className={loading ? "animate-spin" : ""}
            />
            Refresh
          </button>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <select
            value={filters.visibility}
            onChange={(event) =>
              handleFilterChange("visibility", event.target.value)
            }
            className="rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-blue-600"
          >
            <option value="all">All Visibility</option>
            <option value="visible">Visible</option>
            <option value="hidden">Hidden</option>
          </select>

          <select
            value={filters.rating}
            onChange={(event) =>
              handleFilterChange("rating", event.target.value)
            }
            className="rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-blue-600"
          >
            <option value="all">All Ratings</option>
            {[5, 4, 3, 2, 1].map((rating) => (
              <option key={rating} value={rating}>
                {rating} Stars
              </option>
            ))}
          </select>

          <select
            value={filters.sort}
            onChange={(event) =>
              handleFilterChange("sort", event.target.value)
            }
            className="rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-blue-600"
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="highest">Highest Rating</option>
            <option value="lowest">Lowest Rating</option>
          </select>
        </div>
      </div>

      {/* Feedback */}
      {actionError && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {actionError}
        </div>
      )}

      {actionSuccess && (
        <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
          {actionSuccess}
        </div>
      )}

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Reviews Table */}
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1100px] text-left">
            <thead className="border-b border-slate-200 bg-slate-50">
              <tr>
                {[
                  "Customer",
                  "Product",
                  "Review",
                  "Rating",
                  "Purchase",
                  "Visibility",
                  "Date",
                  "Actions",
                ].map((heading) => (
                  <th
                    key={heading}
                    className="px-5 py-4 text-xs font-semibold uppercase text-slate-500"
                  >
                    {heading}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan="8" className="px-5 py-12 text-center">
                    <Loader2
                      size={26}
                      className="mx-auto animate-spin text-blue-700"
                    />

                    <p className="mt-2 text-sm text-slate-500">
                      Loading reviews...
                    </p>
                  </td>
                </tr>
              ) : reviews.length === 0 ? (
                <tr>
                  <td colSpan="8" className="px-5 py-12 text-center">
                    <MessageSquare
                      size={34}
                      className="mx-auto text-slate-300"
                    />

                    <p className="mt-2 font-medium text-slate-700">
                      No reviews found
                    </p>

                    <p className="mt-1 text-sm text-slate-500">
                      Try changing your search or filters.
                    </p>
                  </td>
                </tr>
              ) : (
                reviews.map((review) => {
                  const isUpdating =
                    updatingReviewId === review._id;

                  return (
                    <tr
                      key={review._id}
                      className="transition hover:bg-slate-50"
                    >
                      {/* Customer */}
                      <td className="px-5 py-4">
                        <p className="font-semibold text-slate-900">
                          {review.user?.name || "Unknown"}
                        </p>

                        <p className="mt-1 text-xs text-slate-500">
                          {review.user?.email || "—"}
                        </p>
                      </td>

                      {/* Product */}
                      <td className="px-5 py-4">
                        <p className="max-w-[180px] truncate text-sm font-medium text-slate-800">
                          {review.product?.name || "Product unavailable"}
                        </p>
                      </td>

                      {/* Review */}
                      <td className="px-5 py-4">
                        <p className="max-w-[240px] truncate font-semibold text-slate-900">
                          {review.title}
                        </p>

                        <p className="mt-1 max-w-[240px] text-xs text-slate-500 line-clamp-2">
                          {review.comment}
                        </p>
                      </td>

                      {/* Rating */}
                      <td className="px-5 py-4">
                        <span className="inline-flex items-center gap-1 font-semibold text-slate-800">
                          <Star
                            size={15}
                            className="fill-amber-400 text-amber-400"
                          />
                          {review.rating}/5
                        </span>
                      </td>

                      {/* Purchase */}
                      <td className="px-5 py-4">
                        {review.isVerifiedPurchase ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-green-50 px-2.5 py-1 text-xs font-semibold text-green-700">
                            <ShieldCheck size={14} />
                            Verified
                          </span>
                        ) : (
                          <span className="text-xs text-slate-400">
                            Unverified
                          </span>
                        )}
                      </td>

                      {/* Visibility */}
                      <td className="px-5 py-4">
                        <span
                          className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
                            review.isVisible
                              ? "bg-green-50 text-green-700"
                              : "bg-red-50 text-red-700"
                          }`}
                        >
                          {review.isVisible ? "Visible" : "Hidden"}
                        </span>
                      </td>

                      {/* Date */}
                      <td className="px-5 py-4 text-sm text-slate-600">
                        {formatDate(review.createdAt)}
                      </td>

                      {/* Actions */}
                      <td className="px-5 py-4">
                        <button
                          type="button"
                          onClick={() =>
                            handleVisibilityToggle(review)
                          }
                          disabled={Boolean(updatingReviewId)}
                          title={
                            review.isVisible
                              ? "Hide review"
                              : "Show review"
                          }
                          className={`rounded-lg border p-2 transition disabled:cursor-not-allowed disabled:opacity-50 ${
                            review.isVisible
                              ? "border-amber-200 text-amber-700 hover:bg-amber-50"
                              : "border-green-200 text-green-700 hover:bg-green-50"
                          }`}
                        >
                          {isUpdating ? (
                            <Loader2
                              size={16}
                              className="animate-spin"
                            />
                          ) : review.isVisible ? (
                            <EyeOff size={16} />
                          ) : (
                            <Eye size={16} />
                          )}
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Footer and Pagination */}
        <div className="flex flex-col gap-3 border-t border-slate-200 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-slate-500">
            Showing {reviews.length} of {pagination?.total ?? 0} reviews
          </p>

          <div className="flex items-center justify-between gap-3 sm:justify-end">
            <span className="text-sm text-slate-500">
              Page {pagination?.page ?? 1} of{" "}
              {pagination?.totalPages ?? 0}
            </span>

            <button
              type="button"
              onClick={() =>
                handleFilterChange("page", filters.page - 1)
              }
              disabled={filters.page <= 1 || loading}
              className="rounded-lg border border-slate-300 p-2 text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
              aria-label="Previous page"
            >
              <ChevronLeft size={18} />
            </button>

            <button
              type="button"
              onClick={() =>
                handleFilterChange("page", filters.page + 1)
              }
              disabled={
                filters.page >= (pagination?.totalPages || 1) ||
                loading
              }
              className="rounded-lg border border-slate-300 p-2 text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
              aria-label="Next page"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
