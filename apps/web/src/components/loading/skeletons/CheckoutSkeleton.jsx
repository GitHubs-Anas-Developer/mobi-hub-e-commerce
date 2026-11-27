function Skeleton({ className = "" }) {
  return (
    <div className={`animate-pulse rounded-lg bg-slate-200 ${className}`} />
  );
}

export default function CheckoutSkeleton({ isDirectCheckout = false }) {
  return (
    <div
      className="space-y-6"
      aria-label="Loading checkout"
      aria-busy="true"
    >
      {/* Progress Bar Skeleton */}
      <div className="rounded-2xl border border-[#E2E8F0] bg-white px-5 py-4">
        <div className="flex items-center justify-between gap-4">
          {[1, 2, 3, 4].map((step) => (
            <div key={step} className="flex flex-1 items-center gap-2">
              <Skeleton className="h-8 w-8 rounded-full" />
              <Skeleton className="hidden h-4 w-20 sm:block" />
              {step < 4 && <Skeleton className="h-0.5 flex-1" />}
            </div>
          ))}
        </div>
      </div>

      {/* Main 12-Col Two Column Layout */}
      <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-12 lg:gap-8">
        <div className="space-y-6 lg:col-span-7">
          {/* Contact Card */}
          <div className="rounded-2xl border border-[#E2E8F0] bg-white p-6">
            <Skeleton className="h-6 w-44" />
            <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
              <Skeleton className="h-14 rounded-xl" />
              <Skeleton className="h-14 rounded-xl" />
              <Skeleton className="h-14 rounded-xl" />
            </div>
          </div>

          {/* Delivery Addresses */}
          <div className="rounded-2xl border border-[#E2E8F0] bg-white p-6">
            <div className="mb-5 flex items-center justify-between">
              <Skeleton className="h-6 w-44" />
              <Skeleton className="h-10 w-36 rounded-xl" />
            </div>
            <div className="space-y-3">
              <Skeleton className="h-36 rounded-2xl" />
              <Skeleton className="h-36 rounded-2xl" />
            </div>
          </div>

          {/* Payment Method */}
          <div className="rounded-2xl border border-[#E2E8F0] bg-white p-6">
            <Skeleton className="mb-5 h-6 w-44" />
            <div className="space-y-3">
              <Skeleton className="h-24 rounded-2xl" />
              <Skeleton className="h-20 rounded-2xl" />
            </div>
          </div>
        </div>

        <div className="space-y-5 lg:col-span-5">
          <div className="rounded-2xl border border-[#E2E8F0] bg-white p-6">
            <Skeleton className="mb-5 h-6 w-36" />
            <div className="space-y-4">
              {[1, 2].map((item) => (
                <div key={item} className="flex gap-3">
                  <Skeleton className="h-16 w-16 shrink-0 rounded-xl" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-1/3" />
                  </div>
                </div>
              ))}
            </div>

            <div className="my-5 border-y border-[#E2E8F0] py-4">
              <Skeleton className="h-10 w-full rounded-xl" />
            </div>

            <div className="space-y-3">
              <div className="flex justify-between">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-20" />
              </div>
              <div className="flex justify-between">
                <Skeleton className="h-5 w-28" />
                <Skeleton className="h-6 w-24" />
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-[#E2E8F0] bg-white p-5">
            <Skeleton className="h-12 w-full rounded-xl" />
          </div>
        </div>
      </div>

      {isDirectCheckout && (
        <span className="sr-only">Loading selected product for checkout</span>
      )}
    </div>
  );
}
