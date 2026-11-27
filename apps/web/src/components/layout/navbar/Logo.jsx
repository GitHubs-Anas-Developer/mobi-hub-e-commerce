import Image from "next/image";
import Link from "next/link";
import { BRAND_ASSETS, BRAND_NAME, BRAND_TAGLINE } from "@/config/brand";

export default function Logo({ variant = "default", onClick }) {
  const isLight = variant === "white";

  return (
    <Link
      href="/"
      onClick={onClick}
      aria-label={`${BRAND_NAME} Home`}
      className={`group inline-flex w-fit shrink-0 items-center transition-opacity duration-200 hover:opacity-95 ${
        isLight ? "rounded-xl bg-white px-3 py-1.5 shadow-sm" : ""
      }`}
    >
      <Image
        src={BRAND_ASSETS.logo}
        alt={`${BRAND_NAME} - ${BRAND_TAGLINE}`}
        width={856}
        height={224}
        priority
        className="h-8 w-auto object-contain sm:h-10 lg:h-11"
      />
    </Link>
  );
}
