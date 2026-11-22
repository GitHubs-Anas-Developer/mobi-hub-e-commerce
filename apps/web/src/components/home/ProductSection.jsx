
"use client";

import { useState, useCallback } from "react";
import Link from "next/link";

import { motion, useReducedMotion } from "motion/react";

import {
  ChevronLeft,
  ChevronRight,
  Package,
} from "lucide-react";

import { Swiper, SwiperSlide } from "swiper/react";
import { FreeMode, A11y } from "swiper/modules";

import "swiper/css";
import "swiper/css/free-mode";

import ProductCard from "./ProductCard";
import ProductSkeleton from "./ProductSkeleton";

export default function ProductSection({
  title,
  subtitle,
  products = [],
  loading = false,
  error = "",
}) {
  const [swiper, setSwiper] = useState(null);

  const [navigation, setNavigation] = useState({
    isBeginning: true,
    isEnd: true,
  });

  const shouldReduceMotion = useReducedMotion();

  const initialAnimation = shouldReduceMotion
    ? false
    : { opacity: 0, y: 12 };

  const revealAnimation = shouldReduceMotion
    ? undefined
    : { opacity: 1, y: 0 };

  const revealTransition = {
    duration: shouldReduceMotion ? 0 : 0.35,
    ease: "easeOut",
  };

  // Update navigation state
  const updateNavigation = useCallback((instance) => {
    if (!instance || instance.destroyed) return;

    setNavigation({
      isBeginning: instance.isBeginning,
      isEnd: instance.isEnd,
    });
  }, []);

  // Initialize Swiper
  const handleSwiper = useCallback(
    (instance) => {
      setSwiper(instance);
      updateNavigation(instance);
    },
    [updateNavigation]
  );

  // Previous slide
  const handlePrevious = () => {
    if (swiper && !swiper.destroyed) {
      swiper.slidePrev(350);
    }
  };

  // Next slide
  const handleNext = () => {
    if (swiper && !swiper.destroyed) {
      swiper.slideNext(350);
    }
  };

  const canNavigate =
    !loading &&
    !error &&
    products.length > 0 &&
    swiper &&
    !swiper.destroyed &&
    !swiper.isLocked;

  return (
    <section className="w-full">

      {/* Section Header */}
      <motion.div
        initial={initialAnimation}
        whileInView={revealAnimation}
        viewport={{ once: true, amount: 0.2 }}
        transition={revealTransition}
        className="mb-4 flex items-end justify-between gap-3 sm:mb-5"
      >
        <div className="min-w-0">
          <h2 className="text-lg font-bold tracking-tight text-[#101828] sm:text-xl lg:text-2xl">
            {title}
          </h2>

          {subtitle && (
            <p className="mt-1 text-[11px] leading-relaxed text-slate-500 sm:text-xs">
              {subtitle}
            </p>
          )}
        </div>

        {/* Header Actions */}
        <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">

          <Link
            href="/products"
            className="
              inline-flex items-center gap-1
              text-[11px] font-semibold
              text-[#0755E9]
              transition-colors
              hover:text-[#0645C4]
              sm:text-xs
            "
          >
            View All
            <ChevronRight size={14} />
          </Link>

          {/* Previous */}
          <button
            type="button"
            onClick={handlePrevious}
            disabled={!canNavigate || navigation.isBeginning}
            aria-label="Previous products"
            className="
              hidden h-8 w-8 items-center justify-center
              rounded-full border border-slate-200
              bg-white text-slate-600
              transition-all
              hover:border-[#0755E9]
              hover:bg-[#0755E9] hover:text-white
              disabled:cursor-not-allowed
              disabled:opacity-30
              sm:flex
            "
          >
            <ChevronLeft size={17} />
          </button>

          {/* Next */}
          <button
            type="button"
            onClick={handleNext}
            disabled={!canNavigate || navigation.isEnd}
            aria-label="Next products"
            className="
              hidden h-8 w-8 items-center justify-center
              rounded-full border border-slate-200
              bg-white text-slate-600
              transition-all
              hover:border-[#0755E9]
              hover:bg-[#0755E9] hover:text-white
              disabled:cursor-not-allowed
              disabled:opacity-30
              sm:flex
            "
          >
            <ChevronRight size={17} />
          </button>
        </div>
      </motion.div>

      {/* Loading State */}
      {loading ? (
        <div className="flex gap-3 overflow-hidden sm:gap-4 lg:gap-5">
          {Array.from({ length: 5 }).map((_, index) => (
            <div
              key={index}
              className="
                w-[155px] shrink-0
                sm:w-[195px]
                lg:w-[220px]
              "
            >
              <ProductSkeleton />
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="flex items-center gap-3 rounded-xl border border-red-100 bg-red-50 p-3 sm:p-4">
          <Package
            size={20}
            className="shrink-0 text-red-500"
          />

          <p className="text-xs text-red-600">
            {error}
          </p>
        </div>
      ) : products.length === 0 ? (
        <div className="
          flex flex-col items-center justify-center
          rounded-xl border border-dashed
          border-slate-200 bg-slate-50
          px-4 py-9 text-center
        ">
          <Package
            size={28}
            className="mb-2 text-slate-400"
          />

          <h3 className="text-xs font-semibold text-slate-800">
            No products available
          </h3>

          <p className="mt-1 text-[10px] text-slate-500">
            Products will appear here when available.
          </p>
        </div>
      ) : (
        /* Product Slider */
        <Swiper
          modules={[FreeMode, A11y]}
          onSwiper={handleSwiper}
          onSlideChange={updateNavigation}
          onResize={updateNavigation}
          onReachBeginning={updateNavigation}
          onReachEnd={updateNavigation}
          onFromEdge={updateNavigation}
          onTransitionEnd={updateNavigation}
          slidesPerView="auto"
          spaceBetween={10}
          freeMode={{
            enabled: true,
            momentum: true,
            sticky: false,
          }}
          grabCursor
          watchOverflow
          breakpoints={{
            640: {
              spaceBetween: 14,
            },
            1024: {
              spaceBetween: 18,
            },
          }}
          a11y={{
            enabled: true,
            containerMessage: `${title || "Products"} carousel`,
          }}
          className="!overflow-hidden !pb-3"
        >
          {products.map((product, index) => (
            <SwiperSlide
              key={product._id}
              className="
                !h-auto !w-[155px]
                sm:!w-[195px]
                lg:!w-[220px]
              "
            >
              <motion.div
                initial={initialAnimation}
                whileInView={revealAnimation}
                viewport={{
                  once: true,
                  amount: 0.15,
                }}
                transition={{
                  ...revealTransition,
                  delay: shouldReduceMotion
                    ? 0
                    : (index % 4) * 0.04,
                }}
                className="h-full"
              >
                <ProductCard product={product} />
              </motion.div>
            </SwiperSlide>
          ))}
        </Swiper>
      )}
    </section>
  );
}
