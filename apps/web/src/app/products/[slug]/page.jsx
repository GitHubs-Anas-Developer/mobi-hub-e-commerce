
import { Suspense } from "react";
import { notFound, permanentRedirect } from "next/navigation";

import ProductDetailClient from "@/components/products/details/ProductDetailClient";
import ProductDetailSkeleton from "@/components/products/details/ProductDetailSkeleton";
import JsonLd from "@/components/seo/JsonLd";
import {
  canonicalUrl,
  getBreadcrumbJsonLd,
  getProductBySlug,
  getProductDescription,
  getProductJsonLd,
} from "@/lib/seo";

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) {
    return {
      title: "Product Not Found",
      robots: { index: false, follow: false },
    };
  }

  const customTitle = String(product.seoTitle || "").trim();
  const title = customTitle
    ? (customTitle.toLowerCase().includes(product.name.toLowerCase())
        ? customTitle
        : `${product.name} | ${customTitle}`
      ).slice(0, 180)
    : `${product.name} by ${product.brand} in India`;
  const description = getProductDescription(product);
  const image = product.thumbnail?.url;
  const url = canonicalUrl(`/products/${product.slug}`);

  return {
    title,
    description,
    keywords: product.seoKeywords?.length
      ? product.seoKeywords
      : [product.name, product.brand, `${product.name} online India`],
    alternates: { canonical: url },
    openGraph: {
      type: "website",
      url,
      title,
      description,
      images: image ? [{ url: image, alt: product.name }] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: image ? [image] : undefined,
    },
    robots: { index: true, follow: true },
  };
}

export default async function ProductDetailPage({ params }) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) notFound();
  if (slug !== product.slug) {
    permanentRedirect(`/products/${product.slug}`);
  }

  const breadcrumbItems = [
    { name: "Home", path: "/" },
    { name: "Products", path: "/products" },
    ...(product.category?._id
      ? [
          {
            name: product.category.name,
            path: `/categories/${product.category._id}/products`,
          },
        ]
      : []),
    { name: product.name, path: `/products/${product.slug}` },
  ];

  return (
    <>
      <JsonLd
        data={[
          getProductJsonLd(product),
          getBreadcrumbJsonLd(breadcrumbItems),
        ]}
      />
      <Suspense fallback={<ProductDetailSkeleton />}>
        <ProductDetailClient
          key={product._id}
          slug={slug}
          initialProduct={product}
        />
      </Suspense>
    </>
  );
}
