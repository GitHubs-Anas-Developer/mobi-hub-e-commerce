import ProductSkeleton from "@/components/home/ProductSkeleton";

export default function GlobalPageSkeleton() {
  return (
    <div
      className="mx-auto w-full max-w-[1440px] space-y-8 px-4 py-6 sm:px-6 lg:px-8"
      aria-busy="true"
    >
      <span className="sr-only" role="status">
        Loading ELENZO page
      </span>

      <div className="h-64 animate-pulse motion-reduce:animate-none rounded-2xl bg-[#EFF6FF] sm:h-80 lg:h-[380px]" />

      <section aria-hidden="true">
        <div className="mb-5 space-y-2">
          <div className="h-3 w-28 animate-pulse rounded bg-slate-200" />
          <div className="h-6 w-48 animate-pulse rounded bg-slate-200" />
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {Array.from({ length: 6 }).map((_, index) => (
            <div
              key={index}
              className="aspect-square animate-pulse rounded-2xl border border-[#E2E8F0] bg-slate-100"
            />
          ))}
        </div>
      </section>

      <section aria-hidden="true">
        <div className="mb-5 space-y-2">
          <div className="h-3 w-28 animate-pulse rounded bg-slate-200" />
          <div className="h-6 w-52 animate-pulse rounded bg-slate-200" />
        </div>
        <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <ProductSkeleton key={index} />
          ))}
        </div>
      </section>
    </div>
  );
}
