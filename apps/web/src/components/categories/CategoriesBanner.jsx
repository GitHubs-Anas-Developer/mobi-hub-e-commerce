"use client";

import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination, A11y } from "swiper/modules";
import { useReducedMotion } from "motion/react";

import { fetchActiveBanners } from "@/store/thunks/bannerThunks";

import "swiper/css";
import "swiper/css/pagination";

function getImageUrl(image) {
  if (typeof image === "string") {
    return image.trim();
  }
  return image?.url || image?.secure_url || "";
}

function CategoriesBannerSkeleton() {
  return (
    <section className="w-full" aria-label="Loading category banners">
      <div className="aspect-[16/7] w-full animate-pulse rounded-2xl border border-[#E2E8F0] bg-[#EFF6FF] sm:aspect-[21/6] lg:aspect-[21/5]" />
    </section>
  );
}

export default function AllCategoriesHeader() {
  const dispatch = useDispatch();
  const shouldReduceMotion = useReducedMotion();

  const [swiper, setSwiper] = useState(null);
  const [mounted, setMounted] = useState(false);

  const banners = useSelector(
    (state) => state.banners?.bannersByPlacement?.categories_hero || []
  );

  const loading = useSelector((state) => state.banners?.loading || false);

  useEffect(() => {
    queueMicrotask(() => setMounted(true));
    dispatch(
      fetchActiveBanners({
        placement: "categories",
        position: "hero",
      })
    );
  }, [dispatch]);

  const validBanners = useMemo(() => {
    if (!Array.isArray(banners)) return [];

    return banners
      .map((banner) => {
        const desktopImage = getImageUrl(banner?.desktopImage);
        const mobileImage = getImageUrl(banner?.mobileImage);

        return {
          ...banner,
          desktopImage,
          mobileImage,
          fallbackImage: desktopImage || mobileImage,
        };
      })
      .filter((banner) => banner.fallbackImage);
  }, [banners]);

  if (loading && validBanners.length === 0) {
    return <CategoriesBannerSkeleton />;
  }

  if (validBanners.length === 0) {
    return null;
  }

  const hasMultipleBanners = validBanners.length > 1;

  return (
    <section className="w-full" aria-label="ELENZO category promotions">
      <div className="group relative w-full overflow-hidden rounded-2xl border border-[#E2E8F0] bg-[#EFF6FF] shadow-xs">
        {mounted && (
          <Swiper
            modules={[Autoplay, Pagination, A11y]}
            onSwiper={setSwiper}
            onBeforeDestroy={() => setSwiper(null)}
            slidesPerView={1}
            spaceBetween={0}
            loop={hasMultipleBanners}
            speed={shouldReduceMotion ? 0 : 700}
            autoplay={
              hasMultipleBanners && !shouldReduceMotion
                ? {
                    delay: 4800,
                    disableOnInteraction: false,
                    pauseOnMouseEnter: true,
                  }
                : false
            }
            pagination={hasMultipleBanners ? { clickable: true } : false}
            a11y={{ enabled: true }}
            className="
              [&_.swiper-pagination]:!bottom-3
              [&_.swiper-pagination-bullet]:!h-2
              [&_.swiper-pagination-bullet]:!w-2
              [&_.swiper-pagination-bullet]:!bg-white
              [&_.swiper-pagination-bullet]:!opacity-75
              [&_.swiper-pagination-bullet-active]:!w-7
              [&_.swiper-pagination-bullet-active]:!rounded-full
              [&_.swiper-pagination-bullet-active]:!bg-[#0755E9]
              [&_.swiper-pagination-bullet-active]:!opacity-100
            "
          >
            {validBanners.map((banner, index) => (
              <SwiperSlide key={banner._id || banner.id || index}>
                <a
                  href={banner.buttonLink || "/categories"}
                  aria-label={banner.title || "Explore ELENZO categories"}
                  className="block w-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#0755E9]"
                >
                  <picture className="block w-full">
                    {banner.mobileImage && (
                      <source
                        media="(max-width: 767px)"
                        srcSet={banner.mobileImage}
                      />
                    )}

                    <img
                      src={banner.fallbackImage}
                      alt={
                        banner.title ||
                        "Explore electronics and gadgets at ELENZO"
                      }
                      loading={index === 0 ? "eager" : "lazy"}
                      fetchPriority={index === 0 ? "high" : "auto"}
                      decoding="async"
                      className="block max-h-[260px] w-full object-cover sm:max-h-[300px]"
                    />
                  </picture>
                </a>
              </SwiperSlide>
            ))}
          </Swiper>
        )}

        {hasMultipleBanners && (
          <div className="pointer-events-none absolute inset-y-0 left-3 right-3 z-20 flex items-center justify-between opacity-0 transition-opacity duration-200 group-hover:opacity-100 sm:left-4 sm:right-4">
            <button
              type="button"
              onClick={() => swiper?.slidePrev()}
              aria-label="Previous category banner"
              disabled={!swiper}
              className="pointer-events-auto flex h-9 w-9 items-center justify-center rounded-full border border-[#E2E8F0] bg-white/95 text-[#082B70] shadow-sm backdrop-blur-xs transition hover:border-[#0755E9] hover:bg-[#0755E9] hover:text-white disabled:cursor-not-allowed disabled:opacity-40 sm:h-10 sm:w-10"
            >
              <ChevronLeft size={18} aria-hidden="true" />
            </button>

            <button
              type="button"
              onClick={() => swiper?.slideNext()}
              aria-label="Next category banner"
              disabled={!swiper}
              className="pointer-events-auto flex h-9 w-9 items-center justify-center rounded-full border border-[#E2E8F0] bg-white/95 text-[#082B70] shadow-sm backdrop-blur-xs transition hover:border-[#0755E9] hover:bg-[#0755E9] hover:text-white disabled:cursor-not-allowed disabled:opacity-40 sm:h-10 sm:w-10"
            >
              <ChevronRight size={18} aria-hidden="true" />
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
