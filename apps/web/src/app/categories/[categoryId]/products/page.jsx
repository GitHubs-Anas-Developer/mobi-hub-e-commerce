import { Suspense } from "react";
import { notFound, permanentRedirect } from "next/navigation";
import ProductsPage from "@/app/products/page";
import ProductsPageSkeleton from "@/components/loading/skeletons/ProductsPageSkeleton";
import JsonLd from "@/components/seo/JsonLd";
import {
  canonicalUrl,
  getBreadcrumbJsonLd,
  getCategoryDescription,
  getCategoryById,
} from "@/lib/seo";

export async function generateMetadata({ params, searchParams }) {
  const { categoryId } = await params;
  const query = await searchParams;
  const category = await getCategoryById(categoryId);
  if (!category) {
    return {
      title: "Category Not Found",
      robots: { index: false, follow: false },
    };
  }

  const title = `${category.name} Products`;
  const description = `Shop ${getCategoryDescription(category)}`;

  return {
    title,
    description,
    alternates: {
      canonical: canonicalUrl(`/categories/${category._id}/products`),
    },
    openGraph: { title, description, type: "website" },
    robots: { index: !Object.keys(query || {}).length, follow: true },
  };
}

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

export default async function CategoryProductsPage({ params }) {
  const { categoryId } = await params;
  const category = await getCategoryById(categoryId);
  if (!category) notFound();
  if (categoryId !== String(category._id)) {
    permanentRedirect(`/categories/${category._id}/products`);
  }

  const path = `/categories/${categoryId}/products`;
  const breadcrumbItems = [
    { name: "Home", path: "/" },
    { name: "Categories", path: "/categories" },
    { name: category.name, path: `/categories/${categoryId}` },
    { name: "Products", path },
  ];

  return (
    <>
      <JsonLd data={getBreadcrumbJsonLd(breadcrumbItems)} />
      <Suspense fallback={<CategoryProductsFallback />}>
        <CategoryProductsContent params={params} />
      </Suspense>
    </>
  );
}
