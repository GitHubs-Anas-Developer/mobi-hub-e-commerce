"use client";

import { useEffect, useMemo, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { useDispatch, useSelector } from "react-redux";
import {
  ArrowRight,
  ArrowUpRight,
  ChevronLeft,
  ChevronRight,
  Package,
  Sparkles,
} from "lucide-react";

import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination, A11y } from "swiper/modules";

import { fetchActiveBanners } from "@/store/thunks/bannerThunks";
import formatPrice from "@/utils/formatPrice";

import "swiper/css";
import "swiper/css/pagination";

const subscribeToNothing = () => () => {};
const getMountedSnapshot = () => true;
const getServerSnapshot = () => false;

const getImageUrl = (image) => {
  if (typeof image === "string") return image;
  return image?.url || image?.secure_url || "";
};

function FeaturedSpotlightCard({ product }) {
  if (!product) return null;

  const variant =
    product.variants?.find((v) => v.isDefault && v.isActive !== false) ||
    product.variants?.[0];
  const price = product.basePrice ?? variant?.sellingPrice ?? 0;
  const mrp = variant?.mrp ?? 0;
  const discount =
    mrp > price && mrp > 0 ? Math.round(((mrp - price) / mrp) * 100) : 0;
  const imageUrl =
    getImageUrl(product.thumbnail) || getImageUrl(product.images?.[0]);

  return (
    <div className="flex h-full flex-col justify-between overflow-hidden rounded-2xl border border-[#E2E8F0] bg-gradient-to-br from-[#EFF6FF] via-white to-[#F8FAFC] p-4 shadow-xs sm:p-5">
      <div>
        <div className="flex items-center justify-between gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-[#0755E9] shadow-xs">
            <Sparkles size={12} />
            Featured Spotlight
          </span>

          {discount > 0 && (
            <span className="rounded-full bg-[#0755E9] px-2.5 py-1 text-[11px] font-bold text-white tabular-nums">
              {discount}% OFF
            </span>
          )}
        </div>

        <Link
          href={`/products/${product.slug}`}
          className="group mt-3 flex aspect-[5/4] w-full items-center justify-center overflow-hidden rounded-xl border border-[#E2E8F0]/70 bg-white p-2 transition-colors duration-200 hover:border-[#0755E9]/30"
        >
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={product.name}
              loading="eager"
              fetchPriority="high"
              decoding="async"
              className="h-full w-full object-contain object-center transition-transform duration-300 group-hover:scale-105"
            />
          ) : (
            <Package size={48} className="text-slate-300" />
          )}
        </Link>

        <div className="mt-3">
          <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#0755E9]">
            {product.brand || "Featured Tech"}
          </p>

          <Link href={`/products/${product.slug}`}>
            <h2 className="mt-1 line-clamp-2 text-base font-bold leading-snug text-[#101828] transition-colors hover:text-[#0755E9] sm:text-lg">
              {product.name}
            </h2>
          </Link>
        </div>
      </div>

      <div className="mt-4 border-t border-[#E2E8F0] pt-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="min-w-0">
            <div className="flex flex-wrap items-baseline gap-2">
              <span className="text-xl font-extrabold tracking-tight text-[#101828] tabular-nums">
                {formatPrice(price)}
              </span>
              {mrp > price && (
                <span className="text-xs font-medium text-[#64748B] line-through tabular-nums">
                  {formatPrice(mrp)}
                </span>
              )}
            </div>
            {discount > 0 && (
              <p className="mt-0.5 text-[11px] font-semibold text-emerald-600 tabular-nums">
                Save {formatPrice(mrp - price)}
              </p>
            )}
          </div>

          <Link
            href={`/products/${product.slug}`}
            className="inline-flex h-10 shrink-0 items-center gap-1.5 rounded-xl bg-[#0755E9] px-4 text-xs font-semibold text-white shadow-xs transition hover:bg-[#0645C4]"
          >
            View Deal
            <ArrowUpRight size={15} />
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function HeroBanner({
  featuredProducts = [],
  featuredLoading = false,
}) {
  const dispatch = useDispatch();

  const banners = useSelector(
    (state) => state.banners?.bannersByPlacement?.home_hero || []
  );
  const loading = useSelector((state) => state.banners?.loading || false);

  const [swiper, setSwiper] = useState(null);
  const [activeSlideIndex, setActiveSlideIndex] = useState(0);
  const isMounted = useSyncExternalStore(
    subscribeToNothing,
    getMountedSnapshot,
    getServerSnapshot
  );

  useEffect(() => {
    dispatch(
      fetchActiveBanners({
        placement: "home",
        position: "hero",
      })
    );
  }, [dispatch]);

  const validBanners = useMemo(
    () =>
      banners.filter(
        (banner) =>
          getImageUrl(banner.desktopImage) || getImageUrl(banner.mobileImage)
      ),
    [banners]
  );

  const spotlightProduct = featuredProducts[0] || null;
  const activeBanner = validBanners[activeSlideIndex] || validBanners[0] || null;

  if (loading && validBanners.length === 0 && featuredLoading) {
    return (
      <section className="w-full bg-white pt-4 sm:pt-6">
        <div className="mx-auto grid max-w-[1440px] gap-4 px-4 sm:px-6 lg:grid-cols-12 lg:gap-5 lg:px-8">
          <div className="aspect-[16/9] w-full animate-pulse rounded-2xl bg-slate-100 lg:col-span-8 lg:aspect-auto lg:min-h-[420px]" />
          <div className="hidden h-[420px] animate-pulse rounded-2xl bg-slate-100 lg:col-span-4 lg:block" />
        </div>
      </section>
    );
  }

  return (
    <section
      aria-label="Featured technology hero"
      className="w-full bg-white pt-4 sm:pt-6"
    >
      <div className="mx-auto w-full max-w-[1440px] px-4 sm:px-6 lg:px-8">
        <div
          className={`grid grid-cols-1 gap-4 lg:items-stretch lg:gap-5 ${
            spotlightProduct
              ? "lg:grid-cols-[minmax(0,2.125fr)_minmax(0,1fr)]"
              : "lg:grid-cols-1"
          }`}
        >
          {/* MAIN HERO STAGE */}
          <div className="min-w-0">
            {validBanners.length > 0 ? (
              <div className="flex h-full flex-col overflow-hidden rounded-2xl border border-[#E2E8F0] bg-[#F8FAFC] shadow-xs">
                <div className="relative bg-[#EFF6FF]">
                  {isMounted && (
                    <Swiper
                      modules={[Autoplay, Pagination, A11y]}
                      onSwiper={setSwiper}
                      onSlideChange={(instance) =>
                        setActiveSlideIndex(instance.realIndex ?? 0)
                      }
                      slidesPerView={1}
                      spaceBetween={0}
                      loop={validBanners.length > 1}
                      speed={650}
                      autoplay={
                        validBanners.length > 1
                          ? {
                            delay: 5000,
                            disableOnInteraction: false,
                            pauseOnMouseEnter: true,
                          }
                          : false
                      }
                      pagination={{ clickable: true }}
                      a11y={{ enabled: true }}
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
                      {validBanners.map((banner, index) => {
                        const desktopImage = getImageUrl(banner.desktopImage);
                        const mobileImage = getImageUrl(banner.mobileImage);
                        const fallbackImage = desktopImage || mobileImage;
                        const imageAlt =
                          banner.title || "ELENZO gadgets and electronics offers";

                        return (
                          <SwiperSlide key={banner._id || index} className="!h-auto">
                            <Link
                              href={banner.buttonLink || "/products"}
                              aria-label={imageAlt}
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
                                  alt={imageAlt}
                                  loading={index === 0 ? "eager" : "lazy"}
                                  fetchPriority={index === 0 ? "high" : "auto"}
                                  decoding="async"
                                  className="block h-auto w-full object-contain object-center"
                                />
                              </picture>
                            </Link>
                          </SwiperSlide>
                        );
                      })}
                    </Swiper>
                  )}

                  {validBanners.length > 1 && (
                    <>
                      <button
                        type="button"
                        onClick={() => swiper?.slidePrev()}
                        aria-label="Previous hero banner"
                        disabled={!swiper}
                        className="absolute left-3 top-1/2 z-20 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-[#E2E8F0] bg-white/95 text-[#101828] shadow-sm transition hover:border-[#0755E9] hover:bg-[#0755E9] hover:text-white disabled:opacity-40 sm:left-4 sm:h-10 sm:w-10"
                      >
                        <ChevronLeft size={18} />
                      </button>

                      <button
                        type="button"
                        onClick={() => swiper?.slideNext()}
                        aria-label="Next hero banner"
                        disabled={!swiper}
                        className="absolute right-3 top-1/2 z-20 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-[#E2E8F0] bg-white/95 text-[#101828] shadow-sm transition hover:border-[#0755E9] hover:bg-[#0755E9] hover:text-white disabled:opacity-40 sm:right-4 sm:h-10 sm:w-10"
                      >
                        <ChevronRight size={18} />
                      </button>
                    </>
                  )}
                </div>

                {/* CLEAN EDITORIAL FOOTER BAR FOR ACTIVE BANNER */}
                {activeBanner && (
                  <div className="flex flex-col justify-between gap-3 border-t border-[#E2E8F0] bg-white px-4 py-3.5 sm:flex-row sm:items-center sm:px-6 sm:py-4">
                    <div className="min-w-0">
                      {activeBanner.subtitle && (
                        <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#0755E9]">
                          {activeBanner.subtitle}
                        </p>
                      )}
                      <h1 className="break-words text-base font-extrabold leading-snug tracking-tight text-[#101828] sm:text-xl">
                        {activeBanner.title}
                      </h1>
                      {activeBanner.description && (
                        <p className="mt-1 break-words text-xs leading-5 text-[#64748B] sm:text-sm">
                          {activeBanner.description}
                        </p>
                      )}
                    </div>

                    <div className="flex w-full flex-wrap items-center gap-2.5 sm:w-auto sm:shrink-0">
                      <Link
                        href={activeBanner.buttonLink || "/products"}
                        className="inline-flex min-h-10 max-w-full items-center justify-center gap-2 rounded-xl bg-[#0755E9] px-4 py-2 text-left text-xs font-semibold leading-snug text-white shadow-xs transition hover:bg-[#0645C4] sm:text-sm"
                      >
                        {activeBanner.buttonText || "Shop Now"}
                        <ArrowRight size={15} aria-hidden="true" />
                      </Link>

                      <Link
                        href="/products"
                        className="inline-flex min-h-10 items-center justify-center rounded-xl border border-[#E2E8F0] bg-white px-4 py-2 text-xs font-semibold text-[#101828] transition hover:border-[#0755E9] hover:bg-[#EFF6FF] hover:text-[#0755E9] sm:text-sm"
                      >
                        All Products
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              /* EDITORIAL FALLBACK WHEN NO HERO BANNERS ARE CONFIGURED */
              <div className="relative flex h-full min-h-[320px] flex-col justify-between overflow-hidden rounded-2xl border border-[#E2E8F0] bg-gradient-to-br from-[#082B70] via-[#0A358A] to-[#0755E9] p-6 text-white shadow-sm sm:min-h-[380px] sm:p-9 lg:p-11">
                <div className="relative z-10 max-w-xl">
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-blue-100">
                    <Sparkles size={13} />
                    ELENZO Tech Store
                  </span>

                  <h1 className="mt-4 text-2xl font-extrabold tracking-tight sm:text-4xl lg:text-[44px] lg:leading-[1.12]">
                    Smart Gadgets &amp; Everyday Electronics.
                  </h1>

                  <p className="mt-3 max-w-md text-sm leading-relaxed text-blue-100/85 sm:text-base">
                    Explore curated mobile accessories, audio gear, fast
                    chargers, and smart tech delivered reliably across India.
                  </p>
                </div>

                <div className="relative z-10 mt-7 flex flex-wrap items-center gap-3">
                  <Link
                    href="/products"
                    className="inline-flex h-11 items-center gap-2 rounded-xl bg-white px-5 text-sm font-bold text-[#0755E9] shadow-sm transition hover:bg-[#EFF6FF]"
                  >
                    Shop Collection
                    <ArrowRight size={16} />
                  </Link>

                  <Link
                    href="/categories"
                    className="inline-flex h-11 items-center gap-2 rounded-xl border border-white/25 bg-white/10 px-5 text-sm font-semibold text-white transition hover:bg-white/20"
                  >
                    Browse Categories
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* RIGHT DESKTOP FEATURED SPOTLIGHT (shown whenever real featured products exist) */}
          {spotlightProduct && (
            <div className="min-w-0">
              <FeaturedSpotlightCard product={spotlightProduct} />
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
