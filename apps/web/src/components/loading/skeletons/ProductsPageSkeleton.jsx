"use client";

function Skeleton({ className = "" }) {
  return (
    <div
      className={`animate-pulse rounded-lg bg-slate-200 ${className}`}
    />
  );
}

function CategorySkeleton() {
  return (
    <div className="flex w-[100px] shrink-0 flex-col items-center rounded-xl border border-[#E2E8F0] bg-white p-3 sm:w-[116px]">
      <Skeleton className="h-14 w-14 rounded-xl sm:h-16 sm:w-16" />
      <Skeleton className="mt-2 h-3 w-16" />
    </div>
  );
}

function ProductCardSkeleton() {
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

function FilterSkeleton() {
  return (
    <aside className="hidden rounded-2xl border border-[#E2E8F0] bg-white p-4 lg:block">
      <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-3.5">
        <Skeleton className="h-5 w-24" />
        <Skeleton className="h-4 w-12" />
      </div>

      <div className="mt-5 space-y-6">
        {[1, 2, 3].map((group) => (
          <div key={group} className="space-y-3">
            <Skeleton className="h-4 w-28" />
            {[1, 2, 3, 4].map((item) => (
              <div key={item} className="flex items-center gap-2.5">
                <Skeleton className="h-4 w-4 rounded-full" />
                <Skeleton className="h-3 w-28" />
              </div>
            ))}
          </div>
        ))}
      </div>
    </aside>
  );
}

export default function ProductsPageSkeleton() {
  return (
    <div aria-label="Loading products" aria-busy="true">
      {/* Category cards strip */}
      <section className="mb-6 rounded-2xl border border-[#E2E8F0] bg-white p-4 sm:p-5">
        <div className="mb-4 space-y-1.5">
          <Skeleton className="h-5 w-40" />
          <Skeleton className="h-3 w-56" />
        </div>

        <div className="flex gap-3 overflow-hidden pb-1">
          {[1, 2, 3, 4, 5, 6, 7].map((item) => (
            <CategorySkeleton key={item} />
          ))}
        </div>
      </section>

      {/* Main layout matching desktop sidebar + 2/3/4 column grid */}
      <div className="grid grid-cols-1 items-start gap-5 lg:grid-cols-[272px_minmax(0,1fr)] xl:gap-6">
        <FilterSkeleton />

        <section className="min-w-0">
          {/* Toolbar */}
          <div className="mb-4 flex items-center justify-between gap-3 rounded-2xl border border-[#E2E8F0] bg-white px-4 py-3">
            <Skeleton className="h-9 w-24 rounded-xl lg:w-44" />
            <div className="flex items-center gap-2">
              <Skeleton className="h-10 w-36 rounded-xl sm:w-48" />
              <Skeleton className="h-10 w-20 rounded-xl" />
            </div>
          </div>

          {/* Product grid */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 xl:grid-cols-4">
            {Array.from({ length: 8 }).map((_, index) => (
              <ProductCardSkeleton key={index} />
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
