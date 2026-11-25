
"use client";

function Skeleton({ className = "" }) {
  return (
    <div
      className={`animate-pulse rounded-lg bg-slate-200 ${className}`}
    />
  );
}

function SummaryCardSkeleton() {
  return (
    <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm sm:p-5">
      <div className="flex items-center justify-between gap-2">
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-9 w-9 rounded-xl" />
      </div>
      <Skeleton className="mt-4 h-7 w-12" />
    </div>
  );
}

function OrderCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      {/* Order Header */}
      <div className="flex flex-col justify-between gap-4 p-5 sm:flex-row sm:items-center sm:px-6">
        <div className="flex items-start gap-3">
          <Skeleton className="h-11 w-11 shrink-0 rounded-xl" />

          <div className="min-w-0 flex-1 space-y-2">
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-4 w-36 max-w-full" />
            <Skeleton className="h-3 w-32" />
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <Skeleton className="h-7 w-24 rounded-full" />
          <Skeleton className="h-7 w-28 rounded-full" />
        </div>
      </div>

      <div className="border-t border-slate-100" />

      {/* Order Details */}
      <div className="grid grid-cols-2 gap-5 px-5 py-5 sm:grid-cols-3 sm:px-6">
        <div className="space-y-2">
          <Skeleton className="h-3 w-20" />
          <Skeleton className="h-5 w-24" />
        </div>

        <div className="space-y-2">
          <Skeleton className="h-3 w-24" />
          <Skeleton className="h-4 w-28" />
        </div>

        <div className="col-span-2 space-y-2 sm:col-span-1">
          <Skeleton className="h-3 w-12" />
          <Skeleton className="h-4 w-16" />
        </div>
      </div>

      {/* Order Footer */}
      <div className="flex justify-end border-t border-slate-100 bg-slate-50/70 px-5 py-4 sm:px-6">
        <Skeleton className="h-10 w-40 rounded-xl" />
      </div>
    </div>
  );
}

export default function OrdersSkeleton() {
  return (
    <div
      className="space-y-6"
      aria-label="Loading orders"
      aria-busy="true"
    >
      {/* Summary Cards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[1, 2, 3, 4].map((item) => (
          <SummaryCardSkeleton key={item} />
        ))}
      </div>

      {/* Filter Section */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
        <div className="mb-4 space-y-2">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-3 w-56 max-w-full" />
        </div>

        <div className="flex gap-2 overflow-hidden">
          {[1, 2, 3, 4, 5, 6].map((item) => (
            <Skeleton
              key={item}
              className="h-10 w-24 shrink-0 rounded-xl"
            />
          ))}
        </div>
      </div>

      {/* Orders List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-4 w-20" />
        </div>

        {[1, 2, 3].map((item) => (
          <OrderCardSkeleton key={item} />
        ))}
      </div>
    </div>
  );
}
