
"use client";

function Skeleton({ className = "" }) {
  return (
    <div
      className={`animate-pulse rounded-lg bg-slate-200 ${className}`}
    />
  );
}

function AddressSkeleton() {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
      <div className="mb-6 flex items-center justify-between">
        <Skeleton className="h-6 w-40" />
        <Skeleton className="h-9 w-28 rounded-xl" />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {[1, 2].map((item) => (
          <div
            key={item}
            className="rounded-xl border border-slate-200 p-4"
          >
            <div className="flex items-center gap-3">
              <Skeleton className="h-5 w-5 rounded-full" />
              <Skeleton className="h-4 w-24" />
            </div>

            <Skeleton className="mt-4 h-4 w-3/4" />
            <Skeleton className="mt-2 h-3 w-full" />
            <Skeleton className="mt-2 h-3 w-2/3" />
            <Skeleton className="mt-4 h-3 w-1/2" />
          </div>
        ))}
      </div>
    </div>
  );
}

function PaymentSkeleton() {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
      <Skeleton className="mb-6 h-6 w-40" />

      <div className="space-y-4">
        {[1, 2].map((item) => (
          <div
            key={item}
            className="flex items-center gap-4 rounded-xl border border-slate-200 p-4"
          >
            <Skeleton className="h-5 w-5 rounded-full" />
            <Skeleton className="h-10 w-10 rounded-lg" />

            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-48 max-w-full" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function OrderSummarySkeleton() {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <Skeleton className="mb-6 h-6 w-36" />

      <div className="mb-5 space-y-4">
        {[1, 2, 3].map((item) => (
          <div
            key={item}
            className="flex items-center gap-3"
          >
            <Skeleton className="h-14 w-14 shrink-0 rounded-lg" />

            <div className="flex-1 space-y-2">
              <Skeleton className="h-3 w-4/5" />
              <Skeleton className="h-3 w-2/5" />
            </div>

            <Skeleton className="h-4 w-14" />
          </div>
        ))}
      </div>

      <div className="space-y-4 border-t border-slate-100 pt-5">
        {[1, 2, 3].map((item) => (
          <div
            key={item}
            className="flex justify-between"
          >
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-16" />
          </div>
        ))}
      </div>

      <div className="mt-5 border-t border-slate-100 pt-5">
        <div className="flex justify-between">
          <Skeleton className="h-5 w-20" />
          <Skeleton className="h-6 w-24" />
        </div>
      </div>

      <Skeleton className="mt-6 h-12 w-full rounded-xl" />
      <Skeleton className="mx-auto mt-4 h-3 w-40" />
    </div>
  );
}

export default function CheckoutSkeleton({
  isDirectCheckout = false,
}) {
  return (
    <div
      className="grid grid-cols-1 items-start gap-6 lg:grid-cols-3 lg:gap-8"
      aria-label="Loading checkout"
      aria-busy="true"
    >
      <div className="space-y-6 lg:col-span-2">
        <AddressSkeleton />
        <PaymentSkeleton />
      </div>

      <div className="space-y-5 lg:sticky lg:top-6">
        <OrderSummarySkeleton />

        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <Skeleton className="h-12 w-full rounded-xl" />
          <Skeleton className="mx-auto mt-4 h-3 w-40" />
        </div>
      </div>

      {isDirectCheckout && (
        <span className="sr-only">
          Loading selected product for checkout
        </span>
      )}
    </div>
  );
}
