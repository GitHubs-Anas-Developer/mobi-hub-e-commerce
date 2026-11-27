"use client";

function Skeleton({ className = "" }) {
  return (
    <div
      className={`animate-pulse rounded-lg bg-slate-200 ${className}`}
    />
  );
}

export default function SearchSkeleton({ count = 4 }) {
  return (
    <div
      className="space-y-3 p-1"
      aria-label="Loading search suggestions"
      aria-busy="true"
    >
      <Skeleton className="h-3 w-20" />

      <div className="space-y-2">
        {Array.from({ length: count }).map((_, index) => (
          <div
            key={index}
            className="flex items-center gap-3 rounded-xl border border-[#E2E8F0]/70 bg-[#F8FAFC]/60 p-2"
          >
            <Skeleton className="h-12 w-12 shrink-0 rounded-xl" />

            <div className="min-w-0 flex-1 space-y-2">
              <Skeleton className="h-3.5 w-3/4" />
              <div className="flex items-center gap-2">
                <Skeleton className="h-3 w-16" />
                <Skeleton className="h-3 w-14" />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap gap-2 pt-1">
        <Skeleton className="h-7 w-20 rounded-full" />
        <Skeleton className="h-7 w-24 rounded-full" />
        <Skeleton className="h-7 w-16 rounded-full" />
      </div>
    </div>
  );
}
