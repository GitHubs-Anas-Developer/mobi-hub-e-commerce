
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
    <div className="flex shrink-0 flex-col items-center gap-3">
      <Skeleton className="h-20 w-20 rounded-2xl sm:h-24 sm:w-24" />
      <Skeleton className="h-3 w-16" />
    </div>
  );
}

function ProductCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
      <div className="relative p-3 sm:p-4">
        <Skeleton className="aspect-square w-full rounded-xl" />
      </div>

      <div className="space-y-3 p-3 sm:p-4">
        <Skeleton className="h-3 w-20" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />

        <div className="flex items-center gap-2">
          <Skeleton className="h-5 w-20" />
          <Skeleton className="h-3 w-12" />
        </div>

        <Skeleton className="h-10 w-full rounded-xl" />
      </div>
    </div>
  );
}

function FilterSkeleton() {
  return (
    <aside className="hidden rounded-2xl border border-slate-200 bg-white p-5 lg:block">
      <div className="flex items-center justify-between">
        <Skeleton className="h-5 w-24" />
        <Skeleton className="h-4 w-12" />
      </div>

      <div className="mt-7 space-y-7">
        {[1, 2, 3, 4].map((group) => (
          <div key={group} className="space-y-4">
            <Skeleton className="h-4 w-28" />

            {[1, 2, 3].map((item) => (
              <div key={item} className="flex items-center gap-3">
                <Skeleton className="h-4 w-4 rounded" />
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

      {/* Category cards */}
      <section className="mb-7">
        <div className="mb-5 flex items-center justify-between">
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-4 w-20" />
        </div>

        <div className="flex gap-4 overflow-hidden pb-2">
          {[1, 2, 3, 4, 5, 6].map((item) => (
            <CategorySkeleton key={item} />
          ))}
        </div>
      </section>

      {/* Subcategory tabs */}
      <div className="mb-6 flex gap-3 overflow-hidden">
        {[1, 2, 3, 4, 5].map((item) => (
          <Skeleton
            key={item}
            className="h-9 w-24 shrink-0 rounded-full"
          />
        ))}
      </div>

      {/* Main listing */}
      <div className="grid grid-cols-1 items-start gap-5 lg:grid-cols-[245px_minmax(0,1fr)] xl:gap-6">

        {/* Desktop filters */}
        <FilterSkeleton />

        <section className="min-w-0">

          {/* Toolbar */}
          <div className="mb-5 flex items-center justify-between gap-3">
            <div className="space-y-2">
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-3 w-24" />
            </div>

            <div className="flex items-center gap-2">
              <Skeleton className="h-10 w-28 rounded-xl sm:w-36" />
              <Skeleton className="hidden h-10 w-10 rounded-xl sm:block" />
            </div>
          </div>

          {/* Mobile filter button */}
          <div className="mb-4 lg:hidden">
            <Skeleton className="h-10 w-full rounded-xl" />
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
