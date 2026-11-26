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
        src: BRAND_ASSETS.icon,
        sizes: "any",
        type: "image/svg+xml",
      },
    ],
  };
}

