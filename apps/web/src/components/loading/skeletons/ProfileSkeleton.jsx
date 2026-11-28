function Block({ className = "" }) {
  return (
    <div
      aria-hidden="true"
      className={`animate-pulse motion-reduce:animate-none rounded-md bg-slate-200 ${className}`}
    />
  );
}

export default function ProfileSkeleton() {
  return (
    <div className="space-y-5">
      <div className="space-y-2">
        <Block className="h-6 w-48" />
        <Block className="h-4 w-80 max-w-full" />
      </div>
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[240px_minmax(0,1fr)]">
        <div className="rounded-2xl border border-[#E2E8F0] bg-white p-4">
          {[1, 2, 3].map((item) => (
            <Block key={item} className="mb-2 h-10 w-full rounded-lg last:mb-0" />
          ))}
        </div>
        <div className="space-y-5 rounded-2xl border border-[#E2E8F0] bg-white p-5 sm:p-6">
          <Block className="h-5 w-40" />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {[1, 2, 3, 4].map((item) => (
              <div key={item} className="space-y-2">
                <Block className="h-3 w-24" />
                <Block className="h-11 w-full rounded-xl" />
              </div>
            ))}
          </div>
          <Block className="h-10 w-32 rounded-xl" />
          <div className="border-t border-[#E2E8F0] pt-5">
            <Block className="mb-4 h-5 w-44" />
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {[1, 2, 3].map((item) => (
                <div key={item} className="space-y-2">
                  <Block className="h-3 w-28" />
                  <Block className="h-11 w-full rounded-xl" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
