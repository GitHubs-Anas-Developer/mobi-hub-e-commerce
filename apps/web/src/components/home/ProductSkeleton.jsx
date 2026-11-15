
export default function ProductSkeleton() {
  return (
    <div className="common-card animate-pulse p-2 sm:p-3">

      {/* Product Image Skeleton */}
      <div className="aspect-square rounded-lg bg-slate-100" />

      {/* Product Details Skeleton */}
      <div className="mt-3 space-y-3">

        {/* Rating */}
        <div className="h-3 w-1/3 rounded bg-slate-100" />

        {/* Product Name */}
        <div className="space-y-2">
          <div className="h-4 w-full rounded bg-slate-100" />
          <div className="h-4 w-2/3 rounded bg-slate-100" />
        </div>

        {/* Brand */}
        <div className="h-3 w-1/3 rounded bg-slate-100" />

        {/* Price & Cart */}
        <div className="flex items-center justify-between pt-2">
          <div className="space-y-2">
            <div className="h-5 w-20 rounded bg-slate-100" />
            <div className="h-3 w-14 rounded bg-slate-100" />
          </div>

          <div className="h-8 w-8 rounded-md bg-slate-100" />
        </div>

      </div>
    </div>
  );
}
