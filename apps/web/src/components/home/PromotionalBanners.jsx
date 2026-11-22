
"use client";

import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination } from "swiper/modules";


import "swiper/css";
import "swiper/css/pagination";
import { fetchActiveBanners } from "@/store/thunks/bannerThunks";

export default function PromotionalBanners() {
  const dispatch = useDispatch();

  const banners = useSelector(
    (state) => state.banners.bannersByPlacement.home_middle || []
  );

  const loading = useSelector((state) => state.banners.loading);

  useEffect(() => {
    dispatch(
      fetchActiveBanners({
        placement: "home",
        position: "middle",
      })
    );
  }, [dispatch]);

  if (loading && banners.length === 0) return null;
  if (!banners.length) return null;

  return (
    <section className="w-full px-3 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto w-full overflow-hidden rounded-2xl">
        <Swiper
          modules={[Autoplay, Pagination]}
          slidesPerView={1}
          loop={banners.length > 1}
          autoplay={
            banners.length > 1
              ? {
                  delay: 5000,
                  disableOnInteraction: false,
                  pauseOnMouseEnter: true,
                }
              : false
          }
          pagination={{ clickable: true }}
          speed={800}
        >
          {banners.map((banner) => {
            const desktopImage =
              banner.desktopImage || banner.mobileImage;

            if (!desktopImage) return null;

            return (
              <SwiperSlide key={banner._id}>
                <a
                  href={banner.buttonLink || "/products"}
                  className="block w-full"
                >
                  <picture>
                    {banner.mobileImage && (
                      <source
                        media="(max-width: 767px)"
                        srcSet={banner.mobileImage}
                      />
                    )}

                    <img
                      src={desktopImage}
                      alt={banner.title || "MobiHub promotional banner"}
                      className="block h-auto w-full object-cover"
                    />
                  </picture>
                </a>
              </SwiperSlide>
            );
          })}
        </Swiper>
      </div>
    </section>
  );
}
