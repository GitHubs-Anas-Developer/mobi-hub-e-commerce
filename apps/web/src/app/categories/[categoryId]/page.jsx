import { Suspense } from "react";
import SubcategoryPageClient from "@/components/categories/SubcategoryPageClient";
import { CategoryDetailsSkeleton } from "@/components/categories/CategorySkeleton";

export const metadata = {
  title: "Explore Category",
  description:
    "Browse gadget categories, subcategories, child categories, and tech accessories on ELENZO.",
};

function SubcategoryLoadingFallback() {
  return (
    <main className="min-h-screen w-full bg-[#F8FAFC] px-4 py-5 pb-24 sm:px-6 sm:py-6 lg:px-8 xl:pb-12">
      <CategoryDetailsSkeleton />
    </main>
  );
}

export default function SubcategoryPage({ params }) {
  return (
    <Suspense fallback={<SubcategoryLoadingFallback />}>
      <SubcategoryPageClient params={params} />
    </Suspense>
  );
}
