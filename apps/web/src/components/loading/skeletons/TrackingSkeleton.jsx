"use client";

function Skeleton({ className = "" }) {
  return (
    <div
      className={`animate-pulse rounded-lg bg-slate-200 ${className}`}
    />
  );
}

function TileSkeleton() {
  return (
    <div className="rounded-2xl border border-[#E2E8F0] bg-white p-4">
      <div className="flex items-center gap-3">
        <Skeleton className="h-10 w-10 shrink-0 rounded-xl" />
        <div className="min-w-0 flex-1 space-y-2">
          <Skeleton className="h-3 w-24" />
          <Skeleton className="h-4 w-36 max-w-full" />
        </div>
      </div>
    </div>
  );
}

export default function TrackingSkeleton() {
  return (
    <div
      className="mx-auto w-full max-w-[1320px] space-y-6"
      aria-label="Loading shipment tracking"
      aria-busy="true"
    >
      {/* Breadcrumb & Header */}
      <div className="space-y-3">
        <Skeleton className="h-4 w-60 max-w-full" />
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div className="space-y-2">
            <Skeleton className="h-8 w-56" />
            <Skeleton className="h-4 w-72 max-w-full" />
          </div>
          <div className="flex gap-2.5">
            <Skeleton className="h-10 w-36 rounded-xl" />
            <Skeleton className="h-10 w-36 rounded-xl" />
          </div>
        </div>
      </div>

      {/* Hero Status Banner */}
      <section className="rounded-2xl bg-[#082B70] p-6 sm:p-8">
        <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-center">
          <div className="space-y-3">
            <Skeleton className="h-7 w-40 rounded-full bg-white/15" />
            <Skeleton className="h-8 w-64 max-w-full bg-white/15" />
            <Skeleton className="h-4 w-80 max-w-full bg-white/15" />
          </div>
          <Skeleton className="h-16 w-16 shrink-0 rounded-2xl bg-white/15" />
        </div>

        <div className="mt-6 grid grid-cols-1 gap-4 border-t border-white/15 pt-5 sm:grid-cols-3">
          {[1, 2, 3].map((item) => (
            <div key={item} className="space-y-2">
              <Skeleton className="h-3 w-24 bg-white/15" />
              <Skeleton className="h-4 w-32 bg-white/15" />
            </div>
          ))}
        </div>
      </section>

      {/* Main 2 Columns */}
      <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
        <div className="min-w-0 space-y-6">
          {/* Timeline Skeleton */}
          <section className="rounded-2xl border border-[#E2E8F0] bg-white p-5 sm:p-7">
            <div className="mb-5 flex items-center justify-between gap-4">
              <div className="space-y-2">
                <Skeleton className="h-3 w-28" />
                <Skeleton className="h-6 w-44" />
              </div>
              <Skeleton className="h-8 w-24 rounded-full" />
            </div>
            <Skeleton className="mb-6 h-2 w-full rounded-full" />
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map((step) => (
                <div key={step} className="flex gap-4">
                  <Skeleton className="h-10 w-10 shrink-0 rounded-xl" />
                  <Skeleton className="h-20 flex-1 rounded-2xl" />
                </div>
              ))}
            </div>
          </section>

          {/* Chronological Tracking History Skeleton */}
          <section className="rounded-2xl border border-[#E2E8F0] bg-white p-5 sm:p-7">
            <Skeleton className="mb-5 h-6 w-48" />
            <div className="space-y-3">
              {[1, 2, 3].map((row) => (
                <Skeleton key={row} className="h-20 w-full rounded-2xl" />
              ))}
            </div>
          </section>
        </div>

        {/* Shipment Details Right Column */}
        <aside className="space-y-5">
          <section className="rounded-2xl border border-[#E2E8F0] bg-white p-5 sm:p-6">
            <Skeleton className="mb-4 h-6 w-44" />
            <div className="space-y-3">
              <TileSkeleton />
              <TileSkeleton />
              <TileSkeleton />
            </div>
            <Skeleton className="mt-4 h-11 w-full rounded-xl" />
          </section>

          <section className="rounded-2xl border border-[#E2E8F0] bg-white p-5 sm:p-6">
            <Skeleton className="mb-3 h-6 w-36" />
            <Skeleton className="h-11 w-full rounded-xl" />
          </section>
        </aside>
      </div>
    </div>
  );
}
