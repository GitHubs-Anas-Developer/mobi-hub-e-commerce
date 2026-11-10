
"use client";

import { AlertTriangle, Loader2, Trash2, X } from "lucide-react";

export default function ProductDeleteModal({
  product,
  loading,
  onConfirm,
  onCancel,
}) {
  if (!product) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
        <div className="flex items-start justify-between">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-50 text-red-600">
            <AlertTriangle size={24} />
          </div>

          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 disabled:opacity-50"
            aria-label="Close modal"
          >
            <X size={20} />
          </button>
        </div>

        <h2 className="mt-5 text-lg font-semibold text-slate-900">
          Delete Product?
        </h2>

        <p className="mt-2 text-sm leading-6 text-slate-600">
          Are you sure you want to delete{" "}
          <span className="font-semibold text-slate-900">
            {product.name}
          </span>
          ? This action cannot be undone.
        </p>

        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-red-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Deleting...
              </>
            ) : (
              <>
                <Trash2 size={16} />
                Delete Product
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
