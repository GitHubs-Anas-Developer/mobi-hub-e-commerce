
"use client";

import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import { ChevronLeft, ChevronRight } from "lucide-react";

import { Swiper, SwiperSlide } from "swiper/react";
import {
  Autoplay,
  Pagination,
  A11y,
} from "swiper/modules";

import { useReducedMotion } from "motion/react";

import { fetchActiveBanners } from "@/store/thunks/bannerThunks";

import "swiper/css";
import "swiper/css/pagination";

// ========================================
// HELPERS
// ========================================

function getImageUrl(image) {
  if (typeof image === "string") {
    return image.trim();
  }

  return (
    image?.url ||
    image?.secure_url ||
    ""
  );
}

// ========================================
// LOADING SKELETON
// ========================================

function CategoriesBannerSkeleton() {
  return (
    <section
      className="w-full"
      aria-label="Loading category banners"
    >
      <div className="aspect-[16/9] w-full animate-pulse rounded-2xl bg-blue-50 sm:aspect-[21/7] sm:rounded-[28px]" />
    </section>
  );
}

// ========================================
// MAIN COMPONENT
// ========================================

export default function AllCategoriesHeader() {
  const dispatch = useDispatch();
  const shouldReduceMotion = useReducedMotion();

  const [swiper, setSwiper] = useState(null);

  // ========================================
  // REDUX STATE
  // ========================================

  const banners = useSelector(
    (state) =>
      state.banners?.bannersByPlacement?.categories_hero || []
  );

  const loading = useSelector(
    (state) => state.banners?.loading || false
  );

  // ========================================
  // FETCH BANNERS
  // ========================================

  useEffect(() => {
    dispatch(
      fetchActiveBanners({
        placement: "categories",
        position: "hero",
      })
    );
  }, [dispatch]);

  // ========================================
  // NORMALIZE BANNERS
  // ========================================

  const validBanners = useMemo(() => {
    if (!Array.isArray(banners)) {
      return [];
    }

    return banners
      .map((banner) => {
        const desktopImage = getImageUrl(
          banner?.desktopImage
        );

        const mobileImage = getImageUrl(
          banner?.mobileImage
        );

        return {
          ...banner,
          desktopImage,
          mobileImage,
          fallbackImage:
            desktopImage || mobileImage,
        };
      })
      .filter((banner) => banner.fallbackImage);
  }, [banners]);

  // ========================================
  // LOADING STATE
  // ========================================

  if (loading && validBanners.length === 0) {
    return <CategoriesBannerSkeleton />;
  }

  // ========================================
  // EMPTY STATE
  // ========================================

  if (validBanners.length === 0) {
    return null;
  }

  const hasMultipleBanners =
    validBanners.length > 1;

  // ========================================
  // MAIN UI
  // ========================================

  return (
    <section
      className="w-full"
      aria-label="ELEZIO category promotions"
    >
      <div className="relative w-full overflow-hidden rounded-2xl border border-blue-100 bg-[#F5F9FF] sm:rounded-[28px]">

        <Swiper
          modules={[
            Autoplay,
            Pagination,
            A11y,
          ]}
          onSwiper={setSwiper}
          onBeforeDestroy={() => setSwiper(null)}
          slidesPerView={1}
          spaceBetween={0}
          loop={hasMultipleBanners}
          speed={shouldReduceMotion ? 0 : 800}
          autoplay={
            hasMultipleBanners &&
            !shouldReduceMotion
              ? {
                  delay: 4500,
                  disableOnInteraction: false,
                  pauseOnMouseEnter: true,
                }
              : false
          }
          pagination={
            hasMultipleBanners
              ? {
                  clickable: true,
                }
              : false
          }
          a11y={{
            enabled: true,
          }}
          className="
            [&_.swiper-pagination]:!bottom-3
            [&_.swiper-pagination-bullet]:!h-2
            [&_.swiper-pagination-bullet]:!w-2
            [&_.swiper-pagination-bullet]:!bg-white
            [&_.swiper-pagination-bullet]:!opacity-70
            [&_.swiper-pagination-bullet-active]:!w-7
            [&_.swiper-pagination-bullet-active]:!rounded-full
            [&_.swiper-pagination-bullet-active]:!bg-[#0755E9]
            [&_.swiper-pagination-bullet-active]:!opacity-100
          "
        >
          {validBanners.map((banner, index) => (
            <SwiperSlide
              key={banner._id || banner.id || index}
            >
              <a
                href={banner.buttonLink || "/categories"}
                aria-label={
                  banner.title ||
                  "Explore ELEZIO categories"
                }
                className="block w-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#0755E9]"
              >
                <picture className="block w-full">

                  {/* MOBILE IMAGE */}
                  {banner.mobileImage && (
                    <source
                      media="(max-width: 767px)"
                      srcSet={banner.mobileImage}
                    />
                  )}

                  {/* DESKTOP / FALLBACK IMAGE */}
                  <img
                    src={banner.fallbackImage}
                    alt={
                      banner.title ||
                      "Explore electronics and gadgets at ELEZIO"
                    }
                    loading={
                      index === 0 ? "eager" : "lazy"
                    }
                    fetchPriority={
                      index === 0 ? "high" : "auto"
                    }
                    decoding="async"
                    className="block h-auto w-full object-cover"
                  />

                </picture>
              </a>
            </SwiperSlide>
          ))}
        </Swiper>

        {/* ==================================
            NAVIGATION
        ================================== */}

        {hasMultipleBanners && (
          <div className="absolute bottom-10 right-4 z-20 flex gap-2 sm:bottom-5 sm:right-6">

            <button
              type="button"
              onClick={() => swiper?.slidePrev()}
              aria-label="Previous category banner"
              disabled={!swiper}
              className="flex h-9 w-9 items-center justify-center rounded-full border border-white/70 bg-white/90 text-[#0755E9] shadow-md backdrop-blur transition hover:bg-[#0755E9] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0755E9] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 sm:h-10 sm:w-10"
            >
              <ChevronLeft
                size={19}
                aria-hidden="true"
              />
            </button>

            <button
              type="button"
              onClick={() => swiper?.slideNext()}
              aria-label="Next category banner"
              disabled={!swiper}
              className="flex h-9 w-9 items-center justify-center rounded-full border border-white/70 bg-white/90 text-[#0755E9] shadow-md backdrop-blur transition hover:bg-[#0755E9] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0755E9] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 sm:h-10 sm:w-10"
            >
              <ChevronRight
                size={19}
                aria-hidden="true"
              />
            </button>

          </div>
        )}
      </div>
    </section>
  );
}
