"use client";

export default function CategorySkeleton() {
  return (
    <div
      className="overflow-hidden rounded-2xl border border-[#E2E8F0] bg-white p-3 sm:p-4"
      aria-hidden="true"
    >
      <div className="animate-pulse motion-reduce:animate-none">
        <div className="aspect-square rounded-xl bg-[#F8FAFC]" />

        <div className="space-y-2.5 pt-3.5">
          <div className="h-0.5 w-7 rounded-full bg-slate-200" />
          <div className="h-4 w-3/4 rounded-md bg-slate-200" />
          <div className="h-3 w-full rounded-md bg-slate-100" />
          <div className="h-3 w-1/2 rounded-md bg-slate-100" />
        </div>
      </div>
    </div>
  );
}

export function SubcategoryStripSkeleton({ count = 5 }) {
  return (
    <div
      className="flex gap-3 overflow-hidden pb-1 lg:grid lg:grid-cols-4 xl:grid-cols-5"
      aria-label="Loading subcategories"
      aria-busy="true"
    >
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className="w-[168px] shrink-0 lg:w-auto"
        >
          <CategorySkeleton />
        </div>
      ))}
    </div>
  );
}

export function CategoryDetailsSkeleton() {
  return (
    <div
      className="mx-auto w-full max-w-[1440px] space-y-6"
      aria-label="Loading category details"
      aria-busy="true"
    >
      {/* Breadcrumb & Department Nav */}
      <div className="space-y-3">
        <div className="h-4 w-56 animate-pulse rounded bg-slate-200" />
        <div className="flex gap-2 overflow-hidden">
          {Array.from({ length: 6 }).map((_, index) => (
            <div
              key={index}
              className="h-9 w-28 shrink-0 animate-pulse rounded-full bg-slate-200"
            />
          ))}
        </div>
      </div>

      {/* Category Hero Skeleton */}
      <section className="rounded-2xl border border-[#E2E8F0] bg-white p-5 sm:p-6">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <div className="hidden h-20 w-20 shrink-0 animate-pulse rounded-2xl bg-[#F8FAFC] sm:block" />
            <div className="space-y-2.5">
              <div className="h-5 w-32 animate-pulse rounded-full bg-[#EFF6FF]" />
              <div className="h-8 w-64 max-w-full animate-pulse rounded bg-slate-200" />
              <div className="h-4 w-80 max-w-full animate-pulse rounded bg-slate-100" />
            </div>
          </div>

          <div className="flex gap-2.5">
            <div className="h-10 w-36 animate-pulse rounded-xl bg-slate-200" />
            <div className="h-10 w-28 animate-pulse rounded-xl bg-slate-100" />
          </div>
        </div>
      </section>

      {/* Subcategories Strip Skeleton */}
      <section className="rounded-2xl border border-[#E2E8F0] bg-white p-5 sm:p-6">
        <div className="mb-4 flex items-center justify-between">
          <div className="space-y-1.5">
            <div className="h-5 w-44 animate-pulse rounded bg-slate-200" />
            <div className="h-3.5 w-64 animate-pulse rounded bg-slate-100" />
          </div>
          <div className="h-7 w-24 animate-pulse rounded-full bg-slate-100" />
        </div>
        <SubcategoryStripSkeleton count={5} />
      </section>

      {/* Product Grid Skeleton */}
      <section className="grid grid-cols-1 gap-5 lg:grid-cols-[272px_minmax(0,1fr)]">
        <div className="hidden h-96 animate-pulse rounded-2xl border border-[#E2E8F0] bg-white lg:block" />
        <div className="space-y-4">
          <div className="h-14 animate-pulse rounded-2xl border border-[#E2E8F0] bg-white" />
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 xl:grid-cols-4">
            {Array.from({ length: 8 }).map((_, index) => (
              <CategorySkeleton key={index} />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
