
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

  // Same initial render on server and client
  if (!mounted) {
    return (
      <section className="bg-white py-12 md:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-9 text-center">
            <div className="mx-auto h-3 w-28 animate-pulse rounded bg-slate-200" />
            <div className="mx-auto mt-4 h-8 w-48 animate-pulse rounded bg-slate-200" />
            <div className="mx-auto mt-3 h-4 w-64 animate-pulse rounded bg-slate-100" />
          </div>

          <div className="flex gap-6 overflow-hidden">
            {Array.from({ length: 5 }).map((_, index) => (
              <div
                key={index}
                className="h-24 w-36 shrink-0 animate-pulse rounded-2xl bg-slate-100 sm:h-28 sm:w-44"
              />
            ))}
          </div>
        </div>
      </section>
    );
  }

  const activeBrands = brands.filter((brand) => brand.isActive);

  if (loading && activeBrands.length === 0) {
    return (
      <section className="bg-white py-12 md:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-9 text-center">
            <div className="mx-auto h-8 w-48 animate-pulse rounded bg-slate-200" />
          </div>
        </div>
      </section>
    );
  }

  if (activeBrands.length === 0) return null;

  const brandItems = activeBrands.map((brand) => (
    <Link
      key={brand._id}
      href={`/brands/${brand.slug}`}
      aria-label={`Explore ${brand.name} products`}
      className="group mx-3 flex h-24 w-36 shrink-0 items-center justify-center rounded-2xl border border-slate-100 bg-white px-5 transition-all duration-300 hover:-translate-y-1 hover:border-blue-200 hover:shadow-lg hover:shadow-blue-100/50 sm:mx-4 sm:h-28 sm:w-44"
    >
      {brand.logo?.url ? (
        <div className="relative h-14 w-full">
          <Image
            src={brand.logo.url}
            alt={brand.name}
            fill
            sizes="176px"
            className="object-contain p-2 transition-transform duration-300 group-hover:scale-110"
          />
        </div>
      ) : (
        <span className="text-base font-bold text-slate-700">
          {brand.name}
        </span>
      )}
    </Link>
  ));

  return (
    <section className="overflow-hidden bg-white py-12 md:py-16">
      <div className="mx-auto w-full px-4 sm:px-6 lg:px-8">

        {/* Heading */}
        <div className="mb-9 text-start">
          <span className="mb-2 inline-block text-xs font-bold uppercase tracking-[0.2em] text-[#0755e9]">
            Official Brands
          </span>

          <h2 className="text-2xl font-bold tracking-tight text-[#101828] sm:text-3xl">
            Shop by Brand
          </h2>

          <p className="mt-2 text-sm text-[#64748b] sm:text-base">
            Explore products from your favourite brands
          </p>
        </div>

        {/* Infinite Marquee */}
        <div className="relative min-h-28">
          <Marquee
            speed={40}
            direction="left"
            pauseOnHover
            gradient
            gradientColor="#ffffff"
            gradientWidth={60}
            autoFill
            className="py-3"
          >
            {brandItems}
          </Marquee>
        </div>

      </div>
    </section>
  );
};

export default BrandSection;
