
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

import { motion, useReducedMotion } from "motion/react";

import {
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Tag,
  Truck,
  Zap,
  Sparkles,
} from "lucide-react";

import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination, A11y } from "swiper/modules";

import "swiper/css";
import "swiper/css/pagination";

// ========================================
// OFFER DATA
// ========================================

const offers = [
  {
    id: 1,
    tag: "MEGA SALE",
    title: "Upgrade Your Audio Experience",
    description:
      "Discover premium wireless earbuds and headphones at amazing prices.",
    discount: "UP TO 50% OFF",
    button: "Shop Audio",
    href: "/products",
    image:
      "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=1200&q=85&fit=crop",
    icon: Tag,
    accent: "bg-blue-50",
  },
  {
    id: 2,
    tag: "SPECIAL OFFER",
    title: "Power Up Your Everyday",
    description:
      "Shop premium charging accessories, adapters and cables.",
    discount: "UP TO 40% OFF",
    button: "Shop Chargers",
    href: "/products",
    image:
      "https://images.unsplash.com/photo-1609592806596-b43bada2f4c7?w=1200&q=85&fit=crop",
    icon: Zap,
    accent: "bg-sky-50",
  },
  {
    id: 3,
    tag: "DELIVERY DEAL",
    title: "More Accessories. More Savings.",
    description:
      "Find your everyday mobile essentials at great prices.",
    discount: "FREE SHIPPING",
    button: "Explore Offers",
    href: "/products",
    image:
      "https://images.unsplash.com/photo-1606220945770-b5b6c2c55bf1?w=1200&q=85&fit=crop",
    icon: Truck,
    accent: "bg-indigo-50",
  },
];

// ========================================
// HERO BANNER
// ========================================

