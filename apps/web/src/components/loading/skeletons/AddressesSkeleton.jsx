function Block({ className = "" }) {
  return (
    <div
      aria-hidden="true"
      className={`animate-pulse motion-reduce:animate-none rounded-md bg-slate-200 ${className}`}
    />
  );
}

export default function AddressesSkeleton() {
  return (
    <div className="space-y-5">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div className="space-y-2">
          <Block className="h-6 w-52" />
          <Block className="h-4 w-72 max-w-full" />
        </div>
        <Block className="h-10 w-40 rounded-xl" />
      </div>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {[1, 2, 3, 4].map((item) => (
          <div
            key={item}
            className="rounded-2xl border border-[#E2E8F0] bg-white p-5"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-3">
                <Block className="h-10 w-10 rounded-xl" />
                <div className="space-y-2">
                  <Block className="h-4 w-32" />
                  <Block className="h-3 w-20" />
                </div>
              </div>
              <Block className="h-7 w-20 rounded-full" />
            </div>
            <div className="mt-5 space-y-2">
              <Block className="h-4 w-3/4" />
              <Block className="h-4 w-1/2" />
              <Block className="h-4 w-2/3" />
            </div>
            <div className="mt-5 flex gap-2 border-t border-[#E2E8F0] pt-4">
              <Block className="h-9 w-24 rounded-lg" />
              <Block className="h-9 w-24 rounded-lg" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
