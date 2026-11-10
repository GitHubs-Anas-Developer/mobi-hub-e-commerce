
import { Suspense } from "react";

import ProductDetailClient from "@/components/products/details/ProductDetailClient";
import ProductDetailSkeleton from "@/components/products/details/ProductDetailSkeleton";

async function ProductDetailContent({ params }) {
  const { slug } = await params;

  return <ProductDetailClient slug={slug} />;
}

export default function ProductDetailPage({ params }) {
  return (
    <Suspense fallback={<ProductDetailSkeleton />}>
      <ProductDetailContent params={params} />
    </Suspense>
  );
}
