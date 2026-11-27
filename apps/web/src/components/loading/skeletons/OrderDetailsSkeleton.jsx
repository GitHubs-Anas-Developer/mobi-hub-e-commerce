"use client";

function Skeleton({ className = "" }) {
  return (
    <div
      className={`animate-pulse rounded-lg bg-slate-200 ${className}`}
    />
  );
}

function OrderItemSkeleton() {
  return (
    <div className="flex flex-col gap-4 py-5 first:pt-0 last:pb-0 sm:flex-row sm:items-center">
      <Skeleton className="h-24 w-24 shrink-0 rounded-xl" />

      <div className="min-w-0 flex-1 space-y-2.5">
        <Skeleton className="h-5 w-3/4 max-w-64" />
        <Skeleton className="h-3 w-32" />

        <div className="flex flex-wrap gap-2">
          <Skeleton className="h-6 w-20 rounded-lg" />
          <Skeleton className="h-6 w-24 rounded-lg" />
        </div>

        <div className="flex gap-4">
          <Skeleton className="h-3.5 w-16" />
          <Skeleton className="h-3.5 w-24" />
        </div>
      </div>

      <div className="flex items-center justify-between border-t border-[#E2E8F0] pt-3 sm:block sm:border-0 sm:pt-0 sm:text-right">
        <Skeleton className="h-3 w-16" />
        <Skeleton className="mt-2 h-5 w-24" />
      </div>
    </div>
  );
}

export default function OrderDetailsSkeleton() {
  return (
    <div
      className="mx-auto w-full max-w-[1320px] space-y-6"
      aria-label="Loading order details"
      aria-busy="true"
    >
      {/* Breadcrumb & Header */}
      <div className="space-y-3">
        <Skeleton className="h-4 w-56 max-w-full" />
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-2">
            <Skeleton className="h-8 w-52" />
            <Skeleton className="h-4 w-72 max-w-full" />
          </div>
          <div className="flex gap-2.5">
            <Skeleton className="h-10 w-36 rounded-xl" />
            <Skeleton className="h-10 w-40 rounded-xl" />
          </div>
        </div>
      </div>

      {/* Summary Banner Card */}
      <section className="overflow-hidden rounded-2xl border border-[#E2E8F0] bg-white">
        <div className="flex flex-col justify-between gap-5 p-5 sm:flex-row sm:items-center sm:p-6">
          <div className="flex items-start gap-4">
            <Skeleton className="h-12 w-12 shrink-0 rounded-2xl" />
            <div className="space-y-2">
              <Skeleton className="h-3 w-24" />
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-4 w-40" />
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <Skeleton className="h-8 w-28 rounded-full" />
            <Skeleton className="h-8 w-28 rounded-full" />
          </div>
        </div>

        <div className="grid grid-cols-2 border-t border-[#E2E8F0] bg-[#F8FAFC] sm:grid-cols-4">
          {[1, 2, 3, 4].map((item) => (
            <div key={item} className="space-y-2 p-4 sm:px-6">
              <Skeleton className="h-3 w-20" />
              <Skeleton className="h-4 w-24" />
            </div>
          ))}
        </div>
      </section>

      {/* Main 2-Column Content */}
      <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
        <div className="min-w-0 space-y-6">
          {/* Timeline Skeleton */}
          <section className="rounded-2xl border border-[#E2E8F0] bg-white p-5 sm:p-6">
            <div className="mb-5 flex items-center justify-between gap-3">
              <Skeleton className="h-6 w-44" />
              <Skeleton className="h-7 w-24 rounded-full" />
            </div>
            <Skeleton className="mb-5 h-2 w-full rounded-full" />
            <div className="space-y-4">
              {[1, 2, 3, 4].map((step) => (
                <div key={step} className="flex gap-4">
                  <Skeleton className="h-10 w-10 shrink-0 rounded-xl" />
                  <Skeleton className="h-16 flex-1 rounded-2xl" />
                </div>
              ))}
            </div>
          </section>

          {/* Items Skeleton */}
          <section className="rounded-2xl border border-[#E2E8F0] bg-white p-5 sm:p-6">
            <Skeleton className="mb-5 h-6 w-44" />
            <div className="divide-y divide-[#E2E8F0]">
              <OrderItemSkeleton />
              <OrderItemSkeleton />
            </div>
          </section>

          {/* Address & Payment Skeleton */}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {[1, 2].map((card) => (
              <section
                key={card}
                className="rounded-2xl border border-[#E2E8F0] bg-white p-5 sm:p-6"
              >
                <Skeleton className="mb-4 h-6 w-40" />
                <Skeleton className="h-32 w-full rounded-xl" />
              </section>
            ))}
          </div>
        </div>

        {/* Sticky Sidebar Skeleton */}
        <aside className="space-y-5">
          <section className="rounded-2xl border border-[#E2E8F0] bg-white p-5 sm:p-6">
            <Skeleton className="mb-5 h-6 w-36" />
            <div className="space-y-3.5">
              {[1, 2, 3].map((row) => (
                <div key={row} className="flex justify-between gap-4">
                  <Skeleton className="h-4 w-28" />
                  <Skeleton className="h-4 w-20" />
                </div>
              ))}
              <div className="border-t border-[#E2E8F0] pt-4">
                <div className="flex justify-between gap-4">
                  <Skeleton className="h-5 w-28" />
                  <Skeleton className="h-6 w-24" />
                </div>
              </div>
            </div>
          </section>

          <section className="rounded-2xl border border-[#E2E8F0] bg-white p-5 sm:p-6">
            <Skeleton className="mb-3 h-6 w-32" />
            <Skeleton className="h-12 w-full rounded-xl" />
          </section>
        </aside>
      </div>
    </div>
  );
}
