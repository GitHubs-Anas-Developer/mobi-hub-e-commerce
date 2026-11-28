import { BRAND_NAME, BRAND_SITE_URL } from "@/config/brand";
import { cleanText, getPublicProducts } from "@/lib/seo";

function escapeXml(value) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function getDefaultVariant(product) {
  const variants = (product.variants || []).filter(
    (variant) => variant?.isActive !== false,
  );
  return (
    variants.find((variant) => variant.isDefault) ||
    variants[0] ||
    null
  );
}

export async function GET() {
  const products = await getPublicProducts();
  const items = products
    .filter(
      (product) =>
        product?.isActive !== false &&
        product?.slug &&
        product?.thumbnail?.url &&
        Boolean(getDefaultVariant(product)),
    )
    .map((product) => {
      const variant = getDefaultVariant(product);
      const price = Number(variant.sellingPrice);
      if (!Number.isFinite(price) || price < 0) return "";
      const id = variant?.sku || product._id;
      const title = cleanText(`${product.name} ${product.brand || ""}`).slice(
        0,
        150,
      );
      const description = (
        cleanText(product.description) ||
        `Shop ${product.name} at ${BRAND_NAME}.`
      ).slice(0, 5000);
      const link = new URL(
        `/products/${encodeURIComponent(product.slug)}`,
        BRAND_SITE_URL,
      ).toString();
      const availability =
        Number(variant.stock) > 0 ? "in_stock" : "out_of_stock";

      return [
        "<item>",
        `<g:id>${escapeXml(id)}</g:id>`,
        `<g:title>${escapeXml(title)}</g:title>`,
        `<g:description>${escapeXml(description)}</g:description>`,
        `<g:link>${escapeXml(link)}</g:link>`,
        `<g:image_link>${escapeXml(product.thumbnail.url)}</g:image_link>`,
        `<g:availability>${availability}</g:availability>`,
        `<g:price>${price.toFixed(2)} INR</g:price>`,
        `<g:brand>${escapeXml(product.brand || BRAND_NAME)}</g:brand>`,
        product.category?.name
          ? `<g:product_type>${escapeXml(product.category.name)}</g:product_type>`
          : "",
        "</item>",
      ].join("");
    })
    .join("");

  const xml = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0">',
    "<channel>",
    `<title>${escapeXml(BRAND_NAME)} Product Feed</title>`,
    `<link>${escapeXml(BRAND_SITE_URL)}</link>`,
    `<description>ELENZO product catalog for Google Merchant Center</description>`,
    items,
    "</channel>",
    "</rss>",
  ].join("");

  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
      "X-Robots-Tag": "noindex, nofollow",
    },
  });
}
