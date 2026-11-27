import { BRAND_ASSETS, BRAND_NAME } from "@/config/brand";

export default function BrandMark({ className = "h-6 w-6" }) {
  return (
    <img
      src={BRAND_ASSETS.icon}
      alt={`${BRAND_NAME} icon`}
      className={`object-contain ${className}`}
    />
  );
}
