
"use client";

import { Loader2, Send, X } from "lucide-react";

import { REVIEW_CONFIG } from "@/constants/review.constants";
import RatingSelector from "./RatingSelector";

export default function ReviewForm({
  form,
  setForm,
  onSubmit,
  submitting = false,
  submitLabel = "Submit Review",
  onCancel,
  showCancel = false,
}) {
  const handleChange = (field, value) => {
    setForm((previous) => ({
      ...previous,
      [field]: value,
    }));
  };

  return (
    <form onSubmit={onSubmit} className="mt-6 space-y-5">
      {/* Rating */}
      <div>
        <label className="mb-3 block text-sm font-bold text-[#101828]">
          Your Rating
        </label>

        <RatingSelector
          rating={form.rating}
          onChange={(rating) => handleChange("rating", rating)}
          disabled={submitting}
        />
      </div>

      {/* Review title */}
      <div>
        <label
          htmlFor="review-title"
          className="mb-2 block text-sm font-semibold text-[#101828]"
        >
          Review Title
          <span className="ml-1 text-red-500">*</span>
        </label>

        <input
          id="review-title"
          name="title"
          type="text"
          required
          minLength={REVIEW_CONFIG.MIN_TITLE_LENGTH}
          maxLength={REVIEW_CONFIG.MAX_TITLE_LENGTH}
          value={form.title}
          disabled={submitting}
          onChange={(event) =>
            handleChange("title", event.target.value)
          }
          placeholder="Summarize your experience"
          className="min-h-12 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-[#101828] outline-none transition placeholder:text-slate-400 hover:border-slate-300 focus:border-[#0755e9] focus:ring-4 focus:ring-blue-50 disabled:cursor-not-allowed disabled:bg-slate-50"
        />

        <p className="mt-1.5 text-right text-xs text-slate-400">
          {form.title.length}/{REVIEW_CONFIG.MAX_TITLE_LENGTH}
        </p>
      </div>

      {/* Review comment */}
      <div>
        <label
          htmlFor="review-comment"
          className="mb-2 block text-sm font-semibold text-[#101828]"
        >
          Your Review
          <span className="ml-1 text-red-500">*</span>
        </label>

        <textarea
          id="review-comment"
          name="comment"
          rows={5}
          required
          minLength={REVIEW_CONFIG.MIN_COMMENT_LENGTH}
          maxLength={REVIEW_CONFIG.MAX_COMMENT_LENGTH}
          value={form.comment}
          disabled={submitting}
          onChange={(event) =>
            handleChange("comment", event.target.value)
          }
          placeholder="Tell us about the product quality, features and your experience..."
          className="w-full resize-y rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm leading-6 text-[#101828] outline-none transition placeholder:text-slate-400 hover:border-slate-300 focus:border-[#0755e9] focus:ring-4 focus:ring-blue-50 disabled:cursor-not-allowed disabled:bg-slate-50"
        />

        <p className="mt-1.5 text-right text-xs text-slate-400">
          {form.comment.length}/{REVIEW_CONFIG.MAX_COMMENT_LENGTH}
        </p>
      </div>

      {/* Actions */}
      <div className="flex flex-col gap-3 border-t border-slate-100 pt-5 sm:flex-row">
        <button
          type="submit"
          disabled={submitting}
          className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-[#0755e9] px-6 py-3 text-sm font-bold text-white shadow-sm transition-all duration-200 hover:bg-[#0645c4] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {submitting ? (
            <Loader2 size={18} className="animate-spin" />
          ) : (
            <Send size={17} />
          )}

          {submitting ? "Saving..." : submitLabel}
        </button>

        {showCancel && (
          <button
            type="button"
            onClick={onCancel}
            disabled={submitting}
            className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-6 py-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <X size={17} />
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}
