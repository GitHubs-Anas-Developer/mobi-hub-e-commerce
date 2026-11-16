
import { Suspense } from "react";
import SubcategoryPageClient from "@/components/categories/SubcategoryPageClient";

function SubcategoryFallback() {
  return (
    <main className="min-h-screen bg-[#F8FAFC] px-4 py-8 sm:px-6 lg:px-8">
      <div className="animate-pulse">
        <div className="mb-6 h-4 w-48 rounded bg-slate-200" />
        <div className="h-40 rounded-2xl bg-slate-200" />
        <div className="mt-10 h-8 w-48 rounded bg-slate-200" />
        <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, index) => (
            <div
              key={index}
              className="h-48 rounded-2xl bg-slate-200"
            />
          ))}
        </div>
      </div>
    </main>
  );
}

export default function SubcategoryPage({ params }) {
  return (
    <Suspense fallback={<SubcategoryFallback />}>
      <SubcategoryPageClient params={params} />
    </Suspense>
  );
}
