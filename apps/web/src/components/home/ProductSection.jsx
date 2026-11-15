
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
    isEnd: false,
  });

  const shouldReduceMotion = useReducedMotion();

  // Motion Settings
  const initialAnimation = shouldReduceMotion
    ? false
    : { opacity: 0, y: 24 };

  const revealTransition = shouldReduceMotion
    ? { duration: 0 }
    : {
        duration: 0.55,
        ease: "easeOut",
      };

  // Update Navigation State
  const updateNavigation = useCallback((instance) => {
    if (!instance || instance.destroyed) return;

    setNavigation({
      isBeginning: instance.isBeginning,
      isEnd: instance.isEnd,
    });
  }, []);

  // Initialize Swiper
  const handleSwiper = (instance) => {
    setSwiper(instance);
    updateNavigation(instance);
  };

  // Previous Products
  const handlePrevious = () => {
    swiper?.slidePrev(400);
  };

  // Next Products
  const handleNext = () => {
    swiper?.slideNext(400);
  };

  return (
    <section className="w-full ">

      {/* Section Header */}
      <motion.div
        initial={initialAnimation}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={revealTransition}
        className="mb-5 flex items-end justify-between gap-3 sm:mb-6"
      >

        <div className="min-w-0">

          <h2 className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl lg:text-3xl">
            {title}
          </h2>

          {subtitle && (
            <p className="mt-1 text-xs leading-relaxed text-slate-500 sm:text-sm">
              {subtitle}
            </p>
          )}

        </div>

        {/* Header Actions */}
        <div className="flex shrink-0 items-center gap-2">

          <Link
            href="/products"
            className="hidden items-center gap-1 text-sm font-semibold text-blue-600 transition-colors hover:text-blue-800 sm:inline-flex"
          >
            View All
            <ChevronRight size={17} />
          </Link>

          {/* Previous Button */}
          <button
            type="button"
            onClick={handlePrevious}
            disabled={
              loading ||
              !!error ||
              !swiper ||
              navigation.isBeginning
            }
            aria-label="Previous products"
            className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 transition-all duration-200 hover:border-blue-600 hover:bg-blue-600 hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
          >
            <ChevronLeft size={19} />
          </button>

          {/* Next Button */}
          <button
            type="button"
            onClick={handleNext}
            disabled={
              loading ||
              !!error ||
              !swiper ||
              navigation.isEnd
            }
            aria-label="Next products"
            className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 transition-all duration-200 hover:border-blue-600 hover:bg-blue-600 hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
          >
            <ChevronRight size={19} />
          </button>

        </div>
      </motion.div>

      {/* Loading State */}
      {loading ? (

        <div className="flex gap-3 overflow-hidden sm:gap-4">

          {Array.from({ length: 5 }).map((_, index) => (
            <div
              key={index}
              className="w-[165px] shrink-0 animate-pulse sm:w-[210px] lg:w-[230px]"
            >
              <ProductSkeleton />
            </div>
          ))}

        </div>

      ) : error ? (

        /* Error State */
        <div className="flex items-center gap-3 rounded-xl border border-red-100 bg-red-50 p-4">

          <Package
            size={22}
            className="shrink-0 text-red-500"
          />

          <p className="text-sm text-red-600">
            {error}
          </p>

        </div>

      ) : products.length === 0 ? (

        /* Empty State */
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-10 text-center">

          <Package
            size={32}
            className="mb-3 text-slate-400"
          />

          <h3 className="text-sm font-semibold text-slate-800">
            No products available
          </h3>

          <p className="mt-1 text-xs text-slate-500">
            Products will appear here when available.
          </p>

        </div>

      ) : (

        /* Horizontal Product Slider */
        <Swiper
          modules={[FreeMode, A11y]}

          onSwiper={handleSwiper}
          onSlideChange={updateNavigation}
          onProgress={updateNavigation}
          onResize={updateNavigation}
          onReachBeginning={updateNavigation}
          onReachEnd={updateNavigation}
          onFromEdge={updateNavigation}

          slidesPerView="auto"
          spaceBetween={12}

          freeMode={{
            enabled: true,
            momentum: true,
            momentumRatio: 1,
            momentumVelocityRatio: 1,
            momentumBounce: true,
            sticky: false,
          }}

          grabCursor
          allowTouchMove
          simulateTouch
          watchOverflow

          breakpoints={{
            640: {
              spaceBetween: 16,
            },
            1024: {
              spaceBetween: 20,
            },
          }}

          className="!overflow-hidden !pb-3"
        >

          {products.map((product, index) => (
            <SwiperSlide
              key={product._id}
              className="!h-auto !w-[165px] sm:!w-[210px] lg:!w-[230px]"
            >

              {/* Animated Product Card */}
              <motion.div
                initial={initialAnimation}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{
                  once: true,
                  amount: 0.15,
                }}
                transition={{
                  ...revealTransition,
                  delay: shouldReduceMotion
                    ? 0
                    : (index % 4) * 0.07,
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
