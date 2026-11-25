
"use client";

function Skeleton({ className = "" }) {
  return (
    <div
      className={`animate-pulse rounded-lg bg-slate-200 ${className}`}
    />
  );
}

function DetailTileSkeleton() {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4">
      <div className="flex items-center gap-3">
        <Skeleton className="h-10 w-10 shrink-0 rounded-xl" />
        <div className="min-w-0 flex-1 space-y-2">
          <Skeleton className="h-3 w-24" />
          <Skeleton className="h-4 w-32 max-w-full" />
        </div>
      </div>
    </div>
  );
}

function TrackingEventSkeleton() {
  return (
    <div className="flex gap-4 pb-8">
      <Skeleton className="h-9 w-9 shrink-0 rounded-xl" />

      <div className="min-w-0 flex-1 space-y-3">
        <div className="flex flex-wrap justify-between gap-3">
          <Skeleton className="h-4 w-36" />
          <Skeleton className="h-3 w-28" />
        </div>
        <Skeleton className="h-3 w-full max-w-md" />
        <Skeleton className="h-3 w-32" />
      </div>
    </div>
  );
}

export default function TrackingSkeleton() {
  return (
    <div
      className="min-h-screen bg-[#f5f7fb]"
      aria-label="Loading shipment tracking"
      aria-busy="true"
    >
      <div className="mx-auto w-full max-w-[1800px] px-4 py-6 sm:px-6 lg:px-10 xl:px-14">

        {/* Top navigation */}
        <div className="mb-6 flex items-center justify-between gap-4">
          <Skeleton className="h-5 w-36" />
          <Skeleton className="h-10 w-40 rounded-xl" />
        </div>

        {/* Delivery banner */}
        <section className="rounded-[28px] bg-[#101d3a] p-6 sm:p-9 lg:p-12">
          <div className="grid gap-8 lg:grid-cols-[1fr_auto] lg:items-center">
            <div className="space-y-5">
              <Skeleton className="h-7 w-52 rounded-full bg-slate-600" />
              <Skeleton className="h-10 w-full max-w-xl bg-slate-600" />
              <Skeleton className="h-4 w-full max-w-lg bg-slate-600" />

              <div className="flex flex-wrap gap-3 pt-2">
                <div className="rounded-xl border border-white/10 bg-white/[0.08] p-4">
                  <Skeleton className="h-3 w-24 bg-slate-600" />
                  <Skeleton className="mt-3 h-4 w-32 bg-slate-600" />
                </div>

                <div className="rounded-xl border border-white/10 bg-white/[0.08] p-4">
                  <Skeleton className="h-3 w-24 bg-slate-600" />
                  <Skeleton className="mt-3 h-4 w-32 bg-slate-600" />
                </div>
              </div>
            </div>

            <div className="flex items-center gap-5 lg:flex-col">
              <Skeleton className="h-20 w-20 rounded-[26px] bg-slate-600" />
              <div className="space-y-3">
                <Skeleton className="h-3 w-24 bg-slate-600" />
                <Skeleton className="h-4 w-40 bg-slate-600" />
              </div>
            </div>
          </div>
        </section>

        {/* Shipment progress */}
        <section className="mt-6 rounded-[26px] border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div className="space-y-3">
              <Skeleton className="h-3 w-28" />
              <Skeleton className="h-6 w-48" />
            </div>
            <Skeleton className="h-4 w-32" />
          </div>

          {/* Desktop progress */}
          <div className="mt-9 hidden md:grid md:grid-cols-6 md:gap-3">
            {[1, 2, 3, 4, 5, 6].map((item) => (
              <div key={item} className="flex flex-col items-center gap-4">
                <Skeleton className="h-11 w-11 rounded-full" />
                <Skeleton className="h-3 w-24 max-w-full" />
              </div>
            ))}
          </div>

          {/* Mobile progress */}
          <div className="mt-6 space-y-3 md:hidden">
            {[1, 2, 3, 4, 5, 6].map((item) => (
              <div
                key={item}
                className="flex items-center gap-3 rounded-xl bg-slate-50 p-3"
              >
                <Skeleton className="h-9 w-9 rounded-full" />
                <Skeleton className="h-4 w-40 max-w-full" />
              </div>
            ))}
          </div>
        </section>

        {/* Tracking activity and shipment details */}
        <div className="mt-6 grid items-start gap-6 xl:grid-cols-[minmax(0,1.55fr)_minmax(360px,0.85fr)]">

          {/* Tracking activity */}
          <section className="rounded-[26px] border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
            <div className="flex items-center justify-between gap-3">
              <div className="space-y-3">
                <Skeleton className="h-3 w-28" />
                <Skeleton className="h-6 w-40" />
              </div>
              <Skeleton className="h-7 w-20 rounded-full" />
            </div>

            <div className="mt-8">
              {[1, 2, 3, 4].map((item) => (
                <TrackingEventSkeleton key={item} />
              ))}
            </div>
          </section>

          {/* Right column */}
          <div className="space-y-6">

            {/* Package information */}
            <section className="rounded-[26px] border border-slate-200 bg-white p-6 shadow-sm sm:p-7">
              <div className="space-y-3">
                <Skeleton className="h-3 w-28" />
                <Skeleton className="h-6 w-48" />
              </div>

              <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
                {[1, 2, 3, 4, 5].map((item) => (
                  <DetailTileSkeleton key={item} />
                ))}
              </div>

              <Skeleton className="mt-5 h-12 w-full rounded-xl" />
            </section>

            {/* Latest location */}
            <section className="rounded-[26px] border border-slate-200 bg-white p-6 shadow-sm sm:p-7">
              <div className="flex items-center gap-3">
                <Skeleton className="h-11 w-11 rounded-xl" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-3 w-28" />
                  <Skeleton className="h-5 w-40 max-w-full" />
                </div>
              </div>

              <Skeleton className="mt-5 h-4 w-full" />
              <Skeleton className="mt-3 h-4 w-3/4" />
              <Skeleton className="mt-5 h-16 w-full rounded-xl" />
            </section>
          </div>
        </div>

        {/* Bottom actions */}
        <section className="mt-6 flex flex-col justify-between gap-4 rounded-[24px] border border-slate-200 bg-white p-5 sm:flex-row sm:items-center sm:px-7">
          <div className="space-y-2">
            <Skeleton className="h-5 w-40" />
            <Skeleton className="h-3 w-56 max-w-full" />
          </div>

          <div className="flex flex-col gap-2 sm:flex-row">
            <Skeleton className="h-11 w-full rounded-xl sm:w-32" />
            <Skeleton className="h-11 w-full rounded-xl sm:w-40" />
          </div>
        </section>
      </div>
    </div>
  );
}
