
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useSelector } from "react-redux";
import Marquee from "react-fast-marquee";

const BrandSection = () => {
  const [mounted, setMounted] = useState(false);

  const brandState = useSelector((state) => state.brands);

  const brands = brandState?.brands || [];
  const loading = brandState?.loading || false;

  useEffect(() => {
    setMounted(true);
  }, []);

  const activeBrands = brands.filter(
    (brand) => brand.isActive
  );

  // Brand card skeleton
  const BrandSkeleton = () => (
    <div className="mx-2 h-[68px] w-[112px] shrink-0 animate-pulse rounded-xl bg-slate-100 sm:mx-3 sm:h-20 sm:w-36" />
  );

  // Hydration-safe loading state
  if (!mounted || (loading && activeBrands.length === 0)) {
    return (
      <section className="w-full overflow-hidden bg-white">
        <div className="mb-5">
          <div className="h-2.5 w-24 animate-pulse rounded bg-slate-200" />
          <div className="mt-2.5 h-5 w-36 animate-pulse rounded bg-slate-200" />
          <div className="mt-2 h-3 w-52 animate-pulse rounded bg-slate-100" />
        </div>

        <div className="flex overflow-hidden">
          {Array.from({ length: 6 }).map((_, index) => (
            <BrandSkeleton key={index} />
          ))}
        </div>
      </section>
    );
  }

  // No active brands
  if (activeBrands.length === 0) {
    return null;
  }

  return (
    <section className="w-full overflow-hidden bg-white">

      {/* Section Heading */}
      <div className="mb-5 sm:mb-6">
        <span className="mb-1 inline-block text-[10px] font-bold uppercase tracking-[0.16em] text-[#0755E9] sm:text-[11px]">
          Official Brands
        </span>

        <h2 className="text-lg font-bold tracking-tight text-[#101828] sm:text-xl lg:text-2xl">
          Shop by Brand
        </h2>

        <p className="mt-1 text-[11px] text-[#64748B] sm:text-xs">
          Explore products from your favourite brands
        </p>
      </div>

      {/* Brand Marquee */}
      <div className="relative w-full">
        <Marquee
          speed={35}
          direction="left"
          pauseOnHover
          gradient
          gradientColor="#ffffff"
          gradientWidth={40}
          autoFill
          className="!py-2"
        >
          {activeBrands.map((brand) => (
            <Link
              key={brand._id}
              href={`/brands/${brand.slug}`}
              aria-label={`Explore ${brand.name} products`}
              className="
                group mx-2 flex h-[68px] w-[112px]
                shrink-0 items-center justify-center
                rounded-xl border border-slate-200/80
                bg-white px-3
                transition-all duration-300
                hover:-translate-y-1
                hover:border-blue-200
                hover:shadow-md hover:shadow-blue-100/50
                sm:mx-3 sm:h-20 sm:w-36
                sm:rounded-2xl sm:px-4
              "
            >
              {brand.logo?.url ? (
                <div className="relative h-10 w-full sm:h-12">
                  <Image
                    src={brand.logo.url}
                    alt={`${brand.name} logo`}
                    fill
                    sizes="144px"
                    className="
                      object-contain p-1
                      transition-transform duration-300
                      group-hover:scale-110
                    "
                  />
                </div>
              ) : (
                <span className="truncate text-xs font-bold text-slate-700 transition-colors group-hover:text-[#0755E9] sm:text-sm">
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
