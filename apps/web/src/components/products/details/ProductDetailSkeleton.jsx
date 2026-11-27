function Skeleton({ className = "" }) {
  return (
    <div
      className={`animate-pulse rounded-lg bg-slate-200 ${className}`}
    />
  );
}

export default function ProductDetailSkeleton() {
  return (
    <div
      className="mx-auto w-full max-w-[1440px] px-4 py-5 sm:px-6 sm:py-6 lg:px-8"
      aria-label="Loading product details"
      aria-busy="true"
    >
      {/* Breadcrumb */}
      <Skeleton className="mb-5 h-4 w-56" />

      {/* Two Column Product Hero */}
      <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-12 lg:gap-12">
        {/* Gallery */}
        <div className="flex flex-col gap-3 lg:col-span-6 lg:flex-row-reverse lg:gap-4">
          <Skeleton className="aspect-square w-full flex-1 rounded-2xl" />

          <div className="flex gap-2.5 overflow-hidden lg:w-[82px] lg:flex-col">
            {[1, 2, 3, 4].map((item) => (
              <Skeleton
                key={item}
                className="h-[72px] w-[72px] shrink-0 rounded-xl lg:h-[78px] lg:w-[78px]"
              />
            ))}
          </div>
        </div>

        {/* Info & Actions */}
        <div className="space-y-5 lg:col-span-6">
          <div className="flex items-center justify-between">
            <Skeleton className="h-6 w-24 rounded-md" />
            <Skeleton className="h-5 w-36 rounded-md" />
          </div>

          <div className="space-y-2">
            <Skeleton className="h-8 w-5/6" />
            <Skeleton className="h-8 w-1/2" />
          </div>

          <div className="flex gap-3">
            <Skeleton className="h-6 w-28 rounded-lg" />
            <Skeleton className="h-6 w-24 rounded-lg" />
          </div>

          {/* Price Box */}
          <div className="rounded-2xl border border-[#E2E8F0] bg-[#F8FAFC] p-5">
            <div className="flex items-baseline gap-3">
              <Skeleton className="h-9 w-36" />
              <Skeleton className="h-5 w-20" />
              <Skeleton className="h-6 w-16 rounded-lg" />
            </div>
            <Skeleton className="mt-3 h-4 w-28" />
            <div className="mt-4 border-t border-[#E2E8F0] pt-3">
              <Skeleton className="h-4 w-40" />
            </div>
          </div>

          {/* Variants */}
          <div className="space-y-2.5">
            <Skeleton className="h-4 w-28" />
            <div className="flex flex-wrap gap-2">
              <Skeleton className="h-10 w-24 rounded-xl" />
              <Skeleton className="h-10 w-24 rounded-xl" />
              <Skeleton className="h-10 w-24 rounded-xl" />
            </div>
          </div>

          {/* Quantity & Actions */}
          <Skeleton className="h-10 w-44 rounded-xl" />

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <Skeleton className="h-12 rounded-xl sm:col-span-1" />
            <Skeleton className="h-12 rounded-xl sm:col-span-1" />
            <Skeleton className="h-12 rounded-xl sm:col-span-1" />
          </div>

          {/* Highlights */}
          <div className="grid grid-cols-1 gap-3 border-t border-[#E2E8F0] pt-5 sm:grid-cols-2">
            {[1, 2, 3, 4].map((item) => (
              <Skeleton key={item} className="h-16 rounded-xl" />
            ))}
          </div>
        </div>
      </div>

      {/* Tabs Skeleton */}
      <div className="mt-12 border-t border-[#E2E8F0] pt-8">
        <div className="flex gap-2.5">
          {[1, 2, 3, 4].map((tab) => (
            <Skeleton key={tab} className="h-10 w-32 rounded-xl" />
          ))}
        </div>
        <Skeleton className="mt-5 h-44 w-full rounded-2xl" />
      </div>
    </div>
  );
}
