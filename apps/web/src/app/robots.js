import { BRAND_SITE_URL } from "@/config/brand";
import { canonicalUrl } from "@/lib/seo";

export default function robots() {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
      },
    ],
    sitemap: canonicalUrl("/sitemap.xml"),
    host: BRAND_SITE_URL,
  };
}

