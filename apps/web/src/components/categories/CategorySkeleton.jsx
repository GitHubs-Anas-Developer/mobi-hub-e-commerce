
export default function CategorySkeleton() {
  return (
    <div className="animate-pulse overflow-hidden rounded-2xl border border-slate-100 bg-white">
      <div className="aspect-[1.2/1] bg-slate-100" />

      <div className="space-y-3 p-4">
        <div className="h-4 w-3/4 rounded bg-slate-100" />
        <div className="h-3 w-1/2 rounded bg-slate-100" />
      </div>
    </div>
  );
}
