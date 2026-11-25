
export default function CategorySkeleton() {
  return (
    <div
      className="overflow-hidden rounded-2xl border border-slate-100 bg-white"
      aria-hidden="true"
    >
      {/* Image Skeleton */}
      <div className="animate-pulse motion-reduce:animate-none">
        <div className="aspect-[1.2/1] bg-slate-100" />
      </div>

      {/* Content Skeleton */}
      <div className="space-y-3 p-3 sm:p-4">
        <div className="h-4 w-3/4 animate-pulse rounded-md bg-slate-100 motion-reduce:animate-none" />

        <div className="h-3 w-1/2 animate-pulse rounded-md bg-slate-100 motion-reduce:animate-none" />
      </div>
    </div>
  );
}
