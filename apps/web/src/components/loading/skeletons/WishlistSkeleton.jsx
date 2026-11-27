function Skeleton({ className = "" }) {
  return (
    <div
      className={`animate-pulse rounded-lg bg-slate-200 ${className}`}
    />
  );
}

function WishlistCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-2xl border border-[#E2E8F0] bg-white">
      <div className="border-b border-[#F1F5F9] bg-[#F8FAFC] p-4">
        <Skeleton className="aspect-square w-full rounded-xl" />
      </div>

      <div className="space-y-3 p-3 sm:p-4">
        <div className="flex items-center justify-between">
          <Skeleton className="h-3 w-16" />
          <Skeleton className="h-4 w-12" />
        </div>
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-5 w-20" />
        <Skeleton className="h-10 w-full rounded-xl" />
      </div>
    </div>
  );
}

export default function WishlistSkeleton() {
  return (
    <div className="mx-auto w-full" aria-label="Loading wishlist" aria-busy="true">
      <Skeleton className="mb-4 h-4 w-32" />

      {/* Header Skeleton */}
      <div className="mb-6 flex flex-col gap-4 rounded-2xl border border-[#E2E8F0] bg-white p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-14 w-14 rounded-2xl" />
          <div className="space-y-2">
            <Skeleton className="h-7 w-44" />
            <Skeleton className="h-4 w-72 max-w-full" />
          </div>
        </div>
        <Skeleton className="h-10 w-40 rounded-xl" />
      </div>

      {/* Responsive Product Grid Skeleton matching 2 / 3 / 4 columns */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 xl:grid-cols-4">
        {Array.from({ length: 8 }).map((_, index) => (
          <WishlistCardSkeleton key={`wishlist-skel-${index}`} />
        ))}
      </div>
    </div>
  );
}
