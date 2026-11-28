import { canonicalUrl, getPublicCategories, getPublicProducts } from "@/lib/seo";

export default async function sitemap() {
  const staticRoutes = [
    "",
    "/products",
    "/categories",
    "/about",
    "/contact",
    "/faq",
    "/privacy-policy",
    "/terms",
    "/return-policy",
    "/shipping-policy",
  ];
  const entries = new Map();

  for (const route of staticRoutes) {
    entries.set(canonicalUrl(route), {
      url: canonicalUrl(route),
      changeFrequency: route === "" ? "daily" : "weekly",
      priority: route === "" ? 1 : route === "/products" ? 0.9 : 0.7,
    });
  }

  const [products, categories] = await Promise.all([
    getPublicProducts(),
    getPublicCategories(),
  ]);

  for (const product of products) {
    if (
      !product?.slug ||
      product.isActive === false ||
      (product.status && product.status !== "active")
    ) {
      continue;
    }
    const url = canonicalUrl(`/products/${product.slug}`);
    entries.set(url, {
      url,
      ...(product.updatedAt || product.createdAt
        ? { lastModified: product.updatedAt || product.createdAt }
        : {}),
      changeFrequency: "weekly",
      priority: 0.8,
      images: product.thumbnail?.url ? [product.thumbnail.url] : undefined,
    });
  }

  for (const category of categories) {
    if (!category?._id || category.isActive === false) continue;
    for (const route of [
      `/categories/${category._id}`,
      `/categories/${category._id}/products`,
    ]) {
      const url = canonicalUrl(route);
      entries.set(url, {
        url,
        ...(category.updatedAt || category.createdAt
          ? { lastModified: category.updatedAt || category.createdAt }
          : {}),
        changeFrequency: "weekly",
        priority: 0.7,
      });
    }
  }

  return Array.from(entries.values());
}
