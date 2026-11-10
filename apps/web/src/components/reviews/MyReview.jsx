
"use client";

import { useState } from "react";
import { Pencil, Trash2 } from "lucide-react";
import ReviewCard from "./ReviewCard";
import ReviewForm from "./ReviewForm";
import { INITIAL_REVIEW_FORM, REVIEW_MESSAGES } from "@/constants/review.constants";

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

  const handleEdit = () => {
    setForm({
      rating: review.rating,
      title: review.title || "",
      comment: review.comment || "",
    });

    setIsEditing(true);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      await onUpdate?.(form);
      setIsEditing(false);
    } catch {
      // Parent component handles the error message.
    }
  };

  const handleDelete = async () => {
    if (!window.confirm(REVIEW_MESSAGES.DELETE_CONFIRMATION)) {
      return;
    }

    try {
      await onDelete?.();
    } catch {
      // Parent component handles the error message.
    }
  };

  if (!review) return null;

  return (
    <section className="rounded-xl border border-blue-100 bg-blue-50/40 p-4 sm:p-5">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h3 className="font-semibold text-slate-900">
          Your Review
        </h3>

        {!isEditing && (
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleEdit}
              disabled={updating || deleting}
              className="inline-flex items-center gap-1 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
            >
              <Pencil size={15} />
              Edit
            </button>

            <button
              type="button"
              onClick={handleDelete}
              disabled={updating || deleting}
              className="inline-flex items-center gap-1 rounded-lg border border-red-200 bg-white px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 disabled:opacity-50"
            >
              <Trash2 size={15} />
              {deleting ? "Deleting..." : "Delete"}
            </button>
          </div>
        )}
      </div>

      {isEditing ? (
        <ReviewForm
          form={form}
          setForm={setForm}
          onSubmit={handleSubmit}
          submitting={updating}
          submitLabel="Update Review"
          showCancel
          onCancel={() => setIsEditing(false)}
        />
      ) : (
        <ReviewCard review={review} />
      )}
    </section>
  );
}
