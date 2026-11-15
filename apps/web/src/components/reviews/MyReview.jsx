
"use client";

import { useState } from "react";
import { Pencil, Trash2, LoaderCircle, MessageSquareText } from "lucide-react";
import ReviewCard from "./ReviewCard";
import ReviewForm from "./ReviewForm";
import {
  INITIAL_REVIEW_FORM,
  REVIEW_MESSAGES,
} from "@/constants/review.constants";

export default function MyReview({
  review,
  onUpdate,
  onDelete,
  updating = false,
  deleting = false,
}) {
  const [isEditing, setIsEditing] = useState(false);

  const [form, setForm] = useState({
    ...INITIAL_REVIEW_FORM,
    rating: review?.rating || INITIAL_REVIEW_FORM.rating,
    title: review?.title || "",
    comment: review?.comment || "",
  });

  if (!review) return null;

  const isBusy = updating || deleting;

  const handleEdit = () => {
    setForm({
      ...INITIAL_REVIEW_FORM,
      rating: review.rating || INITIAL_REVIEW_FORM.rating,
      title: review.title || "",
      comment: review.comment || "",
    });

    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);

    setForm({
      ...INITIAL_REVIEW_FORM,
      rating: review.rating || INITIAL_REVIEW_FORM.rating,
      title: review.title || "",
      comment: review.comment || "",
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (isBusy) return;

    try {
      await onUpdate?.(form);
      setIsEditing(false);
    } catch {
      // Parent component handles errors.
    }
  };

  const handleDelete = async () => {
    if (isBusy) return;

    if (!window.confirm(REVIEW_MESSAGES.DELETE_CONFIRMATION)) {
      return;
    }

    try {
      await onDelete?.();
    } catch {
      // Parent component handles errors.
    }
  };

  return (
    <section className="overflow-hidden rounded-2xl border border-blue-100 bg-gradient-to-br from-blue-50/80 to-white p-4 shadow-sm sm:p-5">
      {/* Header */}
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-100 text-[#0755e9]">
            <MessageSquareText size={18} />
          </div>

          <div>
            <h3 className="text-sm font-bold text-slate-900 sm:text-base">
              Your Review
            </h3>
            <p className="text-xs text-slate-500">
              {isEditing
                ? "Update your product experience"
                : "Manage your feedback"}
            </p>
          </div>
        </div>

        {!isEditing && (
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleEdit}
              disabled={isBusy}
              className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition hover:border-blue-200 hover:bg-blue-50 hover:text-[#0755e9] disabled:cursor-not-allowed disabled:opacity-50 sm:text-sm"
            >
              <Pencil size={14} />
              Edit
            </button>

            <button
              type="button"
              onClick={handleDelete}
              disabled={isBusy}
              className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-red-200 bg-white px-3 py-2 text-xs font-semibold text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50 sm:text-sm"
            >
              {deleting ? (
                <LoaderCircle size={14} className="animate-spin" />
              ) : (
                <Trash2 size={14} />
              )}

              {deleting ? "Deleting..." : "Delete"}
            </button>
          </div>
        )}
      </div>

      {/* Review Content */}
      {isEditing ? (
        <div className="rounded-xl border border-slate-200 bg-white p-3 sm:p-5">
          <ReviewForm
            form={form}
            setForm={setForm}
            onSubmit={handleSubmit}
            submitting={updating}
            submitLabel="Update Review"
            showCancel
            onCancel={handleCancel}
          />
        </div>
      ) : (
        <ReviewCard review={review} />
      )}
    </section>
  );
}
