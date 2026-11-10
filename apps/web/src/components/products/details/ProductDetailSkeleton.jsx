
export default function ProductDetailSkeleton() {
  return (
    <div className="mx-auto grid max-w-7xl animate-pulse grid-cols-1 gap-10 px-4 py-10 lg:grid-cols-2">
      <div className="aspect-square rounded-2xl bg-slate-200" />

      <div className="space-y-5">
        <div className="h-5 w-1/3 rounded bg-slate-200" />
        <div className="h-9 w-3/4 rounded bg-slate-200" />
        <div className="h-6 w-1/2 rounded bg-slate-200" />
        <div className="h-20 rounded bg-slate-200" />
        <div className="h-12 w-1/2 rounded bg-slate-200" />
      </div>
    </div>
  );
}
