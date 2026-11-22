
"use client";

import { useEffect, useMemo } from "react";
import Link from "next/link";

import { useDispatch, useSelector } from "react-redux";
import { motion, useReducedMotion } from "motion/react";

import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination, A11y } from "swiper/modules";

import "swiper/css";
import "swiper/css/pagination";

import { fetchActiveBanners } from "@/store/thunks/bannerThunks";

export default function BottomPromotionalBanner() {
  const dispatch = useDispatch();
  const shouldReduceMotion = useReducedMotion();

  const banners = useSelector(
    (state) => state.banners?.bannersByPlacement?.home_bottom || []
  );

  const loading = useSelector(
    (state) => state.banners?.loading
  );

  useEffect(() => {
    dispatch(
      fetchActiveBanners({
        placement: "home",
        position: "bottom",
      })
    );
  }, [dispatch]);

  const getImageUrl = (image) => {
    if (typeof image === "string") return image;

    return image?.url || image?.secure_url || "";
  };

  const activeBanners = useMemo(() => {
    return banners.filter((banner) => {
      return Boolean(
        getImageUrl(banner.desktopImage) ||
        getImageUrl(banner.mobileImage)
      );
    });
  }, [banners]);

  if (loading && activeBanners.length === 0) return null;
  if (activeBanners.length === 0) return null;

  return (
    <section className="w-full">
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
        viewport={{ once: true, amount: 0.15 }}
        transition={{
          duration: shouldReduceMotion ? 0 : 0.4,
          ease: "easeOut",
        }}
        className="w-full overflow-hidden rounded-xl sm:rounded-2xl"
      >
        <Swiper
          modules={[Autoplay, Pagination, A11y]}
          slidesPerView={1}
          loop={activeBanners.length > 1}
          autoplay={
            activeBanners.length > 1 && !shouldReduceMotion
              ? {
                  delay: 5000,
                  disableOnInteraction: false,
                  pauseOnMouseEnter: true,
                }
              : false
          }
          pagination={{
            clickable: true,
          }}
          speed={shouldReduceMotion ? 0 : 600}
          a11y={{
            enabled: true,
            containerMessage: "Mobi Hub promotional offers",
          }}
          className="bottom-promotional-banner-swiper w-full"
        >
          {activeBanners.map((banner) => {
            const desktopImage =
              getImageUrl(banner.desktopImage) ||
              getImageUrl(banner.mobileImage);

            const mobileImage =
              getImageUrl(banner.mobileImage);

            return (
              <SwiperSlide key={banner._id}>
                <Link
                  href={banner.buttonLink || "/products"}
                  className="block w-full"
                  aria-label={
                    banner.title || "Explore Mobi Hub offers"
                  }
                >
                  <picture>
                    {mobileImage && (
                      <source
                        media="(max-width: 767px)"
                        srcSet={mobileImage}
                      />
                    )}

                    <img
                      src={desktopImage}
                      alt={
                        banner.title ||
                        "Mobi Hub promotional offer"
                      }
                      loading="lazy"
                      decoding="async"
                      className="block h-auto w-full object-cover"
                    />
                  </picture>
                </Link>
              </SwiperSlide>
            );
          })}
        </Swiper>
      </motion.div>
    </section>
  );
}
