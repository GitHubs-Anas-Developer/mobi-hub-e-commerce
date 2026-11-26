import { BRAND_SITE_URL } from "@/config/brand";

export default function robots() {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin/", "/account/", "/checkout/", "/api/"],
      },
    ],
    sitemap: `${BRAND_SITE_URL}/sitemap.xml`,
  };
}

