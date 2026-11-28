import { Suspense } from "react";
import { notFound, permanentRedirect } from "next/navigation";
import SubcategoryPageClient from "@/components/categories/SubcategoryPageClient";
import { CategoryDetailsSkeleton } from "@/components/categories/CategorySkeleton";
import JsonLd from "@/components/seo/JsonLd";
import {
  canonicalUrl,
  getBreadcrumbJsonLd,
  getCategoryDescription,
  getCategoryById,
} from "@/lib/seo";

export async function generateMetadata({ params }) {
  const { categoryId } = await params;
  const category = await getCategoryById(categoryId);
  if (!category) {
    return {
      title: "Category Not Found",
      robots: { index: false, follow: false },
    };
  }

  const title = `${category.name} Gadgets & Electronics`;
  const description = getCategoryDescription(category);

  return {
    title,
    description,
    alternates: { canonical: canonicalUrl(`/categories/${category._id}`) },
    openGraph: {
      title,
      description,
      type: "website",
      images: category.image?.url
        ? [{ url: category.image.url, alt: category.name }]
        : undefined,
    },
    robots: { index: true, follow: true },
  };
}

function SubcategoryLoadingFallback() {
  return (
    <main className="min-h-screen w-full bg-[#F8FAFC] px-4 py-5 pb-24 sm:px-6 sm:py-6 lg:px-8 xl:pb-12">
      <CategoryDetailsSkeleton />
    </main>
  );
}

export default async function SubcategoryPage({ params }) {
  const { categoryId } = await params;
  const category = await getCategoryById(categoryId);
  if (!category) notFound();
  if (categoryId !== String(category._id)) {
    permanentRedirect(`/categories/${category._id}`);
  }

  const path = `/categories/${categoryId}`;
  const breadcrumbItems = [
    { name: "Home", path: "/" },
    { name: "Categories", path: "/categories" },
    { name: category.name, path },
  ];

  return (
    <>
      <JsonLd data={getBreadcrumbJsonLd(breadcrumbItems)} />
      <Suspense fallback={<SubcategoryLoadingFallback />}>
        <SubcategoryPageClient params={params} />
      </Suspense>
    </>
  );
}
