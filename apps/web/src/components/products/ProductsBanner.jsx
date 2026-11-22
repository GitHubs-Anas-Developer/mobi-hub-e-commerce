
"use client";

import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import { ChevronLeft, ChevronRight } from "lucide-react";

import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination, A11y } from "swiper/modules";

import { fetchActiveBanners } from "@/store/thunks/bannerThunks";

import "swiper/css";
import "swiper/css/pagination";

export default function ShopBanner() {
  const dispatch = useDispatch();

  // Products page top banners only
  const banners = useSelector(
    (state) =>
      state.banners?.bannersByPlacement?.products_top || [],
  );

  const loading = useSelector(
    (state) => state.banners?.loading || false,
  );

  const [swiper, setSwiper] = useState(null);
  const [isMounted, setIsMounted] = useState(false);

  // Fetch products page top banners
  useEffect(() => {
    dispatch(
      fetchActiveBanners({
        placement: "products",
        position: "top",
      }),
    );

    setIsMounted(true);
  }, [dispatch]);

  // Loading skeleton
  if (loading && banners.length === 0) {
    return (
      <section className="w-full bg-white py-4 sm:py-6">
        <div className="mx-auto px-4 sm:px-6 lg:px-8">
          <div className="aspect-[16/9] w-full animate-pulse rounded-2xl bg-blue-50 sm:rounded-[28px]" />
        </div>
      </section>
    );
  }

  // No banners
  if (!banners.length) return null;

  // Get image URL
  const getImageUrl = (image) => {
    if (typeof image === "string") return image;

    return image?.url || image?.secure_url || "";
  };

  return (
    <section className="w-full bg-white  sm:py-6">
      <div className="mx-auto w-full">
        <div className="relative overflow-hidden rounded-2xl border border-blue-100 bg-[#F5F9FF] sm:rounded-[28px]">

          {/* Banner Slider */}
          {isMounted && (
            <Swiper
              modules={[Autoplay, Pagination, A11y]}
              onSwiper={setSwiper}
              slidesPerView={1}
              spaceBetween={0}
              loop={banners.length > 1}
              speed={800}
              autoplay={
                banners.length > 1
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
              {banners.map((banner, index) => {
                const desktopImage = getImageUrl(
                  banner.desktopImage,
                );

                const mobileImage = getImageUrl(
                  banner.mobileImage,
                );

                const fallbackImage =
                  desktopImage || mobileImage;

                if (!fallbackImage) return null;

                return (
                  <SwiperSlide key={banner._id || index}>
                    <a
                      href={banner.buttonLink || "/products"}
                      aria-label={
                        banner.title || "Explore Mobi Hub products"
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
                            "Mobi Hub products promotion"
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
                );
              })}
            </Swiper>
          )}

          {/* Navigation */}
          {banners.length > 1 && (
            <div className="absolute bottom-10 right-4 z-20 flex gap-2 sm:bottom-5 sm:right-6">

              <button
                type="button"
                onClick={() => swiper?.slidePrev()}
                aria-label="Previous banner"
                disabled={!swiper}
                className="flex h-9 w-9 items-center justify-center rounded-full border border-white/70 bg-white/90 text-[#0755E9] shadow-md backdrop-blur transition hover:bg-[#0755E9] hover:text-white disabled:opacity-50 sm:h-10 sm:w-10"
              >
                <ChevronLeft size={19} />
              </button>

              <button
                type="button"
                onClick={() => swiper?.slideNext()}
                aria-label="Next banner"
                disabled={!swiper}
                className="flex h-9 w-9 items-center justify-center rounded-full border border-white/70 bg-white/90 text-[#0755E9] shadow-md backdrop-blur transition hover:bg-[#0755E9] hover:text-white disabled:opacity-50 sm:h-10 sm:w-10"
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
