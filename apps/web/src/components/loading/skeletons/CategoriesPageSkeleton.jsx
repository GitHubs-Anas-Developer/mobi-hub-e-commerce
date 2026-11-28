function Block({ className = "" }) {
  return (
    <div
      aria-hidden="true"
      className={`animate-pulse motion-reduce:animate-none rounded-lg bg-slate-200 ${className}`}
    />
  );
}

export default function CategoriesPageSkeleton() {
  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-[#E2E8F0] bg-white p-5 sm:p-6">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div className="space-y-3">
            <Block className="h-5 w-36 rounded-full" />
            <Block className="h-8 w-64 max-w-full" />
            <Block className="h-4 w-[min(32rem,80vw)] max-w-full" />
          </div>
          <Block className="h-11 w-44 rounded-xl" />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4 xl:grid-cols-5">
        {Array.from({ length: 10 }).map((_, index) => (
          <div
            key={index}
            className="overflow-hidden rounded-2xl border border-[#E2E8F0] bg-white p-3 sm:p-4"
          >
            <Block className="aspect-square rounded-xl" />
            <Block className="mt-3 h-4 w-3/4" />
            <Block className="mt-2 h-3 w-1/2" />
          </div>
        ))}
      </div>
    </div>
  );
}
