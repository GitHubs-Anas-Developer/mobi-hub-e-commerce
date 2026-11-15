
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
    <div className="flex flex-col items-center animate-pulse">
      <div className="aspect-square w-full max-w-[130px] rounded-full bg-slate-100" />
      <div className="mt-4 h-3 w-20 rounded bg-slate-100" />
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
        if (active) setLoading(false);
      }
    };

    fetchCategories();

    return () => {
      active = false;
    };
  }, []);

  const parentCategories = categories.filter(
    (category) => !category.parentCategory
  );

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
    <section className="w-full bg-white px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
      <div className="mx-auto max-w-[1440px]">

        {/* Header */}
        <motion.div
          initial={shouldReduceMotion ? false : { opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: shouldReduceMotion ? 0 : 0.45 }}
          className="mb-8 flex items-end justify-between gap-4"
        >
          <div>
            <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.18em] text-[#0755E9]">
              Discover more
            </p>

            <h2 className="text-2xl font-bold tracking-tight text-[#101828] sm:text-3xl">
              Explore Categories
            </h2>

            <p className="mt-2 text-xs text-slate-500 sm:text-sm">
              Everything your devices need, all in one place.
            </p>
          </div>

          <div className="flex shrink-0 items-center gap-2">
            <Link
              href="/categories"
              className="hidden items-center gap-1 text-sm font-semibold text-[#0755E9] hover:text-[#0645C4] sm:flex"
            >
              View all
              <ArrowUpRight size={16} />
            </Link>

            <button
              type="button"
              aria-label="Previous categories"
              onClick={() => swiper?.slidePrev(400)}
              disabled={!swiper || navigation.isBeginning || loading}
              className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 text-slate-600 transition hover:border-[#0755E9] hover:bg-[#0755E9] hover:text-white disabled:opacity-30"
            >
              <ChevronLeft size={18} />
            </button>

            <button
              type="button"
              aria-label="Next categories"
              onClick={() => swiper?.slideNext(400)}
              disabled={!swiper || navigation.isEnd || loading}
              className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 text-slate-600 transition hover:border-[#0755E9] hover:bg-[#0755E9] hover:text-white disabled:opacity-30"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </motion.div>

        {/* Loading */}
        {loading ? (
          <div className="grid grid-cols-3 gap-5 sm:grid-cols-5 lg:grid-cols-7">
            {Array.from({ length: 7 }).map((_, index) => (
              <CategorySkeleton key={index} />
            ))}
          </div>
        ) : error ? (
          <div className="rounded-xl border border-red-100 bg-red-50 p-4 text-sm text-red-600">
            {error}
          </div>
        ) : parentCategories.length === 0 ? (
          <div className="flex flex-col items-center rounded-2xl border border-dashed border-slate-200 py-12 text-center">
            <Package size={32} className="text-slate-400" />
            <p className="mt-3 text-sm font-semibold text-slate-700">
              No categories available
            </p>
          </div>
        ) : (
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
            spaceBetween={16}
            freeMode={{
              enabled: true,
              momentum: true,
              sticky: false,
            }}
            grabCursor
            watchOverflow
            breakpoints={{
              640: { spaceBetween: 22 },
              1024: { spaceBetween: 30 },
            }}
            className="!overflow-hidden !pb-3"
          >
            {parentCategories.map((category, index) => (
              <SwiperSlide
                key={category._id}
                className="!h-auto !w-[112px] sm:!w-[135px] lg:!w-[150px]"
              >
                <motion.div
                  initial={shouldReduceMotion ? false : { opacity: 0, y: 12 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{
                    duration: shouldReduceMotion ? 0 : 0.4,
                    delay: shouldReduceMotion ? 0 : (index % 6) * 0.05,
                  }}
                  className="h-full"
                >
                  <Link
                    href={`/products?category=${category._id}`}
                    className="group flex h-full flex-col items-center text-center"
                  >
                    {/* Circular Image */}
                    <div className="relative aspect-square w-full overflow-hidden rounded-full border border-slate-100 bg-[#F5F7FA] p-4 transition-all duration-300 group-hover:border-blue-200 group-hover:bg-[#EFF6FF] group-hover:shadow-[0_8px_25px_rgba(7,85,233,0.10)] sm:p-5">
                      {category.image?.url ? (
                        <img
                          src={category.image.url}
                          alt={category.name || "Category"}
                          loading="lazy"
                          className="h-full w-full object-contain transition-transform duration-500 group-hover:scale-110"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center">
                          <Package
                            size={35}
                            strokeWidth={1.3}
                            className="text-slate-300"
                          />
                        </div>
                      )}

                      <span className="absolute bottom-1 right-1 flex h-7 w-7 items-center justify-center rounded-full border-2 border-white bg-[#0755E9] text-white opacity-0 transition-all duration-300 group-hover:opacity-100">
                        <ArrowUpRight size={14} />
                      </span>
                    </div>

                    {/* Category Name */}
                    <h3 className="mt-3 max-w-full truncate text-xs font-bold text-[#101828] transition-colors group-hover:text-[#0755E9] sm:mt-4 sm:text-sm">
                      {category.name}
                    </h3>

                    <span className="mt-1 text-[10px] font-medium text-slate-400">
                      Explore
                    </span>
                  </Link>
                </motion.div>
              </SwiperSlide>
            ))}
          </Swiper>
        )}

        {/* Mobile View All */}
        {!loading && !error && parentCategories.length > 0 && (
          <div className="mt-5 flex justify-center sm:hidden">
            <Link
              href="/categories"
              className="inline-flex items-center gap-2 rounded-full bg-[#EFF6FF] px-5 py-2.5 text-xs font-bold text-[#0755E9]"
            >
              Explore all categories
              <ChevronRight size={15} />
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}
