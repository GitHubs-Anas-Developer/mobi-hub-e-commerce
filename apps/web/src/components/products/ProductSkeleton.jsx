"use client";

export default function ProductSkeleton({ viewMode = "grid" }) {
  if (viewMode === "list") {
    return (
      <div className="flex animate-pulse flex-col gap-4 rounded-2xl border border-[#E2E8F0] bg-white p-4 sm:flex-row sm:items-center">
        <div className="aspect-square w-full shrink-0 rounded-xl bg-slate-100 sm:h-40 sm:w-44" />

        <div className="flex-1 space-y-3">
          <div className="h-3 w-20 rounded bg-slate-200" />
          <div className="h-4 w-3/4 rounded bg-slate-200" />
          <div className="h-3 w-full max-w-md rounded bg-slate-100" />
          <div className="flex items-center gap-3 pt-1">
            <div className="h-5 w-24 rounded bg-slate-200" />
            <div className="h-9 w-32 rounded-xl bg-slate-200" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-pulse overflow-hidden rounded-2xl border border-[#E2E8F0] bg-white">
      <div className="aspect-square border-b border-[#F1F5F9] bg-[#F8FAFC] p-4">
        <div className="h-full w-full rounded-xl bg-slate-100" />
      </div>

      <div className="space-y-3 p-3 sm:p-4">
        <div className="flex items-center justify-between">
          <div className="h-3 w-16 rounded bg-slate-200" />
          <div className="h-4 w-12 rounded bg-slate-100" />
        </div>
        <div className="h-4 w-full rounded bg-slate-200" />
        <div className="h-4 w-2/3 rounded bg-slate-200" />
        <div className="h-5 w-24 rounded bg-slate-200" />
        <div className="h-10 w-full rounded-xl bg-slate-200" />
      </div>
    </div>
  );
}
