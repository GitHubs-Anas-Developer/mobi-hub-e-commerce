
"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "motion/react";

import {
  ArrowUpRight,
  Sparkles,
} from "lucide-react";

// ========================================
// PROMOTIONAL BANNERS
// ========================================

const promoBanners = [
  {
    id: 1,
    label: "WEEKLY OFFERS",
    title: "Best Deals of the Week",
    description: "Top accessories at unbeatable prices!",
    button: "Shop Deals",
    href: "/products?offer=true",
    image:
      "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=900&q=85&fit=crop",
    imageAlt: "Premium headphones",
  },
  {
    id: 2,
    label: "JUST ARRIVED",
    title: "Discover What's New",
    description: "Explore the latest accessories for your devices.",
    button: "Explore New Arrivals",
    href: "/products?sort=newest",
    image:
      "https://images.unsplash.com/photo-1606220945770-b5b6c2c55bf1?w=900&q=85&fit=crop",
    imageAlt: "Wireless audio accessories",
  },
];

// ========================================
// PROMO BANNER SECTION
// ========================================

export default function PromoBannerSection() {
  const shouldReduceMotion = useReducedMotion();

  return (
    <section className="w-full bg-white px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
      <div className="mx-auto grid max-w-[1440px] grid-cols-1 gap-4 md:grid-cols-2 lg:gap-5">

        {promoBanners.map((banner, index) => (
          <motion.article
            key={banner.id}
            initial={
              shouldReduceMotion
                ? false
                : { opacity: 0, y: 18 }
            }
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{
              duration: shouldReduceMotion ? 0 : 0.5,
              delay: shouldReduceMotion ? 0 : index * 0.1,
              ease: "easeOut",
            }}
            className="h-full"
          >
            <div
              className="
                group relative flex min-h-[220px] h-full
                overflow-hidden rounded-[22px]
                border border-blue-100
                bg-gradient-to-br from-[#EFF6FF] via-white to-[#DBEAFE]
                transition-all duration-300
                hover:-translate-y-1
                hover:border-blue-200
                hover:shadow-[0_15px_35px_rgba(7,85,233,0.10)]
                sm:min-h-[250px]
                lg:min-h-[270px]
              "
            >
              {/* Decorative Blue Circles */}
              <div className="pointer-events-none absolute -right-16 -top-20 h-64 w-64 rounded-full border border-blue-200/60" />

              <div className="pointer-events-none absolute -right-7 -top-11 h-48 w-48 rounded-full border border-blue-200/50" />

              <div className="pointer-events-none absolute -bottom-20 left-10 h-40 w-40 rounded-full bg-blue-100/50 blur-3xl" />

              {/* Banner Content */}
              <div className="relative z-10 flex w-[60%] flex-col items-start justify-center p-5 sm:w-[58%] sm:p-7 lg:p-8">

                {/* Label */}
                <div
                  className="
                    mb-4 inline-flex items-center gap-1.5
                    rounded-full border border-blue-100
                    bg-white px-3 py-1.5
                    text-[9px] font-extrabold tracking-[0.13em]
                    text-[#0755E9] shadow-sm sm:text-[10px]
                  "
                >
                  <Sparkles size={12} />
                  {banner.label}
                </div>

                {/* Title */}
                <h2 className="max-w-[270px] text-xl font-extrabold leading-[1.15] tracking-tight text-[#101828] sm:text-2xl lg:text-[30px]">
                  {banner.title}
                </h2>

                {/* Description */}
                <p className="mt-3 max-w-[260px] text-[11px] font-medium leading-relaxed text-[#64748B] sm:text-sm">
                  {banner.description}
                </p>

                {/* CTA Button */}
                <Link
                  href={banner.href}
                  className="
                    mt-5 inline-flex items-center gap-2
                    rounded-xl bg-[#0755E9]
                    px-4 py-2.5
                    text-[11px] font-bold text-white
                    shadow-md shadow-blue-600/20
                    transition-all duration-300
                    hover:-translate-y-0.5
                    hover:bg-[#0645C4]
                    hover:shadow-lg hover:shadow-blue-600/25
                    sm:px-5 sm:py-3 sm:text-xs
                  "
                >
                  {banner.button}

                  <ArrowUpRight
                    size={15}
                    className="transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                  />
                </Link>
              </div>

              {/* Product Image */}
              <div className="absolute bottom-0 right-0 top-0 flex w-[43%] items-center justify-center sm:w-[44%]">
                <div
                  className="
                    relative flex h-[78%] w-[90%]
                    items-center justify-center
                    overflow-hidden rounded-2xl
                    border border-white bg-white/85
                    p-2 shadow-[0_8px_25px_rgba(7,85,233,0.07)]
                    transition-all duration-500
                    group-hover:scale-[1.04]
                    sm:h-[80%] sm:w-[85%] sm:p-3
                  "
                >
                  <img
                    src={banner.image}
                    alt={banner.imageAlt}
                    loading="lazy"
                    className="
                      h-full w-full object-contain
                      mix-blend-multiply
                      transition-transform duration-700
                      group-hover:scale-110
                    "
                  />
                </div>
              </div>
            </div>
          </motion.article>
        ))}
      </div>
    </section>
  );
}
