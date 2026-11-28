import { BRAND_NAME, BRAND_SITE_URL } from "@/config/brand";

const API_BASE_URL = (
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1"
).replace(/\/+$/, "");
export function canonicalUrl(path) {
  return new URL(path, BRAND_SITE_URL).toString();
}

export function cleanText(value) {
  return String(value || "")
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function getProductSku(product) {
  const variants = getActiveVariants(product);
  return (
    variants.find((variant) => variant?.isDefault)?.sku ||
    variants[0]?.sku ||
    ""
  );
}

export function getProductDescription(product) {
  const name = cleanText(product?.name) || "This product";
  const brand = cleanText(product?.brand);
  const seoDescription = cleanText(product?.seoDescription);
  const source = seoDescription || cleanText(product?.description);
  let description = seoDescription
    ? seoDescription
    : source && source.toLowerCase().startsWith(name.toLowerCase())
      ? source
      : `${name}${brand ? ` by ${brand}` : ""}. ${
          source || "Shop online at ELENZO and check current prices and availability."
        }`;
  const sku = cleanText(getProductSku(product));
  const identifier = sku
    ? `SKU ${sku}`
    : cleanText(product?.slug)
      ? `Product reference ${cleanText(product.slug)}`
      : "";
  if (
    !seoDescription &&
    identifier &&
    !description
      .slice(0, 300)
      .toLowerCase()
      .includes(identifier.toLowerCase())
  ) {
    const identifierSuffix = ` ${identifier}.`;
    description = `${description.slice(0, Math.max(0, 300 - identifierSuffix.length)).trimEnd()}${identifierSuffix}`;
  }

  return description.length > 300
    ? `${description.slice(0, 297).trimEnd()}...`
    : description;
}

export function getCategoryDescription(category) {
  const name = cleanText(category?.name) || "Electronics";
  const source = cleanText(category?.description);
  const description =
    source && source.toLowerCase().startsWith(name.toLowerCase())
      ? source
      : `${name}: ${
          source ||
          "explore related gadgets and products at ELENZO and check current availability."
        }`;

  return description.length > 300
    ? `${description.slice(0, 297).trimEnd()}...`
    : description;
}

export async function fetchPublicApi(path) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: { Accept: "application/json" },
    cache: "no-store",
  });

  if (response.status === 404) return null;
  if (!response.ok) {
    throw new Error(`Public catalog request failed with status ${response.status}`);
  }

  const body = await response.json();
  return body?.data ?? null;
}

export async function getProductBySlug(slug) {
  if (!slug) return null;
  return fetchPublicApi(`/products/slug/${encodeURIComponent(slug)}`);
}

export async function getCategoryById(categoryId) {
  if (!/^[a-f\d]{24}$/i.test(String(categoryId || ""))) return null;
  const category = await fetchPublicApi(
    `/categories/${encodeURIComponent(categoryId)}`,
  );
  return category?.isActive ? category : null;
}

export async function getPublicProducts() {
  const products = [];
  let page = 1;
  let totalPages = 1;

  while (page <= totalPages) {
    const response = await fetch(
      `${API_BASE_URL}/products?page=${page}&limit=100`,
      {
        headers: { Accept: "application/json" },
        cache: "no-store",
      },
    );

    if (!response.ok) {
      throw new Error(
        `Public product catalog request failed with status ${response.status}`,
      );
    }

    const body = await response.json();
    if (!Array.isArray(body?.data)) {
      throw new Error("Public product catalog returned an invalid response");
    }
    products.push(...body.data);
    totalPages = Math.max(1, Number(body?.pagination?.totalPages) || 1);
    page += 1;
  }

  return products;
}

export async function getPublicCategories() {
  const categories = await fetchPublicApi("/categories?isActive=true");
  if (!Array.isArray(categories)) {
    throw new Error("Public category catalog returned an invalid response");
  }
  return categories;
}

export function getActiveVariants(product) {
  return (product?.variants || []).filter(
    (variant) => variant?.isActive !== false,
  );
}

export function getProductJsonLd(product) {
  const productUrl = canonicalUrl(`/products/${product.slug}`);
  const variants = getActiveVariants(product);
  const sku = getProductSku(product);
  const offers = variants
    .filter(
      (variant) =>
        Number.isFinite(Number(variant.sellingPrice)) &&
        Number(variant.sellingPrice) >= 0,
    )
    .map((variant) => ({
      "@type": "Offer",
      url: productUrl,
      priceCurrency: "INR",
      price: Number(variant.sellingPrice).toFixed(2),
      availability:
        Number(variant.stock) > 0
          ? "https://schema.org/InStock"
          : "https://schema.org/OutOfStock",
      sku: variant.sku || undefined,
    }));

  if (
    offers.length === 0 &&
    variants.length > 0 &&
    Number.isFinite(Number(product.basePrice)) &&
    Number(product.basePrice) >= 0
  ) {
    offers.push({
      "@type": "Offer",
      url: productUrl,
      priceCurrency: "INR",
      price: Number(product.basePrice).toFixed(2),
      availability:
        Number(product.totalStock) > 0
          ? "https://schema.org/InStock"
          : "https://schema.org/OutOfStock",
      sku: sku || undefined,
    });
  }

  const images = [
    product.thumbnail?.url,
    ...(product.images || []).map((image) => image?.url),
  ].filter(Boolean);
  const productSchema = {
    "@context": "https://schema.org",
    "@type": "Product",
    url: productUrl,
    name: product.name,
    description: getProductDescription(product),
    ...(images.length ? { image: images } : {}),
    sku: sku || undefined,
    brand: product.brand
      ? { "@type": "Brand", name: product.brand }
      : undefined,
    ...(offers.length
      ? { offers: offers.length === 1 ? offers[0] : offers }
      : {}),
  };

  const average = Number(product.ratings?.average);
  const count = Number(product.ratings?.count);
  if (average > 0 && count > 0) {
    productSchema.aggregateRating = {
      "@type": "AggregateRating",
      ratingValue: average,
      reviewCount: count,
      bestRating: 5,
      worstRating: 1,
    };
  }

  return productSchema;
}

export function getBreadcrumbJsonLd(items) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: canonicalUrl(item.path),
    })),
  };
}

export function serializeJsonLd(data) {
  return JSON.stringify(data)
    .replace(/</g, "\\u003c")
    .replace(/\u2028/g, "\\u2028")
    .replace(/\u2029/g, "\\u2029");
}
