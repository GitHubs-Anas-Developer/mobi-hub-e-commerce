
"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { motion, useReducedMotion } from "motion/react";

import {
  Package,
  ChevronRight,
  ChevronLeft,
  ArrowUpRight,
} from "lucide-react";

import { Swiper, SwiperSlide } from "swiper/react";
import { FreeMode, A11y } from "swiper/modules";

import "swiper/css";
import "swiper/css/free-mode";

import categoryService from "@/services/categoryService";

function CategorySkeleton() {
  return (
    <div className="flex flex-col items-center">
      <div className="aspect-square w-full animate-pulse rounded-full bg-slate-100" />
      <div className="mt-3 h-3 w-16 animate-pulse rounded bg-slate-100" />
    </div>
  );
}

export default function CategorySection() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [swiper, setSwiper] = useState(null);

  const [navigation, setNavigation] = useState({
    isBeginning: true,
    isEnd: false,
  });

  const shouldReduceMotion = useReducedMotion();

  // Fetch categories
  useEffect(() => {
    let active = true;

    const fetchCategories = async () => {
      try {
        const response = await categoryService.getCategories();

        if (active) {
          setCategories(response.data || []);
        }
      } catch (err) {
        if (active) {
          setError(
            err.response?.data?.message ||
              "Failed to load categories."
          );
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    fetchCategories();

    return () => {
      active = false;
    };
  }, []);

  // Parent categories only
  const parentCategories = categories.filter(
    (category) => !category.parentCategory
  );

  // Update slider navigation
  const updateNavigation = useCallback((instance) => {
    if (!instance || instance.destroyed) return;

    setNavigation({
      isBeginning: instance.isBeginning,
      isEnd: instance.isEnd,
    });
  }, []);

  const handleSwiper = (instance) => {
    setSwiper(instance);
    updateNavigation(instance);
  };

  return (
    <section className="w-full bg-white">

      {/* Header */}
      <motion.div
        initial={
          shouldReduceMotion
            ? false
            : { opacity: 0, y: 12 }
        }
        whileInView={
          shouldReduceMotion
            ? undefined
            : { opacity: 1, y: 0 }
        }
        viewport={{ once: true }}
        transition={{ duration: 0.35 }}
        className="mb-5 flex items-end justify-between gap-3 sm:mb-7"
      >
        <div className="min-w-0">
          <p className="mb-1 text-[10px] font-bold uppercase tracking-[0.16em] text-[#0755E9] sm:text-[11px]">
            Discover more
          </p>

          <h2 className="text-lg font-bold tracking-tight text-[#101828] sm:text-xl lg:text-2xl">
            Explore Categories
          </h2>

          <p className="mt-1 text-[11px] text-slate-500 sm:text-xs">
            Everything your devices need, all in one place.
          </p>
        </div>

        {/* Navigation */}
        <div className="flex shrink-0 items-center gap-2">

          <Link
            href="/categories"
            className="hidden items-center gap-1 text-xs font-semibold text-[#0755E9] transition-colors hover:text-[#0645C4] sm:flex"
          >
            View all
            <ArrowUpRight size={14} />
          </Link>

          <button
            type="button"
            aria-label="Previous categories"
            onClick={() => swiper?.slidePrev(400)}
            disabled={
              !swiper || navigation.isBeginning || loading
            }
            className="
              flex h-8 w-8 items-center justify-center
              rounded-full border border-slate-200
              text-slate-600 transition-colors
              hover:border-[#0755E9]
              hover:bg-[#0755E9] hover:text-white
              disabled:cursor-not-allowed disabled:opacity-30
              sm:h-9 sm:w-9
            "
          >
            <ChevronLeft size={17} />
          </button>

          <button
            type="button"
            aria-label="Next categories"
            onClick={() => swiper?.slideNext(400)}
            disabled={
              !swiper || navigation.isEnd || loading
            }
            className="
              flex h-8 w-8 items-center justify-center
              rounded-full border border-slate-200
              text-slate-600 transition-colors
              hover:border-[#0755E9]
              hover:bg-[#0755E9] hover:text-white
              disabled:cursor-not-allowed disabled:opacity-30
              sm:h-9 sm:w-9
            "
          >
            <ChevronRight size={17} />
          </button>
        </div>
      </motion.div>

      {/* Loading Skeleton */}
      {loading ? (
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-5 sm:gap-5 lg:grid-cols-7">
          {Array.from({ length: 7 }).map((_, index) => (
            <CategorySkeleton key={index} />
          ))}
        </div>
      ) : error ? (
        <div className="rounded-xl border border-red-100 bg-red-50 p-4 text-xs text-red-600">
          {error}
        </div>
      ) : parentCategories.length === 0 ? (
        <div className="flex flex-col items-center rounded-xl border border-dashed border-slate-200 py-10 text-center">
          <Package
            size={30}
            className="text-slate-400"
          />

          <p className="mt-3 text-xs font-semibold text-slate-700">
            No categories available
          </p>
        </div>
      ) : (
        /* Category Slider */
        <Swiper
          modules={[FreeMode, A11y]}
          onSwiper={handleSwiper}
          onSlideChange={updateNavigation}
          onResize={updateNavigation}
          onProgress={updateNavigation}
          onReachBeginning={updateNavigation}
          onReachEnd={updateNavigation}
          onFromEdge={updateNavigation}
          slidesPerView="auto"
          spaceBetween={12}
          freeMode={{
            enabled: true,
            momentum: true,
            sticky: false,
          }}
          grabCursor
          watchOverflow
          breakpoints={{
            640: {
              spaceBetween: 18,
            },
            1024: {
              spaceBetween: 24,
            },
          }}
          className="!overflow-hidden !pb-2"
        >
          {parentCategories.map((category, index) => (
            <SwiperSlide
              key={category._id}
              className="!h-auto !w-[100px] sm:!w-[120px] lg:!w-[136px]"
            >
              <motion.div
                initial={
                  shouldReduceMotion
                    ? false
                    : { opacity: 0, y: 10 }
                }
                whileInView={
                  shouldReduceMotion
                    ? undefined
                    : { opacity: 1, y: 0 }
                }
                viewport={{ once: true }}
                transition={{
                  duration: 0.3,
                  delay: shouldReduceMotion
                    ? 0
                    : (index % 6) * 0.04,
                }}
                className="h-full"
              >
                <Link
                  href={`/products?category=${category._id}`}
                  className="group flex h-full flex-col items-center text-center"
                >
                  {/* Category Image */}
                  <div
                    className="
                      relative aspect-square w-full
                      overflow-hidden rounded-full
                      border border-slate-100
                      bg-slate-50 p-3
                      transition-all duration-300
                      group-hover:border-blue-200
                      group-hover:bg-blue-50
                      sm:p-4
                    "
                  >
                    {category.image?.url ? (
                      <img
                        src={category.image.url}
                        alt={category.name || "Category"}
                        loading="lazy"
                        decoding="async"
                        className="
                          h-full w-full object-contain
                          transition-transform duration-500
                          group-hover:scale-110
                        "
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center">
                        <Package
                          size={30}
                          strokeWidth={1.3}
                          className="text-slate-300"
                        />
                      </div>
                    )}

                    {/* Hover Arrow */}
                    <span
                      className="
                        absolute bottom-1 right-1
                        flex h-6 w-6 items-center justify-center
                        rounded-full border-2 border-white
                        bg-[#0755E9] text-white
                        opacity-0 transition-all duration-300
                        group-hover:opacity-100
                      "
                    >
                      <ArrowUpRight size={12} />
                    </span>
                  </div>

                  {/* Category Name */}
                  <h3 className="
                    mt-2 max-w-full truncate
                    text-[10px] font-semibold
                    leading-4 text-[#101828]
                    transition-colors
                    group-hover:text-[#0755E9]
                    sm:mt-2.5 sm:text-xs
                  ">
                    {category.name}
                  </h3>

                  <span className="mt-0.5 text-[9px] font-medium text-slate-400 sm:text-[10px]">
                    Explore
                  </span>
                </Link>
              </motion.div>
            </SwiperSlide>
          ))}
        </Swiper>
      )}

      {/* Mobile View All */}
      {!loading &&
        !error &&
        parentCategories.length > 0 && (
          <div className="mt-4 flex justify-center sm:hidden">
            <Link
              href="/categories"
              className="
                inline-flex items-center gap-2
                rounded-full bg-[#EFF6FF]
                px-4 py-2
                text-[11px] font-bold text-[#0755E9]
                transition-colors hover:bg-blue-100
              "
            >
              Explore all categories
              <ChevronRight size={14} />
            </Link>
          </div>
        )}
    </section>
  );
}
