
import ProductsPage from "@/app/products/page";
import { Suspense } from "react";

function ProductsFallback() {
  return (
    <main className="min-h-screen bg-white px-4 py-8">
      <div className="animate-pulse">
        <div className="mb-6 h-4 w-48 rounded bg-slate-200" />
        <div className="mb-8 h-8 w-56 rounded bg-slate-200" />

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, index) => (
            <div
              key={index}
              className="h-64 rounded-2xl bg-slate-200"
            />
          ))}
        </div>
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
    <Suspense fallback={<ProductsFallback />}>
      <CategoryProductsContent params={params} />
    </Suspense>
  );
}
