import {
  BRAND_ASSETS,
  BRAND_BACKGROUND,
  BRAND_DESCRIPTION,
  BRAND_NAME,
  BRAND_PRIMARY_COLOR,
  BRAND_TAGLINE,
} from "@/config/brand";

export default function manifest() {
  return {
    name: `${BRAND_NAME} - ${BRAND_TAGLINE}`,
    short_name: BRAND_NAME,
    description: BRAND_DESCRIPTION,
    start_url: "/",
    display: "standalone",
    background_color: BRAND_BACKGROUND,
    theme_color: BRAND_PRIMARY_COLOR,
    icons: [
      {
        src: BRAND_ASSETS.icon192,
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: BRAND_ASSETS.icon512,
        sizes: "512x512",
        type: "image/png",
      },
    ],
  };
}
