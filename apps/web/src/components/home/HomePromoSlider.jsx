"use client";

import { useEffect, useMemo } from "react";
import Link from "next/link";
import { useDispatch, useSelector } from "react-redux";
import { ArrowRight } from "lucide-react";

import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination, A11y } from "swiper/modules";

import "swiper/css";
import "swiper/css/pagination";

import { fetchActiveBanners } from "@/store/thunks/bannerThunks";

const getImageUrl = (image) => {
  if (typeof image === "string") return image;
  return image?.url || image?.secure_url || "";
};

export default function HomePromoSlider({
  position = "middle",
  ariaLabel = "ELENZO promotional offers",
}) {
  const dispatch = useDispatch();

  const key = `home_${position}`;
  const banners = useSelector(
    (state) => state.banners?.bannersByPlacement?.[key] || []
  );
  const loading = useSelector((state) => state.banners?.loading || false);

  useEffect(() => {
    dispatch(
      fetchActiveBanners({
        placement: "home",
        position,
      })
    );
  }, [dispatch, position]);

  const activeBanners = useMemo(
    () =>
      banners.filter(
        (banner) =>
          getImageUrl(banner.desktopImage) || getImageUrl(banner.mobileImage)
      ),
    [banners]
  );

  if (loading && activeBanners.length === 0) return null;
  if (activeBanners.length === 0) return null;

  return (
    <section aria-label={ariaLabel} className="w-full">
      <div className="overflow-hidden rounded-2xl border border-[#E2E8F0] bg-white shadow-xs">
        <Swiper
          modules={[Autoplay, Pagination, A11y]}
          slidesPerView={1}
          loop={activeBanners.length > 1}
          autoplay={
            activeBanners.length > 1
              ? {
                  delay: 5000,
                  disableOnInteraction: false,
                  pauseOnMouseEnter: true,
                }
              : false
          }
          pagination={{ clickable: true }}
          speed={600}
          a11y={{
            enabled: true,
            containerMessage: ariaLabel,
          }}
          className="
            w-full
            [&_.swiper-pagination]:!bottom-3
            [&_.swiper-pagination-bullet]:!h-2
            [&_.swiper-pagination-bullet]:!w-2
            [&_.swiper-pagination-bullet]:!bg-white
            [&_.swiper-pagination-bullet]:!opacity-80
            [&_.swiper-pagination-bullet-active]:!w-6
            [&_.swiper-pagination-bullet-active]:!rounded-full
            [&_.swiper-pagination-bullet-active]:!bg-[#0755E9]
            [&_.swiper-pagination-bullet-active]:!opacity-100
          "
        >
          {activeBanners.map((banner) => {
            const desktopImage = getImageUrl(banner.desktopImage);
            const mobileImage = getImageUrl(banner.mobileImage);
            const fallbackImage = desktopImage || mobileImage;

            return (
              <SwiperSlide key={banner._id}>
                <div className="flex flex-col">
                  <Link
                    href={banner.buttonLink || "/products"}
                    className="block w-full"
                    aria-label={banner.title || ariaLabel}
                  >
                    <picture>
                      {mobileImage && (
                        <source
                          media="(max-width: 767px)"
                          srcSet={mobileImage}
                        />
                      )}
                      <img
                        src={fallbackImage}
                        alt={banner.title || ariaLabel}
                        loading="lazy"
                        decoding="async"
                        className="block h-auto w-full object-cover"
                      />
                    </picture>
                  </Link>

                  {(banner.title || banner.description) && (
                    <div className="flex flex-col justify-between gap-3 border-t border-[#E2E8F0] bg-[#F8FAFC] px-4 py-3.5 sm:flex-row sm:items-center sm:px-6">
                      <div className="min-w-0">
                        {banner.subtitle && (
                          <span className="text-[11px] font-bold uppercase tracking-wider text-[#0755E9]">
                            {banner.subtitle}
                          </span>
                        )}
                        {banner.title && (
                          <h3 className="truncate text-sm font-bold text-[#101828] sm:text-base">
                            {banner.title}
                          </h3>
                        )}
                        {banner.description && (
                          <p className="mt-0.5 line-clamp-1 text-xs text-[#64748B]">
                            {banner.description}
                          </p>
                        )}
                      </div>

                      <Link
                        href={banner.buttonLink || "/products"}
                        className="inline-flex h-9 shrink-0 items-center justify-center gap-1.5 rounded-xl bg-[#0755E9] px-4 text-xs font-semibold text-white transition hover:bg-[#0645C4]"
                      >
                        {banner.buttonText || "Explore Offer"}
                        <ArrowRight size={14} />
                      </Link>
                    </div>
                  )}
                </div>
              </SwiperSlide>
            );
          })}
        </Swiper>
      </div>
    </section>
  );
}

