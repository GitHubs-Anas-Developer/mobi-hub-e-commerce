
"use client";

import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import { ChevronLeft, ChevronRight } from "lucide-react";

import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination, A11y } from "swiper/modules";

import { fetchActiveBanners } from "@/store/thunks/bannerThunks";

import "swiper/css";
import "swiper/css/pagination";

export default function ShopBanner() {
  const dispatch = useDispatch();

  const [swiper, setSwiper] = useState(null);
  const [isMounted, setIsMounted] = useState(false);

  // Redux state
  const banners = useSelector(
    (state) =>
      state.banners?.bannersByPlacement?.products_top || []
  );

  const loading = useSelector(
    (state) => state.banners?.loading || false
  );

  // Mount component
  useEffect(() => {
    setIsMounted(true);

    dispatch(
      fetchActiveBanners({
        placement: "products",
        position: "top",
      })
    );
  }, [dispatch]);

  // Get image URL
  const getImageUrl = (image) => {
    if (typeof image === "string") {
      return image;
    }

    return image?.url || image?.secure_url || "";
  };

  // Filter banners with valid images
  const validBanners = useMemo(() => {
    return banners.filter((banner) => {
      return (
        getImageUrl(banner.desktopImage) ||
        getImageUrl(banner.mobileImage)
      );
    });
  }, [banners]);

  // Loading skeleton
  if (loading && validBanners.length === 0) {
    return (
      <section className="w-full bg-white py-4 sm:py-6">
        <div className="mx-auto w-full px-4 sm:px-6 lg:px-8">
          <div className="aspect-[16/9] w-full animate-pulse rounded-2xl bg-blue-50 sm:rounded-[28px]" />
        </div>
      </section>
    );
  }

  // No banners available
  if (!validBanners.length) {
    return null;
  }

  return (
    <section className="w-full bg-white py-3 sm:py-6">
      <div className="mx-auto w-full">
        <div className="relative overflow-hidden rounded-2xl border border-blue-100 bg-[#F5F9FF] sm:rounded-[28px]">

          {/* Banner Slider */}
          {isMounted && (
            <Swiper
              modules={[Autoplay, Pagination, A11y]}
              onSwiper={setSwiper}
              onBeforeDestroy={() => setSwiper(null)}
              slidesPerView={1}
              spaceBetween={0}
              loop={validBanners.length > 1}
              speed={800}
              autoplay={
                validBanners.length > 1
                  ? {
                      delay: 4500,
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
              a11y={{
                enabled: true,
              }}
              className="
                w-full
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
              {validBanners.map((banner, index) => {
                const desktopImage = getImageUrl(
                  banner.desktopImage
                );

                const mobileImage = getImageUrl(
                  banner.mobileImage
                );

                const fallbackImage =
                  desktopImage || mobileImage;

                return (
                  <SwiperSlide key={banner._id || index}>
                    <a
                      href={banner.buttonLink || "/products"}
                      aria-label={
                        banner.title ||
                        "Explore ELEZIO products"
                      }
                      className="block w-full"
                    >
                      <picture className="block w-full">

                        {/* Mobile image */}
                        {mobileImage && (
                          <source
                            media="(max-width: 767px)"
                            srcSet={mobileImage}
                          />
                        )}

                        {/* Desktop image / fallback */}
                        <img
                          src={fallbackImage}
                          alt={
                            banner.title ||
                            "ELEZIO products promotion"
                          }
                          loading={
                            index === 0 ? "eager" : "lazy"
                          }
                          fetchPriority={
                            index === 0 ? "high" : "auto"
                          }
                          decoding="async"
                          className="block h-auto w-full object-cover"
                          onError={(event) => {
                            event.currentTarget.style.display =
                              "none";
                          }}
                        />
                      </picture>
                    </a>
                  </SwiperSlide>
                );
              })}
            </Swiper>
          )}

          {/* Navigation arrows */}
          {validBanners.length > 1 && (
            <div className="absolute bottom-10 right-4 z-20 flex gap-2 sm:bottom-5 sm:right-6">

              <button
                type="button"
                onClick={() => swiper?.slidePrev()}
                aria-label="Previous banner"
                disabled={!swiper}
                className="
                  flex h-9 w-9 items-center justify-center
                  rounded-full border border-white/70
                  bg-white/90 text-[#0755E9]
                  shadow-md backdrop-blur
                  transition duration-200
                  hover:bg-[#0755E9] hover:text-white
                  disabled:cursor-not-allowed disabled:opacity-50
                  sm:h-10 sm:w-10
                "
              >
                <ChevronLeft size={19} />
              </button>

              <button
                type="button"
                onClick={() => swiper?.slideNext()}
                aria-label="Next banner"
                disabled={!swiper}
                className="
                  flex h-9 w-9 items-center justify-center
                  rounded-full border border-white/70
                  bg-white/90 text-[#0755E9]
                  shadow-md backdrop-blur
                  transition duration-200
                  hover:bg-[#0755E9] hover:text-white
                  disabled:cursor-not-allowed disabled:opacity-50
                  sm:h-10 sm:w-10
                "
              >
                <ChevronRight size={19} />
              </button>

            </div>
          )}

        </div>
      </div>
    </section>
  );
}
