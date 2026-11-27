import { Suspense } from "react";
import ProductsPage from "@/app/products/page";
import ProductsPageSkeleton from "@/components/loading/skeletons/ProductsPageSkeleton";

export const metadata = {
  title: "Category Products",
  description:
    "Discover premium electronics, gadgets, and tech accessories by category on ELENZO.",
};

function CategoryProductsFallback() {
  return (
    <main className="min-h-screen w-full bg-[#F8FAFC]">
      <div className="mx-auto w-full max-w-[1440px] px-4 py-6 sm:px-6 lg:px-8">
        <div className="mb-4 h-4 w-48 animate-pulse rounded bg-slate-200" />
        <div className="mb-6 rounded-2xl border border-[#E2E8F0] bg-white p-5">
          <div className="h-5 w-32 animate-pulse rounded-full bg-[#EFF6FF]" />
          <div className="mt-3 h-7 w-64 animate-pulse rounded bg-slate-200" />
          <div className="mt-2 h-4 w-80 max-w-full animate-pulse rounded bg-slate-100" />
        </div>
        <ProductsPageSkeleton />
      </div>
    </main>
  );
}

async function CategoryProductsContent({ params }) {
  const { categoryId } = await params;
  return <ProductsPage categoryId={categoryId} />;
}

export default function CategoryProductsPage({ params }) {
  return (
    <Suspense fallback={<CategoryProductsFallback />}>
      <CategoryProductsContent params={params} />
    </Suspense>
  );
}
