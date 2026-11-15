
import { AlertCircle, RefreshCw } from "lucide-react";

export default function ProductError({ message, onRetry }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-red-100 bg-white px-5 py-12 text-center">

      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-red-50">
        <AlertCircle size={28} className="text-red-500" />
      </div>

      <h2 className="mt-4 text-lg font-bold text-slate-900">
        Something went wrong
      </h2>

      <p className="mt-2 max-w-sm text-sm text-slate-500">
        {message || "Unable to load products. Please try again."}
      </p>

      <button
        type="button"
        onClick={onRetry}
        className="mt-5 inline-flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
      >
        <RefreshCw size={16} />
        Try Again
      </button>
    </div>
  );
}
