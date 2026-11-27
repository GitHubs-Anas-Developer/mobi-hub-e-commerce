"use client";

function Skeleton({ className = "" }) {
  return (
    <div className={`animate-pulse rounded-lg bg-slate-200 ${className}`} />
  );
}

function OrderCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-2xl border border-[#E2E8F0] bg-white">
      <div className="flex flex-col justify-between gap-4 p-5 sm:flex-row sm:items-center">
        <div className="space-y-2">
          <Skeleton className="h-3 w-24" />
          <Skeleton className="h-4 w-40" />
          <Skeleton className="h-3 w-28" />
        </div>

        <div className="flex gap-2">
          <Skeleton className="h-7 w-24 rounded-full" />
          <Skeleton className="h-7 w-28 rounded-full" />
        </div>
      </div>

      <div className="border-t border-[#E2E8F0] p-5">
        <div className="flex items-center gap-3">
          <Skeleton className="h-16 w-16 shrink-0 rounded-xl" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-1/3" />
          </div>
        </div>
      </div>

      <div className="flex justify-end border-t border-[#E2E8F0] bg-[#F8FAFC] px-5 py-3">
        <Skeleton className="h-9 w-36 rounded-xl" />
      </div>
    </div>
  );
}

export default function OrdersSkeleton() {
  return (
    <div className="space-y-6" aria-label="Loading orders" aria-busy="true">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[1, 2, 3, 4].map((item) => (
          <div
            key={item}
            className="rounded-2xl border border-[#E2E8F0] bg-white p-4"
          >
            <div className="flex items-center justify-between">
              <Skeleton className="h-3.5 w-20" />
              <Skeleton className="h-9 w-9 rounded-xl" />
            </div>
            <Skeleton className="mt-3 h-7 w-12" />
          </div>
        ))}
      </div>

      <div className="rounded-2xl border border-[#E2E8F0] bg-white p-4">
        <div className="flex gap-2 overflow-hidden">
          {[1, 2, 3, 4, 5].map((item) => (
            <Skeleton key={item} className="h-9 w-24 shrink-0 rounded-xl" />
          ))}
        </div>
      </div>

      <div className="space-y-4">
        <OrderCardSkeleton />
        <OrderCardSkeleton />
      </div>
    </div>
  );
}
