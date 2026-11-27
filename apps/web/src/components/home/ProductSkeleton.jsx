export default function ProductSkeleton() {
  return (
    <div className="flex h-full animate-pulse flex-col overflow-hidden rounded-2xl border border-[#E2E8F0] bg-white">
      <div className="aspect-square w-full border-b border-[#E2E8F0]/70 bg-slate-100" />

      <div className="flex flex-1 flex-col p-3 sm:p-4">
        <div className="flex items-center justify-between">
          <div className="h-3 w-16 rounded bg-slate-100" />
          <div className="h-3 w-12 rounded bg-slate-100" />
        </div>

        <div className="mt-2.5 space-y-2">
          <div className="h-4 w-full rounded bg-slate-100" />
          <div className="h-4 w-3/4 rounded bg-slate-100" />
        </div>

        <div className="mt-4 flex items-baseline gap-2">
          <div className="h-5 w-20 rounded bg-slate-100" />
          <div className="h-3 w-14 rounded bg-slate-100" />
        </div>

        <div className="mt-2 h-3 w-16 rounded bg-slate-100" />

        <div className="mt-3 h-10 w-full rounded-xl bg-slate-100" />
      </div>
    </div>
  );
}
