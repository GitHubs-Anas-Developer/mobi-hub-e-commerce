function Block({ className = "" }) {
  return (
    <div
      aria-hidden="true"
      className={`animate-pulse motion-reduce:animate-none rounded-md bg-slate-200 ${className}`}
    />
  );
}

export default function NotificationsSkeleton() {
  return (
    <div className="space-y-5">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div className="space-y-2">
          <Block className="h-6 w-56" />
          <Block className="h-4 w-80 max-w-full" />
        </div>
        <Block className="h-8 w-24 rounded-full" />
      </div>
      <div className="flex flex-col justify-between gap-3 rounded-2xl border border-[#E2E8F0] bg-white p-4 sm:flex-row sm:items-center">
        <div className="flex gap-2">
          {[1, 2, 3].map((item) => (
            <Block key={item} className="h-9 w-20 rounded-xl" />
          ))}
        </div>
        <div className="flex gap-2">
          <Block className="h-9 w-36 rounded-xl" />
          <Block className="h-9 w-32 rounded-xl" />
        </div>
      </div>
      <div className="overflow-hidden rounded-2xl border border-[#E2E8F0] bg-white">
        {[1, 2, 3, 4, 5].map((item) => (
          <div
            key={item}
            className="flex items-start gap-3 border-b border-[#E2E8F0] p-4 last:border-b-0 sm:p-5"
          >
            <Block className="h-10 w-10 shrink-0 rounded-xl" />
            <div className="min-w-0 flex-1 space-y-2">
              <Block className="h-4 w-2/3 max-w-full" />
              <Block className="h-3 w-full" />
              <Block className="h-3 w-24" />
            </div>
            <Block className="h-8 w-8 shrink-0 rounded-lg" />
          </div>
        ))}
      </div>
    </div>
  );
}