export default function HeroBanner() {
  const [swiper, setSwiper] = useState(null);
  const [isMounted, setIsMounted] = useState(false);

  const shouldReduceMotion = useReducedMotion();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  return (
    <section className="w-full bg-white py-4 sm:py-6">
      <div className="mx-auto w-full px-4 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-2xl border border-blue-100 bg-[#F5F9FF] sm:rounded-[28px]">

          {/* Decorative Background */}
          <div className="pointer-events-none absolute -right-20 -top-32 h-80 w-80 rounded-full border-[35px] border-blue-100/50" />

          <div className="pointer-events-none absolute -bottom-36 left-[35%] h-72 w-72 rounded-full bg-blue-100/40 blur-3xl" />

          {/* ========================================
              SWIPER
          ======================================== */}

          {isMounted ? (
            <Swiper
              modules={[Autoplay, Pagination, A11y]}
              onSwiper={setSwiper}
              slidesPerView={1}
              spaceBetween={0}
              loop
              speed={800}
              autoplay={{
                delay: 4500,
                disableOnInteraction: false,
                pauseOnMouseEnter: true,
              }}
              pagination={{
                clickable: true,
              }}
              a11y={{
                enabled: true,
              }}
              className="
                relative z-10
                [&_.swiper-pagination]:!bottom-5
                [&_.swiper-pagination]:!left-6
                [&_.swiper-pagination]:!w-auto
                [&_.swiper-pagination-bullet]:!h-2
                [&_.swiper-pagination-bullet]:!w-2
                [&_.swiper-pagination-bullet]:!bg-blue-300
                [&_.swiper-pagination-bullet]:!opacity-100
                [&_.swiper-pagination-bullet-active]:!w-7
                [&_.swiper-pagination-bullet-active]:!rounded-full
                [&_.swiper-pagination-bullet-active]:!bg-[#0755E9]
                sm:[&_.swiper-pagination]:!left-10
              "
            >
              {offers.map((offer) => {
                const Icon = offer.icon;

                return (
                  <SwiperSlide key={offer.id}>
                    <div className="relative grid min-h-[490px] grid-cols-1 items-center gap-4 px-6 pb-16 pt-10 sm:px-10 lg:min-h-[500px] lg:grid-cols-2 lg:gap-8 lg:px-16 lg:py-12">

                      {/* LEFT CONTENT */}
                      <motion.div
                        initial={
                          shouldReduceMotion
                            ? false
                            : { opacity: 0, x: -25 }
                        }
                        whileInView={{
                          opacity: 1,
                          x: 0,
                        }}
                        viewport={{ once: true }}
                        transition={{
                          duration: shouldReduceMotion ? 0 : 0.65,
                          ease: "easeOut",
                        }}
                        className="relative z-10 order-2 lg:order-1"
                      >
                        {/* Tag */}
                        <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-blue-100 bg-white px-4 py-2 shadow-sm">
                          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#EFF6FF] text-[#0755E9]">
                            <Icon size={15} />
                          </span>

                          <span className="text-[10px] font-extrabold tracking-[0.16em] text-[#0755E9] sm:text-xs">
                            {offer.tag}
                          </span>
                        </div>

                        {/* Heading */}
                        <h1 className="max-w-xl text-3xl font-black leading-[1.12] tracking-tight text-[#101828] sm:text-4xl lg:text-[52px]">
                          {offer.title}
                        </h1>

                        {/* Description */}
                        <p className="mt-4 max-w-lg text-sm leading-7 text-[#64748B] sm:text-base">
                          {offer.description}
                        </p>

                        {/* Discount */}
                        <div className="mt-6 inline-flex items-center gap-2 rounded-lg bg-[#0755E9] px-4 py-2.5 text-xs font-extrabold tracking-wide text-white shadow-lg shadow-blue-200 sm:text-sm">
                          <Sparkles size={15} />
                          {offer.discount}
                        </div>

                        {/* CTA */}
                        <div className="mt-7">
                          <Link
                            href={offer.href}
                            className="inline-flex items-center gap-3 rounded-xl bg-[#0755E9] px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-blue-200 transition-all duration-300 hover:-translate-y-1 hover:bg-[#0645C4] active:scale-95"
                          >
                            {offer.button}
                            <ArrowRight size={18} />
                          </Link>
                        </div>

                        {/* Bottom Caption */}
                        <p className="mt-5 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                          Discover more at Mobi Hub
                        </p>
                      </motion.div>

                      {/* RIGHT IMAGE */}
                      <motion.div
                        initial={
                          shouldReduceMotion
                            ? false
                            : { opacity: 0, scale: 0.92, x: 25 }
                        }
                        whileInView={{
                          opacity: 1,
                          scale: 1,
                          x: 0,
                        }}
                        viewport={{ once: true }}
                        transition={{
                          duration: shouldReduceMotion ? 0 : 0.75,
                          ease: "easeOut",
                        }}
                        className="relative order-1 flex min-h-[210px] items-center justify-center lg:order-2 lg:min-h-[380px]"
                      >
                        {/* Image Background Circle */}
                        <div className="absolute h-[210px] w-[210px] rounded-full bg-white shadow-[0_20px_70px_rgba(7,85,233,0.10)] sm:h-[290px] sm:w-[290px] lg:h-[390px] lg:w-[390px]" />

                        <div className="absolute h-[250px] w-[250px] rounded-full border border-blue-200/60 sm:h-[340px] sm:w-[340px] lg:h-[440px] lg:w-[440px]" />

                        {/* Product Image */}
                        <div className="relative z-10 h-[220px] w-full max-w-[340px] overflow-hidden rounded-2xl sm:h-[290px] sm:max-w-[420px] lg:h-[350px] lg:max-w-[500px]">
                          <img
                            src={offer.image}
                            alt={offer.title}
                            loading={offer.id === 1 ? "eager" : "lazy"}
                            fetchPriority={offer.id === 1 ? "high" : "auto"}
                            decoding="async"
                            className="h-full w-full rounded-2xl object-cover shadow-xl transition-transform duration-700 hover:scale-105"
                          />
                        </div>

                        {/* Floating Offer Badge */}
                        <div className="absolute bottom-3 right-0 z-20 flex h-[76px] w-[76px] flex-col items-center justify-center rounded-full border-4 border-white bg-[#0755E9] text-center text-white shadow-xl sm:bottom-5 sm:right-3 sm:h-[94px] sm:w-[94px]">
                          <span className="text-[9px] font-semibold uppercase tracking-wider">
                            Special
                          </span>

                          <span className="text-xs font-black sm:text-sm">
                            OFFER
                          </span>
                        </div>
                      </motion.div>
                    </div>
                  </SwiperSlide>
                );
              })}
            </Swiper>
          ) : (
            <div className="relative z-10 min-h-[490px] lg:min-h-[500px]" />
          )}

          {/* ========================================
              NAVIGATION
          ======================================== */}

          <div className="absolute bottom-4 right-5 z-20 flex gap-2 sm:bottom-5 sm:right-10">
            <button
              type="button"
              onClick={() => swiper?.slidePrev()}
              aria-label="Previous banner"
              className="flex h-9 w-9 items-center justify-center rounded-full border border-blue-200 bg-white text-[#0755E9] shadow-sm transition hover:border-[#0755E9] hover:bg-[#0755E9] hover:text-white sm:h-10 sm:w-10"
            >
              <ChevronLeft size={19} />
            </button>

            <button
              type="button"
              onClick={() => swiper?.slideNext()}
              aria-label="Next banner"
              className="flex h-9 w-9 items-center justify-center rounded-full border border-blue-200 bg-white text-[#0755E9] shadow-sm transition hover:border-[#0755E9] hover:bg-[#0755E9] hover:text-white sm:h-10 sm:w-10"
            >
              <ChevronRight size={19} />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
