
"use client";

import { useEffect, useState } from "react";

import { Swiper, SwiperSlide } from "swiper/react";

import {
  Autoplay,
  Pagination,
  Navigation,
  EffectFade,
} from "swiper/modules";

import {
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  Truck,
} from "lucide-react";

import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";
import "swiper/css/effect-fade";

const slides = [
  {
    id: 1,
    image:
      "https://images.unsplash.com/photo-1695753456538-3d29fa0a4ba0?auto=format&fit=crop&fm=jpg&q=85&w=3000",
    tag: "WELCOME TO MOBI HUB",
    title: "Everything for",
    highlight: "Your Mobile Life",
    description:
      "Discover smartphones, headphones and premium mobile accessories from trusted brands.",
    feature1: "Quality Products",
    feature2: "Trusted Brands",
  },
  {
    id: 2,
    image:
      "https://images.unsplash.com/photo-1758578070291-0c22ff555df9?auto=format&fit=crop&fm=jpg&q=85&w=3000",
    tag: "PREMIUM COLLECTION",
    title: "Upgrade Your",
    highlight: "Tech Lifestyle",
    description:
      "Explore headphones, earbuds, chargers and everyday mobile essentials.",
    feature1: "Premium Gadgets",
    feature2: "Latest Accessories",
  },
  {
    id: 3,
    image:
      "https://images.unsplash.com/photo-1637414165749-9b3cd88b8271?auto=format&fit=crop&fm=jpg&q=85&w=3000",
    tag: "SMART ACCESSORIES",
    title: "Technology",
    highlight: "Made for You",
    description:
      "Discover smart devices and accessories that make everyday life easier.",
    feature1: "Smart Products",
    feature2: "Everyday Essentials",
  },
];

export default function AllCategoriesHeader() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Render placeholder during server prerender
  if (!mounted) {
    return (
      <section
        aria-label="Loading banners"
        className="h-[220px] w-full animate-pulse rounded-2xl bg-slate-200 sm:h-[290px] md:h-[330px] lg:h-[370px]"
      />
    );
  }

  return (
    <section className="w-full">

      <Swiper
        modules={[
          Autoplay,
          Pagination,
          Navigation,
          EffectFade,
        ]}
        effect="fade"
        fadeEffect={{ crossFade: true }}
        loop
        speed={800}
        autoplay={{
          delay: 4500,
          disableOnInteraction: false,
          pauseOnMouseEnter: true,
        }}
        pagination={{
          clickable: true,
          el: ".mobi-banner-pagination",
        }}
        navigation={{
          prevEl: ".mobi-banner-prev",
          nextEl: ".mobi-banner-next",
        }}
        className="mobi-banner-swiper overflow-hidden rounded-2xl sm:rounded-3xl"
      >
        {slides.map((slide, index) => (
          <SwiperSlide key={slide.id}>
            <div className="relative isolate h-[220px] overflow-hidden bg-[#082B70] sm:h-[290px] md:h-[330px] lg:h-[370px]">

              {/* Banner Image */}
              <img
                src={slide.image}
                alt={slide.title}
                loading={index === 0 ? "eager" : "lazy"}
                className="absolute inset-0 h-full w-full object-cover object-center"
              />

              {/* Image Overlay */}
              <div className="absolute inset-0 bg-gradient-to-r from-[#061D4D]/85 via-[#082B70]/50 to-transparent" />

              {/* Content */}
              <div className="relative z-10 flex h-full max-w-[620px] flex-col justify-center px-5 sm:px-9 lg:px-14">

                <span className="w-fit rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-[9px] font-bold tracking-[0.16em] text-blue-100 backdrop-blur-md sm:text-[10px]">
                  {slide.tag}
                </span>

                <h1 className="mt-3 text-2xl font-extrabold leading-tight tracking-tight text-white sm:mt-4 sm:text-4xl lg:text-5xl">
                  {slide.title}

                  <span className="mt-1 block text-blue-200">
                    {slide.highlight}
                  </span>
                </h1>

                <p className="mt-2 max-w-md text-[11px] leading-5 text-blue-50 sm:mt-4 sm:text-sm sm:leading-7">
                  {slide.description}
                </p>

                {/* Features */}
                <div className="mt-3 flex flex-wrap gap-2 sm:mt-5 sm:gap-3">

                  <div className="flex items-center gap-1.5 rounded-full border border-white/15 bg-white/10 px-2.5 py-1.5 text-[9px] font-medium text-white backdrop-blur-md sm:px-3 sm:py-2 sm:text-xs">
                    <ShieldCheck size={14} />
                    {slide.feature1}
                  </div>

                  <div className="flex items-center gap-1.5 rounded-full border border-white/15 bg-white/10 px-2.5 py-1.5 text-[9px] font-medium text-white backdrop-blur-md sm:px-3 sm:py-2 sm:text-xs">
                    <Truck size={14} />
                    {slide.feature2}
                  </div>

                </div>

                {/* Discover More */}
                <div className="mt-3 inline-flex w-fit items-center gap-2 text-xs font-bold text-white sm:mt-5 sm:text-sm">
                  Discover More
                  <ArrowRight size={17} />
                </div>

              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>

      {/* Navigation Controls */}
      <div className="mt-4 flex items-center justify-between px-1">

        {/* Pagination */}
        <div className="mobi-banner-pagination flex items-center gap-2" />

        {/* Previous / Next */}
        <div className="flex items-center gap-2">

          <button
            type="button"
            aria-label="Previous banner"
            className="mobi-banner-prev flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 transition hover:border-[#0755E9] hover:bg-[#0755E9] hover:text-white"
          >
            <ChevronLeft size={18} />
          </button>

          <button
            type="button"
            aria-label="Next banner"
            className="mobi-banner-next flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 transition hover:border-[#0755E9] hover:bg-[#0755E9] hover:text-white"
          >
            <ChevronRight size={18} />
          </button>

        </div>
      </div>

      {/* Pagination Styles */}
      <style jsx global>{`
        .mobi-banner-pagination .swiper-pagination-bullet {
          width: 7px;
          height: 7px;
          border-radius: 20px;
          background: #cbd5e1;
          opacity: 1;
          transition: all 0.3s ease;
        }

        .mobi-banner-pagination .swiper-pagination-bullet-active {
          width: 25px;
          background: #0755e9;
        }
      `}</style>

    </section>
  );
}
