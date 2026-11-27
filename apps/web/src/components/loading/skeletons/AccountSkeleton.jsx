function Skeleton({ className = "" }) {
  return (
    <div className={`animate-pulse rounded-lg bg-slate-200 ${className}`} />
  );
}

export default function AccountSkeleton() {
  return (
    <div className="space-y-6" aria-label="Loading account overview" aria-busy="true">
      {/* Welcome Banner Skeleton */}
      <div className="rounded-2xl border border-[#E2E8F0] bg-[#F8FAFC] p-6">
        <Skeleton className="h-5 w-36 rounded-full" />
        <Skeleton className="mt-3 h-7 w-64" />
        <Skeleton className="mt-2 h-4 w-96 max-w-full" />
      </div>

      {/* KPI Row Skeleton */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
        {[1, 2, 3, 4].map((item) => (
          <div
            key={item}
            className="rounded-2xl border border-[#E2E8F0] bg-white p-4 sm:p-5"
          >
            <div className="flex items-center justify-between">
              <Skeleton className="h-3.5 w-20" />
              <Skeleton className="h-9 w-9 rounded-xl" />
            </div>
            <Skeleton className="mt-4 h-7 w-12" />
          </div>
        ))}
      </div>

      {/* Recent Orders Skeleton */}
      <div className="rounded-2xl border border-[#E2E8F0] bg-white p-5 sm:p-6">
        <div className="mb-4 flex items-center justify-between">
          <Skeleton className="h-5 w-36" />
          <Skeleton className="h-4 w-20" />
        </div>
        <div className="space-y-3">
          {[1, 2].map((order) => (
            <div
              key={order}
              className="flex items-center gap-4 rounded-xl border border-[#E2E8F0] p-4"
            >
              <Skeleton className="h-14 w-14 shrink-0 rounded-xl" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-44" />
                <Skeleton className="h-3 w-32" />
              </div>
              <Skeleton className="h-8 w-24 rounded-lg" />
            </div>
          ))}
        </div>
      </div>

      {/* Bottom 2 Columns */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div className="rounded-2xl border border-[#E2E8F0] bg-white p-5">
          <Skeleton className="h-5 w-40" />
          <Skeleton className="mt-4 h-24 w-full rounded-xl" />
        </div>
        <div className="rounded-2xl border border-[#E2E8F0] bg-white p-5">
          <Skeleton className="h-5 w-40" />
          <Skeleton className="mt-4 h-24 w-full rounded-xl" />
        </div>
      </div>
    </div>
  );
}

