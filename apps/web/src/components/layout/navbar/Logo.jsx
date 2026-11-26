import Link from "next/link";
import { BRAND_NAME, BRAND_SHORT_TAGLINE } from "@/config/brand";
import BrandMark from "@/components/common/BrandMark";

export default function Logo({ variant = "default" }) {
  const isLight = variant === "white";

  return (
    <Link
      href="/"
      aria-label={`${BRAND_NAME} Home`}
      className="group inline-flex w-fit min-w-0 shrink-0 items-center gap-2 sm:gap-2.5"
    >
      {/* Logo Icon */}
      <div
        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl shadow-sm transition-all duration-300 group-hover:scale-105 sm:h-11 sm:w-11 ${
          isLight
            ? "bg-white text-[#0755E9] shadow-black/10"
            : "bg-[#0755E9] text-white shadow-[#0755E9]/20 group-hover:bg-[#082B70]"
        }`}
      >
        <BrandMark className="h-5 w-5 sm:h-6 sm:w-6" />
      </div>

      {/* Brand Name */}
      <div className="flex min-w-0 flex-col justify-center leading-none">
        <span
          className={`whitespace-nowrap text-xl font-extrabold tracking-tight sm:text-2xl lg:text-[28px] ${
            isLight ? "text-white" : "text-[#101828]"
          }`}
        >
          ELE
          <span className={isLight ? "text-blue-200" : "text-[#0755E9]"}>
            ZIO
          </span>
        </span>

        <span
          className={`mt-1 whitespace-nowrap text-[9px] font-medium tracking-wide sm:text-[11px] ${
            isLight ? "text-blue-100" : "text-[#64748B]"
          }`}
        >
          {BRAND_SHORT_TAGLINE}
        </span>
      </div>
    </Link>
  );
}
