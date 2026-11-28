import ProductsPageClient from "@/components/products/ProductsPageClient";
import { canonicalUrl } from "@/lib/seo";

export async function generateMetadata({ searchParams }) {
  const params = await searchParams;
  const hasFilters = Object.keys(params || {}).length > 0;
  const title = "Shop Gadgets, Electronics & Accessories";
  const description =
    "Shop gadgets, electronics, and tech accessories online in India at ELENZO. Discover current product prices, offers, and availability.";

  return {
    title,
    description,
    alternates: { canonical: canonicalUrl("/products") },
    openGraph: { title, description, type: "website" },
    robots: {
      index: !hasFilters,
      follow: true,
    },
  };
}

export default function ProductsPage({ categoryId }) {
  return <ProductsPageClient categoryId={categoryId} />;
}
