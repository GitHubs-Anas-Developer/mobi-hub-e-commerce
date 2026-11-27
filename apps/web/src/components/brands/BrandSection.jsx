"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useSelector } from "react-redux";
import Marquee from "react-fast-marquee";
import { ChevronRight } from "lucide-react";

const BrandSection = () => {
  const [mounted, setMounted] = useState(false);

  const brandState = useSelector((state) => state.brands);

  const brands = brandState?.brands || [];
  const loading = brandState?.loading || false;

  useEffect(() => {
    setMounted(true);
  }, []);

  const activeBrands = brands.filter((brand) => brand.isActive);

  const BrandSkeleton = () => (
    <div className="mx-2 h-16 w-28 shrink-0 animate-pulse rounded-xl bg-slate-100 sm:mx-2.5 sm:h-20 sm:w-36" />
  );

  if (!mounted || (loading && activeBrands.length === 0)) {
    return (
      <section className="w-full overflow-hidden">
        <div className="mb-4">
          <div className="h-2.5 w-24 animate-pulse rounded bg-slate-200" />
          <div className="mt-2 h-5 w-40 animate-pulse rounded bg-slate-200" />
        </div>

        <div className="flex overflow-hidden">
          {Array.from({ length: 6 }).map((_, index) => (
            <BrandSkeleton key={index} />
          ))}
        </div>
      </section>
    );
  }

  if (activeBrands.length === 0) {
    return null;
  }

  return (
    <section
      aria-labelledby="home-brands-heading"
      className="w-full overflow-hidden"
    >
      <div className="mb-5 flex items-end justify-between gap-4">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#0755E9]">
            Official Partners
          </span>
          <h2
            id="home-brands-heading"
            className="mt-1 text-xl font-bold tracking-tight text-[#101828] sm:text-2xl"
          >
            Shop by Brand
          </h2>
        </div>

        <Link
          href="/products"
          className="inline-flex shrink-0 items-center gap-1 text-xs font-semibold text-[#0755E9] transition hover:text-[#082B70] sm:text-sm"
        >
          All Brands
          <ChevronRight size={15} />
        </Link>
      </div>

      <div className="relative w-full">
        <Marquee
          speed={32}
          direction="left"
          pauseOnHover
          gradient
          gradientColor="#ffffff"
          gradientWidth={36}
          autoFill
          className="!py-1"
        >
          {activeBrands.map((brand) => (
            <Link
              key={brand._id}
              href={`/products?brand=${encodeURIComponent(brand.slug)}`}
              aria-label={`Explore ${brand.name} products`}
              className="group mx-2 flex h-16 w-28 shrink-0 items-center justify-center rounded-xl border border-[#E2E8F0] bg-white px-3 transition-all duration-200 hover:border-[#0755E9]/40 hover:bg-[#EFF6FF]/40 hover:shadow-sm sm:mx-2.5 sm:h-20 sm:w-36 sm:rounded-2xl sm:px-4"
            >
              {brand.logo?.url ? (
                <div className="relative h-9 w-full sm:h-11">
                  <Image
                    src={brand.logo.url}
                    alt={`${brand.name} logo`}
                    fill
                    sizes="144px"
                    className="object-contain p-1 transition-transform duration-300 group-hover:scale-105"
                  />
                </div>
              ) : (
                <span className="truncate text-xs font-bold text-[#101828] transition-colors group-hover:text-[#0755E9] sm:text-sm">
                  {brand.name}
                </span>
              )}
            </Link>
          ))}
        </Marquee>
      </div>
    </section>
  );
};

export default BrandSection;
