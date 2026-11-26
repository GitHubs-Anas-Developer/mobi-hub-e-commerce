import { BRAND_SITE_URL } from "@/config/brand";

export default function sitemap() {
  const routes = ["", "/products", "/categories", "/cart", "/wishlist"];

  return routes.map((route) => ({
    url: `${BRAND_SITE_URL}${route}`,
    lastModified: new Date(),
    changeFrequency: route === "" ? "daily" : "weekly",
    priority: route === "" ? 1 : 0.8,
  }));
}

