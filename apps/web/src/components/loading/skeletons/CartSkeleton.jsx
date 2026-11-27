function Skeleton({ className = "" }) {
  return (
    <div
      className={`animate-pulse rounded-lg bg-slate-200 ${className}`}
    />
  );
}

function CartItemSkeleton() {
  return (
    <div className="flex gap-4 border-b border-[#E2E8F0] py-4 last:border-b-0 sm:py-5">
      <Skeleton className="h-24 w-24 shrink-0 rounded-xl sm:h-28 sm:w-28" />

      <div className="flex min-w-0 flex-1 flex-col justify-between">
        <div className="space-y-2">
          <Skeleton className="h-3 w-20" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-3 w-1/3" />
        </div>

        <div className="mt-4 flex items-center justify-between gap-3">
          <Skeleton className="h-9 w-28 rounded-xl" />
          <Skeleton className="h-6 w-20" />
        </div>
      </div>
    </div>
  );
}

export default function CartSkeleton() {
  return (
    <div className="mx-auto w-full" aria-label="Loading shopping cart" aria-busy="true">
      <Skeleton className="mb-4 h-4 w-36" />

      {/* Header Skeleton */}
      <div className="mb-6 flex flex-col gap-4 rounded-2xl border border-[#E2E8F0] bg-white p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-14 w-14 rounded-2xl" />
          <div className="space-y-2">
            <Skeleton className="h-7 w-48" />
            <Skeleton className="h-4 w-72 max-w-full" />
          </div>
        </div>
        <Skeleton className="h-10 w-40 rounded-xl" />
      </div>

      {/* Main 2-column Layout */}
      <div className="grid grid-cols-1 items-start gap-5 lg:grid-cols-[minmax(0,1fr)_380px] lg:gap-7">
        {/* Items Card */}
        <div className="overflow-hidden rounded-2xl border border-[#E2E8F0] bg-white">
          <div className="flex items-center justify-between border-b border-[#E2E8F0] px-5 py-4">
            <Skeleton className="h-5 w-40" />
            <Skeleton className="h-9 w-24 rounded-xl" />
          </div>

          <div className="px-5">
            <CartItemSkeleton />
            <CartItemSkeleton />
            <CartItemSkeleton />
          </div>

          <div className="border-t border-[#E2E8F0] bg-[#F8FAFC] px-5 py-3">
            <Skeleton className="h-4 w-32" />
          </div>
        </div>

        {/* Summary Card */}
        <div className="hidden space-y-4 lg:block">
          <div className="rounded-2xl border border-[#E2E8F0] bg-white p-6">
            <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-4">
              <Skeleton className="h-6 w-36" />
              <Skeleton className="h-6 w-16 rounded-full" />
            </div>

            <div className="space-y-3 border-b border-[#E2E8F0] py-4">
              <Skeleton className="h-4 w-28" />
              <div className="flex gap-2">
                <Skeleton className="h-10 flex-1 rounded-xl" />
                <Skeleton className="h-10 w-20 rounded-xl" />
              </div>
            </div>

            <div className="space-y-3 border-b border-[#E2E8F0] py-4">
              <div className="flex justify-between">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-20" />
              </div>
              <div className="flex justify-between">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-5 w-14 rounded-full" />
              </div>
            </div>

            <div className="py-4">
              <div className="flex justify-between">
                <Skeleton className="h-5 w-28" />
                <Skeleton className="h-7 w-24" />
              </div>
            </div>

            <Skeleton className="h-12 w-full rounded-xl" />
            <Skeleton className="mt-3 h-10 w-full rounded-xl" />
          </div>
        </div>
      </div>
    </div>
  );
}
