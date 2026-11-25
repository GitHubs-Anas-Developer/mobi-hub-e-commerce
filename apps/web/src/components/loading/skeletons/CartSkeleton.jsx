
function Skeleton({ className = "" }) {
  return (
    <div
      className={`animate-pulse rounded-lg bg-slate-200 ${className}`}
    />
  );
}

function CartItemSkeleton() {
  return (
    <div className="flex gap-4 border-b border-slate-100 p-4 sm:p-5">
      <Skeleton className="h-24 w-24 shrink-0 rounded-xl sm:h-28 sm:w-28" />

      <div className="flex min-w-0 flex-1 flex-col justify-between py-1">
        <div className="space-y-2">
          <Skeleton className="h-3 w-20" />
          <Skeleton className="h-4 w-4/5" />
          <Skeleton className="h-3 w-2/5" />
        </div>

        <div className="flex items-center justify-between gap-3">
          <Skeleton className="h-5 w-20" />
          <Skeleton className="h-8 w-24 rounded-lg" />
        </div>
      </div>
    </div>
  );
}

export default function CartSkeleton() {
  return (
    <div className="mx-auto w-full">
      {/* Header */}
      <div className="mb-7 space-y-3">
        <Skeleton className="h-8 w-40 sm:w-52" />
        <Skeleton className="h-4 w-64 max-w-full" />
      </div>

      {/* Cart Layout */}
      <div className="grid grid-cols-1 items-start gap-5 lg:grid-cols-[minmax(0,1fr)_360px] lg:gap-7">
        {/* Cart Items */}
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
          <div className="flex items-center justify-between border-b border-slate-100 p-4 sm:p-5">
            <Skeleton className="h-5 w-28" />
            <Skeleton className="h-4 w-20" />
          </div>

          <CartItemSkeleton />
          <CartItemSkeleton />
          <CartItemSkeleton />

          <div className="flex justify-between p-4 sm:p-5">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-20" />
          </div>
        </div>

        {/* Order Summary */}
        <div className="hidden space-y-5 lg:block">
          <div className="rounded-2xl border border-slate-200 bg-white p-5">
            <Skeleton className="mb-6 h-6 w-36" />

            <div className="space-y-4">
              <div className="flex justify-between">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-20" />
              </div>

              <div className="flex justify-between">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-16" />
              </div>

              <div className="flex justify-between">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-16" />
              </div>

              <div className="border-t border-slate-100 pt-4">
                <div className="flex justify-between">
                  <Skeleton className="h-5 w-24" />
                  <Skeleton className="h-6 w-24" />
                </div>
              </div>

              <Skeleton className="h-12 w-full rounded-xl" />
              <Skeleton className="mx-auto h-3 w-40" />
            </div>
          </div>

          {/* Trust Info */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5">
            <Skeleton className="mb-4 h-5 w-36" />

            <div className="space-y-4">
              <div className="flex gap-3">
                <Skeleton className="h-9 w-9 rounded-full" />
                <Skeleton className="h-4 flex-1" />
              </div>

              <div className="flex gap-3">
                <Skeleton className="h-9 w-9 rounded-full" />
                <Skeleton className="h-4 flex-1" />
              </div>

              <div className="flex gap-3">
                <Skeleton className="h-9 w-9 rounded-full" />
                <Skeleton className="h-4 flex-1" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Checkout Bar */}
      <div className="mt-5 rounded-xl border border-slate-200 bg-white p-4 lg:hidden">
        <div className="flex items-center justify-between">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-5 w-24" />
        </div>
        <Skeleton className="mt-4 h-11 w-full rounded-xl" />
      </div>

      {/* Recently Viewed */}
      <div className="mt-12">
        <Skeleton className="mb-5 h-6 w-48" />

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-5 lg:grid-cols-5">
          {Array.from({ length: 5 }).map((_, index) => (
            <div key={index} className="space-y-3">
              <Skeleton className="aspect-square w-full rounded-xl" />
              <Skeleton className="h-3 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
