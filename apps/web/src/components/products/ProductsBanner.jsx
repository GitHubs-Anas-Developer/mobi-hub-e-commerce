"use client";

import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination, A11y } from "swiper/modules";

import { fetchActiveBanners } from "@/store/thunks/bannerThunks";

import "swiper/css";
import "swiper/css/pagination";

const getImageUrl = (image) => {
  if (typeof image === "string") {
    return image.trim();
  }
  return image?.url || image?.secure_url || "";
};

export default function ShopBanner() {
  const dispatch = useDispatch();

  const [swiper, setSwiper] = useState(null);
  const [isMounted, setIsMounted] = useState(false);

  const banners = useSelector(
    (state) => state.banners?.bannersByPlacement?.products_top || []
  );

  const loading = useSelector(
    (state) => state.banners?.loading || false
  );

  useEffect(() => {
    setIsMounted(true);

    dispatch(
      fetchActiveBanners({
        placement: "products",
        position: "top",
      })
    );
  }, [dispatch]);

  const validBanners = useMemo(() => {
    return (Array.isArray(banners) ? banners : []).filter((banner) => {
      return (
        getImageUrl(banner?.desktopImage) ||
        getImageUrl(banner?.mobileImage)
      );
    });
  }, [banners]);

  if (loading && validBanners.length === 0) {
    return (
      <section className="mb-6 w-full" aria-label="Loading promotion banner">
        <div className="aspect-[16/7] w-full animate-pulse rounded-2xl border border-[#E2E8F0] bg-[#EFF6FF] sm:aspect-[21/6] lg:aspect-[21/5]" />
      </section>
    );
  }

  if (!validBanners.length) {
    return null;
  }

  return (
    <section className="mb-6 w-full" aria-label="Promotional offers">
      <div className="group relative overflow-hidden rounded-2xl border border-[#E2E8F0] bg-[#EFF6FF] shadow-xs">
        {isMounted && (
          <Swiper
            modules={[Autoplay, Pagination, A11y]}
            onSwiper={setSwiper}
            onBeforeDestroy={() => setSwiper(null)}
            slidesPerView={1}
            spaceBetween={0}
            loop={validBanners.length > 1}
            speed={700}
            autoplay={
              validBanners.length > 1
                ? {
                    delay: 5000,
                    disableOnInteraction: false,
                    pauseOnMouseEnter: true,
                  }
                : false
            }
            pagination={
              validBanners.length > 1
                ? {
                    clickable: true,
                  }
                : false
            }
            a11y={{ enabled: true }}
            className="
              w-full
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
            {validBanners.map((banner, index) => {
              const desktopImage = getImageUrl(banner.desktopImage);
              const mobileImage = getImageUrl(banner.mobileImage);
              const fallbackImage = desktopImage || mobileImage;

              return (
                <SwiperSlide key={banner._id || index}>
                  <a
                    href={banner.buttonLink || "/products"}
                    aria-label={banner.title || "Explore ELENZO products"}
                    className="block w-full"
                  >
                    <picture className="block w-full">
                      {mobileImage && (
                        <source
                          media="(max-width: 767px)"
                          srcSet={mobileImage}
                        />
                      )}

                      <img
                        src={fallbackImage}
                        alt={banner.title || "ELENZO products promotion"}
                        loading={index === 0 ? "eager" : "lazy"}
                        fetchPriority={index === 0 ? "high" : "auto"}
                        decoding="async"
                        className="block max-h-[260px] w-full object-cover sm:max-h-[300px]"
                        onError={(event) => {
                          event.currentTarget.style.display = "none";
                        }}
                      />
                    </picture>
                  </a>
                </SwiperSlide>
              );
            })}
          </Swiper>
        )}

        {validBanners.length > 1 && (
          <div className="pointer-events-none absolute inset-y-0 left-3 right-3 z-20 flex items-center justify-between opacity-0 transition-opacity duration-200 group-hover:opacity-100 sm:left-4 sm:right-4">
            <button
              type="button"
              onClick={() => swiper?.slidePrev()}
              aria-label="Previous banner"
              disabled={!swiper}
              className="pointer-events-auto flex h-9 w-9 items-center justify-center rounded-full border border-[#E2E8F0] bg-white/95 text-[#082B70] shadow-sm backdrop-blur-xs transition hover:border-[#0755E9] hover:bg-[#0755E9] hover:text-white disabled:cursor-not-allowed disabled:opacity-40 sm:h-10 sm:w-10"
            >
              <ChevronLeft size={18} />
            </button>

            <button
              type="button"
              onClick={() => swiper?.slideNext()}
              aria-label="Next banner"
              disabled={!swiper}
              className="pointer-events-auto flex h-9 w-9 items-center justify-center rounded-full border border-[#E2E8F0] bg-white/95 text-[#082B70] shadow-sm backdrop-blur-xs transition hover:border-[#0755E9] hover:bg-[#0755E9] hover:text-white disabled:cursor-not-allowed disabled:opacity-40 sm:h-10 sm:w-10"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
