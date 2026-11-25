
"use client";

function Skeleton({ className = "" }) {
  return (
    <div
      className={`animate-pulse rounded-lg bg-slate-200 ${className}`}
    />
  );
}

function SectionSkeleton({ titleWidth = "w-40", children }) {
  return (
    <section className="overflow-hidden rounded-2xl border border-[#E2E8F0] bg-white shadow-sm">
      <div className="flex items-center gap-3 border-b border-[#E2E8F0] px-5 py-5 sm:px-7">
        <Skeleton className="h-10 w-10 rounded-xl" />
        <Skeleton className={`h-5 ${titleWidth}`} />
      </div>
      <div className="p-5 sm:p-7">{children}</div>
    </section>
  );
}

function OrderItemSkeleton() {
  return (
    <div className="flex flex-col gap-4 py-6 first:pt-0 sm:flex-row sm:items-start">
      <Skeleton className="h-24 w-24 shrink-0 rounded-xl" />

      <div className="min-w-0 flex-1 space-y-3">
        <Skeleton className="h-5 w-3/4 max-w-64" />
        <Skeleton className="h-3 w-32" />

        <div className="flex flex-wrap gap-2">
          <Skeleton className="h-7 w-20 rounded-lg" />
          <Skeleton className="h-7 w-24 rounded-lg" />
        </div>

        <div className="flex gap-4">
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-4 w-24" />
        </div>
      </div>

      <div className="flex items-center justify-between border-t border-[#E2E8F0] pt-3 sm:block sm:border-0 sm:pt-0 sm:text-right">
        <Skeleton className="h-3 w-16" />
        <Skeleton className="mt-2 h-5 w-24" />
      </div>
    </div>
  );
}

export default function OrderDetailsSkeleton() {
  return (
    <div className="space-y-6" aria-label="Loading order details" aria-busy="true">
      {/* Back Navigation */}
      <Skeleton className="h-5 w-36" />

      {/* Order Header */}
      <section className="rounded-2xl border border-[#E2E8F0] bg-white p-6 shadow-sm sm:p-10">
        <div className="flex flex-col items-center text-center">
          <Skeleton className="h-20 w-20 rounded-full" />
          <Skeleton className="mt-6 h-8 w-64 max-w-full" />
          <Skeleton className="mt-3 h-4 w-full max-w-md" />
          <Skeleton className="mt-5 h-8 w-48 rounded-full" />
        </div>

        <div className="mt-9 grid grid-cols-1 gap-5 rounded-xl bg-[#F8FAFC] p-5 sm:grid-cols-2 sm:p-6">
          {[1, 2, 3, 4].map((item) => (
            <div key={item} className="space-y-3">
              <Skeleton className="h-3 w-24" />
              <Skeleton className="h-5 w-36 max-w-full" />
            </div>
          ))}
        </div>
      </section>

      {/* Order Items */}
      <SectionSkeleton titleWidth="w-40">
        <div className="divide-y divide-[#E2E8F0]">
          {[1, 2].map((item) => (
            <OrderItemSkeleton key={item} />
          ))}
        </div>
      </SectionSkeleton>

      {/* Delivery Address */}
      <SectionSkeleton titleWidth="w-44">
        <div className="rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-5">
          <div className="flex items-start gap-3">
            <Skeleton className="h-10 w-10 shrink-0 rounded-xl" />
            <div className="flex-1 space-y-3">
              <Skeleton className="h-5 w-40" />
              <Skeleton className="h-4 w-full max-w-sm" />
              <Skeleton className="h-4 w-3/4 max-w-xs" />
              <Skeleton className="h-4 w-32" />
            </div>
          </div>
        </div>
      </SectionSkeleton>

      {/* Payment Details */}
      <SectionSkeleton titleWidth="w-52">
        <div className="space-y-5">
          <div className="space-y-4">
            {[1, 2].map((item) => (
              <div key={item} className="flex justify-between gap-4">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 w-28" />
              </div>
            ))}
          </div>

          <div className="border-t border-[#E2E8F0] pt-5">
            <div className="space-y-4">
              {[1, 2, 3].map((item) => (
                <div key={item} className="flex justify-between gap-4">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-24" />
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between gap-4 rounded-xl bg-[#EFF6FF] p-5">
            <div className="space-y-2">
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-3 w-36" />
            </div>
            <Skeleton className="h-7 w-28" />
          </div>
        </div>
      </SectionSkeleton>

      {/* Action Buttons */}
      <div className="flex flex-col justify-center gap-3 pt-2 sm:flex-row sm:flex-wrap">
        {[1, 2, 3].map((item) => (
          <Skeleton key={item} className="h-12 w-full rounded-xl sm:w-44" />
        ))}
      </div>
    </div>
  );
}
