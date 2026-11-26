
"use client";

import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import { ChevronLeft, ChevronRight } from "lucide-react";

import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination, A11y } from "swiper/modules";

import { fetchActiveBanners } from "@/store/thunks/bannerThunks";

import "swiper/css";
import "swiper/css/pagination";

export default function HeroBanner() {
  const dispatch = useDispatch();

  const banners = useSelector(
    (state) =>
      state.banners?.bannersByPlacement?.home_hero || [],
  );

  const loading = useSelector(
    (state) => state.banners?.loading || false,
  );

  const [swiper, setSwiper] = useState(null);
  const [isMounted, setIsMounted] = useState(false);

  // Fetch active hero banners
  useEffect(() => {
    dispatch(
      fetchActiveBanners({
        placement: "home",
        position: "hero",
      }),
    );

    setIsMounted(true);
  }, [dispatch]);

  // Get image URL
  const getImageUrl = (image) => {
    if (typeof image === "string") {
      return image;
    }

    return image?.url || image?.secure_url || "";
  };

  // Filter valid banners
  const validBanners = banners.filter(
    (banner) =>
      getImageUrl(banner.desktopImage) ||
      getImageUrl(banner.mobileImage),
  );

  // Loading skeleton
  if (loading && validBanners.length === 0) {
    return (
      <section className="w-full">
        <div className="h-auto w-full animate-pulse bg-blue-50">
          <div className="aspect-[4/3] w-full sm:aspect-[16/6] lg:aspect-[16/5]" />
        </div>
      </section>
    );
  }

  // No banners
  if (!validBanners.length) {
    return null;
  }

  return (
    <section className="w-full">
      <div className="relative w-full overflow-hidden bg-[#F5F9FF]">

        {/* Banner Slider */}
        {isMounted && (
          <Swiper
            modules={[Autoplay, Pagination, A11y]}
            onSwiper={setSwiper}
            slidesPerView={1}
            spaceBetween={0}
            loop={validBanners.length > 1}
            speed={700}
            autoplay={
              validBanners.length > 1
                ? {
                    delay: 4500,
                    disableOnInteraction: false,
                    pauseOnMouseEnter: true,
                  }
                : false
            }
            pagination={{
              clickable: true,
            }}
            a11y={{
              enabled: true,
            }}
            className="
              w-full

              [&_.swiper-pagination]:!bottom-3
              sm:[&_.swiper-pagination]:!bottom-4
              lg:[&_.swiper-pagination]:!bottom-5

              [&_.swiper-pagination-bullet]:!h-1.5
              [&_.swiper-pagination-bullet]:!w-1.5
              [&_.swiper-pagination-bullet]:!bg-white
              [&_.swiper-pagination-bullet]:!opacity-80

              [&_.swiper-pagination-bullet-active]:!w-5
              [&_.swiper-pagination-bullet-active]:!rounded-full
              [&_.swiper-pagination-bullet-active]:!bg-[#0755E9]
              [&_.swiper-pagination-bullet-active]:!opacity-100

              sm:[&_.swiper-pagination-bullet]:!h-2
              sm:[&_.swiper-pagination-bullet]:!w-2
              sm:[&_.swiper-pagination-bullet-active]:!w-7
            "
          >
            {validBanners.map((banner, index) => {
              const desktopImage = getImageUrl(
                banner.desktopImage,
              );

              const mobileImage = getImageUrl(
                banner.mobileImage,
              );

              const fallbackImage =
                desktopImage || mobileImage;

              const imageAlt =
                banner.title ||
                "ELEZIO gadgets and electronics offers";

              return (
                <SwiperSlide key={banner._id || index}>
                  <a
                    href={banner.buttonLink || "/products"}
                    aria-label={imageAlt}
                    className="block w-full"
                  >
                    <picture className="block w-full">

                      {/* Mobile Image */}
                      {mobileImage && (
                        <source
                          media="(max-width: 767px)"
                          srcSet={mobileImage}
                        />
                      )}

                      {/* Desktop Image */}
                      <img
                        src={fallbackImage}
                        alt={imageAlt}
                        loading={
                          index === 0 ? "eager" : "lazy"
                        }
                        fetchPriority={
                          index === 0 ? "high" : "auto"
                        }
                        decoding="async"
                        className="
                          block
                          h-auto
                          w-full
                          object-cover
                        "
                      />
                    </picture>
                  </a>
                </SwiperSlide>
              );
            })}
          </Swiper>
        )}

        {/* Navigation Buttons */}
        {validBanners.length > 1 && (
          <>
            <button
              type="button"
              onClick={() => swiper?.slidePrev()}
              aria-label="Previous banner"
              disabled={!swiper}
              className="
                absolute left-3 top-1/2 z-20
                flex h-9 w-9 -translate-y-1/2
                items-center justify-center
                rounded-full border border-white/70
                bg-white/90 text-[#0755E9]
                shadow-md backdrop-blur
                transition-all duration-200
                hover:bg-[#0755E9] hover:text-white
                disabled:opacity-50
                sm:left-5 sm:h-11 sm:w-11
                lg:left-8
              "
            >
              <ChevronLeft size={20} />
            </button>

            <button
              type="button"
              onClick={() => swiper?.slideNext()}
              aria-label="Next banner"
              disabled={!swiper}
              className="
                absolute right-3 top-1/2 z-20
                flex h-9 w-9 -translate-y-1/2
                items-center justify-center
                rounded-full border border-white/70
                bg-white/90 text-[#0755E9]
                shadow-md backdrop-blur
                transition-all duration-200
                hover:bg-[#0755E9] hover:text-white
                disabled:opacity-50
                sm:right-5 sm:h-11 sm:w-11
                lg:right-8
              "
            >
              <ChevronRight size={20} />
            </button>
          </>
        )}
      </div>
    </section>
  );
}
