
"use client";

import { Loader2, Save, X } from "lucide-react";


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
    <form onSubmit={onSubmit} className="mt-5 space-y-4">
      <div>
        <label className="mb-2 block text-sm font-medium text-slate-700">
          Your Rating
        </label>

        <RatingSelector
          rating={form.rating}
          onChange={(rating) => handleChange("rating", rating)}
          disabled={submitting}
        />
      </div>

      <div>
        <label
          htmlFor="review-title"
          className="mb-2 block text-sm font-medium text-slate-700"
        >
          Review Title
        </label>

        <input
          id="review-title"
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
          className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-blue-600 focus:ring-2 focus:ring-blue-100 disabled:bg-slate-50"
        />
      </div>

      <div>
        <label
          htmlFor="review-comment"
          className="mb-2 block text-sm font-medium text-slate-700"
        >
          Your Review
        </label>

        <textarea
          id="review-comment"
          rows={4}
          required
          minLength={REVIEW_CONFIG.MIN_COMMENT_LENGTH}
          maxLength={REVIEW_CONFIG.MAX_COMMENT_LENGTH}
          value={form.comment}
          disabled={submitting}
          onChange={(event) =>
            handleChange("comment", event.target.value)
          }
          placeholder="Tell us about this product..."
          className="w-full resize-y rounded-lg border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-blue-600 focus:ring-2 focus:ring-blue-100 disabled:bg-slate-50"
        />
      </div>

      <div className="flex flex-wrap gap-3">
        <button
          type="submit"
          disabled={submitting}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-700 px-6 py-3 text-sm font-semibold text-white transition hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {submitting ? (
            <Loader2 size={17} className="animate-spin" />
          ) : (
            <Save size={17} />
          )}

          {submitting ? "Saving..." : submitLabel}
        </button>

        {showCancel && (
          <button
            type="button"
            onClick={onCancel}
            disabled={submitting}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
          >
            <X size={17} />
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}
