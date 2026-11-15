
export default function ProductSkeleton({ viewMode = "grid" }) {
  if (viewMode === "list") {
    return (
      <div className="flex animate-pulse items-center gap-4 rounded-xl border border-slate-200 p-4">
        <div className="aspect-square w-28 shrink-0 rounded-lg bg-slate-200 sm:w-40" />

        <div className="flex-1 space-y-3">
          <div className="h-3 w-1/4 rounded bg-slate-200" />
          <div className="h-4 w-3/4 rounded bg-slate-200" />
          <div className="h-4 w-1/3 rounded bg-slate-200" />
          <div className="h-9 w-32 rounded-lg bg-slate-200" />
        </div>
      </div>
    );
  }

  return (
    <div className="animate-pulse overflow-hidden rounded-xl border border-slate-200">
      <div className="aspect-square bg-slate-100" />

      <div className="space-y-3 p-4">
        <div className="h-3 w-1/3 rounded bg-slate-200" />
        <div className="h-4 w-full rounded bg-slate-200" />
        <div className="h-5 w-1/2 rounded bg-slate-200" />
        <div className="h-9 w-full rounded-lg bg-slate-200" />
      </div>
    </div>
  );
}
