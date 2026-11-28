function Block({ className = "" }) {
  return (
    <div
      aria-hidden="true"
      className={`animate-pulse motion-reduce:animate-none rounded-md bg-slate-200 ${className}`}
    />
  );
}

export default function AdminPageSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div className="space-y-2">
          <Block className="h-7 w-56 max-w-full" />
          <Block className="h-4 w-80 max-w-full" />
        </div>
        <Block className="h-10 w-36 rounded-lg" />
      </div>

      <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            key={index}
            className="rounded-xl border border-[#E2E8F0] bg-white p-4 sm:p-5"
          >
            <div className="flex items-center justify-between">
              <Block className="h-3 w-24" />
              <Block className="h-9 w-9 rounded-lg" />
            </div>
            <Block className="mt-4 h-7 w-20" />
          </div>
        ))}
      </div>

      <div className="overflow-hidden rounded-xl border border-[#E2E8F0] bg-white">
        <div className="flex flex-col gap-3 border-b border-[#E2E8F0] p-4 sm:flex-row sm:items-center sm:justify-between">
          <Block className="h-5 w-40" />
          <div className="flex gap-2">
            <Block className="h-9 w-44 rounded-lg" />
            <Block className="h-9 w-24 rounded-lg" />
          </div>
        </div>
        <div className="space-y-4 p-4">
          {Array.from({ length: 5 }).map((_, index) => (
            <div key={index} className="flex items-center gap-3">
              <Block className="h-10 w-10 shrink-0 rounded-lg" />
              <Block className="h-4 flex-1" />
              <Block className="hidden h-4 w-24 sm:block" />
              <Block className="h-8 w-20 rounded-lg" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
