
"use client";

import { ArrowLeft, Loader2, Save } from "lucide-react";

export default function ProductFormActions({
  loading,
  onCancel,
  submitLabel = "Create Product",
  loadingLabel = "Creating Product...",
}) {
  return (
    <div className="flex flex-col-reverse justify-end gap-3 sm:flex-row">
      <button
        type="button"
        onClick={onCancel}
        disabled={loading}
        className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-5 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
      >
        <ArrowLeft size={17} />
        Cancel
      </button>

      <button
        type="submit"
        disabled={loading}
        className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {loading ? (
          <>
            <Loader2 size={17} className="animate-spin" />
            {loadingLabel}
          </>
        ) : (
          <>
            <Save size={17} />
            {submitLabel}
          </>
        )}
      </button>
    </div>
  );
}
